"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../constants/FundTokenContract";
import { useAccount } from "wagmi";

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
  const tokens = [
    { name: "Ethereum", short: "ETH", percentage: "25%", color: "#3b82f6" },
    { name: "Bitcoin", short: "BTC", percentage: "25%", color: "#f59e0b" },
    { name: "Compound", short: "COMP", percentage: "10%", color: "#22c55e" },
    { name: "Uniswap", short: "UNI", percentage: "40%", color: "#ef4444" },
  ];

  const [value, setValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getValue = async () => {
    console.log("In function");
    try {
      if (!window.ethereum) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const result = await contract.name();
      setValue(result.toString());
    } catch (err) {}
  };

  const [colorsToHighlight, setColorsToHighlight] = useState(
    tokens.map((token) => token.color),
  );
  const [mouseHoveringOnCard, setMouseHoveringOnCard] = useState(false);

  const handleMouseOver = async (index: number) => {
    console.log("Setting index to hightlight: ", index);
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
    console.log("On mouse over, index set to highlight: ", index);
  };

  const handleMouseLeave = () => {
    // console.log("Mouse left, resetting index to highlight");
    console.log("On mouse leave");
    setMouseHoveringOnCard(false);
    let colors = tokens.map((token) => token.color); // reset to original colors
    setColorsToHighlight(colors);
  };

  const { isConnected } = useAccount();
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
          {isConnected && <UserButton width="40"> Contribute </UserButton>}
          <DonutChart
            data={tokens.map((token) => ({
              name: token.name,
              value: parseFloat(token.percentage),
              color: colorsToHighlight[tokens.indexOf(token)],
            }))}
            customHover={mouseHoveringOnCard}
          />

          {isConnected && <UserButton width="40"> Redeem </UserButton>}
        </div>
        {isConnected && <UserButton> Submit a Proposal </UserButton>}

        {!isConnected && <GreeterMessage />}

        {isConnected && <div className="py-5"></div>}
        <TokenAllocationCard
          tokens={tokens}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
        />

        {/* Pagination dots */}
        <button
          onClick={getValue}
          className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition"
        >
          {" "}
          test
        </button>
        {value && <p className="mt-4 text-lg">Value: {value}</p>}
        {error && <p className="mt-4 text-red-500">Error: {error}</p>}
      </div>
    </div>
  );
}
