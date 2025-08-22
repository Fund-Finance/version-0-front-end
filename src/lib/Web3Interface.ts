// "use client";

import { FUND_TOKEN_CONTRACT_ADDRESS } from "../constants/contract/FundTokenContract";
import { FUND_CONTROLLER_CONTRACT_ADDRESS } from "../constants/contract/FundControllerContract";
import { ethers } from "ethers";
import { GenericERC20ContractABI } from "../constants/contract/GenericERC20ContractABI";
import { GenericChainlinkAggregator } from "../constants/contract/GenericChainlinkAggregator";
import { FundController__factory, FundController } from "../typechain-types";
import { FundToken__factory, FundToken } from "../typechain-types";
import { ProposalStructOutput } from "../typechain-types/contracts/FundController";
import { RectangleCircle } from "lucide-react";


interface Web3Interface {
  provider: ethers.BrowserProvider | null;
  fundTokenContract: FundToken | null;
  fundControllerContract: FundController | null;
  erc20TokenContracts: Map<string, ethers.Contract>;
  aggregatorContracts: Map<string, ethers.Contract>;
  initialized: boolean;
}

class Web3Manager {
  private static instance: Web3Manager;
  public web3Interface: Web3Interface;

  private constructor() {
    this.web3Interface = {
      provider: null,
      fundTokenContract: null,
      fundControllerContract: null,
      erc20TokenContracts: new Map(),
      aggregatorContracts: new Map(),
      initialized: false
    };
  }

  public static getInstance(): Web3Manager {
    if (!Web3Manager.instance) {
      Web3Manager.instance = new Web3Manager();
    }
    if (!Web3Manager.instance.web3Interface.initialized) {
      Web3Manager.instance.initialize().catch((error) => {
        console.error("Web3Manager initialization failed:", error);
      });
      Web3Manager.instance.web3Interface.initialized = true;
    }
    return Web3Manager.instance;
  }

  public async initialize() {
    if (this.web3Interface.initialized) return;
    if (typeof window === "undefined" || !window.ethereum) throw new Error("MetaMask not available");

    this.web3Interface.provider = new ethers.BrowserProvider(window.ethereum);
    this.web3Interface.provider.on("block", (blockNumber) => {
        console.log("New block received:", blockNumber);
        });
    const provider = this.web3Interface.provider;

    this.web3Interface.fundTokenContract = FundToken__factory.connect(
      FUND_TOKEN_CONTRACT_ADDRESS,
      provider
    );

    this.web3Interface.fundControllerContract = FundController__factory.connect(
      FUND_CONTROLLER_CONTRACT_ADDRESS,
      provider
    );

    const fundAssetList = await this.getFundAssets();
    const fundAssetAggregatorList = await this.getFundAssetAggregators();

    await this.populateERC20Contracts(fundAssetList);
    await this.populateAggregatorContracts(fundAssetAggregatorList);
  }

  private async populateERC20Contracts(addresses: string[]) {
    const provider = this.web3Interface.provider!;
    for (const address of addresses) {
      this.web3Interface.erc20TokenContracts.set(
        address,
        new ethers.Contract(address, GenericERC20ContractABI, provider)
      );
    }
  }

  private async populateAggregatorContracts(addresses: string[]) {
    const provider = this.web3Interface.provider!;
    for (const address of addresses) {
      this.web3Interface.aggregatorContracts.set(
        address,
        new ethers.Contract(address, GenericChainlinkAggregator, provider)
      );
    }
  }

  public async getFundAssets(): Promise<string[]> {
    const fundToken = this.web3Interface.fundTokenContract;
    if (!fundToken) return [];
    const assets = await fundToken.getAssets();
    return assets.map((a) => a[0]);
  }

  public async getFundAssetAggregators(): Promise<string[]> {
    const fundToken = this.web3Interface.fundTokenContract;
    if (!fundToken) return [];
    const assets = await fundToken.getAssets();
    return assets.map((a) => a[1]);
  }

public getProvider(): ethers.BrowserProvider {
    if (!this.web3Interface.provider) {
      throw new Error("Provider not initialized");
    }
    return this.web3Interface.provider;
  }

  public getContract<T extends keyof Web3Interface>(key: T): Web3Interface[T] {
    return this.web3Interface[key];
  }

  public async getFundTotalValue(): Promise<string> {
    const fundToken = this.web3Interface.fundTokenContract;
    if (!fundToken) return "0.00";
    const value = await fundToken.getTotalValueOfFund();
    return (Number(value) / 1e18).toFixed(2);
  }

  public async getFTokenTotalSupply(): Promise<string> {
    const fundToken = this.web3Interface.fundTokenContract;
    if (!fundToken) return "0.00";
    const supply = await fundToken.totalSupply();
    return (Number(supply) / 1e18).toFixed(2);
  }

  public async getERC20HoldingsInFund(address: string): Promise<string> {
    const fundToken = this.web3Interface.fundTokenContract;
    const contract = this.web3Interface.erc20TokenContracts.get(address);
    if (!fundToken || !contract) return "0.00";

    const rawBalance = await contract.balanceOf(await fundToken.getAddress());
    const decimals = await contract.decimals();
    return (Number(rawBalance) / 10 ** Number(decimals)).toFixed(2);
  }

  public async getERC20ValueInFund(address: string): Promise<string> {
    const fundToken = this.web3Interface.fundTokenContract;
    if (!fundToken) return "0.00";
    const value = await fundToken.getValueOfAssetInFund(address);
    return (Number(value) / 1e18).toFixed(2);
  }

    public async getERC20TokenDecimals(address: string): Promise<number> {
      const contract = this.web3Interface.erc20TokenContracts.get(address);
      if (!contract) return 0;
      try {
        return await contract.decimals();
      } catch (err) {
        console.error("Error getting decimals for token", err);
        return 0;
      }
    }

  public async getAggregatorPrice(address: string): Promise<string> {
    const aggregator = this.web3Interface.aggregatorContracts.get(address);
    if (!aggregator) return "0.00";
    try {
      const roundData = await aggregator.latestRoundData();
      const decimals = await aggregator.decimals();
      return (Number(roundData.answer) / 10 ** Number(decimals)).toFixed(2);
    } catch (err) {
      console.error("Aggregator price error:", err);
      return "0.00";
    }
  }

  public async getFundTokenAmountFromUser(userAddress: string): Promise<string> {
    const fundToken = this.web3Interface.fundTokenContract;
    if (!fundToken) return "0.00";
    const balance = await fundToken.balanceOf(userAddress);
    return (Number(balance) / 1e18).toFixed(2);
  }

  public async getFundActiveProposals(): Promise<ProposalStructOutput[]> {
    const controller = this.web3Interface.fundControllerContract;
    if (!controller) return [];
    const activeProposals = await controller.getActiveProposals();
    return activeProposals;
  }

  public async getGovernors(): Promise<string[]> {
    const controller = this.web3Interface.fundControllerContract;
    if (!controller) return [];
    const governors = await controller.getApprovers();
    return governors;
  }

  public async intentToApprove(proposalId: number): Promise<void> {
    const controller = this.web3Interface.fundControllerContract;
    const provider = this.web3Interface.provider;
    if (!controller || !provider) throw new Error("Web3 interface not initialized");

    const signer = await provider.getSigner();
    try
    {
        const tx = await controller.connect(signer).intentToAccept(BigInt(proposalId));
        await tx.wait();
    }
    catch(err: any){}
  }

  public async getBlockTimestamp(): Promise<number> {
    const controller = this.web3Interface.fundControllerContract;
    // const provider = this.web3Interface.provider;
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    if (!controller || !provider) throw new Error("Web3 interface not initialized");

    // local blockchain ping
    // const rand = Number(Math.random() * 1000);
    // console.log("Random number for ping: ", rand);
    // await provider.send("eth_call", [rand]);
    //
    // await provider.send("eth_gasPrice", []);

    // console.log("Provider polling interval: ", provider.pollingInterval);

    const blockNumber3 = await provider.getBlockNumber();
    console.log("Current block number from getBlockNumber: ", blockNumber3);
    const block = (await provider.getBlock(blockNumber3));
    console.log("True block timestamp: ", block?.timestamp);
    if (!block) return 0;

    return block.timestamp;
  }

  public async acceptFundProposal(proposalId: number): Promise<void> {
    const controller = this.web3Interface.fundControllerContract;
    const provider = this.web3Interface.provider;
    if (!controller || !provider) throw new Error("Web3 interface not initialized");

    const signer = await provider.getSigner();
    try
    {
        const tx = await controller.connect(signer).acceptProposal(BigInt(proposalId));
        await tx.wait();
    }
    catch(err: any)
    {
        throw new Error(err);
    }

  }

  public async rejectFundProposal(proposalId: number): Promise<void> {
    const controller = this.web3Interface.fundControllerContract;
    const provider = this.web3Interface.provider;
    if (!controller || !provider) throw new Error("Web3 interface not initialized");

    const signer = await provider.getSigner();
    try
    {
        const tx = await controller.connect(signer).rejectProposal(BigInt(proposalId));
        await tx.wait();
    }
    catch(err: any)
    {
        throw new Error(err);
    }
  }

  public async getFundProposalById(proposalId: number): Promise<any> {
    const controller = this.web3Interface.fundControllerContract;
    if (!controller) return null;

    try
    {
        return await controller.getProposalById(BigInt(proposalId));
    }
    catch (err: any)
    {
        throw new Error(`Failed to get proposal by ID ${proposalId}`);
    }
  }

  public async contributeUsingStableCoin(amount: number): Promise<void> {
    const controller = this.web3Interface.fundControllerContract;
    const provider = this.web3Interface.provider;
    if (!controller || !provider) throw new Error("Web3 interface not initialized");

    const signer = await provider.getSigner();
    const rawAmount = BigInt(amount) * 10n ** 6n;
    const tx = await controller.connect(signer).issueUsingStableCoin(rawAmount);
    const receipt = await tx.wait();
  }

  public async redeemFromFund(amount: number): Promise<void> {
    const controller = this.web3Interface.fundControllerContract;
    const provider = this.web3Interface.provider;
    if (!controller || !provider) throw new Error("Web3 interface not initialized");

    const signer = await provider.getSigner();
    const rawAmount = BigInt(amount) * 10n ** 18n;

    try
    {
        const tx = await controller.connect(signer).redeemAssets(rawAmount);
        await tx.wait();
    }

    
    catch(err: any){}
  }

  public async createProposal(addressesToTrade: string[], addressesToReceive: string[],
                              amountsToTrade: number[], minAmountsToReceive: number[]): Promise<number> {
    const controller = this.web3Interface.fundControllerContract;
    const provider = this.web3Interface.provider;
    if (!controller || !provider) throw new Error("Web3 interface not initialized");

    let amountsToTrade_WAD: bigint[] = [];
    let minAmountsToReceive_WAD: bigint[] = [];
    for (let i = 0; i < addressesToTrade.length; i++) {
        let contractTokenToTrade = this.web3Interface.erc20TokenContracts.get(addressesToTrade[i]);
        let contractTokenToReceive = this.web3Interface.erc20TokenContracts.get(addressesToReceive[i]);
        if (!contractTokenToTrade || !contractTokenToReceive) throw new Error("ERC20 contract not found");

        let decimalsForTradedToken = Number(await contractTokenToTrade?.decimals());
        let decimalsForReceivedToken = Number(await contractTokenToReceive?.decimals());
        amountsToTrade_WAD.push(BigInt(Math.floor(amountsToTrade[i] * 10 ** decimalsForTradedToken)));
        minAmountsToReceive_WAD.push(BigInt(Math.floor(minAmountsToReceive[i] * 10 ** decimalsForReceivedToken)));
    }

    const signer = await provider.getSigner();
    console.log("In create proposal, addressesToTrade:", addressesToTrade[0]);
    try{
    const tx = await controller.connect(signer).createProposal(
      addressesToTrade,
      addressesToReceive,
      amountsToTrade_WAD,
      minAmountsToReceive_WAD
    );
    const receipt = await tx.wait();
    const logs = receipt?.logs || [];

    for (const log of logs)
    {
        const parsed = controller.interface.parseLog(log) || null;
        if (parsed != null && parsed.name === "ProposalCreated") {
            const proposalId = Number(parsed.args.proposalId);
            return Number(proposalId);
        }
    }

    return 0;
    }
    catch(err: any)
    {
      return 0;
    }

  }

  // Add other utility wrappers as needed...
}

export default Web3Manager;
