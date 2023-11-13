import { BigNumber, Contract, PopulatedTransaction, VoidSigner, Wallet, ethers } from "ethers";
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
          gasPrice: BigNumber.from(2660000000000),
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
  setTimeout(async () => {
    await bidShare(subjectAddress, 1, 1);
    console.log('==== BID DONE ======');
    await autoSellSharev4(subjectAddress, endBiddingTime, endBidBlock);
  }, endBiddingTime - currentTime - 27000);
}

const autoSellSharev4 = async (subjectAddress: string, endBiddingTime: number, endBidBlock: number) => {
  console.log("Run auto sell");
  const currentTime = new Date().getTime();
  const _delay = endBiddingTime - currentTime - 2000;
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
        if (Date.now() - _previos >= 400) {
          _previos = Date.now();
          console.log("🚀 ~ file: trade-share.ts:321 ~ test ~ currBlock:", currBlock)
          currBlock = await chiliz_provider.getBlockNumber();
          if (currBlock >= endBidBlock) {
            break;
          }
        }
      }
      console.log("Run sell in block", currBlock);
      const hash = await chiliz_provider.sendTransaction(signSellTrx);
      console.log("🚀 ~ file: trade-share.ts:99 ~ setTimeout ~ hash:", hash)
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
          gasPrice: BigNumber.from(2660000000000),
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
  const subAddress = '0x274a10d1036cc375d9a486807706aafd6ac58e70';

  console.log("🚀 ~ file: trade-share.ts:136 ~ await getBiddingTime(subAddress):", new Date(await getBiddingTime(subAddress)))
  console.log("============ List bids ============", await getListBidPrice(subAddress));
  await getSellPriceAfterFee(subAddress);
  // await getBuyPriceAfterFee(subAddress);
  console.log(await getRecommendBidPrice(subAddress));

  // await autoTrade(subAddress, 7986495);
  await autoSellSharev4(subAddress, 0, 0);
})()

// 0x8f8da3fffb8856d12f28bbb32a21d4dcc644df5d 7986394
// 0xcad81367419baa20bd3b8ed6b8888524bb2fe0c5 7986495
