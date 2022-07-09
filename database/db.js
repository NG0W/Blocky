import postgres from 'postgres'

const sql = postgres({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: ' ',
    database: 'ImmoBloc'
})

export default sql