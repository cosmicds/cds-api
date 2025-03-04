import { teardownTestDatabase } from "./utils";

export default async () => {
  await teardownTestDatabase();
  await new Promise(r => setTimeout(r, 10_000));
};
