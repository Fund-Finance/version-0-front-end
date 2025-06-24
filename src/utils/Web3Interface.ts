"use client";

import { FUND_TOKEN_CONTRACT_ADDRESS } from "../constants/contract/FundTokenContract";
import { FUND_CONTROLLER_CONTRACT_ADDRESS } from "../constants/contract/FundControllerContract";
import { ethers } from "ethers";
import { GenericERC20ContractABI } from "../constants/contract/GenericERC20ContractABI";
import { FundController__factory, FundController } from "../typechain-types";
import { FundToken__factory, FundToken } from "../typechain-types";

interface Web3Interface {
  provider: ethers.BrowserProvider | null;
  fundTokenContract: FundToken | null;
  fundControllerContract: FundController | null;
  erc20TokenContracts: Map<string, ethers.Contract>;
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
  };
  await PopulateProvider();
  await PopulateFundContracts();

  const fundAssetList = await getFundAssets();
  let fundAssetAddresses: string[] = [];
  for (let i = 0; i < fundAssetList.length; i++)
  {
    fundAssetAddresses.push(fundAssetList[i]);
  }

  await PopulateERC20Contracts(fundAssetAddresses);
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

/******************** General ERC20 Functions ********************/

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

// returns the list of the asset token addresses in the fund
export async function getFundAssets(): Promise<string[]>
{
    if (!web3Interface || !web3Interface.fundTokenContract)
        return [];
    const assetsStruct = await web3Interface.fundTokenContract.getAssets();
    const assets: string[] = assetsStruct.map((asset) => asset[0]); // Extracting only the addresses
    console.log(assets)
    return assets;

}

export async function createProposal(addressesToTrade: string[], addressesToReceive: string[], amountsToTrade: number[]): Promise<void>
{
    if (!web3Interface || !web3Interface.fundControllerContract || !web3Interface.provider) {
        throw new Error("Web3 interface not initialized");
    }
    
    const amountToTrade_raw =
        BigInt(amountsToTrade[0]) * (10n ** 18n); 

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
