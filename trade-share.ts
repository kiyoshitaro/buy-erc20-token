import { BigNumber, Contract,  Wallet, ethers } from "ethers";
import abi from './abis/starleague.json';
import * as dotenv from "dotenv";
import { formatEther } from "ethers/lib/utils";
dotenv.config({ path: '.env' });

const BOOST_MIN_PRICE = 1.25;
const STRONG_BOTS = [
  '0xf4ef66a43bdf743cf22c0da76d8510f04bfcf79c', //luckydjj88 
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
  const _delay = endBiddingTime - currentTime + 1050;
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
        // maxPriorityFeePerGas: BigNumber.from(2510000000000), // 2500 gwei        
        // maxPriorityFeePerGas: 2510, //1.5 -2 gwei
      }
    );
    const trx = await sellShares.wait();
    console.log("🚀 ~ file: trade-share.ts:45 ~ sellShare ~ sellShares:", trx.transactionHash,Number(trx.gasUsed.mul(BigNumber.from(2500)).toString())/ (1000000000) );
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
  setTimeout(() => bidShare(subjectAddress, price, times), endBiddingTime - currentTime - 18000);
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
        {value: _price, nonce: transactionCount + i}
      );
    }
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
    const _rank = result.length - Math.ceil(result.length / 2) - 1;
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

const getListBidPrice = async (subjectAddress: string, defaultPrice = 1) => {
  const result = await contract.getPoolInitialTops(
    subjectAddress,
  );
  return result.map(res => `${res.account} - ${Number(formatEther(res.amount).toString())}`);
}

(async () => {
  const subAddress = '0x89bd44a957c58afe76a4995a52579f01df34a74b';
  // await getBiddingTime(subAddress);

  console.log("============ List bits ============", await getListBidPrice(subAddress));
  await getSellPriceAfterFee(subAddress);
  console.log(await getRecommendBidPrice(subAddress));

  // await bidShare(subAddress, 1, 1);  
  // await sellShare(subAddress, 1);

  // await autoBidShare(subAddress, 1, 1);  
  // await autoSellShare(subAddress, 1);

  // const block = await chiliz_provider.getBlock(1)
  // console.log("🚀 ~ file: trade-share.ts:96 ~ block:", new Date(block.timestamp*1000))
})()

// 0x7af4c68b7d89a53f4dd47c9aea26dd90f673c03e