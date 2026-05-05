import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";

// Load .env from project root before anything else
dotenvConfig({ path: resolve(__dirname, "../../../.env") });
