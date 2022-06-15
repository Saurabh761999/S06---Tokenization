import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = {
    loaded: false,
    kycAddress: "0x123...",
    tokenSaleAddress: null,
    userTokens: 0,
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] &&
          MyToken.networks[this.networkId].address
      );

      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] &&
          MyTokenSale.networks[this.networkId].address
      );
      this.kycInstance = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] &&
          KycContract.networks[this.networkId].address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.listenToTokenTransfer();
      this.setState(
        {
          loaded: true,
          tokenSaleAddress: MyTokenSale.networks[this.networkId].address,
        },
        this.updateUserTokens
      );
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  updateUserTokens = async () => {
    let userTokens = await this.tokenInstance.methods
      .balanceOf(this.accounts[0])
      .call();
    this.setState({ userTokens: userTokens });
  };

  listenToTokenTransfer = () => {
    this.tokenInstance.events
      .Transfer({ to: this.accounts[0] })
      .on("data", this.updateUserTokens);
  };

  handleBuyTokens = async () => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({
      from: this.accounts[0],
      value: this.web3.utils.toWei("1", "wei"),
    });
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  handleKycWhitelisting = async () => {
    await this.kycInstance.methods
      .setKycCompleted(this.state.kycAddress)
      .send({ from: this.accounts[0] });
    alert("KYC for " + this.state.kycAddress + " is completed");
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
      
        <div class="imagess">
        <nav class="navbar navbar-dark bg-dark ">
          <div class="container-fluid">
            <span class="navbar-brand">
              <h1>StarDuck's Cappucino Token Sale </h1>
            </span>
          </div>
        </nav>
        <br></br>
        <br></br>
        <br></br>
        
        <p>Get your Tokens today!</p>
        <div class="first card text-bg-secondary mb-3">
          <div class="card-header">
            <h2>Kyc Whitelisting</h2>
          </div>
          <div class="card-body">
            <p class="card-text">
              Address to allow:{" "}
              <input
              class="input1"
                type="text"
                name="kycAddress"
                value={this.state.kycAddress}
                onChange={this.handleInputChange}
              />
              <button class="but1" type="button" onClick={this.handleKycWhitelisting}>
                Add to Whitelist
              </button>
            </p>
            <p>Only Whitelisted Accounts are Allowed to Purchase Tokens from their favourite coffee cafe i.e <bold>StarDuck's Cafe</bold></p>
            
          </div>
        </div>
        <div class="sec card text-bg-secondary mb-3">
          <div class="card-header">
            <h2>Buy Tokens</h2>
          </div>
          <div class="card-body">
            <p class="card-text">
              If you want to buy tokens, send Wei to this address:{" "}
              {this.state.tokenSaleAddress}
              <br></br>
              <p>You currently have: <bold>{this.state.userTokens} </bold>CAPPU Tokens</p>
              <button  class="but2" type="button" onClick={this.handleBuyTokens}>
                Buy more tokens
              </button>
            </p>
          </div>
        </div>
      </div>
      </div>
    );
  }
}

export default App;
