import * as z from "zod"
import { join } from "path";

const Config = z.object({
    EXCHANGE_DB_HOST: z.string().default("localhost"),
    EXCHANGE_DB_PORT: z.string().default("5432").transform(Number),
    EXCHANGE_DB_NAME: z.string().default("test"),
    EXCHANGE_DB_USER: z.string().default("root"),
    EXCHANGE_DB_PASSWORD: z.string().default("1234"),
    DATA_FILE_PATH: z.string().default(join(__dirname, "..", "..", "files", "test-data.txt")),
    PORT: z.string().default("8080").transform(Number),
});

const res = Config.safeParse(process.env);
if(!res.success) {
    console.error("Environment variable errors:", res.error.format())
    process.exit(1);
}
export type Config = z.infer<typeof Config>;
export const config = res.data;
