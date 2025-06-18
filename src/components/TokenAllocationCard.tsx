"use client";

import Image from "next/image";
interface Token {
  name: string;
  short: string;
  percentage: string;
  color: string;
}

interface TokenAllocationCardProps {
  tokens: Token[];
  onMouseOver: (index: number) => void;
  onMouseLeave: () => void;
}

const TokenAllocationCard = ({
  tokens,
  onMouseOver,
  onMouseLeave,
}: TokenAllocationCardProps) => {
  return (
    <div className="flex flex-col py-3 w-1/2 rounded-2xl overflow-hidden shadow-xl bg-white">
      {tokens.map((token, index: number) => (
        <div
          key={index}
          className="px-4 py-3 flex items-center space-x-4 hover:bg-blue-300"
          onMouseEnter={() => onMouseOver(index)}
          onMouseLeave={onMouseLeave}
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
            <Image
              className="w-full h-full"
              src={"/" + token.name + ".png"}
              alt={token.short}
              width="64"
              height="64"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span>{token.name}</span>
              <span>{token.percentage}</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded">
              <div
                className="bg-blue-500 h-3 rounded"
                style={{ width: token.percentage }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TokenAllocationCard;
