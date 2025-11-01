import { createCurveAffine } from 'node_modules/o1js/dist/node/bindings/crypto/elliptic-curve.js';
import { initialAggregator } from 'node_modules/o1js/dist/node/lib/provable/gadgets/elliptic-curve.js';
import { Bool, Bytes, Crypto, Hash, Provable, ProvableType, ZkProgram, createEcdsa, createForeignCurve } from 'o1js';
import { Field3 } from 'node_modules/o1js/dist/node/lib/provable/gadgets/foreign-field.js';

import { Ecdsa as EcdsaVerify, Point } from 'node_modules/o1js/dist/node/lib/provable/gadgets/elliptic-curve.js';

export { Bytes32, Ecdsa, Secp256k1, ecdsa, ecdsaEthers, keccakAndEcdsa, secp256k1Verify, EcdsaVerify, secp256r1programNoEndo };

// class Secp256r1 extends createForeignCurve(Crypto.CurveParams.Secp256r1) {}
class Secp256k1 extends createForeignCurve(Crypto.CurveParams.Secp256k1) {}

class Scalar extends Secp256k1.Scalar {}
class Ecdsa extends createEcdsa(Secp256k1) {}
class Bytes32 extends Bytes(32) {}

const Secp256r1 = createCurveAffine(Crypto.CurveParams.Secp256r1);
const Secp256k1CurveAffine = createCurveAffine(Crypto.CurveParams.Secp256k1);

const keccakAndEcdsa = ZkProgram({
  name: 'ecdsa',
  publicInput: Bytes32,
  publicOutput: Bool,

  methods: {
    verifyEcdsa: {
      privateInputs: [Ecdsa, Secp256k1],
      async method(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1) {
        return {
          publicOutput: signature.verify(message, publicKey),
        };
      },
    },
  },
});

const ecdsa = ZkProgram({
  name: 'ecdsa-only',
  publicInput: Scalar,
  publicOutput: Bool,

  methods: {
    verifySignedHash: {
      privateInputs: [Ecdsa, Secp256k1],
      async method(message: Scalar, signature: Ecdsa, publicKey: Secp256k1) {
        return {
          publicOutput: signature.verifySignedHash(message, publicKey),
        };
      },
    },
  },
});

const ecdsaEthers = ZkProgram({
  name: 'ecdsa-ethers',
  publicInput: Bytes32,
  publicOutput: Bool,

  methods: {
    verifyEthers: {
      privateInputs: [Ecdsa, Secp256k1],
      async method(message: Bytes32, signature: Ecdsa, publicKey: Secp256k1) {
        return { publicOutput: signature.verifyEthers(message, publicKey) };
      },
    },
  },
});

const ia = initialAggregator(Secp256k1CurveAffine);
const config = { G: { windowSize: 4 }, P: { windowSize: 4 }, ia };
const secp256k1Verify = ZkProgram({
    name: 'ecdsa-secp256k1',
    publicOutput: Bool,
    methods: {
        verifySecp256k1: {
            privateInputs: [Field3, EcdsaVerify.Signature, Point],
            async method(msgHash: Field3, signature: EcdsaVerify.Signature, publicKey: Point) {
                let signature_ = Provable.witness(EcdsaVerify.Signature, () => signature);
                let msgHash_ = Provable.witness(Field3, () => msgHash);
                let publicKey_ = Provable.witness(Point, () => publicKey);
                return {
                    publicOutput: EcdsaVerify.verify(Secp256k1CurveAffine, signature_, msgHash_, publicKey_, config),
                };
            },
        },
    },
});


const r1ia = initialAggregator(Secp256r1);
const r1Config = { G: { windowSize: 4 }, P: { windowSize: 4 }, r1ia };
const secp256r1programNoEndo = ZkProgram({
    name: 'ecdsa-secp256r1-no-endo',
    publicOutput: Bool,
    methods: {
        ecdsa: {
            privateInputs: [Field3, EcdsaVerify.Signature, Point],
            async method(msgHash: Field3, signature: EcdsaVerify.Signature, publicKey: Point) {
                let signature_ = Provable.witness(EcdsaVerify.Signature, () => signature);
                let msgHash_ = Provable.witness(Field3, () => msgHash);
                let publicKey_ = Provable.witness(Point, () => publicKey);
                return {
                    publicOutput: EcdsaVerify.verify(Secp256r1, signature_, msgHash_, publicKey_, r1Config),
                };
            },
        },
    },
});

/**
 * We can also use a different hash function with ECDSA, like SHA-256.
 */
// const sha256AndEcdsa = ZkProgram({
//   name: 'ecdsa-sha256',
//   publicInput: Bytes32,
//   publicOutput: Bool,

//   methods: {
//     verifyEcdsa: {
//       privateInputs: [Ecdsa, Secp256r1],
//       async method(message: Bytes32, signature: Ecdsa, publicKey: Secp256r1) {
//         let messageHash = Hash.SHA2_256.hash(message);
//         return {
//           publicOutput: signature.verifySignedHash(messageHash, publicKey),
//         };
//       },
//     },
//   },
// });