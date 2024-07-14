"use client";

import { useEffect, useState } from "react";
import { FC } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { useWriteContract } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { approveUSDCNeonABI, approveUSDCNeonAddress } from "~~/contracts/approveUSDCNeon";
import { approveUSDCRootstockABI, approveUSDCRootstockAddress } from "~~/contracts/approveUSDCRootstock";
import { approveUSDTNeonABI, approveUSDTNeonAddress } from "~~/contracts/approveUSDTNeon";
import { approveUSDTRootstockABI, approveUSDTRootstockAddress } from "~~/contracts/approveUSDTRootstock";
import { neonContractABI, neonContractAddress } from "~~/contracts/depositContractNEON";
import { rootstockContractABI, rootstockContractAddress } from "~~/contracts/depositContractRootstock";
import { sendTransaction, signMessage } from "~~/lib/dynamic";

const Home: NextPage = () => {
  const { primaryWallet, networkConfigurations } = useDynamicContext();
  const [messageSignature, setMessageSignature] = useState<string>("");
  const [transactionSignature, setTransactionSignature] = useState<string>("");
  const [approveTransactionHash, setApproveTransactionHash] = useState<string>("");
  const [balanceRootstock, setBalanceRootstock] = useState<number | null>(null);
  const [balanceNeon, setBalanceNeon] = useState<number | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [approvalContractABI, setapprovalContractABI] = useState<any>("");
  const [tokensRootstock, setTokensRootstock] = useState<
    Array<{ symbol: string; value: number; contractAddress: string; chain: string }>
  >([]);
  const [tokensNeon, setTokensNeon] = useState<
    Array<{ symbol: string; value: number; contractAddress: string; chain: string }>
  >([]);
  const [tokens, setTokens] = useState<
    Array<{ symbol: string; value: number; contractAddress: string; chain: string }>
  >([]);
  const [selectedToken, setSelectedToken] = useState<{
    symbol: string;
    value: number;
    contractAddress: string;
    chain: string;
  } | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const connectedAddress = primaryWallet?.address;
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const logAddress = async () => {
    console.log(connectedAddress);
  };

  const getWalletBalanceRootstock = async () => {
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
      console.log("data", data);

      let totalTokenBalances = 0;
      const tokenData = data.map((tokenBalance: any) => {
        const decimals = tokenBalance.token.decimals;
        const value = tokenBalance.value / 10 ** decimals;
        const chain = "Rootstock";
        console.log("Token Balance Chain:", chain);
        totalTokenBalances += value;
        let contractAddress = "";
        let contractABI;
        switch (tokenBalance.token.symbol) {
          case "USDT":
            contractAddress = approveUSDTRootstockAddress;
            contractABI = approveUSDTRootstockABI;
            break;
          case "USDC":
            contractAddress = approveUSDCRootstockAddress;
            contractABI = approveUSDCRootstockABI;
            break;
        }
        return {
          symbol: tokenBalance.token.symbol,
          value: value,
          contractAddress: contractAddress,
          chain: chain,
        };
      });

      setBalanceRootstock(totalTokenBalances);
      setTokensRootstock(tokenData);
      console.log("Total Token Balances:", totalTokenBalances);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    }
  };
  const getWalletBalanceNeon = async () => {
    try {
      if (!connectedAddress) {
        console.error("No connected address found.");
        return;
      }

      const apiUrl = `https://neon-devnet.blockscout.com/api/v2/addresses/${connectedAddress}/token-balances`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token balances. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("data", data);

      let totalTokenBalances = 0;
      const tokenData = data.map((tokenBalance: any) => {
        const decimals = tokenBalance.token.decimals;
        const value = tokenBalance.value / 10 ** decimals;
        const chain = "Neon";
        // console.log("Token Balance Chain:", chain);
        totalTokenBalances += value;
        let contractAddress = "";
        switch (tokenBalance.token.symbol) {
          case "USDT":
            contractAddress = approveUSDTNeonAddress;
            setapprovalContractABI(approveUSDTNeonABI);
            break;
          case "USDC":
            contractAddress = approveUSDCNeonAddress;
            setapprovalContractABI(approveUSDCNeonABI);
            break;
        }
        return {
          symbol: tokenBalance.token.symbol,
          value: value,
          contractAddress: contractAddress,
          chain: chain,
        };
      });

      setBalanceNeon(totalTokenBalances);
      setTokensNeon(tokenData);
      console.log("symbol", tokensNeon[0].symbol); // Accessing symbol property of the first token in the array
      console.log("value", tokensNeon[0].value); // Accessing symbol property of the first token in the array
      console.log("contractAddress", tokensNeon[0].contractAddress); // Accessing symbol property of the first token in the array
      console.log("chain", tokensNeon[0].chain); // Accessing symbol property of the first token in the array

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

  const handleSupplyClick = (token: { symbol: string; value: number; contractAddress: string; chain: string }) => {
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
      const _amount = ethers.utils.parseUnits(amount, 18);
      await writeContract({
        address: approveUSDCRootstockAddress,
        abi: approveUSDCRootstockABI,
        functionName: "approve",
        args: [rootstockContractAddress, _amount],
      });
      setApproveTransactionHash(hash); // Store the transaction hash
      console.log("store the hash");

      console.log(`Approved ${amount} ${selectedToken.symbol} to xoxox`);
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

      const _amount = ethers.utils.parseUnits(amount, 18);
      const _depositTokenAddress = selectedToken.contractAddress;
      await writeContract({
        address: rootstockContractAddress,
        abi: rootstockContractABI,
        functionName: "deposit",
        args: [_amount, approveUSDCRootstockAddress],
      });
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
      const contract = new ethers.Contract(rootstockContractAddress, rootstockContractABI, signer);

      // Call the borrow function
      const tx = await contract.borrow(ethers.utils.parseUnits(amount, 18), token.contractAddress);
      await tx.wait();

      console.log(`Borrowed ${amount} ${token.symbol}`);
    } catch (error) {
      console.error("Error calling borrow function:", error);
    }
  };

  const getWalletBalance = async () => {
    getWalletBalanceRootstock();
    getWalletBalanceNeon();
  };

  const getBalance = async () => {
    // Check if balanceNeon and balanceRootstock are not null
    if (balanceNeon !== null) {
      const total = balanceNeon;
      console.log("total", total);
      setBalance(total);
    } else {
      // Handle the case where either balanceNeon or balanceRootstock is null
      console.error("balanceNeon or balanceRootstock is null.");
    }
  };

  const getToken = async () => {
    const total = tokensNeon;
    console.log("tokens", total);
    setTokens(total);
  };

  useEffect(() => {
    if (connectedAddress) {
      // getBalance();
      // getToken();
      getWalletBalanceNeon();
      getToken();
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
            <Address address={connectedAddress as `0x${string}`} />
          </div>
          <p className="flex justify-center items-center">Balance: {balance !== null ? `${balance}$` : "Loading..."}</p>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-between items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 items-center w-full max-w-xl rounded-3xl mb-8 mx-auto">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p className="my-2 font-medium">Your supplies</p>
              <div className="flex w-full justify-between items-center">
                <p className="font-medium">Asset | Balance</p>
              </div>
              {/* <div className="w-full">
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
              </div> */}
            </div>

            <div className="flex flex-col bg-base-100 px-10 py-10 items-center w-full max-w-xl rounded-3xl mx-auto">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p className="my-2 font-medium">Your borrows</p>
              <div className="flex w-full justify-between items-center">
                <p className="font-medium">Asset | Balance</p>
              </div>
              {/* <div className="w-full">
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
              </div> */}
            </div>
          </div>

          <div className="flex justify-between items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 items-center w-full max-w-xl rounded-3xl mb-8 mx-auto">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p className="my-2 font-medium">Assets to supply</p>
              <div className="flex w-full justify-between items-center">
                <p className="font-medium">Asset | Balance | Chain</p>
              </div>
              <div className="w-full">
                {tokens.map(token => (
                  <div key={token.symbol} className="mb-4 flex justify-between items-center w-full">
                    <p className="flex-grow">
                      {token.symbol} | {token.value} | {token.chain}
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
            <div className="flex flex-col bg-base-100 px-10 py-10 items-center w-full max-w-xl rounded-3xl mx-auto">
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
