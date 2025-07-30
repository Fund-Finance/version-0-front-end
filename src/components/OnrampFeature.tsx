"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { generateOnrampURL } from "../utils/rampUtils";
import { countryNames } from "../utils/onrampApi";

// Define payment method descriptions
const PAYMENT_METHOD_DESCRIPTIONS: Record<string, string> = {
  CARD: "Debit or Credit Card (Available in most countries)",
  ACH_BANK_ACCOUNT: "Bank Transfer (ACH) - US only",
  APPLE_PAY: "Apple Pay - Available on iOS devices",
};

// Currency symbols for common currencies
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  INR: "₹",
  RUB: "₽",
  BRL: "R$",
  CAD: "C$",
  AUD: "A$",
  CHF: "CHF",
  HKD: "HK$",
  SGD: "S$",
  SEK: "kr",
  NOK: "kr",
  DKK: "kr",
  PLN: "zł",
  ZAR: "R",
  MXN: "Mex$",
  AED: "د.إ",
  THB: "฿",
  TRY: "₺",
};

// Helper function to get currency symbol
const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

// Create an array from countryNames for the dropdown
const countryList = Object.entries(countryNames)
  .map(([code, name]) => ({
    code,
    name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// US States list
const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

export default function OnrampFeature() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [amount, setAmount] = useState("10");
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [selectedPaymentCurrency, setSelectedPaymentCurrency] = useState("USD");
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [selectedState, setSelectedState] = useState("");
  const [useSecureInit, setUseSecureInit] = useState(true);

  // Define supported payment methods
  const paymentMethods = [
    {
      id: "CARD",
      name: "Debit Card",
      description: "Available in 90+ countries",
    },
    {
      id: "ACH_BANK_ACCOUNT",
      name: "Bank Transfer (ACH)",
      description: "US only",
    },
    { id: "APPLE_PAY", name: "Apple Pay", description: "US only" },
  ];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethods[0].id
  );

  // Define supported payment currencies
  const paymentCurrencies = [
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "CAD", name: "Canadian Dollar" },
    { code: "AUD", name: "Australian Dollar" },
    { code: "JPY", name: "Japanese Yen" },
    { code: "CHF", name: "Swiss Franc" },
    { code: "HKD", name: "Hong Kong Dollar" },
    { code: "SGD", name: "Singapore Dollar" },
    { code: "SEK", name: "Swedish Krona" },
    { code: "NOK", name: "Norwegian Krone" },
    { code: "DKK", name: "Danish Krone" },
    { code: "PLN", name: "Polish Złoty" },
    { code: "NZD", name: "New Zealand Dollar" },
    { code: "MXN", name: "Mexican Peso" },
    { code: "BRL", name: "Brazilian Real" },
    { code: "ZAR", name: "South African Rand" },
    { code: "INR", name: "Indian Rupee" },
    { code: "TRY", name: "Turkish Lira" },
    { code: "ILS", name: "Israeli New Shekel" },
    { code: "AED", name: "UAE Dirham" },
    { code: "SAR", name: "Saudi Riyal" },
    { code: "KRW", name: "South Korean Won" },
    { code: "CNY", name: "Chinese Yuan" },
    { code: "THB", name: "Thai Baht" },
    { code: "IDR", name: "Indonesian Rupiah" },
    { code: "MYR", name: "Malaysian Ringgit" },
    { code: "PHP", name: "Philippine Peso" },
  ].sort((a, b) => a.name.localeCompare(b.name));

  // Generate session token
  const generateSessionToken = async () => {
    if (!address) {
      alert("Please connect your wallet first");
      return null;
    }

    try {
      setIsGeneratingToken(true);
      
      // Prepare addresses array based on selected network
      const addresses = [{
        address: address,
        blockchains: [selectedNetwork]
      }];
      
      // Make request to our API endpoint
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addresses,
          assets: ["USDC"], // Hardcoded to USDC
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate session token');
      }

      const data = await response.json();
      
      // Check if this is a mock token
      if (data.mock) {
        console.warn('Using mock session token. In production, configure CDP API credentials.');
        // For demo purposes, we'll skip using the session token
        return null;
      }
      
      return data.token;
    } catch (error) {
      console.error('Error generating session token:', error);
      alert(`Session token generation failed. The transaction will proceed with standard authentication.\n\nFor production use, ensure your CDP API credentials are properly configured.`);
      return null;
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Handle direct onramp
  const handleOnramp = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    let sessionToken: string | undefined;
    
    // Generate session token if secure init is enabled
    if (useSecureInit) {
      const token = await generateSessionToken();
      if (!token) return; // Exit if token generation failed
      sessionToken = token;
    }

    // Note: This is a demo app - actual payments require ownership of assets and sufficient funds
    const url = generateOnrampURL({
      asset: "USDC", // Hardcoded to USDC
      amount,
      network: selectedNetwork,
      paymentMethod: selectedPaymentMethod,
      paymentCurrency: selectedPaymentCurrency,
      address: address || "0x0000000000000000000000000000000000000000",
      redirectUrl: window.location.origin + "/onramp",
      enableGuestCheckout: true, // Always enable guest checkout
      sessionToken, // Include session token if generated
    });

    window.open(url, "_blank");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    alert("URL copied to clipboard!");
  };

  const handleOpenUrl = () => {
    window.open(generatedUrl, "_blank");
  };

  return (
    <div className="bg-white dark:bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-6 dark:text-white text-center">
              Purchase Digital Dollars
            </h3>

            {/* Connect Wallet Button */}
            {!isConnected && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    if (connectors.length > 0) {
                      connect({ connector: connectors[0] });
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Connect Wallet
                </button>
              </div>
            )}

            {/* Form Layout - Single Column */}
            <div className="space-y-6">
              {/* Country Selection */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Country
                </label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="block w-full bg-white text-gray-800 border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {countryList.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* State Selection */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  State
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="block w-full bg-white text-gray-800 border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Asset Display */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Asset
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    USD Coin (USDC)
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Amount
                </label>
                <div className="flex space-x-2 mb-2">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-800 font-medium transition-colors"
                    onClick={() => setAmount("10")}
                  >
                    {getCurrencySymbol(selectedPaymentCurrency)}10
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-800 font-medium transition-colors"
                    onClick={() => setAmount("25")}
                  >
                    {getCurrencySymbol(selectedPaymentCurrency)}25
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-gray-800 font-medium transition-colors"
                    onClick={() => setAmount("50")}
                  >
                    {getCurrencySymbol(selectedPaymentCurrency)}50
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-700">
                    {getCurrencySymbol(selectedPaymentCurrency)}
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full bg-white border border-gray-300 rounded-lg py-3 pl-8 pr-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Payment Currency Selection */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Payment Currency
                </label>
                <div className="relative">
                  <select
                    value={selectedPaymentCurrency}
                    onChange={(e) => setSelectedPaymentCurrency(e.target.value)}
                    className="block w-full bg-white text-gray-800 border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {paymentCurrencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name} ({currency.code})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Payment Method
                </label>
                <div className="relative">
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="block w-full bg-white text-gray-800 border border-gray-300 rounded-lg py-3 px-4 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {PAYMENT_METHOD_DESCRIPTIONS[selectedPaymentMethod] && (
                  <p className="text-sm text-gray-500 mt-2">
                    {PAYMENT_METHOD_DESCRIPTIONS[selectedPaymentMethod]}
                  </p>
                )}
              </div>
            </div>

            {/* Action Button - Full Width */}
            <div className="mt-8">
              <button
                onClick={handleOnramp}
                disabled={!isConnected}
                className={`w-full font-medium py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  !isConnected
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                Buy Digital Dollars Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
