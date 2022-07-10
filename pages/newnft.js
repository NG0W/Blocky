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

  async function onFileUpload(event) {
    const file = event.target.files[0];

    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileURL(url);
    } catch (error) {
      console.log(e);
    }
  }

  async function createItem() {
    console.log("here");
    const { name, symbol } = formInput;

    console.log("form input "+formInput)
    if (!name || !symbol || !fileUrl) return;
    const data = JSON.stringify({
      name,
      symbol,
      image: fileUrl,
    });
    console.log("data : " + data)
    console.log("data : " + formInput.name)
    try {
      const added = await client.add(data);
      // const url = ;
      // console.log("URL " + url)
      setMetadataUrl(`https://ipfs.infura.io/ipfs/${added.path}`);
      console.log("url des metadatas : " + metadataUrl)
    } catch (error) {
      console.log(e);
    }
    console.log("laaa");

    const Tezos = new TezosToolkit(config.rpc);
    const options = {
      name: "Blocky",
      iconUrl:
        "https://img.lovepik.com/free-png/20220125/lovepik-real-estate-building-logo-png-image_401737177_wh860.png",
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
      permissions.address !== "undefined"
        ? setIsAuthenticated(permissions.address)
        : setIsAuthenticated(false);
    } catch (error) {
      console.log("Got error:", error);
    }
    Tezos.setWalletProvider(wallet);

    Tezos.wallet
      .at(config.NFTcontractAddress)
      .then((contract) => {
        console.log("Data.name = ", data.name)
        console.log("Data.symbol = ", data.symbol)
        console.log("Data.fileUrl = ", data.fileUrl)
        return contract.methods.mint(
          formInput.name, 
          formInput.symbol, 
          metadataUrl).send();
      })
      .then((op) => {
        console.log(`Waiting for ${op.hash} to be confirmed...`);
        return op.confirmation(3).then(() => op.hash);
      })
      .then((hash) =>
        console.log(`Operation injected: https://jakarta.tzstats.com/${hash}`)
      )
      .catch((error) => console.log("error : ", error));
  }
  // async function createSale() {
  //   console.log("laaa");
  //   const Tezos = new TezosToolkit(config.rpc);
  //   const options = {
  //     name: "Blocky",
  //     iconUrl:
  //       "https://img.lovepik.com/free-png/20220125/lovepik-real-estate-building-logo-png-image_401737177_wh860.png",
  //     preferredNetwork: config.network,
  //   };

  //   const wallet = new BeaconWallet(options);
  //   console.log(wallet);

  //   try {
  //     console.log("Requesting permissions...");
  //     const permissions = await wallet.client.requestPermissions({
  //       network: { type: network },
  //     });
  //     console.log("Got permissions:", permissions.address);
  //     permissions.address !== "undefined"
  //       ? setIsAuthenticated(permissions.address)
  //       : setIsAuthenticated(false);
  //   } catch (error) {
  //     console.log("Got error:", error);
  //   }
  //   Tezos.setWalletProvider(wallet);

  //   Tezos.wallet
  //     .at(config.NFTcontractAddress)
  //     .then((contract) => {
  //       console.log(`Incrementing storage value by ...`);
  //       return contract.methods
  //         .createSale(2, {
  //           amount: 50000000,
  //           to: "tz1W7QTkztWhg9sj5fTu5jdrHKWPqDDd2pUM",
  //         })
  //         .send();
  //     })
  //     .then((op) => {
  //       console.log(`Waiting for ${op.hash} to be confirmed...`);
  //       return op.confirmation(3).then(() => op.hash);
  //     })
  //     .then((hash) =>
  //       console.log(`Operation injected: https://ithaca.tzstats.com/${hash}`)
  //     )
  //     .catch((error) => console.log("error : ", error));
  // }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Name"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <input
          placeholder="Symbol"
          className="mt-8 border rounded p-4"
          onChange={(e) =>
            updateFormInput({ ...formInput, symbol: e.target.value })
          }
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onFileUpload}
        />
        {wallet ? (
          <button onClick={createItem}>Mint NFT</button>
        ) : (
          <button onClick={isConnectWallet}>Connect Wallet</button>
        )}{" "}
        {/* {wallet ? (
          <button onClick={createSale}>Create sale</button>
        ) : (
          <button onClick={isConnectWallet}>Connect Wallet</button>
        )} */}
      </div>
    </div>
  );
}
