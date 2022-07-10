import { useState, useEffect } from "react";
import Image from 'next/image';

export default function displayUsers() {
    const [users, setUsers] = useState([]);

    async function getUsers() {
        const get = await fetch("http://localhost:3000/api/assets");
        const data = await get.json();
        setUsers(data);
    }
  
    useEffect(() => {
        getUsers()
    }, [])

    console.log(users)

    return (
        <div style={{ padding: 30 }}>
            <div>
            { users.map((user) => (
                <div key={user[1].id} className="border shadow rounded-xl overflow-hidden">
                    <div>
                        <p className='text-gray-400'> {user[1].id} </p>
                        <p className='text-2xl mb-4 font-bold text-white'> {user[1].surname} </p>
                        <p className='text-2xl mb-4 font-bold text-white'> {user[1].name} </p>
                        {/*
                        <Image
                            src={user[1].link}
                            width="350px"
                            height="330px"
                        />
                        <button className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded'
                        onClick={() => bidnft(user[1])}> Bid </button>
                        */}
                    </div>
                </div>
                ))
            }
            </div>
        </div>
    );
}