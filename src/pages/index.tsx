import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";

import Web3Manager from "../lib/Web3Interface";

import UserButton from "../components/UserButton";

import TokenAllocationCard from "../components/TokenAllocationCard";
import DonutChart from "../components/DonutChart";
import { tokenAddressToName, tokenNameToColor,
    tokenShortToAddress, usdcPriceAggregatorAddress }
    from "../constants/contract/ERC20Contracts";
import ProposalModal from "../components/ProposalModal";
import { TokenPair } from "../types/TokenPair";
import ContributeModal from '../components/ContributeModule';
import RedeemModal from '../components/RedeemModale';

import Link from "next/link";

interface TokenInformation
{
    name: string;
    short: string;
    percentage: string;
    color: string;
    address: string;
    holdings: string;
    dollarValue: string;
}

export default function Home() {

  const { isConnected, address } = useAccount();

  const [tokensArray, setTokensArray] = useState<TokenInformation[]>([]);
  // the state variables for this front-end
  const [fundTotalValue, setFundTotalValue] = useState<string>("1.00");
  const [fTokenTotalSupply, setFTokenTotalSupply] = useState<string>("1.00");
  const [usdcPrice, setUsdcPrice] = useState<string>("10.00");
  const [mouseHoveringOnCard, setMouseHoveringOnCard] = useState<boolean>(false);
  const [colorsToHighlight, setColorsToHighlight] = useState<string[]>();

  // the text of the donut chart when hovering over a card
  const [donutChartHoverOnCardText, setDonutChartHoverOnCardText] = useState<string[]>(["Total Invested:", "$0.00", ""]);

  const [submitProposalModalOpen, setSubmitProposalModalOpen] = useState<boolean>(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const [userFTokenBalance, setUserFTokenBalance] = useState<string>("0.00");

  const [numberOfActiveProposals, setNumberOfActiveProposals] = useState<number>(0);
  const web3Manager = Web3Manager.getInstance();


  // this use Effect will initialize the front-end
  // and query the backend frequently to update the neede values
  useEffect(() =>
  {
    // The initialize function which runs only once
    async function init()
    {
      
      if (typeof window === "undefined") 
          return;
      await web3Manager.initialize();
      const totalValue = await web3Manager.getFundTotalValue();
      console.log("Total Supply: " + fTokenTotalSupply);
      setFundTotalValue(totalValue);
      let tokens = await queryBackend();
      setColorsToHighlight(tokens.map((token) => token.color));
    };

    // The queryBackend function which is meant to
    // run at a set interval
    async function queryBackend()
    {
      const web3Manager = Web3Manager.getInstance();
      const fTokenTotalSupply = await web3Manager.getFTokenTotalSupply();
      setFTokenTotalSupply(fTokenTotalSupply);
      const usdcPrice = await web3Manager.getAggregatorPrice(usdcPriceAggregatorAddress);
      setUsdcPrice(usdcPrice);
      const totalValue = await web3Manager.getFundTotalValue();
      setFundTotalValue(totalValue);
      const activeProposals = await web3Manager.getFundActiveProposals();
      setNumberOfActiveProposals(activeProposals.length);
      const fundAssets = await web3Manager.getFundAssets();

      let tokens = [];
      for(let i = 0; i < fundAssets.length; i++)
      {
          const tokenAddress = fundAssets[i];
          const tokenNameData = tokenAddressToName.get(tokenAddress) ?? ["Unknown Token", "UNK"];
          const tokenDollarValue = await web3Manager.getERC20ValueInFund(fundAssets[i]);
          const tokenPercentage = (Number(tokenDollarValue) / Number(totalValue) * 100).toFixed(2) + "%";

          let tokenInformation: TokenInformation = {
            name: tokenNameData[0],
            short: tokenNameData[1],
            percentage: tokenPercentage,
            color: tokenNameToColor.get(tokenNameData[0]) || "#000000",
            address: tokenAddress,
            holdings: await web3Manager.getERC20HoldingsInFund(fundAssets[i]),
            dollarValue: tokenDollarValue
          };

          tokens.push(tokenInformation);
      }
      setTokensArray(tokens);

      if(isConnected)
      {
          const userBalance = await web3Manager.getFundTokenAmountFromUser(address || "");
          setUserFTokenBalance(userBalance);
      }

      return tokens;

    }
    init();
    queryBackend();

    // Set an interval to query the backend every second
    const interval = setInterval(queryBackend, 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [isConnected, address]);


  // handles the case when the mouse is hovering over a card
  const handleMouseOverCard = async (index: number) => {
    const unHighlightedColor = "#4b5563"; // dark grey
    let colors = Array(tokensArray.length).fill(unHighlightedColor); // initialize all colors to unhighlighted
    colors[index] = tokensArray[index].color; // highlight the current token

    setColorsToHighlight(colors);

    setMouseHoveringOnCard(true);

    setDonutChartHoverOnCardText([tokensArray[index].holdings, tokensArray[index].dollarValue, tokensArray[index].short]);
  };

  // handles the case when the mouse leaves the card
  const handleMouseLeaveCardStack = () => {
    setMouseHoveringOnCard(false);
    let colors = tokensArray.map((token) => token.color); // reset to original colors
    setColorsToHighlight(colors);
  };

  const handleSubmitProposal = async (proposalData: TokenPair[], justification: string) => 
  {
      // close the proposal window
      setSubmitProposalModalOpen(false);
      const assetsToTrade_shorts: string[] = proposalData.map(pair => pair.from);
      const assetsToReceive_shorts: string[] = proposalData.map(pair => pair.to);
      const amountsToTrade: number[] = proposalData.map(pair => Number(pair.amountToTrade));
      const minAmountsToReceive: number[] = proposalData.map(pair => Number(pair.minAmountToReceive));

      const addressesToTrade: string[] = assetsToTrade_shorts.map(short => {
          const address = tokenShortToAddress.get(short);
          if (!address) {
              throw new Error(`Token short ${short} does not have a valid address.`);
          }
          return address;
      });
      const addressesToReceive: string[] = assetsToReceive_shorts.map(short => {
          const address = tokenShortToAddress.get(short);
          if (!address) {
              throw new Error(`Token short ${short} does not have a valid address.`);
          }
          return address;
      });


    const proposalId = await web3Manager.createProposal(addressesToTrade, addressesToReceive, amountsToTrade, minAmountsToReceive);
    if(proposalId != 0)
    {
        console.log("Justification text:");
        console.log(JSON.stringify({justification}));

        const res = await fetch("/api/saveText", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ justification: justification, id: proposalId}),
    });

        const result = await res.json();
        console.log("Result from backend:");
        console.log(result);

    }
  }

  const handleContributeToFund = async (amount: number) => {
      setContributeOpen(false);
      web3Manager.contributeUsingStableCoin(amount);
  }

  const handleRedeemFromFund = async (amount: number) => {
      setRedeemOpen(false);
      // Implement redeem logic here
      web3Manager.redeemFromFund(amount);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b py-4 px-6">
        <div className="text-lg font-bold px-10">Logo</div>
        <div className="flex items-center">
            <img src="/fToken.png" alt="Logo" width={25} height={25} className="rounded " />
            <p className="text-gray-600 font-bold p-1">{userFTokenBalance}</p>
        </div>
        <Link href="/activeProposals">
        <span className="text-black font-bold hover:text-blue-500 cursor-pointer px-6">Active Proposals: {numberOfActiveProposals}</span>
        </Link>
        <p className="text-gray-600 font-bold px-6">Total Fund Value: ${fundTotalValue}</p>
        <p className="text-gray-600 font-bold px-6">Your Stake: {isConnected && userFTokenBalance && fTokenTotalSupply ? ((parseFloat(userFTokenBalance) / parseFloat(fTokenTotalSupply)) * 100).toFixed(2) : "0.00"}%</p>
        <ConnectButton showBalance={false} chainStatus={"icon"}/>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-3 px-4">
        <div className="flex items-center justify-center gap-[10vw] p-[2vw]">
          {isConnected && <UserButton width="w-40" onClick={() => setContributeOpen(true)}> Contribute </UserButton>}

          <DonutChart
            data={tokensArray ? tokensArray.map((token) => ({
              name: token.name,
              value: parseFloat(token.percentage),
              color: colorsToHighlight ? colorsToHighlight[tokensArray.indexOf(token)] : token.color,
              short: token.short,
            })) : []}
            customHover={mouseHoveringOnCard}
            lines={mouseHoveringOnCard ? [donutChartHoverOnCardText[0], donutChartHoverOnCardText[1], donutChartHoverOnCardText[2]] : ["Your Investment:", "$" + (isConnected && userFTokenBalance && fTokenTotalSupply ? ((parseFloat(userFTokenBalance) / parseFloat(fTokenTotalSupply)) * parseFloat(fundTotalValue)).toFixed(2) : "0.00")]}
            isConnected={isConnected}
            userStake={isConnected && userFTokenBalance && fTokenTotalSupply ? ((parseFloat(userFTokenBalance) / parseFloat(fTokenTotalSupply)) * 100).toFixed(2) : "0.00"}
            fundTotalValue={fundTotalValue}
          />

          {isConnected && <UserButton width="w-40" onClick={() => setRedeemOpen(true)}> Redeem </UserButton>}
        </div>
        {isConnected && <UserButton onClick={() => setSubmitProposalModalOpen(true)}> Submit a Proposal </UserButton>}

        {isConnected && <div className="py-5"></div>}
        {tokensArray && <TokenAllocationCard
          tokens={tokensArray}
          onMouseOver={handleMouseOverCard}
          onMouseLeave={handleMouseLeaveCardStack}
        />}
        <ProposalModal isOpen={submitProposalModalOpen} onClose={() => setSubmitProposalModalOpen(false)}
        onSubmit={handleSubmitProposal}
        supportedTokensName={tokensArray.map(token => token.name)} supportedTokensShort={tokensArray.map(token => token.short)}/>
        <ContributeModal
        isOpen={contributeOpen}
        onClose={() => setContributeOpen(false)}
        usdcPrice={Number(usdcPrice)}
        fTokenTotalSupply={Number(fTokenTotalSupply)}
        fundTotalValue={Number(fundTotalValue)}
        onSubmit={handleContributeToFund}
      />
        <RedeemModal
        isOpen={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        usdcPrice={Number(usdcPrice)}
        fTokenTotalSupply={Number(fTokenTotalSupply)}
        tokenHoldings={ tokensArray.map(token => Number(token.holdings)) }
        tokenNames={ tokensArray.map(token => token.name) }
        tokenShorts={ tokensArray.map(token => token.short) }
        onSubmit={handleRedeemFromFund}
      />
      </div>
    </div>
  );
}
