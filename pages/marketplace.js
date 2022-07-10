import { create as ipfsHttpClient } from "ipfs-http-client";
import Image from 'next/image'
import { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import config from "../utils/config";
import styles from "../styles/Home.module.css";
import { connectWallet, disconnectWallet, getActiveAccount, checkIfWalletConnected } from "../utils/wallet";
import { NotificationResponseMessage } from "pg-protocol/dist/messages";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export default function getMarketplace() {
  const [fileUrl, setFileURL] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("null");
  const [formInput, updateFormInput] = useState({ name: "", symbol: "" });
  const [wallet, setWallet] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageWallet, setStorageWallet] = useState(null);
  const [nfts, setNFT] = useState([{}]);
  const [price, setPrice] = useState(null);
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
      setPrice(price);
    }
    console.log(sold)

    // Available nfts with sale ids
    const metadatas = storage['token_metadata']['valueMap'];
    const itmetas = metadatas.entries();
    for (const meta of itmetas) {
      const getUri = await fetch(meta[1].uri);
      const uri = await getUri.json()
      const nftid = Number(meta[0].substr(1, 1));
      sold.includes(nftid) ? setNFT([uri]) : '';
    }
  }

  async function createItem(nftid) {
    console.log("here");
    const { name, symbol } = formInput;
    const Tezos = new TezosToolkit(config.rpc);
    const options = {
      name: "Blocky",
      iconUrl: config.logo,
      preferredNetwork: config.network,
    };
    const wallet = new BeaconWallet(options);
    console.log(wallet);

    try {
      console.log("Requesting permissions...");
      const permissions = await wallet.client.requestPermissions({
        network: { type: config.network },
      });
      console.log("Got permissions:", permissions.address);
      permissions.address !== "undefined" ? setIsAuthenticated(permissions.address) : setIsAuthenticated(false);
    } catch (error) {
      console.log("Got error:", error);
    }
    Tezos.setWalletProvider(wallet);

    Tezos.wallet
      .at(config.NFTcontractAddress)
      .then((contract) => {
        return contract.methods
          .buy(nftid)
          .send({amount: 5});
      })
      .then((op) => {
        console.log(`Waiting for transaction to be confirmed...`);
        return op.confirmation(3).then(() => op.hash);
      })
      .then((hash) =>
        console.log(`Operation injected: https://jakarta.tzstats.com/${hash}`)
      )
      .catch((error) => console.log("error : ", error));
  }

  useEffect(() => { getContractNFT() }, []);

  return (
    <div style={{ padding: 30 }}>
        <div>
        { nfts.map((nft, i) => (
          <div key={i} className={styles.card}>
            <div>
              <p className='text-2xl mb-4 font-bold text-white'> {nft.name} </p>
              <p className='text-2xl mb-4 font-bold text-white'> {nft.symbol} </p>
              <p className='text-2xl mb-4 font-bold text-white'><img src={nft.image} className="rounded" width="300px" height="300px"/></p>
              <button className='w-full bg-pink-500 text-white font-bold py-2 px-12 rounded' onClick={() => createItem(0)}>Buy</button>
            </div>
          </div>
        ))}
        </div>
    </div>
  );
}