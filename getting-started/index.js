import {ethers} from "ethers";

const provider = new ethers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/0SCqvG5MyH4Eb5v2IlPE_");

function getBlockNumber() {
    provider.getBlockNumber().then((blockNumber) => {
        console.log("Current block number: " + blockNumber);
    });
}

getBlockNumber();

function getBalance(address) {
    provider.getBalance(address).then((balance) => {
        console.log("Balance of " + address + ": " + ethers.formatEther(balance) + " ETH");
    });
}

getBalance("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");

function getTransactionCount(address) {
    provider.getTransactionCount(address).then((transactionCount) => {
        console.log("Transaction count of " + address + ": " + transactionCount);
    });
}

getTransactionCount("0x742d35Cc6634C0532925a3b844Bc454e4438f44e");
