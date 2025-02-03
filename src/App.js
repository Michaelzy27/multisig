import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Replace with your actual contract ABI and address
const CONTRACT_ADDRESS = '0x...'; 
const CONTRACT_ABI = [/* paste full ABI here */];

const MultiSigWallet = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [admins, setAdmins] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Transaction form state
  const [recipient, setRecipient] = useState('');
  const [value, setValue] = useState('');
  const [txData, setTxData] = useState('');

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        
        const multiSigContract = new ethers.Contract(
          CONTRACT_ADDRESS, 
          CONTRACT_ABI, 
          signer
        );

        setProvider(web3Provider);
        setContract(multiSigContract);
        setAccount(address);

        // Check if user is an admin
        const adminStatus = await multiSigContract.isAdmin(address);
        setIsAdmin(adminStatus);

        // Fetch admins and transactions
        const contractAdmins = await multiSigContract.admins();
        setAdmins(contractAdmins);
      }
    };

    connectWallet();
  }, []);

  const submitTransaction = async () => {
    try {
      const tx = await contract.submit(recipient, ethers.utils.parseEther(value), txData);
      await tx.wait();
      alert('Transaction submitted successfully!');
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const approveTransaction = async (txId) => {
    try {
      const tx = await contract.adminTxApprove(txId);
      await tx.wait();
      alert('Transaction approved!');
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  const executeTransaction = async (txId) => {
    try {
      const tx = await contract.execute(txId);
      await tx.wait();
      alert('Transaction executed!');
    } catch (error) {
      console.error('Execution error:', error);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MultiSig Wallet</h1>
      
      {!account ? (
        <button 
          className="bg-blue-500 text-white p-2 rounded"
          onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}
        >
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="mb-4">
            <h2 className="font-semibold">Connected Account: {account}</h2>
            <p>Admin Status: {isAdmin ? 'Yes' : 'No'}</p>
          </div>

          {isAdmin && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h3 className="font-semibold mb-2">Submit Transaction</h3>
              <input 
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />
              <input 
                placeholder="Value (ETH)"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />
              <input 
                placeholder="Transaction Data"
                value={txData}
                onChange={(e) => setTxData(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />
              <button 
                onClick={submitTransaction}
                className="bg-green-500 text-white p-2 rounded"
              >
                Submit Transaction
              </button>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Admins</h3>
            <ul>
              {admins.map((admin, index) => (
                <li key={index} className="mb-1">{admin}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default MultiSigWallet;