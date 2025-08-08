import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Web3Manager from "../../lib/Web3Interface";
import { tokenAddressToName, tokenNameToColor } from "../../constants/contract/ERC20Contracts";
import TokenAllocationCard from "../../components/TokenAllocationCard";
import { useAccount } from "wagmi";

interface Token {
  name: string;
  short: string;
  percentage: string;
  color: string;
}

type visualProposal = [
    number, // id
    string, // proposer
    string[], // assetsToTrade
    string[], // assetsToReceive
    number[], // amountsIn
    number[], // minAmountsToReceive
    number,  // approvalTimelockEnd
    string, // justification
] & {
    id: number;
    proposer: string;
    assetsToTradeVisual: string[];
    assetsToReceiveVisual: string[];
    amountsInAdjusted: number[];
    minAmountsToReceiveAdjusted: number[];
    approvalTimelockEnd: number;
    justification: string;
};

export default function ProposalPage() {
  const router = useRouter();
  const { id } = router.query;
  const { isConnected, address } = useAccount();

  const [proposal, setProposal] = useState<null | visualProposal>(null);
  const [justification, setJustification] = useState<string>("");
  const [fundTokenPercentageAfterProposal, setFundTokenPercentageAfterProposal] = useState<Map<string, number>>();
  const [tokensArray, setTokensArray] = useState<Token[]>([]);
  const [governors, setGovernors] = useState<string[]>([]);
  const [blockTimestamp, setBlockTimestamp] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  
  const web3Manager = Web3Manager.getInstance();

  const handleIntentToApprove = async () => {
    const proposalId = Number(id);

    web3Manager.intentToApprove(proposalId);
  }

  const handleAcceptProposal = async () => {
    const proposalId = Number(id);

    await web3Manager.acceptFundProposal(proposalId);

    router.push("/");

  }

  const handleRejectProposal = async () => {
    const proposalId = Number(id);

    // Implement rejection logic here
    await web3Manager.rejectFundProposal(proposalId);
    router.push("/");
  }

  useEffect(() => {
    if (!id) return;
    const readFile = async (filename: string) => {
      const res = await fetch(`/api/readFile/${filename}`);
      
      if (!res.ok) {
        const error = await res.json();
        console.error("Error:", error.message);
        return;
      }

      const content = await res.text();
      setJustification(content);
};

    const fetchproposal = async () => {
    const rawproposaldata = await web3Manager.getFundProposalById(Number(id));
    console.log(rawproposaldata);
      try {
        let visualProposalData:
            visualProposal = Object.assign(
            [
                Number(rawproposaldata.id),
                rawproposaldata.proposer,
                [],
                [],
                [],
                [],
                Number(rawproposaldata.approvalTimelockEnd),
                "No justification provided.",
            ],
            {
                id: Number(rawproposaldata.id),
                proposer: rawproposaldata.proposer,
                assetsToTradeVisual: [],        // visual to show token name and short
                assetsToReceiveVisual: [],      // visual to show token name and short
                amountsInAdjusted: [],          // adjusted for decimals
                minAmountsToReceiveAdjusted: [],// adjusted for decimals
                approvalTimelockEnd: Number(rawproposaldata.approvalTimelockEnd),
                justification: justification || "No justification provided.",

            });
        for(let i = 0; i < rawproposaldata.assetsToTrade.length; i++)
        {
            const decimalsForAssetToTrade = BigInt(await web3Manager.getERC20TokenDecimals(rawproposaldata.assetsToTrade[i]));
            const decimalsForAssetToReceive = BigInt(await web3Manager.getERC20TokenDecimals(rawproposaldata.assetsToReceive[i]));
            visualProposalData.amountsInAdjusted.push(
                Number(rawproposaldata.amountsIn[i]) / Number(10n ** decimalsForAssetToTrade));
            visualProposalData.minAmountsToReceiveAdjusted.push(
                Number(rawproposaldata.minAmountsToReceive[i]) / Number(10n ** decimalsForAssetToReceive));
            visualProposalData.assetsToTradeVisual.push(
        tokenAddressToName.get(rawproposaldata.assetsToTrade[i]));
            visualProposalData.assetsToReceiveVisual.push(tokenAddressToName.get(rawproposaldata.assetsToReceive[i]));
        }

        await readFile(rawproposaldata.id.toString() + ".txt");
        setBlockTimestamp(await web3Manager.getBlockTimestamp());
        setProposal(visualProposalData);
      } catch (err) {
        console.error("error fetching proposal:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchFundDistribution = async () => {
        const rawproposaldata = await web3Manager.getFundProposalById(Number(id));
        const fundAssets = await web3Manager.getFundAssets();
        let fundTokenHoldings = new Map<string, number>();
        let fundTokenAmounts = new Map<string, number>();
        let cryptoPerDollarAmount = new Map<string, number>();

        for(let i = 0; i < fundAssets.length; i++)
        {
            fundTokenHoldings.set(fundAssets[i], Number(await web3Manager.getERC20HoldingsInFund(fundAssets[i])));
            fundTokenAmounts.set(fundAssets[i], Number(await web3Manager.getERC20ValueInFund(fundAssets[i])));
            cryptoPerDollarAmount.set(fundAssets[i],
                (fundTokenAmounts.get(fundAssets[i]) || 0) / (fundTokenHoldings.get(fundAssets[i]) || 1));
        }

        let fundTokenHoldingsAfterProposal = fundTokenHoldings;
        for(let i = 0; i < rawproposaldata.assetsToTrade.length; i++)
        {
            const assetToTrade_address = rawproposaldata.assetsToTrade[i];
            const assetToReceive_address = rawproposaldata.assetsToReceive[i];
            let amountToTrade_crypto = Number(rawproposaldata.amountsIn[i]) / (10 ** Number(await web3Manager.getERC20TokenDecimals(assetToTrade_address)));
            fundTokenHoldingsAfterProposal.set(
                assetToTrade_address,
                (fundTokenHoldingsAfterProposal.get(assetToTrade_address) || 0)
                - amountToTrade_crypto);

            const assetToTradeDollarValue = amountToTrade_crypto * (cryptoPerDollarAmount.get(assetToTrade_address) || 0);
            const amountToReceive_crypto = assetToTradeDollarValue / (cryptoPerDollarAmount.get(assetToReceive_address) || 1);
            fundTokenHoldingsAfterProposal.set(
                assetToReceive_address,
                (fundTokenHoldingsAfterProposal.get(assetToReceive_address) || 0)
                + amountToReceive_crypto);
        }

        const totalFundValue = Number(await web3Manager.getFundTotalValue());
        let tokenPercentagesAfterProposal = new Map<string, number>();
        let tokens : Token[] = [];
        for (const tokenAddress of fundTokenHoldingsAfterProposal.keys())
        {
            tokenPercentagesAfterProposal.set(tokenAddress,
                    (fundTokenHoldingsAfterProposal.get(tokenAddress) || 0) * (cryptoPerDollarAmount.get(tokenAddress) || 0) / 
                    (totalFundValue || 1));

            const tokenNameAndShort = (tokenAddressToName.get(tokenAddress) || ["Unknown", "UNK"]);
            const tokenName = tokenNameAndShort[0];
            const tokenShort = tokenNameAndShort[1];
            const tokenPercentage = ((tokenPercentagesAfterProposal.get(tokenAddress) || 0) * 100).toFixed(2) + "%";
            const tokenColor = tokenNameToColor.get(tokenName) || "#888888";
            tokens.push({
                name: tokenName,
                short: tokenShort,
                percentage: tokenPercentage,
                color: tokenColor
            });

        }
        setTokensArray(tokens);
        setFundTokenPercentageAfterProposal(tokenPercentagesAfterProposal);
    }
    const fetchGovernorData = async () => {
       const governorsList = await web3Manager.getGovernors();
       setGovernors(governorsList);
    }

    fetchproposal();
    fetchFundDistribution();
    fetchGovernorData();

    const interval = setInterval(fetchproposal, 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!proposal) return <div>Proposal not found.</div>;

return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-gray-500">User {proposal.proposer}</div>
        <div className="text-xl font-bold">Proposal ID: {proposal.id}</div>
      </div>

        {/* Swap Preview */}
        <h2 className="font-semibold text-lg text-center">Proposes the following:</h2>
<div className="border p-4 rounded shadow space-y-3 relative">
  {proposal.amountsInAdjusted.map((amount: number, i: number) => (
    <div key={`swap-${i}`} className="relative">
      {/* Right-aligned "Swap" label */}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-lg font-bold">
        Swap
      </span>

      {/* Centered content */}
<div className="flex justify-center gap-2">
  {/* Fixed-width number field to avoid shifting */}
  <span className="font-mono text-right w-[70px]">
    {proposal.amountsInAdjusted[i]}
  </span>

  {/* Asset to trade text */}
  <span className="font-mono w-[45px]">
    {proposal.assetsToTradeVisual[i][1]}
  </span>

  {/* Asset to trade icon */}
  <span className="w-6 h-6">
    <img
      src={`/${proposal.assetsToTradeVisual[i][0]}.png`}
      className="w-6 h-6"
    />
  </span>

  {/* Arrow */}
  <span className="text-gray-500">→</span>

  {/* Fixed 'YY' placeholder */}
  <span className="font-mono">{proposal.minAmountsToReceiveAdjusted[i]}</span>

  {/* Asset to receive text */}
  <span className="font-mono w-[50px]">
    {proposal.assetsToReceiveVisual[i][1]}
  </span>

  {/* Asset to receive icon */}
  <span className="w-6 h-6">
    <img
      src={`/${proposal.assetsToReceiveVisual[i][0]}.png`}
      className="w-6 h-6"
    />
  </span>
</div>
        
    </div>
  ))}
</div>

      {/* Fund Distribution */}
      <div className="border p-4 rounded shadow space-y-4">
        <h2 className="font-semibold text-lg">Fund distribution upon acceptance:</h2>
        <div className="flex justify-center py-5">
        <TokenAllocationCard
          tokens={tokensArray}
          onMouseOver={(index) => {}}
          onMouseLeave={() => {}}
        />
        </div>
      </div>

      {/* Justification */}
      <div className="border p-4 rounded shadow">
        <h2 className="font-semibold text-lg mb-2">Justification</h2>
        <p className="text-black whitespace-pre-wrap">{justification}</p>
      </div>

      {/* Voting */}
      <div className="border p-4 rounded shadow">
      <h2 className="font-semibold text-lg mb-2">Voting</h2>
      {/* Specify the greeting message*/}
      {
        isConnected && governors.includes(address || "NAN") &&
          <h2 className="font-semibold text-lg text-center">Welcome Governor</h2>
      }
      {
          !isConnected || (isConnected && !governors.includes(address || "NAN")) &&
              (proposal.approvalTimelockEnd == 0 || proposal.approvalTimelockEnd - blockTimestamp)  &&
            <h2 className="font-semibold text-lg text-center">Only Governors can vote on a proposal</h2>
      }
      {
          proposal.approvalTimelockEnd - blockTimestamp > 0 &&
            <h2 className="font-semibold text-lg text-center">This proposal has been queued,
            it can be accepted in: {proposal.approvalTimelockEnd - blockTimestamp} seconds</h2>
      }
      {
          proposal.approvalTimelockEnd - blockTimestamp <= 0 && proposal.approvalTimelockEnd != 0 &&
            <h2 className="font-semibold text-lg text-center">This proposal is ready to be executed</h2>
      }
     
      { (proposal.approvalTimelockEnd == 0 || (proposal.approvalTimelockEnd - blockTimestamp <= 0 && proposal.approvalTimelockEnd != 0)) &&
      <div className="flex justify-between pt-4">

      { isConnected && governors.includes(address || "NAN") && proposal.approvalTimelockEnd == 0 &&
        <button className="px-10 py-2 bg-green-600 text-white ml-50 rounded hover:bg-green-700" onClick={handleIntentToApprove}>
          Approve Proposal
        </button>}
      { isConnected && governors.includes(address || "NAN") && proposal.approvalTimelockEnd - blockTimestamp <= 0 && proposal.approvalTimelockEnd != 0 &&
        <button className="px-10 py-2 bg-green-600 text-white ml-50 rounded hover:bg-green-700" onClick={handleAcceptProposal}>
          Accept Proposal
        </button>}
        { isConnected && governors.includes(address || "NAN") && proposal.approvalTimelockEnd - blockTimestamp > 0 &&
        <button className="px-10 py-2 bg-red-600 text-white mr-50 rounded hover:bg-red-700" onClick={handleRejectProposal}>
          Reject Proposal
        </button>
      }
        { isConnected && governors.includes(address || "NAN") && (proposal.approvalTimelockEnd - blockTimestamp <= 0 || proposal.approvalTimelockEnd == 0) &&
        <button className="px-10 py-2 bg-red-600 text-white mr-50 rounded hover:bg-red-700" onClick={handleRejectProposal}>
          Reject Proposal
        </button>
      }
      { !isConnected || (isConnected && !governors.includes(address || "NAN")) && proposal.approvalTimelockEnd == 0 &&
        <button className="px-10 py-2 bg-gray-300 text-white ml-50 rounded">
          Approve Proposal
        </button>}
      { !isConnected || (isConnected && !governors.includes(address || "NAN")) && proposal.approvalTimelockEnd - blockTimestamp <= 0 && proposal.approvalTimelockEnd != 0 &&
        <button className="px-10 py-2 bg-gray-300 text-white ml-50 rounded">
          Accept Proposal
        </button>}
        {!isConnected || (isConnected && !governors.includes(address || "NAN")) &&
        <button className="px-10 py-2 bg-gray-300 text-white mr-50 rounded">
          Reject Proposal
        </button>

      }

      </div>}

      {
        proposal.approvalTimelockEnd - blockTimestamp > 0 &&
        <div className="flex justify-center pt-4">
        { isConnected && governors.includes(address || "NAN") && proposal.approvalTimelockEnd - blockTimestamp > 0 &&
        <button className="px-10 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={handleRejectProposal}>
          Reject Proposal
        </button>}
        {!isConnected || (isConnected && !governors.includes(address || "NAN")) &&
        <button className="px-10 py-2 bg-gray-300 text-white rounded">
          Reject Proposal
        </button>
        }

        </div>
      }
      </div>
    </div>
  );
}


