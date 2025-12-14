import {Pool} from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: parseInt(process.env.PGPORT || "5432"),
});

pool.on("connect", () => {
    console.log("Connected to the database");
})

pool.on("error", (err) => {
    console.error("Database error", err);
})

export { pool };
