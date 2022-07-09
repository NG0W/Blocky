import sql from '../../database/db'

export default async function getUsers(req, res) {
    const users = await sql`select * from users`;
    res.status(200).json({ users: users });
}