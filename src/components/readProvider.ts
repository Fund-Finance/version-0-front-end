'use client';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../constants/FundTokenContract';

const readValue = async () => {
if (typeof window.ethereum === 'undefined') {
  console.error('MetaMask is not installed');
  return;
}

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

try {
  const value = await contract.getTotalValueOfFund();
  console.log('Value from contract:', value.toString());
} catch (error) {
  console.error('Error reading value from contract:', error);
}
}

export default readValue;
