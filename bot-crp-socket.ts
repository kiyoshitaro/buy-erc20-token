import io, { Socket } from "socket.io-client";
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
  sendTransaction,
} from "./sdk/utils";
import { NATIVE_MINT } from "@solana/spl-token";
import _ from "lodash";
import WebSocket from "ws";
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

let globalState = {
  round: undefined,
  balance: undefined,
  allocation_amount: undefined,
  deposited_amount: undefined,
  symbol: undefined,
  tokenAddress: undefined,
  poolAddress: undefined,
};

const truncateGlobalState = (data?: any) => {
  globalState = {
    round: undefined,
    balance: undefined,
    allocation_amount: undefined,
    deposited_amount: undefined,
    symbol: undefined,
    tokenAddress: undefined,
    poolAddress: undefined,
  };
};
const saveGlobalState = (data?: any) => {
  try {
    // if (fs.existsSync(dataPath)) {
    //   fs.truncateSync(dataPath, 0);
    // }
    globalState = { ...globalState, ...data };
    fs.writeFileSync(dataPath, JSON.stringify(globalState));
  } catch (error) {
    console.log(error);
  }
};

const loadGlobalState = () => {
  let data: any = {};
  if (fs.existsSync(dataPath)) {
    data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  }
  console.log("LOAD GLOBAL", data);
  return data;
};

const getCoins = async (tokenAddress: string) => {
  const res = await axios.get(
    `${GM_FUN_API_ENDPOINT}/coins/${tokenAddress}?address=${creator?.publicKey?.toString()}`
  );
  return {
    symbol: res?.data?.data?.symbol,
    deposited_amount: res?.data?.data?.deposited_amount,
    allocation_amount: res?.data?.data?.allocation_amount,
  };
};
const handleGetBalance = async (tokenAddress: string) => {
  while (true) {
    try {
      const res = await getCoins(tokenAddress);
      if (res?.allocation_amount) {
        saveGlobalState(res);
        return res?.allocation_amount;
      }
    } catch (error) {
      console.log("getBalance ====> ", error.message);
    }
  }
};

const getClaimSignature = async (tokenAddress: string) => {
  let response;
  while (true) {
    try {
      const _response = await axios.post(
        `${GM_FUN_API_ENDPOINT}/coins/claimed`,
        {
          token_address: tokenAddress,
          wallet_address: creator.publicKey.toString(),
        }
      );
      response = _response.data.data;
      if (response) {
        break;
      }
    } catch (error) {
      console.log("getClaimSignature ====> ", error.message);
    }
  }
  const rawTx = web3.Transaction.from(Buffer.from(response, "base64"));
  rawTx.partialSign(creator);
  return rawTx;
};
const claim = async (rawTx: any) => {
  try {
    const txHash = await sendTransaction(rawTx.serialize().toString("base64"));
    console.log("Transaction hash:", txHash);
    return {
      tx_hash: txHash,
      message: "Claimed successfully",
    };
  } catch (e) {
    console.log("🚀 ~ file: claim ~ e", e.message);
    throw e;
  }
};
const getSwapSignature = async (
  tokenAddress: string,
  poolAddress: string,
  amount: number
) => {
  const slippage = [50, 100];
  while (true) {
    const transaction = await cPContract.swapRaydiumV4(
      creator.publicKey,
      new PublicKey(poolAddress),
      new PublicKey(tokenAddress),
      NATIVE_MINT,
      new BN(amount * 10 ** 6),
      slippage,
      true,
      false
    );
    if (transaction.finalIxs) {
      return transaction.finalIxs;
    }
  }
};
const swap = async (instruction: anchor.web3.TransactionInstruction[]) => {
  try {
    const dataSend = await createAndSendV0Tx(creator, instruction);
    return dataSend;
  } catch (e) {
    console.log("🚀 ~ file: swap ~ e", e.message);
    throw e;
  }
};
const handleSwap = async (
  tokenAddress: string,
  poolAddress: string,
  maxretry = 5
) => {
  let retry = 0;
  console.log("balance from API", globalState?.allocation_amount, poolAddress);
  while (true) {
    if (retry >= maxretry) return;
    if (!globalState?.allocation_amount) {
      const _bl = Number(
        await getBalanceByTokenAddressOnSolana(
          tokenAddress,
          creator.publicKey.toString()
        )
      );
      saveGlobalState({ allocation_amount: _bl });
      console.log(
        "🚀 ~ balance from CONTRACT:",
        globalState?.allocation_amount
      );
    }
    if (globalState.allocation_amount > 0) {
      const instruction = await getSwapSignature(
        tokenAddress,
        poolAddress,
        globalState.allocation_amount
      );
      try {
        await swap(instruction);
        console.log("======== SWAP SUCCESS =======");
        return;
      } catch (error) {
        retry += 1;
        console.log(retry, "🚀 ~~ retry:SWAP:", error.message);
      }
    }
  }
};

const handleclaim = async (tokenAddress: string, retry = 5) => {
  const rawTx = await getClaimSignature(tokenAddress);
  let _retry = 0;
  while (true) {
    if (_retry >= retry) return;
    try {
      await claim(rawTx);
      console.log("======== CLAIM SUCCESS =======");
      return;
    } catch (error) {
      _retry += 1;
      console.log(_retry, "🚀 ~ retry:CLAIM:", error.message);
    }
  }
};
async function autoClaimAndSell(tokenAddress: string, poolAddress: string) {
  saveGlobalState({ tokenAddress, poolAddress });
  await handleclaim(tokenAddress, 100);
  await handleSwap(tokenAddress, poolAddress, 20);
}
let socket: any;
const loadSocket = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket?.close();
    console.log(`🚀 CREATE NEW SOCKET CONNECTION : ${url}`);
    socket = io(url, {
      transports: ["websocket"],
    });
    // socket.emit("ping");
    // socket.on("pong", (payload: any) => {
    //   console.log("🚀 PONG", payload);
    // });
    socket.on("createRaydiumV4Event", async (data: any) => {
      console.log(
        data?.event_data?.token?.address,
        "-------",
        data?.event_data?.token?.raydium_pool
      );
      await autoClaimAndSell(
        data?.event_data?.token?.address,
        data?.event_data?.token?.raydium_pool
      );
      saveGlobalState();
    });
    socket.on("creatingRaydiumPool", async (data: any) => {
      await handleGetBalance(data?.event_data?.winner?.address);
    });
    socket.on("newRoundEvent", async (data: any) => {
      console.log(
        `========== START NEW ROUND ${data?.event_data?.round?.round_index}============`
      );
      saveGlobalState({
        round: data?.event_data?.round?.round_index,
      });
    });
    socket.on("contributeEvent", (payload: any) => {
      console.log(
        "🚀 ~ socket.on ~ payload:",
        payload?.event_name,
        "------",
        `${
          payload?.event_data?.wallet_txn?.wallet_address ===
          creator?.publicKey?.toString()
            ? `\x1b[31m${payload?.event_data?.wallet_txn?.wallet_address}\x1b[0m`
            : payload?.event_data?.wallet_txn?.wallet_address
        }`,
        ":",
        payload?.event_data?.wallet_txn?.amount,
        "SOL"
      );
      if (
        payload?.event_data?.wallet_txn?.wallet_address ===
        creator?.publicKey?.toString()
      ) {
        saveGlobalState({
        //   myContributes: globalState?.myContributes.push(
        //     payload?.event_data?.wallet_txn?.amount
        //   ),
          allocation_amount: undefined,
        });
      }
    });
    // socket.on("close", (payload: any) => {
    //   console.log("WebSocket closed");
    //   setTimeout(() => {
    //     loadSocket();
    //   }, 500);
    // });
    socket.on("disconnect", (payload: any) => {
      console.log("WebSocket disconnect");
      setTimeout(() => {
        loadSocket();
      }, 500);
    });
  }
};
// =======================================  MAIN ========================================
// SELF HANDLE
(async () => {
  //   const data = loadGlobalState();
  //   // await handleclaim(data?.tokenAddress);
  //   await handleSwap(data?.tokenAddress, data?.poolAddress);
})();
// LISTEN SOCKET
(async () => {
  loadSocket();
})();
