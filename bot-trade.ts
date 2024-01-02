import { BigNumber, Contract, PopulatedTransaction, VoidSigner, Wallet, ethers } from "ethers";
import abi from './abis/starleague.json';
import * as dotenv from "dotenv";
import { formatEther } from "ethers/lib/utils";
import { TransactionRequest } from "zksync-web3/build/src/types";
dotenv.config({ path: '.env' });

const BOOST_MIN_PRICE = 1;
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

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const _buildAndSignSellTransaction = async (subAddress: string, nonce: number = 0) => {
  let _previos = Date.now() - 30;
  while (true) {
    try {
      if (Date.now() - _previos >= 30) {
        _previos = Date.now();
        const sellShares = await contract.populateTransaction.sellShares(subAddress, 1);
        const _data = {
          data: sellShares.data,
          to: CA,
          gasLimit: BigNumber.from(300000),
          from: wallet.address,
          type: 0,
          nonce: nonce,
          gasPrice: BigNumber.from(2950000000000),
          chainId: 88888,
        };
        const signedTrx = await wallet.signTransaction(_data);
        console.log("🚀 ~ file: trade-share.ts:57 ~ const_buildAndSignSellTransaction= ~ signedTrx:", signedTrx)
        return signedTrx;
      }
    } catch (error) {
      console.log("Build fail");
    }
  }
}

const autoTrade = async (subjectAddress: string, endBidBlock: number) => {
  const currentTime = new Date().getTime();
  const endBiddingTime = await getBiddingTime(subjectAddress);
  console.log("🚀 ~ RUN BID IN: ", (endBiddingTime - currentTime - 23000)/1000 )
  setTimeout(async () => {
    await bidShare(subjectAddress, 1, 1);
    console.log('==== BID DONE ======');
    await autoSellSharev4(subjectAddress, endBiddingTime, endBidBlock);
  }, endBiddingTime - currentTime - 21000);
}

const autoSellSharev5 = async (subjectAddress: string, endBiddingTime: number, endBidBlock: number) => {
  console.log("Run auto sell");
  const currentTime = new Date().getTime();
  const _delay = endBiddingTime - currentTime - 5000;
  if (_delay <= 0) {
    // const hash = await chiliz_provider.sendTransaction(signSellTrx);
    // console.log("🚀 ~ file: bot-trade.ts:67 ~ autoSellSharev4 ~ hash:", hash);
    const sellShares = await contract.connect(wallet).sellShares(subjectAddress, 1);
    const trx = await sellShares.wait();
    console.log("🚀 ~ file: trade-share.ts:45 ~ sellShare ~ sellShares:", trx.transactionHash);
  } else {
    const nonce = await wallet.getTransactionCount();
    console.log("🚀 ~ file: bot-trade.ts:76 ~ autoSellSharev4 ~ nonce:", nonce + 1);
    const signSellTrx = await _buildAndSignSellTransaction(subjectAddress, nonce + 1);
    setTimeout(async () => {
      console.log("Run sell");
      const hash = await chiliz_provider.sendTransaction(signSellTrx);
      console.log("🚀 ~ file: trade-share.ts:99 ~ setTimeout ~ hash:", hash)
      // await sleep(2500);
      // await chiliz_provider.sendTransaction(signSellTrx);
    }, _delay);
  }
}


const autoSellSharev4 = async (subjectAddress: string, endBiddingTime: number, endBidBlock: number) => {
  console.log("Run auto sell");
  const currentTime = new Date().getTime();
  const _delay = endBiddingTime - currentTime - 8000;
  if (_delay <= 0) {
    // const hash = await chiliz_provider.sendTransaction(signSellTrx);
    // console.log("🚀 ~ file: bot-trade.ts:67 ~ autoSellSharev4 ~ hash:", hash);
    const sellShares = await contract.connect(wallet).sellShares(subjectAddress, 1);
    const trx = await sellShares.wait();
    console.log("🚀 ~ file: trade-share.ts:45 ~ sellShare ~ sellShares:", trx.transactionHash);
  } else {
    // await sleep(11000);
    const nonce = await wallet.getTransactionCount();
    console.log("🚀 ~ file: bot-trade.ts:76 ~ autoSellSharev4 ~ nonce:", nonce + 1);
    const signSellTrx = await _buildAndSignSellTransaction(subjectAddress, nonce + 1);
    setTimeout(async () => {
      let currBlock = await chiliz_provider.getBlockNumber();
      let _previos = Date.now();
      while (true) {
        if (Date.now() - _previos >= 1000) {
          _previos = Date.now();
          console.log("🚀 ~ file: trade-share.ts:321 ~ test ~ currBlock:", currBlock)
          if (currBlock >= endBidBlock) {
            break;
          }
          currBlock = await chiliz_provider.getBlockNumber();
        }
      }
      console.log("Run sell in block", currBlock);
      const hash = await chiliz_provider.sendTransaction(signSellTrx);
      console.log("🚀 ~ file: trade-share.ts:99 ~ setTimeout ~ hash:", hash)
      // await sleep(2500);
      // await chiliz_provider.sendTransaction(signSellTrx);
    }, _delay);
  }
}

const bidShare = async (subjectAddress: string, price: number, times: number = 1) => {
  console.log("Start Bid");
  try {
    const _t = await getRecommendBidPrice(subjectAddress, price);
    console.log("🚀 ~ AUTO BID WITH VALUE: ", _t.toFixed(2));
    const _price = ethers.utils.parseEther(_t.toFixed(2)).toHexString();
    const transactionCount = await wallet.getTransactionCount();
    for (let i = 0; i < times; i++) {
      contract.connect(wallet).buyShares(
        subjectAddress,
        {
          value: _price,
          gasPrice: BigNumber.from(2680000000000),
          nonce: transactionCount + i
        }
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
    const _rank = result.length - Math.ceil(result.length / 2) - 2;
    return result.length <= 20 ? minPrice : Math.max(Number(formatEther(result[_rank].amount).toString()), minPrice);
  } catch (error) {
    return defaultPrice;
  }
}

const getBiddingTime = async (subjectAddress: string) => {
  const result = await contract.getBiddingTime(
    subjectAddress,
  );
  console.log("🚀 ~ file: trade-share.ts:280 ~ getBiddingTime ~ result:", result.toNumber())
  return result.toNumber() * 1000;
}


const getPoolInitialBuyPriceAfterFee = async (subjectAddress: string) => {
  const result = await contract.getPoolInitialBuyPriceAfterFee(
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
  console.log("🚀 ~ file: trade-share.ts:157 ~ getBuyPriceAfterFee ~ ethers.utils.parseEther(result.toString()).toHexString():", Number(formatEther(result)), ethers.utils.parseEther(result.toString()).toHexString())
  return Number(formatEther(result))
}


const getListBidPrice = async (subjectAddress: string, defaultPrice = 1) => {
  const result = await contract.getPoolInitialTops(
    subjectAddress,
  );
  return result.map(res => `${res.account} - ${Number(formatEther(res.amount).toString())}`);
  }

(async () => {
  const subAddress = '0xbb636d952542c360096e9334da01ac8444644ff8';

  // console.log("🚀 ~ file: trade-share.ts:136 ~ await getBiddingTime(subAddress):", new Date(await getBiddingTime(subAddress)))
  // console.log("============ List bids ============", await getListBidPrice(subAddress));
  // await getSellPriceAfterFee(subAddress);
  // // await getBuyPriceAfterFee(subAddress);
  // console.log(await getRecommendBidPrice(subAddress));

  await autoTrade(subAddress, 8095168 + 298);
  // await autoSellSharev4(subAddress, 0, 0);
})()

// 0xdde0e8e11d9c57577b17208543d55f86dc186c35 8013766
// 0x1bcfbb4e40f71a725d604f1f016f589e117dceb5 8003825
// 0x2f0510666da29e9a05768df224f4db63fc87d44d
