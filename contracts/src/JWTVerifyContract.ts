import { method, SmartContract, state, Field, State, Bool } from "o1js";
import { JWTProof } from "./JWTProof.js";

export class JWTVerifyContract extends SmartContract {
    @state(Field) updated = State<Field>();

    init() {
        super.init();
        this.updated.set(Field(0));
    }

    // this verify jwt token from SSO providers like Auth0, Clerk, etc.
    @method async verify(jwtProof: JWTProof) {
        // Require current state match old state
        const currentState = this.updated.get();
        this.updated.requireEquals(currentState);

        jwtProof.verify();

        const isValid = jwtProof.publicOutput;
        // Update state to indicate successful verification
        this.updated.set(currentState.add(1));
        // Ensure the proof indicates validity
        isValid.assertEquals(true);
    }
}