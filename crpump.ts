import io from "socket.io-client";
import axios from "axios";
import * as solanaWeb3 from "@solana/web3.js";
import { BN, web3 } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import bs58 from "bs58";
import * as dotenv from "dotenv";
import path from "path";
import {
  cPContract,
  createAndSendV0Tx,
  getBalanceByTokenAddressOnSolana,
  sendTransaction,
} from "./sdk/utils";
import { NATIVE_MINT } from "@solana/spl-token";
dotenv.config({ path: path.join(__dirname, "./.env") });
const isMainet = Boolean(Number(process.env.IS_MAINET || 0) == 1);

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
      e
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
    console.log("🚀 ~ UserService ~ swap ~ transaction:", transaction);
    const dataSend = await createAndSendV0Tx(creator, transaction.finalIxs);
    console.log("🚀 ~ UserService ~ swap ~ dataSend:", dataSend);
    return dataSend;
  } catch (e) {
    console.log(
      "🚀 ~ file: user.service.ts ~ line 153 ~ UserService ~ contribute ~ e",
      e
    );
    throw e;
  }
};

const handleSwap = async (token: any, balance: number) => {
  let retry = 0;
  while (true) {
    if (retry >= 5) return;
    try {
      await swap(token?.address, token?.raydium_pool, balance);
      console.log("======== SWAP SUCCESS =======");
      return;
    } catch (error) {
      retry += 1;
      console.log("🚀 ~ socket.on ~ retry:SWAP", retry);
    }
  }
};

const handleclaim = async (tokenAddress: string) => {
  let retry = 0;
  while (true) {
    if (retry >= 5) return;
    try {
      await claim(tokenAddress);
      console.log("======== CLAIM SUCCESS =======");
      return;
    } catch (error) {
      retry += 1;
      console.log("🚀 ~ socket.on ~ retry:CLAIM", retry);
    }
  }
};

(async () => {
  const tokenAddress = "J6gQsPShEAdwi9zSLJCddGrBoBB9kBcroLY3wePCQs2q";
  const poolAddress = "CA72TEWZjcYCi4YXCRCakXk28s996i5Z3ge9JjJueUY";
  //   await handleclaim(tokenAddress);
  const balance = await getBalanceByTokenAddressOnSolana(
    tokenAddress,
    creator.publicKey.toString()
  );
  console.log("🚀 ~ socket.on ~ balance:", balance);
  //   await handleSwap(
  //     {
  //       address: tokenAddress,
  //       raydium_pool: poolAddress,
  //     },
  //     balance
  //   );
})();

(async () => {
  console.log(`🚀 URL : ${url}`);
  const socket = io(url, {
    transports: ["websocket"],
  });
  //   socket.emit("ping");
  //   socket.on("pong", (payload: any) => {
  //     console.log("🚀 PONG", payload);
  //   });
  socket.on("createRaydiumV4Event", async (data: any) => {
    // if (data?.event_name === "createRaydiumV4Event") {
    console.log(
      "🚀 ~ +++++++++++++++++++++++++++++++",
      data?.event_name,
      data?.event_data?.token?.address,
      data?.event_data?.token?.raydium_pool
    );
    await handleclaim(data?.event_data?.token?.address);
    const balance = await getBalanceByTokenAddressOnSolana(
      data?.event_data?.token?.address,
      creator.publicKey.toString()
    );
    console.log("🚀 ~ socket.on ~ balance:", balance);
    await handleSwap(data?.event_data?.token, balance);
    // }
  });
  socket.on("contributeEvent", (payload: any) => {
    console.log(
      "🚀 ~ socket.on ~ payload:",
      payload?.event_name,
      "------",
      payload?.event_data?.wallet_txn?.wallet_address
    );
  });
  socket.on("close", (payload: any) => {
    console.log("close");
  });
  socket.on("disconnect", (payload: any) => {
    console.log("disconnect");
  });
})();
