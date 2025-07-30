
export const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const wethAddress = "0x4200000000000000000000000000000000000006";
export const cbBTCAddress = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";

export const tokenAddressToName: Map<string, string[]> = new Map([
    [usdcAddress, ["United States Dollar Coin","USDC"]],
    [wethAddress, ["Wrapped Ethereum", "wETH"]],
    [cbBTCAddress, ["Coinbase Bitcoin", "cbBTC"]]
]);

export const tokenNameToColor: Map<string, string> = new Map([
    ["United States Dollar Coin", "#2775CA"],
    ["Wrapped Ethereum", "#6F00FF"],
    ["Coinbase Bitcoin", "#F7931A"]
]);

export const tokenShortToAddress: Map<string, string> = new Map([
    ["USDC", usdcAddress],
    ["wETH", wethAddress],
    ["cbBTC", cbBTCAddress]
]);

export const tokenAddressToShort: Map<string, string> = new Map([
    [usdcAddress, "USDC"],
    [wethAddress, "wETH"],
    [cbBTCAddress, "cbBTC"]
]);


export const usdcPriceAggregatorAddress = "0x7e860098F58bBFC8648a4311b374B1D669a2bc6B";
