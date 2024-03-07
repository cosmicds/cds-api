import { nanoid } from "nanoid";
import { enc, SHA256 } from "crypto-js";
import { v5 } from "uuid";

import { Model } from "sequelize";

// This type describes objects that we're allowed to pass to a model's `update` method
export type UpdateAttributes<M extends Model> = Parameters<M["update"]>[0];

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

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function isArrayThatSatisfies<T extends Array<any>>(array: any, condition: (t: Array<any>) => boolean): array is T {
  return Array.isArray(array) && condition(array);
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function isNumberArray(arr: any): arr is number[] {
  return Array.isArray(arr) && arr.every(x => typeof x === "number");
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export function isStringArray(arr: any): arr is string[] {
  return Array.isArray(arr) && arr.every(x => typeof x === "string");
}
