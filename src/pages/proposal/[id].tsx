import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Web3Manager from "../../lib/Web3Interface";

import OnrampFeature from "../../components/OnrampFeature";

export default function ProposalPage() {
  const router = useRouter();
  const { id } = router.query;

  const [proposal, setProposal] = useState<null | {
    id: number;
    proposer: string;
    assetToTrade: string;
    assetToReceive: string;
    amountIn: string;
    approvalTimelockEnd: string;
    justification: string;
  }>(null);

  const [loading, setLoading] = useState(true);

  
  const web3Manager = Web3Manager.getInstance();

  useEffect(() => {
    if (!id) return;

    const fetchProposal = async () => {
      try {
        const data = await web3Manager.getFundProposalById(Number(id));
        setProposal(data);
      } catch (err) {
        console.error("Error fetching proposal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!proposal) return <div>Proposal not found.</div>;

return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">Proposal ID: {proposal.id}</div>
        <div className="text-gray-500">By {proposal.proposer}</div>
      </div>

      {/* Swap Preview */}
      <div className="border p-4 rounded shadow space-y-3">
        <h2 className="font-semibold text-lg">Propose the following:</h2>
        {<div className="flex items-center gap-2">
            <span className="font-mono">{proposal.amountIn} {proposal.assetToTrade}</span>
            <span className="text-gray-500">→</span>
            <span className="font-mono">{"YY"} {proposal.assetToReceive}</span>
          </div>
        }
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

      <OnrampFeature/>
    </div>
  );
}


