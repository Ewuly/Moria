"use client";

import { useEffect, useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { contractABI, contractAddress } from "~~/contracts/depositContract";
import { sendTransaction, signMessage } from "~~/lib/dynamic";

const Home: NextPage = () => {
  const { primaryWallet, networkConfigurations } = useDynamicContext();
  const [messageSignature, setMessageSignature] = useState<string>("");
  const [transactionSignature, setTransactionSignature] = useState<string>("");
  const [approveTransactionHash, setApproveTransactionHash] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<Array<{ symbol: string; value: number; contractAddress: string }>>([]);
  const [selectedToken, setSelectedToken] = useState<{
    symbol: string;
    value: number;
    contractAddress: string;
    chain: string;
  } | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const connectedAddress = primaryWallet?.address;

  const logAddress = async () => {
    console.log(connectedAddress);
  };

  const getWalletBalanceRoostock = async () => {
    try {
      if (!connectedAddress) {
        console.error("No connected address found.");
        return;
      }

      const apiUrl = `https://rootstock-testnet.blockscout.com/api/v2/addresses/${connectedAddress}/token-balances`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token balances. Status: ${response.status}`);
      }

      const data = await response.json();

      let totalTokenBalances = 0;
      const tokenData = data.map((tokenBalance: any) => {
        const decimals = tokenBalance.token.decimals;
        const value = tokenBalance.value / 10 ** decimals;
        const chain = "Rootstock";
        totalTokenBalances += value;
        let contractAddress = "";
        switch (tokenBalance.token.symbol) {
          case "DAI":
            contractAddress = "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357";
            break;
          case "USDC":
            contractAddress = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";
            break;
          case "LINK":
            contractAddress = "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5";
            break;
          case "AAVE":
            contractAddress = "0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a";
            break;
        }
        return {
          symbol: tokenBalance.token.symbol,
          value: value,
          contractAddress: contractAddress,
        };
      });

      setBalance(totalTokenBalances);
      setTokens(tokenData);
      console.log("Total Token Balances:", totalTokenBalances);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };

  const handleSignMessage = async () => {
    try {
      const signature = await signMessage("Hello World", primaryWallet);
      setMessageSignature(signature);

      setTimeout(() => {
        setMessageSignature("");
      }, 10000);
    } catch (e) {
      console.error(e);
    }
  };

  // const handleSendTransaction = async () => {
  //   try {
  //     const isTestnet = await primaryWallet?.connector?.isTestnet();
  //     if (!isTestnet) {
  //       alert("You're not on a testnet, proceed with caution.");
  //     }
  //     const hash = await sendTransaction(connectedAddress, "0.0001", primaryWallet, networkConfigurations);
  //     setTransactionSignature(hash);

  //     setTimeout(() => {
  //       setTransactionSignature("");
  //     }, 10000);
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const handleSupplyClick = (token: { symbol: string; value: number; contractAddress: string }) => {
    setSelectedToken(token);
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      if (!selectedToken) {
        console.error("No token selected.");
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        console.error("Invalid amount.");
        return;
      }

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(selectedToken.contractAddress, contractABI, signer);

      // Define the arguments
      const _amount = ethers.utils.parseUnits(amount, 18);
      const _depositTokenAddress = contractAddress; // This is the address of the deposit contract
      const _owner = connectedAddress; // The address of the user

      // Set a manual gas limit
      const manualGasLimit = 100000; // Example gas limit, adjust as necessary

      // Send the transaction with a manual gas limit
      const tx = await tokenContract.approve(_amount, _depositTokenAddress, _owner, {
        gasLimit: manualGasLimit, // Setting manual gas limit
      });
      await tx.wait();
      setApproveTransactionHash(tx.hash); // Store the transaction hash

      console.log(`Approved ${amount} ${selectedToken.symbol} to ${contractAddress}`);
    } catch (error) {
      console.error("Error approving token:", error);
    }
  };

  const handleSupply = async () => {
    try {
      if (!selectedToken) {
        console.error("No token selected.");
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        console.error("Invalid amount.");
        return;
      }

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Define the arguments
      const _amount = ethers.utils.parseUnits(amount, 18);
      const _depositTokenAddress = selectedToken.contractAddress;

      // Set a manual gas limit
      const manualGasLimit = 1000000; // Example gas limit, adjust as necessary

      // Call the deposit function with a manual gas limit
      const tx = await contract.deposit(_amount, _depositTokenAddress, {
        gasLimit: manualGasLimit, // Setting manual gas limit
      });
      await tx.wait();

      console.log(`Supply ${selectedToken.symbol} with amount ${amount}`);
    } catch (error) {
      console.error("Error calling deposit function:", error);
    }
  };

  const handleBorrow = async (token: { symbol: string; value: number; contractAddress: string }) => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        console.error("Invalid amount.");
        return;
      }

      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Call the borrow function
      const tx = await contract.borrow(ethers.utils.parseUnits(amount, 18), token.contractAddress);
      await tx.wait();

      console.log(`Borrowed ${amount} ${token.symbol}`);
    } catch (error) {
      console.error("Error calling borrow function:", error);
    }
  };

  useEffect(() => {
    if (connectedAddress) {
      getWalletBalance();
    }
  }, [connectedAddress]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 relative w-full">
        <button onClick={() => getWalletBalance()} className="btn btn-primary absolute top-4 right-4">
          Refresh
        </button>
        <div className="px-5 w-full">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Moria</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          <p className="flex justify-center items-center">Balance: {balance !== null ? `${balance}$` : "Loading..."}</p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-between items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 items-center w-full max-w-md rounded-3xl mb-8 mx-auto">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p className="my-2 font-medium">Your supplies</p>
              <div className="flex w-full justify-between items-center">
                <p className="font-medium">Asset | Balance</p>
              </div>
              <div className="w-full">
                {tokens.map(token => (
                  <div key={token.symbol} className="mb-4 flex justify-between items-center w-full">
                    <p className="flex-grow">
                      {token.symbol} | {token.value}
                    </p>
                    <div className="flex space-x-2">
                      <button className="btn btn-primary">Supply</button>
                      <button className="btn btn-primary">Withdraw</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 items-center w-full max-w-md rounded-3xl mx-auto">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p className="my-2 font-medium">Your borrows</p>
              <div className="flex w-full justify-between items-center">
                <p className="font-medium">Asset | Balance</p>
              </div>
              <div className="w-full">
                {tokens.map(token => (
                  <div key={token.symbol} className="mb-4 flex justify-between items-center w-full">
                    <p className="flex-grow">
                      {token.symbol} | {token.value}
                    </p>
                    <div className="flex space-x-2">
                      <button className="btn btn-primary" onClick={() => handleBorrow(token)}>
                        Borrow
                      </button>
                      <button className="btn btn-primary">Repay</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 items-center w-full max-w-md rounded-3xl mb-8 mx-auto">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p className="my-2 font-medium">Assets to supply</p>
              <div className="flex w-full justify-between items-center">
                <p className="font-medium">Asset | Balance</p>
              </div>
              <div className="w-full">
                {tokens.map(token => (
                  <div key={token.symbol} className="mb-4 flex justify-between items-center w-full">
                    <p className="flex-grow">
                      {token.symbol} | {token.value}
                    </p>
                    <div className="flex space-x-2">
                      <button className="btn btn-primary" onClick={() => handleSupplyClick(token)}>
                        Supply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 items-center w-full max-w-md rounded-3xl mx-auto">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p className="my-2 font-medium">Assets to borrow</p>
              <div className="flex w-full justify-between items-center">
                <p className="font-medium">Asset | Balance</p>
              </div>
              <div className="w-full">
                {tokens.map(token => (
                  <div key={token.symbol} className="mb-4 flex justify-between items-center w-full">
                    <p className="flex-grow">
                      {token.symbol} | {token.value}
                    </p>
                    <div className="flex space-x-2">
                      <button className="btn btn-primary" onClick={() => handleBorrow(token)}>
                        Borrow
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && selectedToken && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Supply {selectedToken.symbol}</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1" htmlFor="amount">
                  Amount (Select an amount)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>
              <p className="mb-4">{selectedToken.symbol}</p>
              <p className="mb-4">$0</p>
              <p className="mb-4">Wallet balance: {balance}</p>
              <div className="flex justify-end space-x-4">
                <button className="btn btn-primary" onClick={handleApprove}>
                  Approve {selectedToken.symbol}
                </button>
                {approveTransactionHash && (
                  <a
                    href={`https://neon-devnet.blockscout.com/tx/${approveTransactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    View Transaction
                  </a>
                )}
                <button className="btn btn-primary" onClick={handleSupply}>
                  Supply {selectedToken.symbol}
                </button>
              </div>
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                onClick={() => setIsModalOpen(false)}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
