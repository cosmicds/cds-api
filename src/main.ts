import { promises } from "fs";
import { join } from "path";
import { app } from "./server";

const STORIES_DIR = join(__dirname, "stories");
const MAIN_FILE = "main.js";

promises.readdir(STORIES_DIR, { withFileTypes: true }).then(entries => {
  entries.forEach(async (entry) => {
    if (entry.isDirectory()) {
      const file = join(STORIES_DIR, entry.name, MAIN_FILE);
      const data = await import(file);
      app.use(data.path, data.router);
    }
  });
}).then(() => {
  import("./server");
});


