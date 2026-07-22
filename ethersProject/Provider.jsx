import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

export const CF_CONTRACT_ADDRESS = "0xE3e51aa40B24756f0268df489789B8a4f4D48A78";

export const cfAbi = [
  "function launch(string _title, string _description, uint _goal, uint32 _startAt, uint32 _endAt) external",
  "function cancel(uint _id) external",
  "function pledge(uint _id) external payable",
  "function unpledge(uint _id, uint _amount) external",
  "function claim(uint _id) external",
  "function refund(uint _id) external",
  "function count() view returns (uint)",
  "function campaigns(uint) view returns (string title, string description, address creator, uint goal, uint pledged, uint32 startAt, uint32 endAt, bool claimed)",
  "function pledgedAmount(uint, address) view returns (uint)",
  "event Launch(uint id, address indexed creator, uint goal, uint32 startAt, uint32 endAt)",
  "event Cancel(uint id)",
  "event Pledge(uint indexed id, address indexed caller, uint amount)",
  "event Unpledge(uint indexed id, address indexed caller, uint amount)",
  "event Claim(uint id)",
  "event Refund(uint id, address indexed caller, uint amount)"
];

// 1. Create the Context
const WalletContext = createContext();

// 2. Create the Provider Component
export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState("");
  const [cfContract, setCfContract] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CF_CONTRACT_ADDRESS, cfAbi, signer);
      const userAddress = await signer.getAddress();

      setAddress(userAddress);
      setCfContract(contract);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setCfContract(null);
  };

  return (
    <WalletContext.Provider value={{ address, cfContract, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

// 3. Custom Hook to use the wallet context easily
export const useWallet = () => useContext(WalletContext);