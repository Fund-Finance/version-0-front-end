"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getFundTotalValue, getFundAssets, getERC20HoldingsInFund, populateWeb3Interface, getERC20ValueInFund } from "../utils/readContract";

import GreeterMessage from "../components/GreeterMessage";
import UserButton from "../components/UserButton";

import TokenAllocationCard from "../components/TokenAllocationCard";
import DonutChart from "../components/DonutChart";
import { tokenAddressToName, tokenNameToColor } from "../constants/ERC20Contracts";

export default function Home() {

  const { isConnected } = useAccount();

  const [tokensArray, setTokensArray] = useState();
  // the state variables for this front-end
  const [fundTotalValue, setFundTotalValue] = useState<string>("1.00");
  const [mouseHoveringOnCard, setMouseHoveringOnCard] = useState(false);
  const [colorsToHighlight, setColorsToHighlight] = useState();
  const [donutChartText, setDonutChartText] = useState(["Total Invested:", "$0.00"]);

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
      setDonutChartText(["Total Invested:", "$" + totalValue]);
      await queryBackend();
      setFundTotalValue(totalValue);
      const fundAssets = await getFundAssets();
      let tokens = [];
      for(let i = 0; i < fundAssets.length; i++)
      {
          const tokenAddress = fundAssets[i][0];
          const tokenName = tokenAddressToName.get(tokenAddress)[0];
          const tokenShort = tokenAddressToName.get(tokenAddress)[1];
          const tokenColor = tokenNameToColor.get(tokenName);
          const tokenHoldings = await getERC20HoldingsInFund(tokenAddress);
          const tokenDollarValue = await getERC20ValueInFund(fundAssets[i][0]);
          const tokenPercentage = (Number(tokenDollarValue) / Number(totalValue) * 100).toFixed(2) + "%";
          tokens.push({name: tokenName, short: tokenShort, percentage: tokenPercentage, color: tokenColor, address: tokenAddress,
          holdings: tokenHoldings, value: tokenDollarValue});
      }
      setTokensArray(tokens);
      setColorsToHighlight(tokens.map((token) => token.color));
    };

    // The queryBackend function which is meant to
    // run at a set interval
    async function queryBackend()
    {
      const totalValue = await getFundTotalValue();
      setFundTotalValue(totalValue);
      const fundAssets = await getFundAssets();
      let tokens = [];
      for(let i = 0; i < fundAssets.length; i++)
      {
          const tokenAddress = fundAssets[i][0];
          const tokenName = tokenAddressToName.get(tokenAddress)[0];
          const tokenShort = tokenAddressToName.get(tokenAddress)[1];
          const tokenHoldings = await getERC20HoldingsInFund(tokenAddress);
          const tokenColor = tokenNameToColor.get(tokenName);
          const tokenDollarValue = await getERC20ValueInFund(fundAssets[i][0]);
          const tokenPercentage = (Number(tokenDollarValue) / Number(totalValue) * 100).toFixed(2) + "%";
          tokens.push({name: tokenName, short: tokenShort, percentage: tokenPercentage, color: tokenColor, address: tokenAddress,
          holdings: tokenHoldings, value: tokenDollarValue});
      }
      setTokensArray(tokens);

    }
    init();
    queryBackend();

    // Set an interval to query the backend every second
    const interval = setInterval(queryBackend, 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);


  // handles the case when the mouse is hovering over a card
  const handleMouseOverCard = async (index: number) => {
    const unHighlightedColor = "#4b5563"; // dark grey
    let colors = Array(tokensArray.length).fill(unHighlightedColor); // initialize all colors to unhighlighted
    colors[index] = tokensArray[index].color; // highlight the current token

    setColorsToHighlight(colors);

    setMouseHoveringOnCard(true);

    setDonutChartText([tokensArray[index].holdings + " " + tokensArray[index].short + ":", "$" + tokensArray[index].value]);
  };

  // handles the case when the mouse leaves the card
  const handleMouseLeaveCardStack = () => {
    console.log("Mouse left card stack");
    let donutChartText = ["Total Invested:", "$" + fundTotalValue];
    setDonutChartText(donutChartText);
    setMouseHoveringOnCard(false);
    let colors = tokensArray.map((token) => token.color); // reset to original colors
    setColorsToHighlight(colors);
  };

  useEffect(() => {
      console.log("donutChartText updated:", donutChartText);
  } , [donutChartText]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b py-4 px-6">
        <div className="text-lg font-bold">Logo</div>
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center mt-3 px-4">
        <div className="flex items-center justify-center gap-[10vw] p-[2vw]">
          {isConnected && <UserButton width="w-40"> Contribute </UserButton>}
          {tokensArray && colorsToHighlight && <DonutChart
            data={tokensArray.map((token) => ({
              name: token.name,
              value: parseFloat(token.percentage),
              color: colorsToHighlight[tokensArray.indexOf(token)],
            }))}
            customHover={mouseHoveringOnCard}
            lines={donutChartText}
          />}

          {isConnected && <UserButton width="w-40"> Redeem </UserButton>}
        </div>
        {isConnected && <UserButton> Submit a Proposal </UserButton>}

        {!isConnected && <GreeterMessage />}

        {isConnected && <div className="py-5"></div>}
        {tokensArray && <TokenAllocationCard
          tokens={tokensArray}
          onMouseOver={handleMouseOverCard}
          onMouseLeave={handleMouseLeaveCardStack}
        />}
      </div>
    </div>
  );
}
