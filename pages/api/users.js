import sql from '../../database/db'

export default async function getUsers() {
    return await sql`select * from users`;
}