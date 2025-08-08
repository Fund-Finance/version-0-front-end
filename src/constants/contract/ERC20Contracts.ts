
export const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const wethAddress = "0x4200000000000000000000000000000000000006";
export const cbBTCAddress = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
export const linkAddress = "0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196";
export const aaveAddress = "0x63706e401c06ac8513145b7687A14804d17f814b";

export const tokenAddressToName: Map<string, string[]> = new Map([
    [usdcAddress, ["United States Dollar Coin","USDC"]],
    [wethAddress, ["Wrapped Ethereum", "wETH"]],
    [cbBTCAddress, ["Coinbase Bitcoin", "cbBTC"]],
    [linkAddress, ["Chainlink", "LINK"]],
    [aaveAddress, ["Aave", "AAVE"]]
]);

export const tokenNameToColor: Map<string, string> = new Map([
    ["United States Dollar Coin", "#2775CA"],
    ["Wrapped Ethereum", "#6F00FF"],
    ["Coinbase Bitcoin", "#F7931A"],
    ["Chainlink", "#F7931A"],
    ["Aave", "#F7931A"],
]);

export const tokenShortToAddress: Map<string, string> = new Map([
    ["USDC", usdcAddress],
    ["wETH", wethAddress],
    ["cbBTC", cbBTCAddress],
    ["LINK", linkAddress],
    ["AAVE", aaveAddress]
]);

export const tokenAddressToShort: Map<string, string> = new Map([
    [usdcAddress, "USDC"],
    [wethAddress, "wETH"],
    [cbBTCAddress, "cbBTC"],
    [linkAddress, "LINK"],
    [aaveAddress, "AAVE"]
]);


export const usdcPriceAggregatorAddress = "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B";
