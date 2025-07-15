import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Web3Manager from "../../lib/Web3Interface";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Proposal #{proposal.id}</h1>
      <p><strong>Proposer:</strong> {proposal.proposer}</p>
      <p><strong>Asset In:</strong> {proposal.assetToTrade}</p>
      <p><strong>Asset Out:</strong> {proposal.assetToReceive}</p>
      <p><strong>Amount:</strong> {proposal.amountIn}</p>
      <p><strong>Timelock Ends:</strong> {proposal.approvalTimelockEnd}</p>
    </div>
  );
}

