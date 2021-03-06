import pool from "../../database/db";

export default async function getUsers(req, res) {
    const query = await pool.query("SELECT * FROM users");
    const items = query.rows
    const users = Object.entries(items)

    res.status(200).json(users);
}