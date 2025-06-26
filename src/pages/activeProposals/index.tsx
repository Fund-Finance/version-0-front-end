import { useState, useEffect } from "react";
import { getERC20TokenDecimals, getFundActiveProposals } from "../../utils/Web3Interface";
import { ProposalStructOutput } from "../../typechain-types/contracts/FundController";
import { tokenAddressToShort } from "../../constants/contract/ERC20Contracts";
import { tokenAddressToName } from "../../constants/contract/ERC20Contracts";

type frontEndProposal = [
    number, // id
    string, // proposer
    string, // assetToTrade
    string, // assetToReceive
    number, // amountIn
    number  // approvalTimelockEnd
] & {
    id: number;
    proposer: string;
    assetToTrade: string;
    assetToReceive: string;
    amountIn: number;
    approvalTimelockEnd: number;
};

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

      let rawProposals = await getFundActiveProposals();
      let editedProposals: frontEndProposal[] = [];
      for (let proposal of rawProposals)
      {
        // Convert assetToTrade to short name
        let decimals = BigInt(await getERC20TokenDecimals(proposal.assetToTrade));
        const newAmountIn = Number(proposal.amountIn) / Number((10n ** decimals));
        const newProposal: frontEndProposal = Object.assign(
        [
            Number(proposal.id),
            proposal.proposer,
            proposal.assetToTrade,
            proposal.assetToReceive,
            newAmountIn,
            Number(proposal.approvalTimelockEnd),
        ],
        {
            id: Number(proposal.id),
            proposer: proposal.proposer,
            assetToTrade: proposal.assetToTrade,
            assetToReceive: proposal.assetToReceive,
            amountIn: Number(newAmountIn),
            approvalTimelockEnd: Number(proposal.approvalTimelockEnd),
        });
        editedProposals.push(newProposal);
      }

      console.log("Edited Proposals:", editedProposals);


      setProposals(editedProposals);
    };

    // The queryBackend function which is meant to
    // run at a set interval
    async function queryBackend()
    {
      let rawProposals = await getFundActiveProposals();
      let editedProposals: frontEndProposal[] = [];
      for (let proposal of rawProposals)
      {
        // Convert assetToTrade to short name
        let decimals = BigInt(await getERC20TokenDecimals(proposal.assetToTrade));
        const newAmountIn = Number(proposal.amountIn) / Number(10n ** decimals);
        const newProposal: frontEndProposal = Object.assign(
        [
            Number(proposal.id),
            proposal.proposer,
            proposal.assetToTrade,
            proposal.assetToReceive,
            newAmountIn,
            Number(proposal.approvalTimelockEnd),
        ],
        {
            id: Number(proposal.id),
            proposer: proposal.proposer,
            assetToTrade: proposal.assetToTrade,
            assetToReceive: proposal.assetToReceive,
            amountIn: newAmountIn,
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

  return (
    <div className="min-h-screen bg-gray-100 p-6 mb-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b mb-6 py-1">
        <div className="text-xl font-bold">Logo</div>
        <h1 className="text-2xl font-semibold text-center flex-grow">Active Proposals</h1>
        <div className="w-[60px]">{/* empty space for alignment */}</div>
      </header>

      {/* Table Header */}
      <div className="grid grid-cols-[7%_25%_34%_34%] bg-white shadow rounded-t-md px-4 py-3 font-semibold text-gray-700">
        <div className="text-center">Proposal ID</div>
        <div className="text-center">User</div>
        <div className="text-center">Assets to Trade</div>
        <div className="text-center">Justification</div>
      </div>

      {/* Table Rows (mocked entries with circles) */}
      <div className="bg-white shadow rounded-b-md divide-y">
        {proposals.map((proposal, index) => (
          <div
            key={index}
            className="grid grid-cols-[7%_25%_34%_34%] px-4 py-4 items-center text-gray-600 transition duration-200 ease-in-out transform hover:bg-gray-200 hover:scale-[1.01] cursor-pointer"
          >
            <div className="text-center text-black">#{proposal.id}</div>
            <div className="text-center text-black">{proposal.proposer}</div>
            <div className="flex items-center justify-center gap-2">
              {/* From Token */}
              <div className="flex items-center gap-1">
                <img src={"/" + (tokenAddressToName.get(proposal.assetToTrade)?.[0] ?? "default")
                    + ".png"} alt={tokenAddressToName.get(proposal.assetToTrade)?.[1]} className="w-4 h-4" />
                <span>{Number(proposal.amountIn)} {tokenAddressToName.get(proposal.assetToTrade)?.[1]}</span>
              </div>

              {/* Arrow */}
              <span>→</span>

              {/* To Token */}
              <div className="flex items-center gap-1">
                <img src={"/" + (tokenAddressToName.get(proposal.assetToReceive)?.[0] ?? "default")
                    + ".png"} alt={tokenAddressToName.get(proposal.assetToReceive)?.[1]} className="w-4 h-4" />
                <span>YY {tokenAddressToName.get(proposal.assetToReceive)?.[1]}</span>
                </div>
            </div>

            <div className="text-center text-black">
                Justification Here
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

