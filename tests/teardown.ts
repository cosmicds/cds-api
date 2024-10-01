import { teardownTestDatabase } from "./utils";

export default async () => {
  await teardownTestDatabase();
};
