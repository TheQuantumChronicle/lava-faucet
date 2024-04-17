import React, { useState, useEffect } from 'react';
import './App.css';
import { ethers } from 'ethers';
import FaucetBalance from './components/FaucetBalance';
import WithdrawFunds from './components/WithdrawFunds';
import ContributeFunds from './components/ContributeFunds';
import TipFaucet from './components/TipFaucet';
import MatrixRain from './components/MatrixRain';
import Background from './components/Background';
import contractABI from './contractABI.json';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [showMatrixRain, setShowMatrixRain] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isStartHereHovered, setIsStartHereHovered] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const CONTRACT_ADDRESS = '0xA6484A3F99215703b3DFe1d006cf2374f8675A2D';
  const MAGMA_NETWORK_ID = 6969696969;

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  useEffect(() => {
    const checkNetwork = async () => {
      if (window.ethereum) {
        try {
          await requestAccount();
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const network = await provider.getNetwork();
          const correctNetwork = parseInt(network.chainId, 10) === MAGMA_NETWORK_ID;
          if (!correctNetwork) {
            console.warn("Please switch to the Magma (Sepolia) blockchain");
            return;
          }
          const signer = provider.getSigner();
          const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
          setContract(contractInstance);
          const userAddress = await signer.getAddress();
          setAccount(userAddress);
          setIsConnected(true);
        } catch (error) {
          console.error('Error connecting to MetaMask:', error);
        }
      } else {
        console.error('MetaMask or compatible wallet not detected');
      }
    };
  
    checkNetwork();
  }, []);

  const handleConnect = async () => {
    try {
      if (window.ethereum && window.ethereum.selectedAddress) {
        const selectedAddress = window.ethereum.selectedAddress;
        setAccount(selectedAddress);
        // Reload the page only if the connection is successful
        window.location.reload();
      } else {
        await requestAccount();
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      alert('Error connecting to MetaMask. Please try again.');
    }
  };

  const handleTransaction = async (transactionFunction) => {
    if (!window.ethereum) {
      console.error('MetaMask or compatible wallet not detected');
      alert('Please install MetaMask or a compatible wallet to proceed.');
      return;
    }
  
    if (!account) {
      console.error('MetaMask account not connected');
      alert('Please connect MetaMask to your wallet');
      return;
    }
  
    try {
      const result = await transactionFunction();
      if (result) {
        const receipt = await result.wait();
        if (receipt.status === 1) {
          setShowMatrixRain(true);
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowMatrixRain(false);
            setShowSuccessMessage(false);
          }, 100000);
        } else {
          throw new Error("Transaction failed");
        }
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  return (
    <div className="App">
      <Background />
      <header className="App-header">
        <h1 className="title">LAVA FAUCET</h1>
        <div
          className="start-here-container"
          onMouseEnter={() => setIsStartHereHovered(true)}
          onMouseLeave={() => setIsStartHereHovered(false)}
        >
          <h2 className="start-here-text">Start Here</h2>
          <div className={`start-here-tooltip ${isStartHereHovered ? 'show' : ''}`}>
            <div className="start-here-line">
              <p><strong>1.</strong> Users must be whitelisted to use our faucet</p>
            </div>
            <div className="start-here-line">
              <p><strong>2.</strong> Gain WL access by contributing .1 LAVA minimum</p>
            </div>
            <div className="start-here-line">
              <p><strong>3.</strong> After initial contribution, users can contribute any amount of LAVA</p>
            </div>
            <div className="start-here-line">
              <p><strong>4.</strong> 'Withdraw' gives you .1 LAVA every 24hrs</p>
            </div>
            <div className="start-here-line">
              <p>
                <strong>Note:</strong> If you have 0 LAVA, DM{' '}
                <strong>
                  <a href="https://twitter.com/TYinTECH" target="_blank" rel="noopener noreferrer">@TYinTECH</a>
                </strong> on X
              </p>
            </div>
          </div>
        </div>
        {!isConnected && (
          <div className="connect-wallet-container">
            <button onClick={handleConnect} className="connect-wallet-button" style={{ fontFamily: "'Roboto', monospace", fontWeight: "bold" }}>Connect Wallet</button>
          </div>
        )}
        {isConnected && (
          <>
            {contract && (
              <FaucetBalance contract={contract} />
            )}
            <div className="button-container withdraw-button">
              <WithdrawFunds 
                contract={contract} 
                account={account} 
                handleTransaction={handleTransaction}
                setShowMatrixRain={setShowMatrixRain}
              />
            </div>
            <div className="button-container contribute-button">
              <ContributeFunds
                contract={contract}
                account={account}
                handleTransaction={handleTransaction}
                setShowMatrixRain={setShowMatrixRain}
              />
              <div className="info-container contribution-info" style={{ fontFamily: "'Roboto', monospace", fontWeight: "strong" }}>
                <p>Add LAVA (testnet) to our faucet (potential airdrop rewards...).</p>
              </div>
            </div>
            <div className="button-container tip-button">
              <TipFaucet
                contract={contract}
                account={account}
                handleTransaction={handleTransaction}
                setShowMatrixRain={setShowMatrixRain}
              />
              <div className="info-container tip-info" style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: "bold" }}>
                <p>Tip Mainnet ETH/Magma to support (higher potential airdrop rewards...).</p>
              </div>
            </div>
            {showMatrixRain && (
              <MatrixRain showSuccessMessage={showSuccessMessage} />
            )}
          </>
        )}
      </header>
      <div className="footer-links">
        <p>Built By Magma Makers, For Magma Makers </p>
        <span className="link-separator"> | </span>
        <a href="https://twitter.com/i/communities/1766007547775873227">Join Magma Makers</a>
        <span className="link-separator"> | </span>
        <a href="https://docs.magma.foundation/" target="_blank" rel="noopener noreferrer">Magma Docs</a>
        <span className="link-separator"> | </span>
        <a href="https://www.magma.foundation/" target="_blank" rel="noopener noreferrer">Magma Foundation Website</a>
      </div>
    </div>
  );
}

export default App;
