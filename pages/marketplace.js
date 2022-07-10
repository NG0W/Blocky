import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import config from "../utils/config";
import { connectWallet, disconnectWallet, getActiveAccount, checkIfWalletConnected } from "../utils/wallet";
import { NotificationResponseMessage } from "pg-protocol/dist/messages";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export default function CreateItem() {
  const [fileUrl, setFileURL] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("null");
  const [formInput, updateFormInput] = useState({ name: "", symbol: "" });
  const [wallet, setWallet] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageWallet, setStorageWallet] = useState(null);
  const nfts = [];
  const sold = [];

  async function getContractNFT() {
    const tezos = new TezosToolkit(config.rpc);
    tezos.setWalletProvider(wallet);
    const contract = await tezos.contract.at(config.NFTcontractAddress);
    const storage = await contract.storage();

    // Sales done
    const sales = storage['sales']['valueMap'];
    const itsales = sales.entries();
    for (const sale of itsales) {
      const saleid = sale[1]['nft_id']['c'][0];
      const price = sale[1]['price']['c'][0];
      sold.push(saleid);
    }

    // Available nfts with sale ids
    const metadatas = storage['token_metadata']['valueMap'];
    const itmetas = metadatas.entries();
    for (const meta of itmetas) {
      const getUri = await fetch(meta[1].uri);
      const uri = await getUri.json()
      const nftid = Number(meta[0].substr(1, 1));
      sold.includes(nftid) ? nfts.push(uri) : '';
    }
    console.log
    setStorageWallet(storage)
  }

  useEffect(() => { getContractNFT() }, []);
  console.log(nfts)

  return (
    <div style={{ padding: 30 }}>
        <div>
        { nfts.forEach((nft, i) => (
          <div key={i} className="border shadow rounded-xl overflow-hidden">
            <div>
              <p className='text-gray-400'>{i}</p>
              <p className='text-2xl mb-4 font-bold text-white'> {nft[0].name} </p>
              <p className='text-2xl mb-4 font-bold text-white'> {nft[0].symbol} </p>
              <Image src={nft[0].image} width="350px" height="330px"/>
              <button className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded' onClick={() => bidnft(nft[0])}>Bid</button>
            </div>
          </div>
        ))}
        </div>
    </div>
  );
}