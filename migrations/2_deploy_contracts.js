const Token = artifacts.require("Token");
const ODToken = artifacts.require("ODToken");
const EthSwap = artifacts.require("EthSwap");

//Truffle console fix; set global = this

module.exports = async function(deployer) {
  // Deploy Token
  await deployer.deploy(Token);
  const token = await Token.deployed()

  // Deploy ODToken
  await deployer.deploy(ODToken);
  const odToken = await ODToken.deployed()

  // Deploy EthSwap
  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed()

  // Transfer all tokens to EthSwap (1 million)
  await token.transfer(ethSwap.address, '1000000000000000000000000')

  // Transfer all tokens to EthSwap (1 million)
  await odToken.transfer(ethSwap.address, '1000000000000000000000000')
};