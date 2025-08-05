import { useState, useEffect } from "react";
import { tokenAddressToName } from "../../constants/contract/ERC20Contracts";
import Link from "next/link";

import Web3Manager from "../../lib/Web3Interface";

type frontEndProposal = [
    number, // id
    string, // proposer
    string[], // assetsToTrade
    string[], // assetsToReceive
    number[], // amountsIn
    number  // approvalTimelockEnd
] & {
    id: number;
    proposer: string;
    assetsToTrade: string[];
    assetsToReceive: string[];
    amountsIn: number[];
    minAmountsToReceive: number[];
    approvalTimelockEnd: number;
};
const web3Manager = Web3Manager.getInstance();

export default function Home()
{
  const [proposals, setProposals] = useState<frontEndProposal[]>([]);

  // this use Effect will initialize the front-end
  // and query the backend frequently to update the neede values
  useEffect(() =>
  {
    // The initialize function which runs only once
    async function init()
    {
      if (typeof window === "undefined") 
          return;

      let rawProposals = await web3Manager.getFundActiveProposals();
      console.log("Raw Proposals:");
      console.log(rawProposals);
      let editedProposals: frontEndProposal[] = [];
      for (let proposal of rawProposals)
      {
        // Convert assetToTrade to short name
        let amountsIn_crypto: number[] = [];
        let minAmountsToReceive_crypto: number[] = [];
        let decimals: BigInt[] = [];
        let decimal = BigInt(0);
        for(let i = 0; i < amountsIn_crypto.length; i++)
        {
            decimal = BigInt(await web3Manager.getERC20TokenDecimals(proposal.assetsToTrade[i]));
            decimals.push(decimal);
            amountsIn_crypto.push(Number(proposal.amountsIn[i]) / Number(10n ** decimal));
            minAmountsToReceive_crypto.push(Number(proposal.minAmountsToReceive[i]) / Number(10n ** decimal));
        }
        const newProposal: frontEndProposal = Object.assign(
        [
            Number(proposal.id),
            proposal.proposer,
            proposal.assetsToTrade,
            proposal.assetsToReceive,
            amountsIn_crypto,
            minAmountsToReceive_crypto,
            Number(proposal.approvalTimelockEnd),
        ],
        {
            id: Number(proposal.id),
            proposer: proposal.proposer,
            assetsToTrade: proposal.assetsToTrade,
            assetsToReceive: proposal.assetsToReceive,
            amountsIn: amountsIn_crypto,
            minAmountsToReceive: minAmountsToReceive_crypto,
            approvalTimelockEnd: Number(proposal.approvalTimelockEnd),
        });
        editedProposals.push(newProposal);
      }

      setProposals(editedProposals);
    };

    // The queryBackend function which is meant to
    // run at a set interval
    async function queryBackend()
    {
      let rawProposals = await web3Manager.getFundActiveProposals();
      console.log("Raw Proposals from backend:");
      console.log(rawProposals);
      let editedProposals: frontEndProposal[] = [];
      for (let proposal of rawProposals)
      {
        // Convert assetToTrade to short name
        // let decimals = BigInt(await web3Manager.getERC20TokenDecimals(proposal.assetToTrade));
        // const newAmountsIn = proposal.amountsIn.map(amount: BigInt) => Number(amount) / Number(10n ** decimals);
        let amountsIn_crypto: number[] = [];
        let minAmountsToReceive_crypto: number[] = [];
        let decimals: BigInt[] = [];
        let decimal = BigInt(0);
        for(let i = 0; i < amountsIn_crypto.length; i++)
        {
            decimal = BigInt(await web3Manager.getERC20TokenDecimals(proposal.assetsToTrade[i]));
            decimals.push(decimal);
            amountsIn_crypto.push(Number(proposal.amountsIn[i]) / Number(10n ** decimal));
            minAmountsToReceive_crypto.push(Number(proposal.minAmountsToReceive[i]) / Number(10n ** decimal));
        }
        const newProposal: frontEndProposal = Object.assign(
        [
            Number(proposal.id),
            proposal.proposer,
            proposal.assetsToTrade,
            proposal.assetsToReceive,
            amountsIn_crypto,
            minAmountsToReceive_crypto,
            Number(proposal.approvalTimelockEnd),
        ],
        {
            id: Number(proposal.id),
            proposer: proposal.proposer,
            assetsToTrade: proposal.assetsToTrade,
            assetsToReceive: proposal.assetsToReceive,
            amountsIn: amountsIn_crypto,
            minAmountsToReceive: minAmountsToReceive_crypto,
            approvalTimelockEnd: Number(proposal.approvalTimelockEnd),
        });
        editedProposals.push(newProposal);
      }

      setProposals(editedProposals);
    }
    init();
    queryBackend();

    // Set an interval to query the backend every second
    const interval = setInterval(queryBackend, 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount

  }, []);

  useEffect(() => {
    console.log("Proposals updated:", proposals);
  }, [proposals]);

  return (
    <div className="min-h-screen bg-gray-100 p-6 mb-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b mb-6 py-1">
        <div className="text-xl font-bold">Logo</div>
        <h1 className="text-2xl font-semibold text-center flex-grow">Active Proposals</h1>
        <div className="w-[60px]">{/* empty space for alignment */}</div>
      </header>

      {/* Table Header */}
      <div className="grid grid-cols-[7%_25%_36%_32%] bg-white shadow rounded-t-md px-4 py-3 font-semibold text-gray-700">
        <div className="text-center">Proposal ID</div>
        <div className="text-center">User</div>
        <div className="text-center">Assets to Trade</div>
        <div className="text-center">Justification</div>
      </div>

      {/* Table Rows (mocked entries with circles) */}
      <div className="bg-white shadow rounded-b-md divide-y">
     {proposals.map((proposal) => (
    <Link
      key={proposal.id}
      href={`/proposal/${proposal.id}`}
      className="grid grid-cols-[7%_25%_36%_32%] px-4 py-4 items-center text-gray-600 border-b 
                 transition duration-200 ease-in-out transform hover:bg-gray-100 hover:scale-[1.01] cursor-pointer"
    >
      <div className="text-center text-black">#{proposal.id}</div>
      <div className="text-center text-black">{proposal.proposer}</div>
        <div className="flex items-center justify-center gap-1">
  {proposal.assetsToTrade.slice(0, 4).map((fromToken: string, idx: number) => {
    const toToken = proposal.assetsToReceive[idx];

    const [fromImage, fromSymbol] = tokenAddressToName.get(fromToken) ?? ["default", "UNK"];
    const [toImage, toSymbol] = tokenAddressToName.get(toToken) ?? ["default", "UNK"];

    return (
      <span key={idx} className="flex items-center">
        <span className="flex items-center gap-1">
          <img src={`/${fromImage}.png`} alt={fromSymbol} className="w-4 h-4" />
          <span>{fromSymbol}</span>
        </span>

        <span className="px-1">→</span>

        <span className="flex items-center gap-1">
          <img src={`/${toImage}.png`} alt={toSymbol} className="w-4 h-4" />
          <span>{toSymbol}</span>
        </span>

        {/* Only add comma if this is not the last shown item */}
        {idx < Math.min(4, proposal.assetsToTrade.length - 1) && <span className="ml-1">|</span>}
      </span>
    );
  })}

      {proposal.assetsToTrade.length > 4 && (
        <span className="text-gray-500">...</span>
      )}

      </div>
        <div className="text-center text-black">
            Justification Here
        </div>
      
    </Link>
  ))}

  </div>
    </div>
  );
}

