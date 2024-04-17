import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers'; // Import ethers
import LoadingSpinner from './LoadingSpinner'; // Import the LoadingSpinner component

const ContributeFunds = ({ account, isLoading, setIsLoading, setShowMatrixRain, contract }) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const MAGMA_NETWORK_ID = 6969696969;

  // Function to request account access from MetaMask
  const requestAccount = async () => {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  };

  const checkNetwork = useCallback(async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        await requestAccount();
  
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await provider.getNetwork();
        const correctNetwork = parseInt(network.chainId, 10) === MAGMA_NETWORK_ID;
  
        if (!correctNetwork) {
          console.warn("Please switch to the Magma (Testnet) blockchain");
          return;
        }
  
        // Continue with your logic for the correct network
      } else {
        console.error('MetaMask or compatible wallet not detected');
        // Handle the case where MetaMask or a compatible wallet is not installed
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  }, []);

  useEffect(() => {
    checkNetwork();
  }, [checkNetwork]);

  // Function to handle contribution of funds
  const contributeFundsHandler = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (!contract) {
        console.error('Contract not loaded');
        return;
      }

      const amountInWei = ethers.utils.parseEther(amount);

      const transaction = await contract.contribute({
        from: account,
        value: amountInWei,
      });

      if (transaction && transaction.hash) {
        setMessage('Transaction successful!');
        setTimeout(() => setMessage(''), 11000); // Clear message after 10 seconds
        setShowMatrixRain(true); // Show animation or any other action upon successful withdrawal
        setTimeout(() => setShowMatrixRain(false), 7000); // Hide animation after 8 seconds
      } else {
        setMessage('Contribution failed. Ensure Wallet Is Connected & On Magma Testnet');
        setTimeout(() => setMessage(''), 10000); // Clear message after 10 seconds
      }
    } catch (error) {
      console.error("Error contributing funds:", error);
      setMessage('Contribution failed. Ensure Wallet Is Connected & On Magma Testnet');
      setTimeout(() => setMessage(''), 10000); // Clear message after 10 seconds
    } finally {
      setLoading(false);
      setAmount('');
    }
  };

  return (
    <>
      <input 
        type="text"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in ETH"
        className="contribute-input"
      />
      <button 
        onClick={contributeFundsHandler}
        disabled={loading || !contract || !amount}
        className={`button ${loading ? 'button-disabled' : ''}`}
      >
        {loading ? 'Processing...' : 'Contribute Funds'}
      </button>
      {loading && <LoadingSpinner />}
      {message && <p className="message">{message}</p>}
    </>
  );
};

export default ContributeFunds;
