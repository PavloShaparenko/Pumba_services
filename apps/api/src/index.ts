import pool from "./services/pool";

async function connectDB() {
    try {
        const result = await pool.query(
            "SELECT current_user FROM current_database()",
        );
        console.log("succes connection");
        console.log(result.rows[0]);
    } catch (error) {
        console.error("not succes:", error);
    } finally {
        await pool.end();
    }
}

connectDB();
