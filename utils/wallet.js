import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";
import config from "./config";
const preferredNetwork = "hangzhounet";
const options = {
  name: "NFT",
  iconUrl: "https://tezostaquito.io/img/favicon.png",
  preferredNetwork: preferredNetwork,
};
const rpcURL = "https://hangzhounet.smartpy.io";
const wallet = new BeaconWallet(options);

const getActiveAccount = async () => {
  return await wallet.client.getActiveAccount();
};

const connectWallet = async () => {
  const Tezos = new TezosToolkit(config.rpc);
  const options = {
    name: "Blocky",
    iconUrl: config.logo,
    preferredNetwork: config.network,
  };
  const wallet = new BeaconWallet(options);
  console.log(wallet);
  const perm = null;
  try {
    console.log("Requesting permissions...");
    const permissions = await wallet.client.requestPermissions({
      network: { type: config.network },
    });
    console.log("Got permissions:", permissions.address);
  } catch (error) {
    console.log("Got error:", error);
  }
  return { success: true, wallet: permissions };
};

const disconnectWallet = async () => {
  await wallet.disconnect();
  return { success: true, wallet: null };
};

const checkIfWalletConnected = async (wallet) => {
  try {
    const activeAccount = await wallet.client.getActiveAccount();
    if (!activeAccount) {
      await wallet.client.requestPermissions({
        type: { network: preferredNetwork },
      });
    }
    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error,
    };
  }
};

export {
  connectWallet,
  disconnectWallet,
  getActiveAccount,
  checkIfWalletConnected,
};
