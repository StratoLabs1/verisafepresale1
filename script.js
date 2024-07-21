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

  const connectWalletButton = document.getElementById('connect-wallet');
  const buyButton = document.getElementById('buy-now');
  const usdtAmountInput = document.getElementById('usdt-amount');
  const claimButton = document.getElementById('claim-tokens');
  let userAddress;

  connectWalletButton.addEventListener('click', async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = web3.currentProvider.selectedAddress;
      web3.setProvider(new Web3.providers.HttpProvider('https://arb1.arbitrum.io/rpc')); // Connect to Arbitrum One
      connectWalletButton.textContent = "Wallet Connected: " + userAddress;
      connectWalletButton.disabled = true;
      claimButton.style.display = 'block';
    } catch (error) {
      alert("Error connecting wallet: " + error.message);
    }
  });

  buyButton.addEventListener('click', async () => {
    const usdtAmount = usdtAmountInput.value;

    if (!usdtAmount || usdtAmount < 10) {
      alert("Please enter a valid amount greater than or equal to $10.");
      return;
    }

    try {
      await presaleContract.methods.buyTokens(web3.utils.toWei(usdtAmount, 'ether')).send({
        from: userAddress,
        value: 0 // Since we are using USDT, no ETH is required.
      });
      alert("Tokens purchased successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    }
  });

  claimButton.addEventListener('click', async () => {
    try {
      await presaleContract.methods.claimTokens().send({ from: userAddress });
      alert("Tokens claimed successfully!");
    } catch (error) {
      alert("Error claiming tokens: " + error.message);
    }
  });

  // Example of sending data back to Telegram bot
  tg.sendData(JSON.stringify({
    event: 'connect',
    data: {
      wallet: userAddress
    }
  }));
});
