const { assert } = require('chai');

const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')
const ODToken = artifacts.require("ODToken");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

// deployer = 1st account, investor - 2nd account
contract('EthSwap', ([deployer, investor]) => {
  let token, ethSwap

  before(async () => {
    token = await Token.new()
    ethSwap = await EthSwap.new(token.address)
    // Transfer all tokens to EthSwap (1 million)
    await token.transfer(ethSwap.address, tokens('1000000'))
  })

  describe('Token deployment', async () => {
    it('contract has a name', async () => {
      const name = await token.name()
      assert.equal(name, 'DApp Token')
    })
  })

  describe('EthSwap deployment', async () => {
    it('contract has a name', async () => {
      const name = await ethSwap.name()
      assert.equal(name, 'EthSwap Instant Exchange')
    })

    it('contract has tokens', async () => {
      let balance = await token.balanceOf(ethSwap.address)
      assert.equal(balance.toString(), tokens('1000000'))
    })
  })
    
  describe('buyTokens()', async () => {
      let result
    before(async () => {
        // Purchase tokens before each example
        result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
      })

      it('Allows user to instantly purchase tokens from ethswap for a fixed price', async () => {
          //Check investor token balance after purchase
        let investorBalance = await token.balanceOf(investor)
        assert.equal(investorBalance.toString(), tokens('100'))

        let ethSwapBalance
        ethSwapBalance = await token.balanceOf(ethSwap.address)
        assert.equal(ethSwapBalance.toString(), tokens('999900')) //ethswap loses 100 dapp tokens
        ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
        assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1','Ether')) //ethswap got 1 ether

         // return part of event
        const event = result.logs[0].args
        assert.equal(event.account, investor)
        assert.equal(event.token, token.address)
        assert.equal(event.amount.toString(), tokens('100').toString())
        assert.equal(event.rate.toString(), '100')
      }) 
  })

  describe('sellTokens()', async () => {
        let result
        before(async () => {
            //investor approves purchase
            await token.approve(ethSwap.address, tokens('100'), { from: investor }) //approve token before transferring from
            //Investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), { from: investor })
        })

        it('Allows user to instantly sell tokens from ethswap for eth', async () => {
                 //Check investor token balance after purchase
                let investorBalance = await token.balanceOf(investor)
                assert.equal(investorBalance.toString(), tokens('0'))

                let ethSwapBalance
                ethSwapBalance = await token.balanceOf(ethSwap.address)
                assert.equal(ethSwapBalance.toString(), tokens('1000000')) //ethswap back to 1 mil
                ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
                assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0','Ether')) //ethswap trades ether

                 // return part of event
                const event = result.logs[0].args
                assert.equal(event.account, investor)
                assert.equal(event.token, token.address)
                assert.equal(event.amount.toString(), tokens('100').toString())
                assert.equal(event.rate.toString(), '100')

                //FAILURE: investor cant sell more than they have
                await ethSwap.sellTokens(tokens('500'), { from: investor }).should.be.rejected;
        
        }) 
    })

})