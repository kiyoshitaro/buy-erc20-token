import { BigNumber, Contract,  Wallet, ethers } from "ethers";
import abi from './abis/starleague.json';
import * as dotenv from "dotenv";
import { formatEther } from "ethers/lib/utils";
dotenv.config({ path: '.env' });

const fantechCA = '0xFaD9Fb76EE13aBFe08F8B17d3898a19902b6f9FB';
const chiliz_provider = new ethers.providers.StaticJsonRpcProvider(process.env.QUIKNODE_CHZ);
const wallet = new Wallet(process.env.PRIVATE_KEY as string, chiliz_provider);
const contract = new Contract(
  fantechCA,
  abi,
  chiliz_provider,
);

const sellShare = async(subjectAddress: string, retry: number = 10) =>{
  console.log("🚀 ~ file: trade-share.ts:51 ~ sellShare ~ retry:", retry)
  try {
    const sellShares = await contract.connect(wallet).sellShares(
      subjectAddress,
      1,
      {
        gasLimit: BigNumber.from(500000),
        // maxPriorityFeePerGas: BigNumber.from(2510000000000), // 2500 gwei        
        // maxPriorityFeePerGas: 2510, //1.5 -2 gwei
      }
    );
    const trx = await sellShares.wait();
    const gasFee = Number(
      ethers.utils.formatEther(
        trx.gasUsed.mul(trx.effectiveGasPrice),
      ),
    );
    console.log("🚀 ~ file: trade-share.ts:45 ~ sellShare ~ sellShares:", trx.transactionHash,gasFee.toString() )
  } catch (error) {
    console.log("🚀 ~ file: trade-share.ts:36 ~ sellShare ~ error:", error)
    if(retry > 1){
      sellShare(subjectAddress, retry -1)
    }
  }
}

const bitShare = async(subjectAddress: string, price:number, times: number = 1) =>{
  try {
    // const _price = ethers.utils.parseEther(String(price)).toHexString(); 
    const _t = await getBitPrice(subjectAddress, price);   
    const _price = ethers.utils.parseEther(_t.toString()).toHexString();
    const transactionCount = await wallet.getTransactionCount();
    for(let i =0; i< times; i++){
      contract.connect(wallet).buyShares(
        subjectAddress,
        {value: _price, gasLimit: 500000, nonce: transactionCount + i}
      );
    }
  } catch (error) {
    console.log("🚀 ~ file: trade-share.ts:64 ~ bitShare ~ error:", error)
  }
}

const getBitPrice = async (subjectAddress: string, defaultPrice = 1) => {
  try {
    const result = await contract.getPoolInitialTops(
      subjectAddress,
    );
    const _rank = result.length - Math.ceil(result.length / 2) - 3;
    return Number(formatEther(result[_rank].amount).toString());
  } catch (error) {
    return defaultPrice;
  }
}


const getSellPriceAfterFee = async (subjectAddress: string, defaultAmount = 1) => {
  const result = await contract.getSellPriceAfterFee(
    subjectAddress,
    defaultAmount,
  );
  console.log("🚀 ~ file: trade-share.ts:92 ~ getSellPriceAfterFee ~ result:", formatEther(result).toString())
}
(async () => {
  // await getSellPriceAfterFee('0x86e12538b27fd905de7cf0782f1c9e4e09dfa656');
  await bitShare('0x86e12538b27fd905de7cf0782f1c9e4e09dfa656', 3, 1);  
  // await sellShare('0x86e12538b27fd905de7cf0782f1c9e4e09dfa656',3);
})()

// 0x158dfdd4847f2fc07b6e6d38d5d500e2e74a3fb2