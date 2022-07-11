import { create as ipfsHttpClient } from "ipfs-http-client";
import { useState, useEffect } from "react";
import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import config from "../utils/config";
import { connectWallet, disconnectWallet, getActiveAccount, checkIfWalletConnected } from "../utils/wallet";

export default function createSale() {
  const [formInput, updateFormInput] = useState({ nftid: "", price: "", topay: "", from: "" });
  const [wallet, setWallet] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (str) => {
    setIsAuthenticated(str);
  };

  const isConnectWallet = async () => {
    const { wallet } = await connectWallet();
    setAuth(wallet.address);
    setWallet(wallet);
    console.log("wallet", wallet);
  };

  async function newSale() {
    const { nftid, price, topay, from } = formInput;
    if (!nftid || !price || !topay || !from) return;

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

    const listedSale = {
      active: true,
      nft_id: nftid,
      price: price,
      to_pay: topay
    }

    const transferParams = {
      _from: from,
      _to: config.NFTcontractAddress,
      token_id: nftid
    }

    Tezos.wallet
      .at(config.NFTcontractAddress)
      .then((contract) => {
        return contract.methods
        .createSale(listedSale, transferParams)
        .send();
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

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="NFT ID"
          className="mt-8 border rounded p-4"
          onChange={(e) => updateFormInput({ ...formInput, nftid: e.target.value })}
        />
        <input
          placeholder="PRICE"
          className="mt-8 border rounded p-4"
          onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          placeholder="TO_PAY"
          className="mt-8 border rounded p-4"
          onChange={(e) => updateFormInput({ ...formInput, topay: e.target.value })}
        />
        <input
          placeholder="FROM"
          className="mt-8 border rounded p-4"
          onChange={(e) => updateFormInput({ ...formInput, from: e.target.value })}
        />
        {wallet ? (
          <button onClick={createSale}>Create Sale</button>
        ) : (
          <button onClick={isConnectWallet}>Connect Wallet</button>
        )}{" "}
      </div>
    </div>
  );
}
