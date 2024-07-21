// script.js
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
    } else {
        alert("MetaMask is not installed. Please install it to use this feature.");
        return;
    }

    const tg = window.Telegram.WebApp;
    tg.ready(); // This tells Telegram that the web app is ready

    const contractAddress = '0xYourPresaleContractAddress';
    const contractABI = [ /* ABI from your compiled contract */ ];
    const presaleContract = new web3.eth.Contract(contractABI, contractAddress);

    const connectWalletButton = document.getElementById('connectWallet');
    const purchaseForm = document.getElementById('purchaseForm');
    const claimTokensButton = document.getElementById('claimTokens');
    let userAddress;

    connectWalletButton.addEventListener('click', async () => {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAddress = web3.currentProvider.selectedAddress;
            web3.setProvider(new Web3.providers.HttpProvider('https://arb1.arbitrum.io/rpc')); // Connect to Arbitrum One
            connectWalletButton.style.display = 'none';
            purchaseForm.style.display = 'block';
            claimTokensButton.style.display = 'block';
            document.getElementById('status').innerText = "Wallet connected: " + userAddress;
        } catch (error) {
            document.getElementById('status').innerText = "Error connecting wallet: " + error.message;
        }
    });

    purchaseForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const amount = document.getElementById("amount").value;

        try {
            await presaleContract.methods.buyTokens(web3.utils.toWei(amount, 'ether')).send({
                from: userAddress,
                value: 0  // Since we are using USDT, no ETH is required.
            });
            document.getElementById("status").innerText = "Tokens purchased successfully!";
        } catch (error) {
            document.getElementById("status").innerText = "Error: " + error.message;
        }
    });

    claimTokensButton.addEventListener('click', async () => {
        try {
            await presaleContract.methods.claimTokens().send({ from: userAddress });
            document.getElementById("status").innerText = "Tokens claimed successfully!";
        } catch (error) {
            document.getElementById("status").innerText = "Error claiming tokens: " + error.message;
        }
    });

    // Use Telegram Web App API to communicate with the bot
    tg.onEvent('mainButtonClicked', () => {
        // Handle main button click event
    });

    tg.onEvent('viewportChanged', (height) => {
        // Handle viewport change event
    });

    // Example of sending data back to Telegram bot
    tg.sendData(JSON.stringify({
        event: 'connect',
        data: {
            wallet: userAddress
        }
    }));
});
