import { BigNumber, Contract,  PopulatedTransaction,  VoidSigner,  Wallet, ethers } from "ethers";
import abi from './abis/starleague.json';
import * as dotenv from "dotenv";
import { formatEther } from "ethers/lib/utils";
import { TransactionRequest } from "zksync-web3/build/src/types";
dotenv.config({ path: '.env' });

const BOOST_MIN_PRICE = 1.2;
const STRONG_BOTS = [
  '0xf4ef66a43bdf743cf22c0da76d8510f04bfcf79c', //luckydjj88 
  '0x5fb2ee869c31e94b098aaaf2351cd37a56d14d42', //unknown
];
const CA = '0xFaD9Fb76EE13aBFe08F8B17d3898a19902b6f9FB';
const chiliz_provider = new ethers.providers.StaticJsonRpcProvider(process.env.QUIKNODE_CHZ);
const wallet = new Wallet(process.env.PRIVATE_KEY as string, chiliz_provider);
const contract = new Contract(
  CA,
  abi,
  chiliz_provider,
);

const autoSellShare = async(subjectAddress: string, retry: number = 0) =>{
  const currentTime = new Date().getTime();
  const endBiddingTime = await getBiddingTime(subjectAddress);
  const _delay = endBiddingTime - currentTime + 1400;
  if(_delay <= 0){
    await sellShare(subjectAddress, retry)
  } else {
    setTimeout(() => sellShare(subjectAddress, retry), _delay);
  }
}

const sellShare = async(subjectAddress: string, retry: number = 0) =>{
  console.log("🚀 ~ file: trade-share.ts:51 ~ sellShare ~ retry:", retry)
  try {
    const sellShares = await contract.connect(wallet).sellShares(
      subjectAddress,
      1,
      {
        // gasLimit: BigNumber.from(500000),
        gasPrice: BigNumber.from(2660000000000),
        // maxPriorityFeePerGas: BigNumber.from(2510000000000), // 2500 gwei        
        // maxPriorityFeePerGas: 2510, //1.5 -2 gwei
      }
    );
    const trx = await sellShares.wait();
    console.log("🚀 ~ file: trade-share.ts:45 ~ sellShare ~ sellShares:", trx.transactionHash);
  } catch (error) {
    console.log("🚀 ~ file: trade-share.ts:36 ~ sellShare ~ error:", error)

    // NOTE: prevent strong bot
    const bidUsers = (await contract.getPoolInitialTops(
      subjectAddress,
    )).map((user: any)=>user.account);
    for(const bot of STRONG_BOTS){
      if(bidUsers.includes(bot)){
        console.log("should't sell now, front-run!");
        return;
      }
    }

    if(retry >= 1){
      sellShare(subjectAddress, retry -1)
    }
  }
}


const autoBidShare = async(subjectAddress: string, price:number, times: number = 1) =>{
  const currentTime = new Date().getTime();
  const endBiddingTime = await getBiddingTime(subjectAddress);
  setTimeout(() => bidShare(subjectAddress, price, times), endBiddingTime - currentTime - 21000);
}
const bidShare = async(subjectAddress: string, price:number, times: number = 1) =>{
  try {
    // const _price = ethers.utils.parseEther(String(price)).toHexString(); 
    const _t = await getRecommendBidPrice(subjectAddress, price);   
    console.log("🚀 ~ file: trade-share.ts:75 ~ bidShare ~ _t:", _t)
    const _price = ethers.utils.parseEther(_t.toFixed(2)).toHexString();
    const transactionCount = await wallet.getTransactionCount();
    for(let i =0; i< times; i++){
      contract.connect(wallet).buyShares(
        subjectAddress,
        {
          value: _price,
          gasPrice: BigNumber.from(2660000000000),
          nonce: transactionCount + i
        }
      );
    }
  } catch (error) {
    console.log("🚀 ~ file: trade-share.ts:64 ~ bidShare ~ error:", error)
  }
}

const buyShare = async(subjectAddress: string) =>{
  try {
    const _t = await getBuyPriceAfterFee(subjectAddress);   
    console.log("🚀 ~ Buy at :", _t)
    const _price = ethers.utils.parseEther(_t.toString()).toHexString();
      contract.connect(wallet).buyShares(
        subjectAddress,
        {
          value: _price,
          // gasPrice: BigNumber.from(2660000000000),
        }
      );
  } catch (error) {
    console.log("🚀 ~ file: trade-share.ts:64 ~ bidShare ~ error:", error)
  }
}


const getRecommendBidPrice = async (subjectAddress: string, defaultPrice = 1) => {
  try {
    const result = await contract.getPoolInitialTops(
      subjectAddress,
    );
    const minPrice = (await getPoolInitialBuyPriceAfterFee(subjectAddress)) * BOOST_MIN_PRICE;
    const _rank = result.length - Math.ceil(result.length / 2);
    return result.length <= 20 ? minPrice : Math.max(Number(formatEther(result[_rank].amount).toString()), minPrice);
  } catch (error) {
    return defaultPrice;
  }
}

const getBiddingTime = async (subjectAddress: string) => {
  const result = await contract.getBiddingTime(
    subjectAddress,
  );
  return result.toNumber() * 1000;
}


const getPoolInitialBuyPriceAfterFee = async(subjectAddress: string) => {
  const result = await contract.getPoolInitialBuyPriceAfterFee (
    subjectAddress,
  );
  return Number(formatEther(result).toString())
}

const getSellPriceAfterFee = async (subjectAddress: string) => {
  const result = await contract.getSellPriceAfterFee(
    subjectAddress,
    1,
  );
  console.log("🚀 ~ file: trade-share.ts:92 ~ getSellPriceAfterFee ~ result:", formatEther(result).toString())
}


const getBuyPriceAfterFee = async (subjectAddress: string) => {
  const result = await contract.getBuyPriceAfterFee(
    subjectAddress,
    1,
  );
  console.log("🚀 ~ file: trade-share.ts:157 ~ getBuyPriceAfterFee ~ ethers.utils.parseEther(result.toString()).toHexString():",Number(formatEther(result)), ethers.utils.parseEther(result.toString()).toHexString())
  return Number(formatEther(result))
}

const getListBidPrice = async (subjectAddress: string, defaultPrice = 1) => {
  const result = await contract.getPoolInitialTops(
    subjectAddress,
  );
  return result.map(res => `${res.account} - ${Number(formatEther(res.amount).toString())}`);
}

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
let updatedNonceAt = Date.now();
let nonce = 0;
const updateNonce = async () => {
  while (true) {
    console.log("run");
    try {
      if (
        updatedNonceAt + 1000 * 7 < Date.now()
      ) {
        nonce = await wallet.getTransactionCount();
        console.log("🚀 ~ file: trade-share.ts:148 ~ updateNonce ~ nonce:", nonce)
        updatedNonceAt = Date.now();
        await sleep(5000);
      }
    } catch (e) {
      console.log('Error get nonce2: ', e);
    }
  }
}

(async () => {
  const subAddress = '0x71f0db8a29cdb04a69400dc061585070e673d4b2';

  console.log("🚀 ~ file: trade-share.ts:136 ~ await getBiddingTime(subAddress):", new Date(await getBiddingTime(subAddress)))
  console.log("============ List bids ============", await getListBidPrice(subAddress));
  await getSellPriceAfterFee(subAddress);
  // await getBuyPriceAfterFee(subAddress);
  console.log(await getRecommendBidPrice(subAddress));

  // await buyShare(subAddress);  
  // await bidShare(subAddress ,1 ,1);  
  // await sellShare(subAddress, 1);

  // await autoBidShare(subAddress, 1, 1);  
  // await autoSellShare(subAddress, 1);

  // const transactionHash = '0x7fe152653415da8bd2c6d24e932da2bcfead4e48a9697dfa804a06b026a3ca0c';
  // const [transactions, transactionOrbiter] = await Promise.all([
  //   chiliz_provider.getTransactionReceipt(transactionHash),
  //   chiliz_provider.getTransaction(transactionHash),
  // ]);
  // const _t = await transactionOrbiter.wait()
  // console.log("🚀 ~ file: trade-share.ts:155 ~ _t:", _t)
  // console.log("🚀 ~ file: trade-share.ts:154 ~ transactions:", ethers.utils.formatEther(transactionOrbiter.gasPrice.mul(transactionOrbiter.gasLimit)).toString() )


  // const fromBlock = 7945000
  // const latestBlock = Math.min(
  //   await chiliz_provider.getBlockNumber(),
  //   fromBlock + 10,
  // );
  // const eventBuyFilter = contract.filters.Trade();
  // const buyLogs = await contract.queryFilter(
  //   eventBuyFilter,
  //   fromBlock,
  //   Number(latestBlock),
  // );
  // console.log("🚀 ~ file: trade-share.ts:170 ~ buyLogs:", buyLogs)


  // const _price = ethers.utils.parseEther('1').toHexString();
  // const response = await contract.populateTransaction.buyShares(
  //   subAddress,
  //   {value: _price}
  // );
  // response.gasLimit = BigNumber.from(40000000000000);
  // response.gasPrice = BigNumber.from(2650000000000);
  // console.log("🚀 ~ file: trade-share.ts:152 ~ response:", response)
  // const voidSigner = new VoidSigner(wallet.address, chiliz_provider);
  // const _data = await voidSigner.populateTransaction(response);
  // console.log("🚀 ~ file: trade-share.ts:156 ~ _data:", _data)
  // const data = toStringTransaction(_data);
  // console.log("🚀 ~ file: trade-share.ts:160 ~ data:", data)

  // const block = await chiliz_provider.getBlock(1)
  // console.log("🚀 ~ file: trade-share.ts:96 ~ block:", new Date(block.timestamp*1000))


  // updateNonce().then().catch();
  // console.log("hrhrhr");
})()


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


// 0x65a9f921dc6184cbadce4f66cdbd6b05fafdd778