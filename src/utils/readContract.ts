"use client";

import { FUND_TOKEN_CONTRACT_ADDRESS, FUND_TOKEN_CONTRACT_ABI } from "../constants/contract/FundTokenContract";
import { FUND_CONTROLLER_CONTRACT_ADDRESS, FUND_CONTROLLER_CONTRACT_ABI } from "../constants/contract/FundControllerContract";
import { ethers } from "ethers";
import { GenericERC20ContractABI } from "../constants/contract/GenericERC20ContractABI";
import { TokenPair } from "../types/TokenPair";

interface Web3Interface {
  provider: ethers.BrowserProvider | null;
  fundTokenContract: ethers.Contract | null;
  fundControllerContract: ethers.Contract | null;
  erc20TokenContracts: Map<string, ethers.Contract>;
}

let web3Interface: Web3Interface;

const PopulateProvider = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");
  web3Interface.provider = new ethers.BrowserProvider(window.ethereum);
};

const PopulateFundContracts = async () => {
  if (!web3Interface.provider)
      throw new Error("Provider not initialized");

    web3Interface.fundTokenContract = new ethers.Contract(
        FUND_TOKEN_CONTRACT_ADDRESS,
        FUND_TOKEN_CONTRACT_ABI,
        web3Interface.provider,
    );
    const signer = await web3Interface.provider.getSigner();
    web3Interface.fundControllerContract = new ethers.Contract(
        FUND_CONTROLLER_CONTRACT_ADDRESS,
        FUND_CONTROLLER_CONTRACT_ABI,
        signer,
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

export async function populateWeb3Interface() {
  web3Interface = {
    provider: null,
    fundTokenContract: null,
    fundControllerContract: null,
    erc20TokenContracts: new Map<string, ethers.Contract>([]),
  };
  await PopulateProvider();
  await PopulateFundContracts();

  const fundAssetList = await getFundAssets();
  let fundAssetAddresses: string[] = [];
  for (let i = 0; i < fundAssetList.length; i++)
  {
    fundAssetAddresses.push(fundAssetList[i][0]);
  }

  await PopulateERC20Contracts(fundAssetAddresses);
}

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

export async function getFundAssets(): Promise<string[]>
{
    if (!web3Interface || !web3Interface.fundTokenContract)
        return [];
    const assets = await web3Interface.fundTokenContract.getAssets();
    return assets;
}

export async function createProposal(addressesToTrade: string[], addressesToReceive: string[], amountsToTrade: number[]): Promise<void>
{
    if (!web3Interface || !web3Interface.fundControllerContract) {
        throw new Error("Web3 interface not initialized");
    }
    

    console.log("Creating proposal with the following data:");
    console.log("Addresses to trade:", addressesToTrade[0]);
    console.log("Addresses to receive:", addressesToReceive[0]);
    console.log("Amounts to trade:", amountsToTrade[0]);

    const amountToTrade_raw =
        BigInt(amountsToTrade[0]) * (10n ** 18n); 

    // Call the contract method to publish the proposal
    // const tx = await web3Interface.fundTokenContract.createProposal(
    await web3Interface.fundControllerContract.createProposal(
        addressesToTrade[0],
        addressesToReceive[0],
        amountToTrade_raw
    );
    
    // await tx.wait(); // Wait for transaction confirmation
}
