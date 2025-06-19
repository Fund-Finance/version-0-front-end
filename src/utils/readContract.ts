'use client';

import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants/FundTokenContract";
import { ethers } from "ethers";

interface Web3Interface
{
    provider: ethers.BrowserProvider | null;
    fundTokenContract: ethers.Contract | null;
    fundControllerContract: ethers.Contract | null;
}

let web3Interface:Web3Interface;


const PopulateProvider = async () => {
    if (!window.ethereum) throw new Error("MetaMask not found");
    web3Interface.provider = new ethers.BrowserProvider(window.ethereum);

    }


const PopulateContract = async () => {
    if (!web3Interface.provider) throw new Error("Provider not initialized");
    web3Interface.fundTokenContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        web3Interface.provider
    );
}

export async function populateWeb3Interface()
{
    web3Interface = {
        provider: null,
        fundTokenContract: null,
        fundControllerContract: null
    };
    await PopulateProvider();
    await PopulateContract();
}

export async function getValue() : Promise<string>
{
try {

  if(!web3Interface || !web3Interface.fundTokenContract)
      return "0.00";
  let result = Number(await web3Interface.fundTokenContract.getTotalValueOfFund()) / (10 ** 18);
  result = Math.round(result * 100) / 100; // round to 2 decimal places
  return result.toString();
} catch (err) {
    console.log("An error occurred: ", err);
    return "0.00";
}
};
