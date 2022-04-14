import { nanoid } from "nanoid";
import { enc, SHA256 } from "crypto-js";
import { v5 } from "uuid";

export function createVerificationCode(): string {
  return nanoid(21);
}

export function encryptPassword(password: string): string {
  return SHA256(password).toString(enc.Base64);
}

// A namespace for creating v5 UUIDs
const cdsNamespace = "0a69782c-f1af-48c5-9aaf-078a4e511518";
function createV5(name: string): string {
  return v5(name, cdsNamespace);
}

export function createClassCode(educatorID: number, className: string) {
  const nameString = `${educatorID}_${className}`;
  return createV5(nameString);
}
