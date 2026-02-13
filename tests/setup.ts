import { addTestData, setupTestDatabase } from "./utils";

export default async () => {
  await setupTestDatabase();
  await addTestData();
  await new Promise(r => setTimeout(r, 10_000));
};
