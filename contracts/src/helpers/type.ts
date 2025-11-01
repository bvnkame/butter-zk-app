import { Struct } from "o1js";

export class JWTValueInputs extends Struct({
  header: String,
  payload: String,
  signature: String,
}) {}