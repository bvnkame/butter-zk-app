import { Bool, Field, PublicKey, Signature, ZkProgram } from "o1js";

// class Bytes64 extends Bytes(64) {}
// class Bytes256 extends Bytes(256) {}
// class Bytes1024 extends Bytes(1024) {}

const JWTProofProgram = ZkProgram({
    name: 'jwt-proof',
    publicOutput: Bool,
    methods: {
        verifyJWTProof: {
            privateInputs: [Field, PublicKey, Signature, Field, Field],
            async method(expectedHash: Field, issuerPubKey: PublicKey, jwtSignature: Signature, exp: Field, currentTime: Field) {
                // Verify expiration
                const notExpired = exp.greaterThan(currentTime);

                // Verify signature of the payload hash
                const payloadHash = expectedHash; 
                const signatureValid = jwtSignature.verify(issuerPubKey, [payloadHash]);

                // Final boolean: both conditions must hold
                const isValid = signatureValid.and(notExpired);

                return {
                    publicOutput: isValid,
                };
            },
        },
    },
});

class JWTProof extends ZkProgram.Proof(JWTProofProgram) {}

export { JWTProofProgram, JWTProof };