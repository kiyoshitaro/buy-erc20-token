import { Contract } from 'zksync-web3';
import ERC20ABI from './abis/ERC20.json';
import { BigNumber, ethers, VoidSigner } from 'ethers';

export class ERC20 {
  private contract: Contract;

  private decimals: number;

  constructor(tokenAddress: string, provider: ethers.providers.Provider) {
    this.contract = new Contract(tokenAddress, ERC20ABI.abi, provider);
  }

  async getDecimals() {
    if (!this.decimals) {
      this.decimals = Number(await this.contract.callStatic.decimals());
    }
    return this.decimals;
  }

  async getBalance(address: string): Promise<BigNumber> {
    return this.contract.callStatic.balanceOf(address);
  }

  async approve(walletAddress: string, spender: string, amount: string, gasLimit?: BigNumber) {
    const response = await this.contract.populateTransaction.approve(
      spender,
      amount.toString(),
    );

    if (gasLimit) {
      response.gasLimit = gasLimit;
    }

    const voidSigner = new VoidSigner(walletAddress, this.contract.provider);

    return await voidSigner.populateTransaction(response);
  }

  async allowance(owner: string, spender: string): Promise<BigNumber> {
    return await this.contract.callStatic.allowance(owner, spender);
  }

  buildApprove = async (
    walletAddress: string,
    spender: string,
    amount: string,
  ) => {
    return this.approve(walletAddress, spender, amount);
  };

  async isValidAllowance(amount: string, allowanceAmount: BigNumber) {
    const amountBigNum = await this.parseValue(amount);
    return amountBigNum.lte(allowanceAmount);
  }

  async formatValue(amount: BigNumber) {
    const decimals = await this.getDecimals();
    return ethers.utils.formatUnits(amount, decimals);
  }

  async parseValue(amount: string): Promise<BigNumber> {
    const decimals = await this.getDecimals();
    const modifiedAmount = Number(amount).toFixed(decimals);
    return ethers.utils.parseUnits(modifiedAmount, decimals);
  }
}