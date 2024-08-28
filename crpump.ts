import io from "socket.io-client";
import axios from "axios";
import * as solanaWeb3 from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import path from "path";
import * as fs from "fs";
import {
  cPContract,
  createAndSendV0Tx,
  getBalanceByTokenAddressOnSolana,
  parseContribute,
  parseCreateRaydiumV4,
  sendTransaction,
} from "./sdk/utils";
import { NATIVE_MINT } from "@solana/spl-token";
import _ from "lodash";
import { sleep } from "zksync-web3/build/src/utils";
dotenv.config({ path: path.join(__dirname, "./.env") });
const isMainet = Boolean(Number(process.env.IS_MAINET || 0) == 1);

const dataPath = "data.json";
const url = isMainet
  ? "wss://ws.gm.fun/events"
  : "wss://crowdpump-ws-dev.uslab.dev/events";

const GM_FUN_API_ENDPOINT = isMainet
  ? "https://api.gm.fun"
  : "https://crowdpump-api-dev.uslab.dev";
const creator = solanaWeb3.Keypair.fromSecretKey(
  bs58.decode(process.env.SOL_PK)
);
const claim = async (tokenAddress: string) => {
  try {
    const response = await axios.post(`${GM_FUN_API_ENDPOINT}/coins/claimed`, {
      token_address: tokenAddress,
      wallet_address: creator.publicKey.toString(),
    });
    const rawTx = web3.Transaction.from(
      Buffer.from(response?.data?.data, "base64")
    );
    rawTx.partialSign(creator);
    const txHash = await sendTransaction(rawTx.serialize().toString("base64"));
    console.log("Transaction hash:", txHash);
    return {
      tx_hash: txHash,
      message: "Claimed successfully",
    };
  } catch (e) {
    console.log(
      "🚀 ~ file: user.service.ts ~ line 153 ~ UserService ~ contribute ~ e",
      e.message
    );
    throw e;
  }
};
const swap = async (
  tokenAddress: string,
  poolAddress: string,
  amount: number
) => {
  try {
    const slippage = [20, 100];
    const transaction = await cPContract.swapRaydiumV4(
      creator.publicKey,
      new PublicKey(poolAddress),
      new PublicKey(tokenAddress),
      NATIVE_MINT,
      new BN(amount * 10 ** 6),
      slippage,
      true
    );
    const dataSend = await createAndSendV0Tx(creator, transaction.finalIxs);
    return dataSend;
  } catch (e) {
    console.log(
      "🚀 ~ file: user.service.ts ~ line 153 ~ UserService ~ contribute ~ e",
      e.message
    );
    throw e;
  }
};

const handleSwap = async (
  tokenAddress: string,
  poolAddress: string,
  maxretry = 5
) => {
  let retry = 0;
  while (true) {
    if (retry >= maxretry) return;
    const balance = Number(
      await getBalanceByTokenAddressOnSolana(
        tokenAddress,
        creator.publicKey.toString()
      )
    );
    console.log("🚀 ~ autoClaimAndSell ~ balance:", balance);
    if (balance > 0) {
      try {
        await swap(tokenAddress, poolAddress, balance);
        console.log("======== SWAP SUCCESS =======");
        return;
      } catch (error) {
        retry += 1;
        console.log("🚀 ~ socket.on ~ retry:SWAP", retry);
      }
    }
  }
};

const handleclaim = async (tokenAddress: string, retry = 5) => {
  let _retry = 0;
  while (true) {
    if (_retry >= retry) return;
    try {
      await claim(tokenAddress);
      console.log("======== CLAIM SUCCESS =======");
      return;
    } catch (error) {
      if (error.message.includes("Request failed with status code 400")) {
        console.log("Waiting for 0.5 seconds...");
        sleep(500);
      }
      _retry += 1;
      console.log("🚀 ~ retry:CLAIM", _retry);
    }
  }
};
async function autoClaimAndSell(tokenAddress: string, poolAddress: string) {
  console.log("🚀 ~ ++++++++++++++++++++++", tokenAddress, poolAddress);
  try {
    if (fs.existsSync(dataPath)) {
      fs.truncateSync(dataPath, 0);
      fs.writeFileSync(dataPath, JSON.stringify({ tokenAddress, poolAddress }));
    }
  } catch (error) {
    console.log(error);
  }
  await handleclaim(tokenAddress, 10);
  await handleSwap(tokenAddress, poolAddress, 10);
}

let fromSignature: string;
let isRunning = false;
const _checkSyncing = () => {
  return isRunning;
};
const _lockSyncing = () => {
  isRunning = true;
};
const _unlockSyncing = (latestSignature: string) => {
  isRunning = false;
  if (latestSignature && latestSignature !== fromSignature) {
    fromSignature = latestSignature;
  }
};

async function getTxnLogs() {
  if (_checkSyncing()) {
    console.log("======= Syncing is in progress ... =======");
    return;
  }
  _lockSyncing();
  let latestSignature;
  try {
    const { data: signatures, latestSignature: _latestSignature } =
      await cPContract.getTransactions(fromSignature);
    latestSignature = _latestSignature;
    if (latestSignature !== fromSignature) {
      const rs = [];
      for (const signature of signatures) {
        const transactions = await cPContract.parseTransactions(signature);
        const transaction_push = [];
        for (const transaction of transactions) {
          if (!transaction?.meta?.err) transaction_push.push(transaction);
        }
        rs.push(transaction_push);
      }
      const events = cPContract.parseEvents(_.flatten(rs)).reverse();
      console.log(
        `🚀 ~ SyncSMCService ~ getTxnLogs : FROM ${fromSignature} ---> ${latestSignature} : ${events.length}`
      );
      const logsParseContribute = parseContribute(events);
      const logsCreateRaydiumPool = parseCreateRaydiumV4(events);
      if (logsParseContribute.length > 0) {
        console.log(
          "CONTRIBUTE: ",
          logsParseContribute.map(
            (dt) => `${dt?.user} ------- ${dt?.sol_amount / 10 ** 9} SOL`
          )
        );
      }
      if (logsCreateRaydiumPool.length > 0) {
        const roundData = await cPContract.fetchRoundWithPubkey(
          logsCreateRaydiumPool[0]?.round
        );
        console.log("ROUND: ------> ", roundData?.index.toString());
        await autoClaimAndSell(
          roundData?.topMint.toString(),
          logsCreateRaydiumPool[0]?.amm
        );
        return true;
      }
    }
  } catch (error) {
    console.log("🚀 ~ SyncSMCService ~ getTxnLogs ~ error:", error);
  }
  _unlockSyncing(latestSignature);
}
// =======================================  MAIN ========================================
// LISTEN ONCHAIN
(async () => {
  //   fromSignature =
  //     "3Gay4c5ZNANjy5iG33Bn6CjsnCjvgoMJjtgGBWzaAE4ipT21Amc58oUMyWtv1qco2HLPUyk5VZjYo5iynhahCt3Q";
  fromSignature = await cPContract.getLatestTransaction();
  while (true) {
    let t = await getTxnLogs();
    if (t) return;
    sleep(200);
  }
})();

// SELF HANDLE
(async () => {
  // TODO: read & write from file
  const data = fs.readFileSync(dataPath, "utf8");
  console.log(data);
  // Parse the JSON string into an object
  const tokenAddress = "6oxMVKS43DSSqBxGj5R7ktiFjXGBkHfJ6yptXD6AvPBU";
  const poolAddress = "PQ3pKowzpNS8ZUk7AwXPt32gLmLh2JQZksEVLdextCc";
  await handleclaim(tokenAddress);
  await handleSwap(tokenAddress, poolAddress);
})();

// LISTEN SOCKET
// (async () => {
//   console.log(`🚀 URL : ${url}`);
//   const socket = io(url, {
//     transports: ["websocket"],
//   });
//   //   socket.emit("ping");
//   //   socket.on("pong", (payload: any) => {
//   //     console.log("🚀 PONG", payload);
//   //   });
//   socket.on("createRaydiumV4Event", async (data: any) => {
//     await autoClaimAndSell(
//       data?.event_data?.token?.address,
//       data?.event_data?.token?.raydium_pool
//     );
//   });
//   socket.on("contributeEvent", (payload: any) => {
//     console.log(
//       "🚀 ~ socket.on ~ payload:",
//       payload?.event_name,
//       "------",
//       payload?.event_data?.wallet_txn?.wallet_address
//     );
//   });
//   socket.on("close", (payload: any) => {
//     console.log("close");
//   });
//   socket.on("disconnect", (payload: any) => {
//     console.log("disconnect");
//   });
// })();
