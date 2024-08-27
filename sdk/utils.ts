import * as anchor from "@coral-xyz/anchor";
import * as dotenv from "dotenv";
import path from "path";

// import { ed25519 } from '@noble/curves/ed25519';
import {
  ApiPoolInfoV4,
  LIQUIDITY_STATE_LAYOUT_V4,
  Liquidity,
  MARKET_STATE_LAYOUT_V3,
  Market,
  SPL_MINT_LAYOUT,
} from "@raydium-io/raydium-sdk";
import { PublicKey } from "@solana/web3.js";
import * as solanaWeb3 from "@solana/web3.js";
import { CrowdPump } from "./crowdPump";
dotenv.config({ path: path.join(__dirname, "../.env") });
const isMainet = Boolean(Number(process.env.IS_MAINET || 0) == 1);
export const PROGRAM_ID = isMainet
  ? "gmFzEt99MUCbiQ9Cn1CvCQ8Yz1gphfY8xXyHUGofcf6"
  : "BAyFv7aAtgXWcnj1MyMhLZset5QbdR6X9QbcLqZzgvDi";

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const formatAmmKeysById = async (
  connection: anchor.web3.Connection,
  id: string
): Promise<ApiPoolInfoV4> => {
  const account = await connection.getAccountInfo(
    new anchor.web3.PublicKey(id)
  );
  if (account === null) throw Error(" get id info error ");
  const info = LIQUIDITY_STATE_LAYOUT_V4.decode(account.data);

  const marketId = info.marketId;
  const marketAccount = await connection.getAccountInfo(marketId);
  if (marketAccount === null) throw Error(" get market info error");
  const marketInfo = MARKET_STATE_LAYOUT_V3.decode(marketAccount.data);

  const lpMint = info.lpMint;
  const lpMintAccount = await connection.getAccountInfo(lpMint);
  if (lpMintAccount === null) throw Error(" get lp mint info error");
  const lpMintInfo = SPL_MINT_LAYOUT.decode(lpMintAccount.data);

  return {
    id,
    baseMint: info.baseMint.toString(),
    quoteMint: info.quoteMint.toString(),
    lpMint: info.lpMint.toString(),
    baseDecimals: info.baseDecimal.toNumber(),
    quoteDecimals: info.quoteDecimal.toNumber(),
    lpDecimals: lpMintInfo.decimals,
    version: 4,
    programId: account.owner.toString(),
    authority: Liquidity.getAssociatedAuthority({
      programId: account.owner,
    }).publicKey.toString(),
    openOrders: info.openOrders.toString(),
    targetOrders: info.targetOrders.toString(),
    baseVault: info.baseVault.toString(),
    quoteVault: info.quoteVault.toString(),
    withdrawQueue: info.withdrawQueue.toString(),
    lpVault: info.lpVault.toString(),
    marketVersion: 3,
    marketProgramId: info.marketProgramId.toString(),
    marketId: info.marketId.toString(),
    marketAuthority: Market.getAssociatedAuthority({
      programId: info.marketProgramId,
      marketId: info.marketId,
    }).publicKey.toString(),
    marketBaseVault: marketInfo.baseVault.toString(),
    marketQuoteVault: marketInfo.quoteVault.toString(),
    marketBids: marketInfo.bids.toString(),
    marketAsks: marketInfo.asks.toString(),
    marketEventQueue: marketInfo.eventQueue.toString(),
    lookupTableAccount: null as any,
  };
};

export async function createAndSendV0Tx(
  signer: anchor.web3.Keypair,
  txInstructions: anchor.web3.TransactionInstruction[],
  addressLookupTableAccounts?: anchor.web3.AddressLookupTableAccount[],
  confirmed: boolean = false,
  CUnit?: number,
  retry = 1
) {
  try {
    const latestBlockhash = await solanaConnection.getLatestBlockhash(
      "finalized"
    );

    console.log(
      "   ✅ - Fetched latest blockhash. Last valid height:",
      latestBlockhash.lastValidBlockHeight
    );

    if (CUnit) {
      txInstructions = [
        ...txInstructions,
        solanaWeb3.ComputeBudgetProgram.setComputeUnitLimit({ units: CUnit }),
      ];
    }
    // Step 2 - Generate Transaction Message
    const messageV0 = new anchor.web3.TransactionMessage({
      payerKey: signer.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message(addressLookupTableAccounts);

    console.log("   ✅ - Compiled transaction message");

    const transaction = new anchor.web3.VersionedTransaction(messageV0);

    // Step 3 - Sign your transaction with the required Signers
    transaction.sign([signer]);

    console.log("   ✅ - Transaction Signed");
    console.log("transaction size", transaction.serialize().length);

    console.log(
      JSON.stringify(
        await solanaConnection.simulateTransaction(transaction, {
          sigVerify: true,
        }),
        null,
        2
      )
    );

    // Step 4 - Send our v0 transaction to the cluster
    const txh = Buffer.from(transaction.serialize()).toString("base64");

    const txtHash = await sendTransaction(txh).catch((e) => {
      console.log(e.getLogs());
    });
    console.log("🚀 ~ txtHash:", txtHash);

    const waited = await getParsedTransactionByTxHash(String(txtHash));

    console.log("🚀 ~ waited ~ waited:", waited);

    if (waited?.meta?.err || !waited) {
      //TODO: retry
      if (retry < 5) {
        console.log("🚀 ~ retry ~ retry:", retry);
        await sleep(1000);
        return createAndSendV0Tx(
          signer,
          txInstructions,
          addressLookupTableAccounts,
          confirmed,
          CUnit,
          retry + 1
        );
      }
      throw new Error("Fail after recorded onchain");
    }
    return {
      message: "Transaction successfully submitted !",
      tx_hash: txtHash as anchor.web3.TransactionSignature,
    };
  } catch (e: any) {
    console.log("[createAndSendV0Tx] [ERROR]", e);
    console.log(
      "[createAndSendV0Tx] [ERROR] [RangeError: encoding overruns Uint8Array]",
      e?.toString()?.includes("RangeError: encoding overruns Uint8Array")
    );
    console.log("[createAndSendV0Tx] [ERROR] [string]", JSON.stringify(e));
    // const onlyDirectRoutes = e
    //   ?.toString()
    //   ?.includes('RangeError: encoding overruns Uint8Array');
    throw e;
  }
}
export const sendTransactionRpc = async (jupConnection: any, data: string) => {
  try {
    const txhash = await jupConnection.sendRawTransaction(
      Buffer.from(data, "base64"),
      {
        maxRetries: 10,
        skipPreflight: true,
        preflightCommitment: "processed",
      }
    );
    return txhash;
  } catch (e) {
    console.log(`🚀 ~ RpcTransactionService ~ sendTransactionRpc ~ e`, e);
  }
};
export const sendTransaction = async (data: string) => {
  const start = new Date().getTime();
  return new Promise(async (resolve, reject) => {
    try {
      let txhash;
      await Promise.all(
        JUP_RPCS.map(async (rpc) => {
          const tx = await sendTransactionRpc(rpc, data);
          if (!txhash) {
            const end = new Date().getTime();
            console.log("🚀 ~ sendTransaction ~ end - start", end - start);
            txhash = tx;
            resolve(txhash);
          }
        })
      );
      const end2 = new Date().getTime();
      console.log("🚀 ~ sendTransaction ~ end2 - start", end2 - start);
    } catch (e) {
      reject("Send transaction error");
    }
  });
};

export async function getBalanceByTokenAddressOnSolana(
  inputTokenAddress: string,
  walletAddress: string
) {
  try {
    let balance;
    const walletPublicKey = new PublicKey(walletAddress);
    const tokenInfo = await solanaConnection.getParsedAccountInfo(
      new PublicKey(inputTokenAddress)
    );
    const tokenAccounts = await solanaConnection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      {
        programId: new PublicKey(tokenInfo.value.owner),
      },
      "confirmed"
    );
    const tokenAccount = tokenAccounts.value.find((account) => {
      return account.account.data.parsed.info.mint === inputTokenAddress;
    });
    balance =
      tokenAccount?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
    return balance;
  } catch (e) {
    throw e;
  }
}

export async function getParsedTransactionByTxHash(txHash: string, retry = 0) {
  try {
    const dataTxh: any = await solanaConnection.getParsedTransaction(txHash, {
      maxSupportedTransactionVersion: 2,
      commitment: "confirmed",
    });

    console.log("1", dataTxh?.meta?.err);
    console.log("2", dataTxh?.meta?.err !== null);
    const isRetry = dataTxh?.meta?.err !== null;
    console.log("[getParsedTransaction] dataTxh: ", dataTxh); // console by M-MON
    console.log("[getParsedTransaction] isRetry", isRetry); // console by M-MON
    console.log("[getParsedTransaction] retry", retry); // console by M-MON
    console.log(
      "[getParsedTransaction] isRetry && retry < 10",
      isRetry && retry < 10
    ); // console by M-MON
    console.log("=========[getParsedTransaction]=========="); // console by M-MON
    if (isRetry && retry < 10) {
      console.log("🚀 ~ getParsedTransactionByTxHash ~ retry:", retry);
      await new Promise((resolve) => setTimeout(resolve, retry * 1000)); // wait for 10 seconds
      return getParsedTransactionByTxHash(txHash, retry + 1);
    }

    return dataTxh;
  } catch (e) {
    console.log("=========> [getParsedTransaction] [ERROR]", e);
    console.log("🚀 ~ getParsedTransactionByTxHash ~ e:", e);
    return null;
  }
}

const SEND_RPC_TRANSACTIONS = process.env.SOL_RPCS?.split(",") || [];
const JUP_RPCS = SEND_RPC_TRANSACTIONS.map(
  (rpc) =>
    new solanaWeb3.Connection(rpc, {
      httpHeaders: {
        "Content-Type": "application/json",
        Origin: "https://jup.ag",
        Referrer: "https://jup.ag",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    })
);
export const solanaConnection = new solanaWeb3.Connection(
  SEND_RPC_TRANSACTIONS[0]
);
export const cPContract = new CrowdPump(solanaConnection, PROGRAM_ID);
cPContract.bootstrap().then().catch(console.log);
