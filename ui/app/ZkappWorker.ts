import { Mina, PublicKey, Signature, fetchAccount, ZkProgram, PrivateKey, Sign, Field } from 'o1js';
import * as Comlink from "comlink";
// import type { JWTVerifyContract } from '../../contracts/build/src/JWTVerifyContract.js';
import { JWTVerifyContractV2 } from '../../contracts/build/src/JWTVerifyContractV2.js';
import { JWTProofProgram } from '../../contracts/build/src/JWTProof.js';

import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// const cachedArtifacts = {
//   verificationKey: await (await fetch("/cache/step-vk-jwt-proof-verifyjwtproof.json")).json(),
// };

const state = {
  JWTVerifyContractInstance: null as null | typeof JWTVerifyContractV2,
  JWTProofInstance: null as null | typeof JWTProofProgram,
  zkappInstance: null as null | JWTVerifyContractV2,
  transaction: null as null | Transaction,
};

export const api = {
  async setActiveInstanceToDevnet() {
    // const Network = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
    const Network = Mina.Network('https://devnet.zeko.io/graphql');
    console.log('Devnet network instance configured');
    Mina.setActiveInstance(Network);
  },
  async loadContract() {
    state.JWTVerifyContractInstance = JWTVerifyContractV2;
    state.JWTProofInstance = JWTProofProgram;
  },
  async compileContract() {
    
    console.time('⏱️ Compiling JWTVerifyContract...');
    await state.JWTProofInstance!.compile();
    console.timeEnd('⏱️ Compiling JWTVerifyContract...');

    console.time('⏱️ Compiling JWTVerifyContractInstance...');
    await state.JWTVerifyContractInstance!.compile();
    console.timeEnd('⏱️ Compiling JWTVerifyContractInstance...');
  },

  async fetchAccount(publicKey58: string) {
    const publicKey = PublicKey.fromBase58(publicKey58);
    return fetchAccount({ publicKey });
  },

  async initZkappInstance(publicKey58: string) {
    const publicKey = PublicKey.fromBase58(publicKey58);
    state.zkappInstance = new state.JWTVerifyContractInstance!(publicKey);
  },

  async getCurrentUpdate() {
    const currentUpdate = await state.zkappInstance!.updated.get();
    return JSON.stringify(currentUpdate.toJSON());
  },

  async createUpdateTransaction() {
    state.transaction = await Mina.transaction(async () => {
        let privateKey = PrivateKey.random();
        let publicKey = privateKey.toPublicKey();

        console.log("Issuer Private Key:", privateKey.toBase58());
        console.log("Create jwt! with key: ", privateKey.toBigInt().toString(16));
      
        let key : any = jwt.sign(
          { data: 'foobar' },
          privateKey.toBigInt().toString(16),
          { algorithm: 'HS256', expiresIn: '1h' }
        );

        console.log("JWT:", key);

        const [, payloadB64] = key.split(".");

        // hash raw base64url payload bytes
        const hash = createHash("sha256").update(payloadB64).digest("hex");

        let sig = Signature.create(
          privateKey,
          [Field.fromValue(`0x${hash}`)]
        );

        console.log("Payload hash (base64 part):", hash);
        console.log("Verifying with sigBase58: ", sig.toBase58());
        
        console.time('⏱️ Generating JWT proof...');
        let { proof } = await JWTProofProgram.verifyJWTProof(
          `0x${hash}`,
          publicKey,
          sig,
          Math.floor(Date.now() / 1000) + 3600,
          Math.floor(Date.now() / 1000), 
        );

        console.timeEnd('⏱️ Generating JWT proof...');

        await state.zkappInstance!.verify(proof);
    });
  },
  async proveUpdateTransaction() {
    await state.transaction!.prove();
  },
  async getTransactionJSON() {
    return state.transaction!.toJSON();
  },
};

// Expose the API to be used by the main thread
Comlink.expose(api);


// Convert base64url → Uint8Array
function base64UrlToBytes(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const data = atob(base64 + pad);
  const bytes = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) bytes[i] = data.charCodeAt(i);
  return bytes;
}