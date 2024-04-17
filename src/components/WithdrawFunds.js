import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import LoadingSpinner from './LoadingSpinner';
import HCaptcha from '@hcaptcha/react-hcaptcha';

const WithdrawFunds = ({ contract, account, isLoading, setShowMatrixRain }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [cooldownTime] = useState(86400); // Cooldown time in seconds (1 day)
  const [timeLeft, setTimeLeft] = useState(cooldownTime); // Time left until next withdrawal
  const [captchaToken, setCaptchaToken] = useState('');
  const [withdrawDisabled, setWithdrawDisabled] = useState(true);

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

  // Function to get the time of the last withdrawal and calculate the time until the next withdrawal
  const getLastWithdrawTime = useCallback(async () => {
    try {
      const lastTime = await contract.lastClaimTime(account);
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
      const timePassed = currentTime - lastTime;
      const timeRemaining = cooldownTime - timePassed;
      setCanWithdraw(timePassed >= cooldownTime);
      setTimeLeft(timeRemaining);
      setWithdrawDisabled(timePassed < cooldownTime); // Disable withdraw button if cooldown time is not passed

      if (timePassed < cooldownTime) {
        const interval = setInterval(() => {
          setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
      }
    } catch (error) {
      console.error('Error fetching last withdrawal time:', error);
    }
  }, [contract, account, cooldownTime]); // Add dependencies to useCallback

  useEffect(() => {
    checkNetwork();
    getLastWithdrawTime();
  }, [checkNetwork, getLastWithdrawTime]); // Add dependencies to useEffect

  // Function to format the time left until the next withdrawal
  const formatTimeLeft = time => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // Function to handle hCaptcha verification success
  const handleCaptchaVerify = token => {
    setCaptchaToken(token);
  };

  // Function to handle withdrawal of funds
  const withdrawFundsHandler = async () => {
    if (!captchaToken) {
      // If hCaptcha token is not available, show error message
      setMessage('Please complete the captcha');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const transaction = await contract.withdraw({ from: account });
      if (transaction && transaction.hash) {
        // Withdrawal successful
        setMessage('Withdrawal successful!');
        setTimeout(() => setMessage(''), 10000);
        setShowMatrixRain(true); // Show animation or any other action upon successful withdrawal
        setTimeout(() => setShowMatrixRain(false), 8000); // Hide animation after 8 seconds
      } else {
        setMessage('Withdrawal failed: Transaction not found.');
        setTimeout(() => setMessage(''), 10000);
      }
    } catch (error) {
      console.error("Withdrawal failed", error);
      setMessage('Withdrawal failed. Faucet is out of LAVA, you are on the wrong network, or you are not on the whitelist');
      setTimeout(() => setMessage(''), 10000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="captcha-container"> {/* Apply CSS styles to this container */}
        <HCaptcha
          sitekey="cb31ae15-8e58-4fe4-abe3-7ee60b98be11"
          onVerify={handleCaptchaVerify}
          onExpire={() => setCaptchaToken('')}
        />
      </div>
      <button
        onClick={withdrawFundsHandler}
        disabled={loading || !canWithdraw || !captchaToken || withdrawDisabled}
        className={loading || !canWithdraw || !captchaToken || withdrawDisabled ? 'button-disabled' : ''}
      >
        {loading ? <LoadingSpinner /> : canWithdraw ? 'Claim .1 LAVA' : `Next withdrawal in ${formatTimeLeft(timeLeft)}`}
      </button>
      {message && <p className="message">{message}</p>}
    </>
  );
};

export default WithdrawFunds;