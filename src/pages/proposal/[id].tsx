
import { GetServerSideProps } from 'next';

import Web3Manager from "../../lib/Web3Interface";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type Proposal = {
  id: string;
  user: string;
  assetFrom: {
    symbol: string;
    amount: string;
    icon: string;
  };
  assetTo: {
    symbol: string;
    amount: string;
    icon: string;
  };
};

type ProposalPageProps = {
  proposal: Proposal;
};

const web3Manager = Web3Manager.getInstance();

export default async function ProposalPage() {

    const router = useRouter();
    const { id } = router.query;
//     const [proposal, setProposal] = useState();
//     
//     // This useEffect will run on the client side to fetch proposal data
//     // when the component mounts or when the id changes
//
// useEffect(() => {
//     async function init()
//     {
//       const proposalResult = await web3Manager.getFundProposalById(Number(id));
//       setProposal(proposalResult);
//       console.log(proposalResult);
//       
//       // Here you can perform any client-side initialization if needed
//       // For example, fetching additional data or setting up event listeners
//       console.log("Proposal data:", proposal);
//     }
//     init();
// }, [id]);
 
  const proposal = await web3Manager.getFundProposalById(Number(id));
  return (
      <h1>{proposal.id}</h1>
  );
}

