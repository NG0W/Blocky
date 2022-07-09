import { useState, Image } from "react"
import { create as ipfsHttpClient } from "ipfs-http-client"
import { useRouter } from 'next/router'

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0")

export default function CreateItem() {
  const [fileUrl, setFileURL] = useState(null)
  const [formInput,  updateFormInput] = useState({name: "", symbol: ""})
  const router = useRouter()

  async function onFileUpload(event) {
    const file = event.target.files[0]

    try {
        const added = await client.add(file, {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      setFileURL(url)
    } catch(error) {
      console.log(e)
    }
  }

  async function createItem() {
    const {name, symbol} = formInput

    if(!name || !symbol || !fileUrl) return
    const data = JSON.stringify({
      name, symbol, image: fileUrl
    })

    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      createSale(url)
    } catch(error) {
      console.log(e)
    }
  }

  async function createSale(uri) {
    {/* TODO */}
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
        placeholder="Name"
        className="mt-8 border rounded p-4"
        onChange={e => updateFormInput({...formInput, name: e.target.value})}
        />

        <input
        placeholder="Symbol"
        className="mt-8 border rounded p-4"
        onChange={e => updateFormInput({...formInput, symbol: e.target.value})}
        />

        <input
        type="file"
        name="Asset"
        className="my-4"
        onChange={onFileUpload}
        />

        <button
        onClick={createItem}
        className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          Create NFT
        </button>
      </div>
    </div>
  )
}