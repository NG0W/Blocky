import { InMemorySigner } from '@taquito/signer';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';
import nft from '../contracts/NFT.json';
import * as dotenv from 'dotenv'
console.log(__dirname);
dotenv.config(({path:__dirname+'/.env'}))

const rpc: string | undefined = process.env.RPC.toString() || undefined; 
const pk: string | undefined = process.env.PK.toString() || undefined;
console.log("RPC :" + rpc);
console.log("PK : " + pk);
const Tezos = new TezosToolkit(rpc);
const signer = new InMemorySigner(pk);
Tezos.setProvider({ signer: signer })

let counter = 0
let balance = new MichelsonMap();
let operator_approvals = new MichelsonMap();
let uris = new MichelsonMap();
let token_metadata = new MichelsonMap();
let salesCounter = 0
let whitelist = [];
let files = new MichelsonMap();
let sales = new MichelsonMap();
let owner = "tz1PRoqjLQezi2sJkA2RTxNddLzajrvmknVW";

async function orig() {

    const store = {
        'balance' : balance,
        'operator_approvals' : operator_approvals,
        'uris' : uris,
        'counter': counter,
        'salesCounter': salesCounter,
        'token_metadata' : token_metadata,
        'whitelist': whitelist,
        'owner': owner,
        'sales': sales,
        'files' : files
    }

    try {
        const originated = await Tezos.contract.originate({
            code: nft,
            storage: store,
        })
        console.log(`Waiting for nft contract ${originated.contractAddress} to be confirmed...`);
        await originated.confirmation(2);
        console.log('confirmed nft: ', originated.contractAddress);


    } catch (error: any) {
        console.log(error)
    }
}

orig();