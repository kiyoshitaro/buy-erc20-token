import { BigNumber, Contract,  PopulatedTransaction,  VoidSigner,  Wallet, ethers } from "ethers";
import abi from './abis/starleague.json';
import * as dotenv from "dotenv";
import { formatEther } from "ethers/lib/utils";
import { TransactionRequest } from "zksync-web3/build/src/types";
dotenv.config({ path: '.env' });

const BOOST_MIN_PRICE = 1.05;
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


const _buildAndSignSellTransaction = async (subAddress: string) => {
  // const _price = ethers.utils.parseEther('1').toHexString();
  // const buyShares = await contract.populateTransaction.buyShares(
  //   subAddress,
  //   {value: _price}
  // );
  const sellShares = await contract.populateTransaction.sellShares(
    subAddress,
    1,
    {
      // gasLimit: BigNumber.from(40000000000000),
      gasPrice: BigNumber.from(2660000000000),
    }
);
  const voidSigner = new VoidSigner(wallet.address, chiliz_provider);
  const _data = await voidSigner.populateTransaction(sellShares);
  // {
  //   data: '0xb51d05340000000000000000000000004599be6df57341bd0cec978e62f18c09a839ab890000000000000000000000000000000000000000000000000000000000000001',
  //   to: '0xFaD9Fb76EE13aBFe08F8B17d3898a19902b6f9FB',
  //   gasPrice: BigNumber { _hex: '0x026b545ae800', _isBigNumber: true },
  //   from: '0x5A78DDBb0C6fe763D45A2c3Ed882143e00d4fe48',
  //   type: 0,
  //   nonce: 762,
  //   gasLimit: BigNumber { _hex: '0x01d6ba', _isBigNumber: true },
  //   chainId: 88888
  // }
  // const data = toStringTransaction(_data);
  // console.log("🚀 ~ file: trade-share.ts:160 ~ data:", data);
  const signedTrx = await wallet.signTransaction(_data);
  // const hash = await chiliz_provider.perform('sendTransaction', {
  //   signedTrx,
  // });
  return signedTrx;
}

const autoTrade = async(subjectAddress: string) =>{
  const currentTime = new Date().getTime();
  const endBiddingTime = await getBiddingTime(subjectAddress);
  setTimeout(async () => {
    await bidShare(subjectAddress, 1, 1);
    await autoSellSharev3(subjectAddress, endBiddingTime);
  }, endBiddingTime - currentTime - 21000);
}

const autoSellSharev3 = async(subjectAddress: string, endBiddingTime: number) =>{
  const currentTime = new Date().getTime();
  const signSellTrx = await _buildAndSignSellTransaction(subjectAddress);
  const _delay = endBiddingTime - currentTime - 1000;
  if(_delay <= 0){
    await sellSharev3(signSellTrx, endBiddingTime)
  } else {
    setTimeout(() => sellSharev3(subjectAddress, endBiddingTime), _delay);
  }
}

const sellSharev3 = async(signSellTrx: string, endBiddingTime: number) =>{
    let _previos = Date.now() - 1000;
    let _count = 0;
    while(true){
      try {
        if(Date.now() - _previos >= 1000){
          _previos = Date.now(); 
          _count += 1;
          console.log("Run sell", _count);
          const hash = await chiliz_provider.sendTransaction(signSellTrx);
          console.log("🚀 ~ file: trade-share.ts:87 ~ sellSharev3 ~ hash:", hash)
        }
      } catch (error) {
        console.log("🚀 ~ file: trade-share.ts:90 ~ sellSharev3 ~ error:", error)
      } 
      if(Date.now() - endBiddingTime >= 1650){
        break;
      }
    }
}

const autoSellSharev2 = async(subjectAddress: string) =>{
  const currentTime = new Date().getTime();
  const endBiddingTime = await getBiddingTime(subjectAddress);
  const _delay = endBiddingTime - currentTime + 1600;
  if(_delay <= 0){
    await sellShare(subjectAddress, endBiddingTime)
  } else {
    setTimeout(() => sellSharev2(subjectAddress, endBiddingTime), _delay);
  }
}

const sellSharev2 = async(subjectAddress: string, endBiddingTime: number) =>{
    let _previos = Date.now() - 30;
    let _count = 0;
    while(true){
      try {
        if(Date.now() - _previos >= 30){
          _previos = Date.now(); 
          _count += 1;
          console.log("Run sell", _count);
          contract.connect(wallet).sellShares(
            subjectAddress,
            1,
            {
              // gasLimit: BigNumber.from(500000),
              gasPrice: BigNumber.from(2660000000000),
            }
          );    
        }
      } catch (error) {
        console.log("🚀 ~ file: trade-share.ts:53 ~ sellSharev2 ~ error:", error)
      } 
      if(Date.now() - endBiddingTime >= 1650){
        break;
      }
    }
}


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

(async () => {
  const subAddress = '0xe7dca53e16de0df1b81b9265348475abb5d54f91';

  // console.log("🚀 ~ file: trade-share.ts:136 ~ await getBiddingTime(subAddress):", new Date(await getBiddingTime(subAddress)))
  // console.log("============ List bids ============", await getListBidPrice(subAddress));
  // await getSellPriceAfterFee(subAddress);
  // // await getBuyPriceAfterFee(subAddress);
  // console.log(await getRecommendBidPrice(subAddress));

  // await buyShare(subAddress);  
  // await bidShare(subAddress ,1 ,1);  
  // await sellShare(subAddress, 1);

  // await autoBidShare(subAddress, 1, 1);  
  // await autoSellShare(subAddress, 1);
  // await autoSellSharev2(subAddress);

  // await autoTrade(subAddress);
  await autoSellSharev3(subAddress, 0);

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
})()