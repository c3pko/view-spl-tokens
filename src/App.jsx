import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js'; //npm install @solana/web3.js 
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'; //npm i @solana/spl-token
import { Program, Provider, web3 } from '@project-serum/anchor';
import './App.css';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;


const USER_TOKENS = []
//filter by user tokens + balance to display

const App = () => {
  // State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [tokenList, setTokenList] = useState([]);
  
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        
          console.log("getting token balance");
          const connection = new web3.Connection("https://api.mainnet-beta.solana.com", "confirmed");
          const mintAccount = new web3.PublicKey(
            "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm"
            //check for USDC
          );
 
          console.log("walletAddress");
          console.log(response.publicKey.toString());
          const walletAccount = new web3.PublicKey(response.publicKey.toString());
          let tokenBalance = await connection.getTokenAccountsByOwner(
            walletAccount, {mint: mintAccount})
          console.log("tokenBalance");
          console.log(tokenBalance);

    
          const walletToQuery = walletAccount;

          const accounts = await connection.getParsedProgramAccounts(
            TOKEN_PROGRAM_ID, 
            {
              filters: [
                {
                  dataSize: 165, // number of bytes
                },
                {
                  memcmp: {
                    offset: 32, // number of bytes
                    bytes: walletToQuery, // base58 encoded string
                  },
                },
              ],
            }
          );
        console.log(accounts);


        console.log("mint authority:", accounts[0].account.data.parsed.info.mint);
        const mint_authority = new web3.PublicKey(accounts[0].account.data.parsed.info.mint);
        console.log("mint_authority:", mint_authority);
        const account_info = await connection.getAccountInfo(mint_authority);
        console.log(account_info);
        const sol_token = "So11111111111111111111111111111111111111112";
        const btc_token =  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E";
        const usdc_token = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
        const eth_token = "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs"; //"Ether (Wormhole)"
        const token_list = [sol_token, btc_token, usdc_token, eth_token];
        const token_names = [
            {"mintAddress": "So11111111111111111111111111111111111111112", "tokenName": "SOL"},
            {"mintAddress": "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", "tokenName": "BTC"},
            {"mintAddress": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "tokenName": "USDC"},
            {"mintAddress": "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", "tokenName": "ETH"}
          ]
        
 
        // console.table(token_list);

        //console.log(`Found ${accounts.length} token account(s) for wallet ${wallet}.`);
        accounts.forEach((account, i) => {
            //Parse the account data
        
          const parsedAccountInfo = account.account.data;
          const mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
          const tokenBalance = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
          console.log(typeof mintAddress);


          const temp = {"mintAddress": mintAddress, "tokenBalance": tokenBalance.toFixed(2)}
          //need to add tokenName
          if (temp.tokenBalance > 0) {
            USER_TOKENS.push(temp);
          }
            
        });
        console.log("user tokens", USER_TOKENS)
        
        let table = document.querySelector("table");
        let data = Object.keys(USER_TOKENS[0]);
        generateTableHead(table, data);
        generateTable(table, USER_TOKENS);
        function generateTableHead(table, data) {
          let thead = table.createTHead();
          let row = thead.insertRow();
          for (let key of data) {
            let th = document.createElement("th");
            let text = document.createTextNode(key);
            th.appendChild(text);
            row.appendChild(th);
          }
        }
      
        function generateTable(table, data) {
          for (let element of data) {
            let row = table.insertRow();
            console.log(element)
            const keys = Object.keys(element);
            console.log("keys", keys)
            for (let key in keys) {
              console.log("key =", keys[key])
              console.log("element[key]", element[keys[key]])
              let cell = row.insertCell();
              let text = document.createTextNode(element[keys[key]]);
              cell.appendChild(text);
            }
          }
        }
      }
    

        
        } else {
          alert('Solana object not found! Get a Phantom Wallet 👻');
        }
    } catch (error) {
      console.log(error);
    }
  };
 
  const connectWallet = async () => {
    const { solana } = window;
  
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };


  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };


  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    
 

    <div className="connected-container">
      <div>
        
        {USER_TOKENS.map((token, index) => {
          return (
            <div key={index}>
              <h2>mintAddress: {token.mintAddress}</h2>
              <h2>tokenBalance: {token.tokenBalance}</h2>
              <hr />
            </div>
          );
        })}
        <hr />
        <hr />
        <hr />
        <hr />
      </div>
    </div>
  };

  // UseEffects
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
  if (walletAddress) {
    console.log('Fetching Token list...');
    
    // Call Solana program here.

    // Set state
    setTokenList(tokenList);
  }
}, [walletAddress]);
  //if you have a walletAddress, go ahead and run the fetch logic

  return (
      <div className="App">
          
        
  			<div className={walletAddress ? 'authed-container' : 'container'}>

          
          <div className="header-container">
            <p className="header"> Token Portal</p>
            <p className="sub-text">
              View your spl tokens
            </p>
            <h5 className="notice"> Note: You may need to refresh the page after connecting your wallet </h5>
            {/* Add the condition to show this only if we don't have a wallet address */}
            {!walletAddress && renderNotConnectedContainer()}
            {walletAddress && renderConnectedContainer()}
          </div>
          
        </div>
      </div>
    );
  };

export default App;