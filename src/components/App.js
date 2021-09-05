import React, { Component } from 'react'
import './App.css'
import EthSwap from '../abis/EthSwap.json'
import Token from '../abis/Token.json'
import NavBar from './NavBar'
import Main from './Main'
import Web3 from 'web3'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    //assign accounts to var
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] }) //1st account is from constructor, second is the value we grabbed
    //console.log(this.state.account)

    const ethBalance = await web3.eth.getBalance(this.state.account) // getting accounts current ethbalance
    this.setState({ ethBalance: ethBalance }) //setting states balance to the current balance
    //console.log(this.state.ethBalance)

    //Load Token
    const networkID = await web3.eth.net.getId()
    const tokenData = Token.networks[networkID]

    if (tokenData) {
      const address = tokenData.address
      const token = new web3.eth.Contract(Token.abi, address) // grabs contract via web3
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call() // have to .call when fetching info from blockchain
      console.log("tokenBalance", tokenBalance.toString())
      this.setState({ tokenBalance: tokenBalance.toString() })
      console.log(token)
    } else {
        window.alert('Token contract not deployed to correct network')
    }

     //Load EthSwap
     const ethSwapData = EthSwap.networks[networkID]
 
     if (ethSwapData) {
       const address = ethSwapData.address
       const ethSwap = new web3.eth.Contract(EthSwap.abi, address) // grabs contract via web3
       this.setState({ ethSwap })
     } else {
         window.alert('EthSwap contract not deployed to correct network')
     }
     console.log(this.state.ethSwap)

     //once loading is done, set loading > False
     this.setState({ loading: false })


     //get number of blocks
     let blockAmount =  await web3.eth.getBlock("latest")
     const transactionCount = blockAmount.transactions.length;
     console.log('Transaction Count:' + transactionCount)
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens()
      .send({ value: etherAmount, from: this.state.account})
        .on('transactionHash', (hash) => {
      this.setState({ loading: false })
    }) //sending is like buying
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods
      .approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account })
        .on('transactionHash', (hash) => {
          this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account })
          .on('transactionHash', (hash) => {
            this.setState({ loading: false })
      })
    }) //selling 2 step process
  }

  constructor(props) {
    super(props);
    this.state = { 
      account: '',
      token: {},
      ethSwap: {},
      loading: true,
      ethBalance: '0',
      tokenBalance: '0',
      blockAmount: '0'
      
    }
  }

  render() {
    //loading
    let content
    if (this.state.loading) {
      content = <p id="loader" className="text-center">Loading Please Wait... </p>
    } else {
      content = <Main 
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }
    return (
      <div>
        <NavBar 
        account={this.state.account}
        />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px'}}>
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
