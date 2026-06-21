import { createApp } from "./app.js";
import { getDb } from "./db/index.js";

const PORT = Number(process.env.PORT) || 3001;

getDb();
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
