import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const FaucetBalance = ({ contract }) => {
  const [balance, setBalance] = useState('N/A');

  useEffect(() => {
    const getBalance = async () => {
      if (contract) {
        try {
          console.log('Fetching faucet balance...');
          const balanceWei = await contract.getFaucetBalance();
          console.log('Faucet balance (Wei):', balanceWei.toString());
          const balanceLAVA = ethers.utils.formatUnits(balanceWei, 'ether');
          console.log('Faucet balance (LAVA):', balanceLAVA);
          setBalance(balanceLAVA);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      } else {
        console.warn('Contract instance not available.');
      }
    };
  
    getBalance();
  }, [contract]);
  

  return (
    <div className="faucet-balance">
      <h2 className="balance-title">Faucet Balance</h2>
      <p className="balance">{`${balance} LAVA`}</p>
    </div>
  );
};

export default FaucetBalance;
