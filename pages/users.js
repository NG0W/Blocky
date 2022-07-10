import getUsers from "./api/users"
import { useState, useEffect } from 'react'

export default function displayUsers() {
    const [users, setUsers] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    useEffect(() => { 
        loadUsers() 
    }, [])

    async function loadUsers() {
        const data = await getUsers()
        const items = await Promise.all(data.map(i => { 
            return {
                id: i.id,
                name: i.name,
                surname: i.surname,
                mail: i.mail
            }
        }))
        setUsers(items)
        setLoadingState('loaded')
    }

    if (loadingState === 'loaded' && !users.length) return (
        <h1 className='px-20 py-10 text-3xl'>No user registered yet.</h1>
    )
    
    return (
        <div style={{ padding: 30 }}>
            <div>
                { users.map(user =>
                    <div key={ user.id } style={{ padding: 20, borderBottom: '1px solid #ccc' }}>
                        <h2>{ user.surname } { user.name }</h2>
                        <p>{ user.mail }</p>
                    </div>
                )}
            </div>
        </div>
    )
}
