import pool from "../../database/db";

export default async function getUsers(req, res) {
    const query = await pool.query("SELECT * FROM assets");
    const items = query.rows
    const assets = Object.entries(items)

    res.status(200).json(assets);
}