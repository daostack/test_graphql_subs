const BN = require('bn.js')

async function getGasPrice(web3) {
  const s = await web3.eth.getGasPrice()
  return new BN(s)
}

module.exports = {
  getGasPrice
}
