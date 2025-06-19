"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants/FundTokenContract";
import { useAccount } from "wagmi";
import { getValue, populateWeb3Interface } from "../utils/readContract";

import GreeterMessage from "../components/GreeterMessage";
import UserButton from "../components/UserButton";

import TokenAllocationCard from "../components/TokenAllocationCard";
import DonutChart from "../components/DonutChart";

interface Token {
  name: string;
  short: string;
  percentage: string;
  color: string;
}

export default function Home() {
  // general variables used
  const tokens = [
    { name: "Ethereum", short: "ETH", percentage: "25%", color: "#3b82f6" },
    { name: "Bitcoin", short: "BTC", percentage: "25%", color: "#f59e0b" },
    { name: "Compound", short: "COMP", percentage: "10%", color: "#22c55e" },
    { name: "Uniswap", short: "UNI", percentage: "40%", color: "#ef4444" },
  ];

  const { isConnected } = useAccount();

  // the state variables for this front-end
  const [fundTotalValue, setFundTotalValue] = useState<string>("1.00");
  const [mouseHoveringOnCard, setMouseHoveringOnCard] = useState(false);
  const [colorsToHighlight, setColorsToHighlight] = useState(
    tokens.map((token) => token.color),
  );
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
      const totalValue = await getValue();
      setFundTotalValue(totalValue);
      setDonutChartText(["Total Invested:", "$" + totalValue]);
    };

    // The queryBackend function which is meant to
    // run at a set interval
    async function queryBackend()
    {
      const totalValue = await getValue();
      setFundTotalValue(totalValue);
    }
    init();
    queryBackend();

    // Set an interval to query the backend every second
    const interval = setInterval(queryBackend, 1000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);


  const handleMouseOver = async (index: number) => {
    const unHighlightedColor = "#4b5563"; // dark grey
    let colors = [];
    const currentColors = tokens.map((token) => token.color);
    for (let i = 0; i < currentColors.length; i++) {
      if (i === index) {
        colors.push(currentColors[i]);
      } else {
        colors.push(unHighlightedColor);
      }
    }

    setColorsToHighlight(colors);

    setMouseHoveringOnCard(true);

    setDonutChartText(["2.23 " + tokens[index].short + ":", "$1,000.21"]);
  };

  const handleMouseLeave = () => {
    console.log("Fund Total Value: ", fundTotalValue);
    let donutChartText = ["Total Invested:", "$" + fundTotalValue];
    setDonutChartText(donutChartText);
    setMouseHoveringOnCard(false);
    let colors = tokens.map((token) => token.color); // reset to original colors
    setColorsToHighlight(colors);
  };

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
          <DonutChart
            data={tokens.map((token) => ({
              name: token.name,
              value: parseFloat(token.percentage),
              color: colorsToHighlight[tokens.indexOf(token)],
            }))}
            customHover={mouseHoveringOnCard}
            lines={donutChartText}
          />

          {isConnected && <UserButton width="w-40"> Redeem </UserButton>}
        </div>
        {isConnected && <UserButton> Submit a Proposal </UserButton>}

        {!isConnected && <GreeterMessage />}

        {isConnected && <div className="py-5"></div>}
        <TokenAllocationCard
          tokens={tokens}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </div>
  );
}
