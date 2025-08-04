import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Web3Manager from "../../lib/Web3Interface";
import { tokenAddressToName } from "../../constants/contract/ERC20Contracts";


type visualProposal = [
    number, // id
    string, // proposer
    string[], // assetsToTrade
    string[], // assetsToReceive
    number[], // amountsIn
    number,  // approvalTimelockEnd
    string, // justification
] & {
    id: number;
    proposer: string;
    assetsToTradeVisual: string[];
    assetsToReceiveVisual: string[];
    amountsInAdjusted: number[];
    approvalTimelockEnd: number;
    justification: string;
};

export default function ProposalPage() {
  const router = useRouter();
  const { id } = router.query;

  const [proposal, setProposal] = useState<null | visualProposal>(null);

  const [loading, setLoading] = useState(true);

  
  const web3Manager = Web3Manager.getInstance();

  useEffect(() => {
    if (!id) return;

    const fetchproposal = async () => {
      try {
        const rawproposaldata = await web3Manager.getFundProposalById(Number(id));
        let visualProposalData:
            visualProposal = Object.assign(
            [
                Number(rawproposaldata.id),
                rawproposaldata.proposer,
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
                approvalTimelockEnd: Number(rawproposaldata.approvalTimelockEnd),
                justification: rawproposaldata.justification || "No justification provided.",

            });
        for(let i = 0; i < rawproposaldata.assetsToTrade.length; i++)
        {
            const decimals = BigInt(await web3Manager.getERC20TokenDecimals(rawproposaldata.assetsToTrade[i]));
            visualProposalData.amountsInAdjusted.push(
                Number(rawproposaldata.amountsIn[i]) / Number(10n ** decimals));
            visualProposalData.assetsToTradeVisual.push(
        tokenAddressToName.get(rawproposaldata.assetsToTrade[i]));
            visualProposalData.assetsToReceiveVisual.push(tokenAddressToName.get(rawproposaldata.assetsToReceive[i]));

            console.log("decimals:", decimals);
            console.log("Raw amounts in:", rawproposaldata.amountsIn[i]);
            console.log("amountsInAdjusted:", visualProposalData.amountsInAdjusted);
            console.log("assetsToTradeVisual:", visualProposalData.assetsToTradeVisual);
            console.log("assetsToReceiveVisual:", visualProposalData.assetsToReceiveVisual);

        }
        setProposal(visualProposalData);
      } catch (err) {
        console.error("error fetching proposal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchproposal();
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
  <span className="font-mono w-[20px]">YY</span>

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
        {/*proposal.distribution.map((dist: any, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <img src={`/${dist.token}.png`} alt={dist.token} className="w-6 h-6" />
            <span className="w-28">{dist.token}</span>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${dist.percentage}%` }}
              />
            </div>
            <span className="w-12 text-right">{dist.percentage}%</span>
          </div>
        ))*/}
      </div>

      {/* Justification */}
      <div className="border p-4 rounded shadow">
        <h2 className="font-semibold text-lg mb-2">Justification</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{proposal.justification}</p>
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


