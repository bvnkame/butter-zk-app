import { Field, PrivateKey, Signature } from "o1js";
import { JWTProofProgram } from "./JWTProof.js";
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { JWTVerifyContract } from "./JWTVerifyContract.js";

// Compile
await JWTProofProgram.compile();

// await JWTVerifyContract.compile();

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
// let signature = key.split(".")[2];
// let signatureBytes = base64UrlToBytes(signature);
// let sigBase58 = bs58.encode(signatureBytes);
// let signatureField = Signature.fromBase58(sigBase58);

// [Field, PublicKey, Signature, Field, Field]

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