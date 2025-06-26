"use client";

import { FUND_TOKEN_CONTRACT_ADDRESS } from "../constants/contract/FundTokenContract";
import { FUND_CONTROLLER_CONTRACT_ADDRESS } from "../constants/contract/FundControllerContract";
import { ethers } from "ethers";
import { GenericERC20ContractABI } from "../constants/contract/GenericERC20ContractABI";
import { GenericChainlinkAggregator } from "../constants/contract/GenericChainlinkAggregator";
import { FundController__factory, FundController } from "../typechain-types";
import { FundToken__factory, FundToken } from "../typechain-types";

interface Web3Interface {
  provider: ethers.BrowserProvider | null;
  fundTokenContract: FundToken | null;
  fundControllerContract: FundController | null;
  erc20TokenContracts: Map<string, ethers.Contract>;
  aggregatorContracts: Map<string, ethers.Contract>;
}

// global variable for interfacing with the blockchain backend
let web3Interface: Web3Interface;

/******************** Initialization Functions ********************/

export async function populateWeb3Interface() {
  web3Interface = {
    provider: null,
    fundTokenContract: null,
    fundControllerContract: null,
    erc20TokenContracts: new Map<string, ethers.Contract>([]),
    aggregatorContracts: new Map<string, ethers.Contract>([]),
  };
  await PopulateProvider();
  await PopulateFundContracts();

  const fundAssetList = await getFundAssets();
  const fundAssetAggregatorList = await getFundAssetAggregators();
  let fundAssetAddresses: string[] = [];
  let fundAssetAggregators: string[] = [];
  for (let i = 0; i < fundAssetList.length; i++)
  {
    fundAssetAddresses.push(fundAssetList[i]);
    fundAssetAggregators.push(fundAssetAggregatorList[i]);
  }

  await PopulateERC20Contracts(fundAssetAddresses);
  await PopulateAggregatorContracts(fundAssetAggregators);
}

const PopulateProvider = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  web3Interface.provider = new ethers.BrowserProvider(window.ethereum);
};

const PopulateFundContracts = async () => {
  if (!web3Interface.provider)
      throw new Error("Provider not initialized");

    web3Interface.fundTokenContract = FundToken__factory.connect(
        FUND_TOKEN_CONTRACT_ADDRESS,
        web3Interface.provider
    );
    web3Interface.fundControllerContract = FundController__factory.connect(
        FUND_CONTROLLER_CONTRACT_ADDRESS,
        web3Interface.provider
    );
};


const PopulateERC20Contracts = async (addressList: string[]) => {
    if (!web3Interface.provider)
        throw new Error("Provider not initialized");

    for(let i = 0; i < addressList.length; i++)
    {
        web3Interface.erc20TokenContracts.set(
            addressList[i],
            new ethers.Contract(
                addressList[i],
                GenericERC20ContractABI,
                web3Interface.provider,
            )
        );
    }
}

const PopulateAggregatorContracts = async (addressList: string[]) => {
    if (!web3Interface.provider)
        throw new Error("Provider not initialized");

    for (let i = 0; i < addressList.length; i++) {
        web3Interface.aggregatorContracts.set(
            addressList[i],
            new ethers.Contract(
                addressList[i],
                GenericChainlinkAggregator,
                web3Interface.provider,
            )
        );
    }
}

/******************** General ERC20 Functions ********************/

// gets the amount of an ERC20 token in the fund given the address as an input
export async function getERC20HoldingsInFund (address: string): Promise<string>
{
    if (!web3Interface || !web3Interface.fundTokenContract || !web3Interface.erc20TokenContracts.has(address))
        return "0.00";
    
    const contract = web3Interface.erc20TokenContracts.get(address);
    if (!contract) return "0.00";
    
    let result = Number(await contract.balanceOf(await web3Interface.fundTokenContract.getAddress())) /
        (10 ** Number(await contract.decimals()));
    result = Math.round(result * 100) / 100; // round to 2 decimal places
    return result.toString();
}

// gets the monitary value of an ERC20 token in the fund given the address as an input
export async function getERC20ValueInFund (address: string): Promise<string>
{
    if (!web3Interface || !web3Interface.fundTokenContract || !web3Interface.erc20TokenContracts.has(address))
        return "0.00";
    
    const contract = web3Interface.erc20TokenContracts.get(address);
    if (!contract) return "0.00";
    
    let result = Number(await web3Interface.fundTokenContract.getValueOfAssetInFund(address)) / (10 ** 18);
    result = Math.round(result * 100) / 100; // round to 2 decimal places
    return result.toString();
}

export async function getERC20TokenDecimals(address: string): Promise<number>
{
    if (!web3Interface || !web3Interface.erc20TokenContracts.has(address))
        return 0;

    const contract = web3Interface.erc20TokenContracts.get(address);
    if (!contract) return 0;

    try {
        return await contract.decimals();
    } catch (error) {
        console.error("Error fetching decimals for token:", error);
        return 0;
    }
}

export async function getFundTokenAmountFromUser (address: string): Promise<string>
{
    if (!web3Interface || !web3Interface.fundTokenContract) 
        return "0.00";

    let rawResult = await web3Interface.fundTokenContract.balanceOf(address);
    if (rawResult === null || rawResult === undefined) return "0.00";
    let result = Number(rawResult) / (10 ** 18); // fund token uses 18 decimals
    result = Math.round(result * 100) / 100; // round to 2 decimal places
    return result.toString();
}

export async function getFundActiveProposals()
{
    if (!web3Interface || !web3Interface.fundControllerContract)
        return [];
    
    const proposals = await web3Interface.fundControllerContract.getActiveProposals();
    return proposals
}

/******************** Aggregator Functions ********************/
export async function getAggregatorPrice(address: string): Promise<string>
{
    if (!web3Interface || !web3Interface.aggregatorContracts.has(address))
        return "0.00";
   
    const contract = web3Interface.aggregatorContracts.get(address);
    if (!contract) return "00.00";

    try {
        const latestRoundData = await contract.latestRoundData();
        let result = Number(latestRoundData.answer) / (10 ** Number(await contract.decimals()));
        return result.toString();
    } catch (error) {
        console.error("Error fetching price from aggregator:", error);
        return "0.00";
    }
}

/******************** Fund Functions ********************/

export async function getFundTotalValue(): Promise<string>
{
    if (!web3Interface || !web3Interface.fundTokenContract)
        return "0.00";
    let result =
      Number(await web3Interface.fundTokenContract.getTotalValueOfFund()) /
      10 ** 18;
    result = Math.round(result * 100) / 100; // round to 2 decimal places
    return result.toString();
}

export async function getFTokenTotalSupply(): Promise<string>
{
    if (!web3Interface || !web3Interface.fundTokenContract)
        return "0.00";
    let result =
        Number(await web3Interface.fundTokenContract.totalSupply()) /
        (10 ** 18);
    result = Math.round(result * 100) / 100; // round to 2 decimal places
    return result.toString();
}

// returns the list of the asset token addresses in the fund
export async function getFundAssets(): Promise<string[]>
{
    if (!web3Interface || !web3Interface.fundTokenContract)
        return [];
    const assetsStruct = await web3Interface.fundTokenContract.getAssets();
    const assets: string[] = assetsStruct.map((asset) => asset[0]); // Extracting only the addresses
    return assets;

}

export async function getFundAssetAggregators(): Promise<string[]>
{
    if (!web3Interface || !web3Interface.fundTokenContract)
        return [];
    const assetsStruct = await web3Interface.fundTokenContract.getAssets();
    const aggregators: string[] = assetsStruct.map((asset) => asset[1]); // Extracting only the aggregator addresses
    return aggregators;
}

export async function contributeUsingStableCoin(amount:number)
{
    if (!web3Interface || !web3Interface.fundControllerContract || !web3Interface.provider) {
        throw new Error("Web3 interface not initialized");
    }

    // USDC uses 6 decimals
    const amount_raw = BigInt(amount) * (10n ** 6n); // Convert to raw amount
    console.log("Contributing amount (raw):", amount_raw.toString());

    // get the signer to sign the transaction
    const signer = await web3Interface.provider.getSigner();
    await web3Interface.fundControllerContract.connect(signer).issueUsingStableCoin(
        amount_raw
    );
}

export async function redeemFromFund(amount: number)
{
    if (!web3Interface || !web3Interface.fundControllerContract || !web3Interface.provider) {
        throw new Error("Web3 interface not initialized");
    }

    // fToken uses 18 decimals
    const amount_raw = BigInt(amount) * (10n ** 18n); // Convert to raw amount
    console.log("Redeeming amount (raw):", amount_raw.toString());

    // get the signer to sign the transaction
    const signer = await web3Interface.provider.getSigner();
    await web3Interface.fundControllerContract.connect(signer).redeemAssets(
        amount_raw
    );
}

export async function createProposal(addressesToTrade: string[], addressesToReceive: string[], amountsToTrade: number[]): Promise<void>
{
    if (!web3Interface || !web3Interface.fundControllerContract || !web3Interface.provider) {
        throw new Error("Web3 interface not initialized");
    }
    
    const contract = web3Interface.erc20TokenContracts.get(addressesToTrade[0]);
    if (!contract) {
        throw new Error("Contract not found for the address to trade");
    }
    const decimals = await contract.decimals();
    const amountToTrade_raw =
        amountsToTrade[0] * (10 ** Number(decimals)); 

    console.log("In creating proposal, amount to trade (raw):", amountToTrade_raw);

    // get the signer to sign the transaction
    const signer = await web3Interface.provider.getSigner();
    await web3Interface.
    fundControllerContract.connect(signer).createProposal(
        addressesToTrade[0],
        addressesToReceive[0],
        amountToTrade_raw
    );
    
    // await tx.wait(); // Wait for transaction confirmation
}
