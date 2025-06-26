import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getFundTotalValue, getFundAssets,
    getERC20HoldingsInFund, populateWeb3Interface,
    getERC20ValueInFund, createProposal,
    getAggregatorPrice, getFTokenTotalSupply,
    contributeUsingStableCoin, redeemFromFund, 
    getFundTokenAmountFromUser,
    getFundActiveProposals} from "../utils/Web3Interface";

import GreeterMessage from "../components/GreeterMessage";
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
  const [donutChartHoverOnCardText, setDonutChartHoverOnCardText] = useState<string[]>(["Total Invested:", "$0.00"]);

  const [submitProposalModalOpen, setSubmitProposalModalOpen] = useState<boolean>(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);

  const [userFTokenBalance, setUserFTokenBalance] = useState<string>("0.00");

  const [numberOfActiveProposals, setNumberOfActiveProposals] = useState<number>(0);


  // this use Effect will initialize the front-end
  // and query the backend frequently to update the neede values
  useEffect(() =>
  {
    // The initialize function which runs only once
    async function init()
    {
      
      if (typeof window === "undefined") 
          return;
      await populateWeb3Interface();
      const totalValue = await getFundTotalValue();
      setFundTotalValue(totalValue);
      let tokens = await queryBackend();
      setColorsToHighlight(tokens.map((token) => token.color));
    };

    // The queryBackend function which is meant to
    // run at a set interval
    async function queryBackend()
    {
      const fTokenTotalSupply = await getFTokenTotalSupply();
      setFTokenTotalSupply(fTokenTotalSupply);
      const usdcPrice = await getAggregatorPrice(usdcPriceAggregatorAddress);
      setUsdcPrice(usdcPrice);
      const totalValue = await getFundTotalValue();
      setFundTotalValue(totalValue);
      const activeProposals = await getFundActiveProposals();
      setNumberOfActiveProposals(activeProposals.length);
      const fundAssets = await getFundAssets();

      let tokens = [];
      for(let i = 0; i < fundAssets.length; i++)
      {
          const tokenAddress = fundAssets[i];
          const tokenNameData = tokenAddressToName.get(tokenAddress) ?? ["Unknown Token", "UNK"];
          const tokenDollarValue = await getERC20ValueInFund(fundAssets[i]);
          const tokenPercentage = (Number(tokenDollarValue) / Number(totalValue) * 100).toFixed(2) + "%";

          let tokenInformation: TokenInformation = {
            name: tokenNameData[0],
            short: tokenNameData[1],
            percentage: tokenPercentage,
            color: tokenNameToColor.get(tokenNameData[0]) || "#000000",
            address: tokenAddress,
            holdings: await getERC20HoldingsInFund(fundAssets[i]),
            dollarValue: tokenDollarValue
          };

          tokens.push(tokenInformation);
      }
      setTokensArray(tokens);

      if(isConnected)
      {
          const userBalance = await getFundTokenAmountFromUser(address || "");
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

    setDonutChartHoverOnCardText([tokensArray[index].holdings + " " + tokensArray[index].short + ":", "$" + tokensArray[index].dollarValue]);
  };

  // handles the case when the mouse leaves the card
  const handleMouseLeaveCardStack = () => {
    setMouseHoveringOnCard(false);
    let colors = tokensArray.map((token) => token.color); // reset to original colors
    setColorsToHighlight(colors);
  };

  const handleSubmitProposal = async (proposalData: TokenPair[]) => 
  {
      // close the proposal window
      setSubmitProposalModalOpen(false);
      const assetsToTrade_shorts: string[] = proposalData.map(pair => pair.from);
      const assetsToReceive_shorts: string[] = proposalData.map(pair => pair.to);
      const amountsToTrade: number[] = proposalData.map(pair => Number(pair.amountFrom));

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

      createProposal(addressesToTrade, addressesToReceive, amountsToTrade);
  }

  const handleContributeToFund = async (amount: number) => {
      setContributeOpen(false);
      contributeUsingStableCoin(amount);
  }

  const handleRedeemFromFund = async (amount: number) => {
      setRedeemOpen(false);
      // Implement redeem logic here
      redeemFromFund(amount);
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
        <p className="text-gray-600 font-bold px-6">Active Proposals: {numberOfActiveProposals}</p>
        <ConnectButton showBalance={false} chainStatus={"icon"}/>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-3 px-4">
        <div className="flex items-center justify-center gap-[10vw] p-[2vw]">
          {isConnected && <UserButton width="w-40" onClick={() => setContributeOpen(true)}> Contribute </UserButton>}

          {tokensArray && colorsToHighlight && <DonutChart
            data={tokensArray.map((token) => ({
              name: token.name,
              value: parseFloat(token.percentage),
              color: colorsToHighlight[tokensArray.indexOf(token)],
            }))}
            customHover={mouseHoveringOnCard}
            lines={mouseHoveringOnCard ? [donutChartHoverOnCardText[0], donutChartHoverOnCardText[1]] : ["Total Invested:", "$" + fundTotalValue]}
          />}

          {isConnected && <UserButton width="w-40" onClick={() => setRedeemOpen(true)}> Redeem </UserButton>}
        </div>
        {isConnected && <UserButton onClick={() => setSubmitProposalModalOpen(true)}> Submit a Proposal </UserButton>}

        {!isConnected && <GreeterMessage />}

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
