"use client";
import { PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";

interface DonutChartProps {
  data: { name: string; value: number; color: string; short?: string }[];
  customHover: boolean;
  lines: string[];
  isConnected?: boolean;
  userStake: string;
  fundTotalValue: string;
}

const DonutChart = ({ data, customHover, lines, isConnected = false, userStake, fundTotalValue}: DonutChartProps) => {
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsClient(true); // ensures this runs only in the browser
  }, []);

  // Token logos for animation (two of each)
  const tokenLogos = [
    "/United States Dollar Coin.png",
    "/Wrapped Ethereum.png", 
    "/Coinbase Bitcoin.png",
    "/Aave.png",
    "/Chainlink.png",
    "/United States Dollar Coin.png",
    "/Wrapped Ethereum.png", 
    "/Coinbase Bitcoin.png",
    "/Aave.png",
    "/Chainlink.png",
  ];

  if (!isClient) return null;

  // If not connected, show animated logos
    return (
      <div className="relative w-[280px] h-[280px] rounded-full">
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translate(-50%, -50%) translateY(0);
            }
            40% {
              transform: translate(-50%, -50%) translateY(-5px);
            }
            60% {
              transform: translate(-50%, -50%) translateY(-5px);
            }
          }
        `}</style>
        {/* Animated background circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 animate-pulse"></div>
        
        {/* Animated token logos in donut ring */}
        {tokenLogos.map((logo, index) => {
          // Create a mapping of logo files to token short names
          const logoToTokenMap: { [key: string]: string } = {
            '/United States Dollar Coin.png': 'USDC',
            '/Wrapped Ethereum.png': 'wETH',
            '/Coinbase Bitcoin.png': 'cbBTC',
            '/Chainlink.png': 'LINK',
            '/Aave.png': 'AAVE',
          };
          
          // Get the token short name for this logo
          const logoTokenShort = logoToTokenMap[logo];
          
          // Extract token short name from hover text when hovering
          let hoveredTokenShort = null;
          if (customHover && lines.length > 0) {
            const hoverText = lines[0]; // e.g., "1,234.56 USDC:"
            const match = hoverText.match(/(\w+):$/); // Extract token short before the colon
              hoveredTokenShort = lines[2];
          }
          
          // Find the hovered token data by matching the short name
          const hoveredToken = customHover && data.length > 0 ? data.find(token => {
            // Use the short property directly from the token data
            return token.short === logoTokenShort;
          }) : null;
          
          // Show all logos when not hovering, or only the hovered token when hovering
          // Use hoveredTokenShort if data is empty (not connected)
          const shouldShow = !customHover || (hoveredTokenShort ? logoTokenShort === hoveredTokenShort : hoveredToken);
          
          return (
            <div
              key={index}
              className="absolute w-8 h-8 transition-opacity duration-300"
              style={{
                left: `${50 + 37.5 * Math.cos((index * (360 / tokenLogos.length)) * Math.PI / 180)}%`,
                top: `${50 + 37.5 * Math.sin((index * (360 / tokenLogos.length)) * Math.PI / 180)}%`,
                transform: 'translate(-50%, -50%)',
                animation: `bounce 2s ${index * 0.5}s infinite`,
                opacity: shouldShow ? 1 : 0,
              }}
            >
              <img
                src={logo}
                alt="Token"
                className="w-full h-full object-contain"
              />
            </div>
          );
        })}


        {/* Center message */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center border-2 border-gray-200"
          style={{
            width: 150,
            height: 150,
          }}
        >
          <div className="text-center">
            {customHover && isConnected ? (
              <>
                <p className="text-sm font-semibold text-gray-700">You have</p>
                <p className="text-sm font-semibold text-gray-700">{(Number(lines[0]) * Number(userStake) / 100.0).toFixed(3) + " " + lines[2]}</p>
                <p className="text-xs text-gray-500">${(Number(lines[1]) * Number(userStake) / 100.0).toFixed(2)}</p>
              </>
            ) : customHover && !isConnected ? (
              <>
                <p className="text-sm font-semibold text-gray-700">{lines[0] + " " + lines[2]}</p>
                <p className="text-xs text-gray-500">${lines[1]}</p>
              </>
            ) : !isConnected ? (
              <>
                <p className="text-sm font-semibold text-gray-700">Connect Wallet</p>
                <p className="text-xs text-gray-500">to start</p>
              </>
            ) : Number(userStake) == 0 ? (
              <>
                <p className="text-sm font-semibold text-gray-700">Contribute to get started</p>
              </>
            ) :
              <>
                <p className="text-sm font-semibold text-gray-700">Your investment</p>
                <p className="text-xs text-gray-500">${((Number(userStake) / 100.0) * Number(fundTotalValue)).toFixed(2)}</p>
               </> 
            }
          </div>
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, index) => (
          <div
            key={`particle-${index}`}
            className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '3s',
              left: `${20 + (index * 15) % 60}%`,
              top: `${20 + (index * 10) % 60}%`,
            }}
          />
        ))}
      </div>
    );
  }


export default DonutChart;
