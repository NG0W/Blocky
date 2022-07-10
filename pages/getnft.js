import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import config from "../utils/config";
import {
  connectWallet,
  disconnectWallet,
  getActiveAccount,
  checkIfWalletConnected,
} from "../utils/wallet";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export default function CreateItem() {
  const [fileUrl, setFileURL] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("null");
  const [formInput, updateFormInput] = useState({ name: "", symbol: "" });
  const [wallet, setWallet] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [storageWallet, setStorageWallet] = useState(null);

  const router = useRouter();
  const setAuth = (str) => {
    setIsAuthenticated(str);
  };

  const isConnectWallet = async () => {
    const { wallet } = await connectWallet();
    setAuth(wallet.address);
    setWallet(wallet);
    console.log("wallet", wallet);
  };

  const isAdmin = async () => {
    const tezos = new TezosToolkit(config.rpc);
    tezos.setWalletProvider(wallet);
    await tezos.contract
      .at("KT1RGSXDSy2Ex8YArtsQ2vpTPEvnkByMfU5B")
      .then((myContract) => {
        console.log(myContract.storage());
        setStorageWallet(myContract.storage());
        return myContract.storage();
      });
  };

  const getLocalStorage = async () => {
    console.log(localStorage);
  };
  return (
    <div>
      <button onClick={isAdmin}>Mint NFT</button>
      <button onClick={getLocalStorage}>getLocalStorage</button>
    </div>
  );
}
