import { Wallet } from "zksync-web3";
import { BigNumber, Contract, PopulatedTransaction, VoidSigner, ethers } from "ethers";
import * as dotenv from "dotenv";
import { ERC20 } from "./erc20";
import { ETH_ADDRESS } from "zksync-web3/build/src/utils";
import ERC20Json from "./abis/ERC20.json";
import UniswapV2Route02ABI from './abis/UniswapV2Route02.json';
import { TransactionRequest } from "zksync-web3/build/src/types";
import { Provider as ZkProvider, Contract as ZkContract } from "zksync-web3";
dotenv.config({ path: '.env' });

const isMainet = Boolean(Number(process.env.IS_MAINET || 0) == 1);
const eth_provider = new ethers.providers.JsonRpcProvider(isMainet ?`https://crimson-winter-sun.quiknode.pro/${process.env.QUIKNODE_KEY}`: 'https://goerli.blockpi.network/v1/rpc/public	')
const zk_native_provider = new ZkProvider(isMainet ? 'https://mainnet.era.zksync.io':'https://testnet.era.zksync.dev');
const WETH = isMainet ? '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' : '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6';
const MAX_AMOUNT_APPROVE_TOKEN = '100000000000000000000000000000000';

const uniswapRouter = async () => {
  return new Contract(
    '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    UniswapV2Route02ABI['abi'],
    eth_provider,
  );
}
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
const toStringTransaction = (
  populatedTransaction: PopulatedTransaction | TransactionRequest,
) => {
  const transaction = { ...populatedTransaction };
  Object.keys(transaction).forEach((key) => {
    if (typeof transaction[key] === 'object') {
      transaction[key] = populatedTransaction[key].toString();
    }
  });
  return transaction;
};

const getTokenETHBalance = async (accountAddress: string, contractAddr: string) => {
  try {
    const erc20Contract = new ethers.Contract(contractAddr, ERC20Json.abi, eth_provider);
    const balance = await erc20Contract.balanceOf(accountAddress);
    return ethers.utils.formatUnits(balance, Number(await erc20Contract.callStatic.decimals()));
  } catch (error) {
    console.error('Error:', error);
  }
}
const buildTransaction = async (
  tokenAAddress: string,
  tokenBAddress: string,
  amountIn: BigNumber,
  amountOutMin: BigNumber,
  walletAddress: string,
  options?: {
    gasLimit?: BigNumber;
    maxPriorityFeePerGas?: BigNumber;
  },
) => {
  let response: any;
  let deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 70); // ~70s

  if (tokenAAddress != WETH && tokenBAddress != WETH) {
    throw new Error('Not support token');
  }
  if (tokenAAddress == WETH) {
    response =
      await (await uniswapRouter()).populateTransaction.swapExactETHForTokensSupportingFeeOnTransferTokens(
        amountOutMin,
        [WETH, tokenBAddress],
        walletAddress,
        deadline,
        { value: amountIn },
      );
  }
  if (tokenBAddress == WETH) {
    response =
      await (await uniswapRouter()).populateTransaction.swapExactTokensForETHSupportingFeeOnTransferTokens(
        amountIn,
        amountOutMin,
        [tokenAAddress, WETH],
        walletAddress,
        deadline,
      );
  }
  if(options?.gasLimit) response.gasLimit = options?.gasLimit;
  if(options?.maxPriorityFeePerGas) response.maxPriorityFeePerGas = options?.maxPriorityFeePerGas
    const voidSigner = new VoidSigner(walletAddress, eth_provider);
  return toStringTransaction(await voidSigner.populateTransaction(response));
};
const signTransaction = async (transaction: any, pk: string) => {
  const walletWeb3 = new Wallet(pk);
  return await walletWeb3.signTransaction(transaction);
}

const approveToken = async (
  tokenAddress: string,
  spender: string,
  amount: string,
  walletAddress: string,
) => {
  try {
    const erc20 = new ERC20(tokenAddress, eth_provider);
    console.log("🚀 ~ file: buy-token.ts:107 ~ walletAddress, spender:", walletAddress, spender,tokenAddress)
    const allowance = await erc20.allowance(walletAddress, spender);
    if (!(await erc20.isValidAllowance(amount, allowance))) {
      //Approve token;
      const transaction = await erc20.approve(
        walletAddress,
        spender,
        MAX_AMOUNT_APPROVE_TOKEN,
      );
      console.log("🚀 ~ file: 11-swap-in-eth-uniswap.ts:70 ~ transaction:", transaction)

      const signedTransaction = await signTransaction(transaction, process.env.PRIVATE_KEY as string);
      const trx = await eth_provider.sendTransaction(signedTransaction);
      console.log('Sending approve');
      return await trx.wait();
    }
  } catch (e) {
    throw e;
  }
};

const approveTokenAndSlippage = async (
  inputTokenAddress: string,
  outputTokenAddress: string,
  amountInput: string,
  slippage: number,
  address: string,
  options?: {
    gasLimit?: BigNumber;
    maxPriorityFeePerGas?: BigNumber;
  },
) => {
  if (inputTokenAddress != WETH && outputTokenAddress != WETH) {
    throw new Error('Only support ETH');
  }
  if (inputTokenAddress != WETH) {
    await approveToken(
      inputTokenAddress,
      (await uniswapRouter()).address,
      amountInput,
      address,
    );
  }

  const erc20 = new ERC20(inputTokenAddress, eth_provider);
  const path = [inputTokenAddress, outputTokenAddress];
  const amountIn = await erc20.parseValue(amountInput);
  const amountOut = (await (await uniswapRouter()).getAmountsOut(amountIn, path))[
    path.length - 1
  ];
  const slippagePercent = Number(Number(slippage).toFixed(1)) * 10;
  const amountOutMin = amountOut.mul(1000 - slippagePercent).div(1000); 
  console.log("🚀 ~ file: 11-swap-in-eth-uniswap.ts:126 ~ amountOutMin:",amountOutMin.toString())
  return await buildTransaction(
    inputTokenAddress,
    outputTokenAddress,
    amountIn,
    amountOutMin,
    address,
    options
  );
}

const buyToken = async(amount = '0.05', lr = 0.8, isLoop = false) =>{
  try {
    const contract = '0x61f275c54577a66cf4e4ccc6D20CbE04d31ae889';
    const addr = '0xf9F689367990f981BCD267FB1A4c45f63B6Bd7b1';
  
    // ------- BUY --------
    const transaction = await approveTokenAndSlippage(
      WETH,
      contract,
      amount,
      10,  // Slippage
      addr,
      {
        gasLimit: BigNumber.from(getRandomInt(550000, 650000)), 
        // maxPriorityFeePerGas: BigNumber.from(getRandomInt(1500000000, 1500000000)) //1.5 -2 gwei
      });
  
  
    // ------- SELL --------
    // const transaction = await approveTokenAndSlippage(
    //   contract,
    //   WETH,
    //   '40000',
    //   50, // Slippage
    //   addr,
    //   {
    //     gasLimit: BigNumber.from(getRandomInt(550000, 650000)),
    //     // maxPriorityFeePerGas: BigNumber.from(getRandomInt(1500000000, 2000000000)) //1.5 -2 gwei
    //   }
    // );
    console.log("🚀 ~ file: 11-swap-in-eth-uniswap.ts:133 ~ transaction:", transaction)
    const signedTransaction = await signTransaction(transaction, process.env.PRIVATE_KEY as string);
    const trx = await eth_provider.sendTransaction(signedTransaction);
    console.log("🚀 ~ OLD BALANCE:", await getTokenETHBalance(addr, contract))
    const trxReceip = await trx.wait(1);
    return {trxReceip, amount, addr, contract}  
  } catch (error) {
    // ----------NOTE: remove if no need
    console.log("🚀 ~ file: buy-token.ts:207 ~ buyToken ~ error:", error);
    if(isLoop) return await buyToken(String(Number(amount) * lr), lr, isLoop);
    throw error;
  }
}

(async () => {
    const {trxReceip, addr,contract, amount} = await buyToken('0.05', 0.8, true);
    if(!!trxReceip){
    const gasFee = Number(
      ethers.utils.formatEther(
        trxReceip.gasUsed.mul(trxReceip.effectiveGasPrice),
      ),
    );
    const feeUSD = Number(await zk_native_provider.getTokenPrice(ETH_ADDRESS)) * gasFee
    console.log("🚀 ~ file: 11-swap-in-eth-uniswap.ts:138 ~ gasFee:", trxReceip.transactionHash, trxReceip.blockHash, `${gasFee} ETH ~ $${feeUSD}`);
    console.log("------------DONE------------");
    setTimeout(async () => {
      console.log(`🚀 ~Use ${amount} eth to new balance : `, await getTokenETHBalance(addr, contract))
    }, 4000);
  }
})()