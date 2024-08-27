import * as anchor from "@coral-xyz/anchor";
// @ts-ignore
import _ from "lodash";
import { GmFunType } from "./idl/gm_fun";
import IDL from "./idl/gm_fun.json";
import {
  CurrencyAmount,
  Liquidity,
  LiquidityPoolKeys,
  Percent,
  SPL_ACCOUNT_LAYOUT,
  Token,
  TokenAmount,
  TxVersion,
  jsonInfo2PoolKeys,
} from "@raydium-io/raydium-sdk";
import { formatAmmKeysById } from "./utils";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const CONFIG_INDEX = 1;
export const EXPO = 100_000;

export class CrowdPump {
  connection: anchor.web3.Connection;
  program: anchor.Program<GmFunType>;
  cpLookupTable: string;

  constructor(
    connection: anchor.web3.Connection,
    programId: string = "gmFzEt99MUCbiQ9Cn1CvCQ8Yz1gphfY8xXyHUGofcf6"
  ) {
    this.connection = connection;
    IDL.address = programId;
    this.program = new anchor.Program(IDL as GmFunType, {
      connection: this.connection,
    });
  }

  get programInstance() {
    return this.program;
  }

  async bootstrap(): Promise<void> {
    try {
    } catch (error) {
      throw new Error("Pool config account is not initialize");
    }
  }

  async swapRaydiumV4(
    user: anchor.web3.PublicKey,
    ammId: anchor.web3.PublicKey,
    inputMint: anchor.web3.PublicKey,
    outputMint: anchor.web3.PublicKey,
    amountIn: anchor.BN,
    slippage: number[] = [1, 100],
    bypassAssociatedCheck: boolean = false,
    estimateAmountOut: boolean = true
  ) {
    const inputMintInfo = await this.connection.getParsedAccountInfo(inputMint);
    if (!inputMintInfo.value) {
      throw new Error(`Input mint account not found ${inputMint}`);
    }
    const outputMintInfo = await this.connection.getParsedAccountInfo(
      outputMint
    );
    if (!outputMintInfo.value) {
      throw new Error(`Output mint account not found ${outputMint}`);
    }

    const inputTokenAccounts = await this.connection.getTokenAccountsByOwner(
      user,
      {
        programId: inputMintInfo.value.owner,
        mint: inputMint,
      }
    );

    const outputTokenAccounts = await this.connection.getTokenAccountsByOwner(
      user,
      {
        programId: outputMintInfo.value.owner,
        mint: outputMint,
      }
    );

    const walletTokenAccount = {
      value: [...inputTokenAccounts.value, ...outputTokenAccounts.value],
    };

    const walletTokenAccounts = walletTokenAccount.value.map((i) => {
      const accountInfo = SPL_ACCOUNT_LAYOUT.decode(i.account.data);
      return {
        pubkey: i.pubkey,
        programId: i.account.owner,
        accountInfo,
      };
    });

    const inputToken = new Token(
      inputMintInfo.value.owner,
      inputMint.toBase58(),
      (inputMintInfo.value?.data as any).parsed.info.decimals as number,
      "",
      ""
    );
    const outputToken = new Token(
      outputMintInfo.value.owner,
      outputMint.toBase58(),
      (outputMintInfo.value?.data as any).parsed.info.decimals as number,
      "",
      ""
    );

    const inputTokenAmount = new TokenAmount(inputToken, amountIn);

    // -------- pre-action: get pool info --------
    const targetPoolInfo = await formatAmmKeysById(
      this.connection,
      ammId.toBase58()
    );
    // assert(targetPoolInfo, 'cannot find the target pool')
    const poolKeys = jsonInfo2PoolKeys(targetPoolInfo) as LiquidityPoolKeys;
    // -------- step 1: coumpute amount out --------
    let finalAmountOut: TokenAmount | CurrencyAmount = new TokenAmount(
      outputToken,
      new anchor.BN(1)
    );

    if (estimateAmountOut) {
      const { amountOut, minAmountOut } = Liquidity.computeAmountOut({
        poolKeys: poolKeys,
        poolInfo: await Liquidity.fetchInfo({
          connection: this.connection,
          poolKeys,
        }),
        amountIn: inputTokenAmount,
        currencyOut: outputToken,
        slippage: new Percent(slippage[0], slippage[1]),
      });

      finalAmountOut = minAmountOut;
    }
    // -------- step 2: create instructions by SDK function --------
    const { innerTransactions } = await Liquidity.makeSwapInstructionSimple({
      connection: this.connection,
      poolKeys,
      userKeys: {
        tokenAccounts: walletTokenAccounts,
        owner: user,
      },
      amountIn: inputTokenAmount,
      amountOut: finalAmountOut,
      fixedSide: "in",
      makeTxVersion: TxVersion.LEGACY,
      config: {
        bypassAssociatedCheck: bypassAssociatedCheck,
        checkCreateATAOwner: bypassAssociatedCheck,
      },
    });

    if (bypassAssociatedCheck) {
      innerTransactions[0].instructions =
        innerTransactions[0].instructions.filter(
          (ix) =>
            ix.programId.toBase58() !== ASSOCIATED_TOKEN_PROGRAM_ID.toBase58()
        );
    }

    return { finalIxs: innerTransactions[0].instructions };
  }
}
