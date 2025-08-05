import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Web3Manager from "../../lib/Web3Interface";
import { tokenAddressToName, tokenNameToColor } from "../../constants/contract/ERC20Contracts";
import TokenAllocationCard from "../../components/TokenAllocationCard";

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

  const [proposal, setProposal] = useState<null | visualProposal>(null);
  const [justification, setJustification] = useState<string>("");
  const [fundTokenPercentageAfterProposal, setFundTokenPercentageAfterProposal] = useState<Map<string, number>>();
  const [tokensArray, setTokensArray] = useState<Token[]>([]);

  const [loading, setLoading] = useState(true);

  
  const web3Manager = Web3Manager.getInstance();

  useEffect(() => {
    if (!id) return;
    const readFile = async (filename: string) => {
      const res = await fetch(`/api/readFile/${filename}`);
      
      if (!res.ok) {
        const error = await res.json();
        console.error("Error:", error.message);
        return;
      }

      const content = await res.text(); // 🔥 because it's plain text
      console.log("File content:", content);
      setJustification(content);
};

    const fetchproposal = async () => {
    const rawproposaldata = await web3Manager.getFundProposalById(Number(id));
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
            const decimals = BigInt(await web3Manager.getERC20TokenDecimals(rawproposaldata.assetsToTrade[i]));
            visualProposalData.amountsInAdjusted.push(
                Number(rawproposaldata.amountsIn[i]) / Number(10n ** decimals));
            visualProposalData.minAmountsToReceiveAdjusted.push(
                Number(rawproposaldata.minAmountsToReceive[i]) / Number(10n ** decimals));
            visualProposalData.assetsToTradeVisual.push(
        tokenAddressToName.get(rawproposaldata.assetsToTrade[i]));
            visualProposalData.assetsToReceiveVisual.push(tokenAddressToName.get(rawproposaldata.assetsToReceive[i]));
        }

        await readFile(rawproposaldata.id.toString() + ".txt");
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

    fetchproposal();
    fetchFundDistribution();
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
      <span className="absolute left-0 top-1/2 -translate-y-1/2 font-mono text-sm font-bold">
        Swap
      </span>

      {/* Centered content */}
<div className="flex justify-center gap-2">
  {/* Fixed-width number field to avoid shifting */}
  <span className="font-mono text-right w-[70px]">
    {proposal.amountsInAdjusted[i]}
  </span>

  {/* Asset to trade text */}
  <span className="font-mono w-[40px]">
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
        <p className="text-gray-700 whitespace-pre-wrap">{justification}</p>
      </div>

      {/* Voting */}
      <div className="flex justify-between pt-4">
        <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Vote to Accept
        </button>
        <button className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
          Vote to Deny
        </button>
      </div>

    </div>
  );
}


