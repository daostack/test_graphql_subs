const { Arc } = require("@daostack/client")
const NETWORK = process.env.NETWORK
const BN = require("bn.js")

const secrets = require("./secrets.json")
const PRIVATE_KEY = secrets[NETWORK]["private_key"].toLowerCase()

const logMessages = {
  debug: [],
  mail:[]
}
function log(msg, whereto="debug") {
  console.log(msg)
  logMessages[whereto].push(msg)
  if (whereto === 'mail') {
    logMessages['debug'].push(msg)
  }
}

function weiToEth(n) {
  return n.div(new BN(10).pow(new BN(15))).toNumber()/1000
}

async function setupArc() {

  let settings
  if (NETWORK === "mainnet") {
    settings = {
      graphqlHttpProvider: process.env.ARC_GRAPHQLHTTPPROVIDER || "https://api.thegraph.com/subgraphs/name/daostack/v28_0",
      graphqlWsProvider: process.env.ARC_GRAPHQLWSPROVIDER || "wss://api.thegraph.com/subgraphs/name/daostack/v28_0",
      web3Provider: process.env.ARC_WEB3PROVIDER || "wss://mainnet.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2",
      web3ProviderRead: process.env.ARC_WEB3PROVIDERREAD || "wss://mainnet.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2",
      ipfsProvider: process.env.ARC_IPFSPROVIDER || {
        "host": process.env.ARC_IPFSPROVIDER_HOST || "api.thegraph.com",
        "port": process.env.ARC_IPFSPROVIDER_PORT || "443",
        "protocol": process.env.ARC_IPFSPROVIDER_PROTOCOL || "https",
        "api-path": process.env.ARC_IPFSPROVIDER_API_PATH || "/ipfs-daostack/api/v0/"
      }
    }
  } else if (NETWORK === "rinkeby") {
    settings = {
      graphqlHttpProvider: process.env.ARC_GRAPHQLHTTPPROVIDER || "https://api.thegraph.com/subgraphs/name/daostack/v28_0_rinkeby",
      graphqlWsProvider:  process.env.ARC_GRAPHQLWSPROVIDER || "wss://api.thegraph.com/subgraphs/name/daostack/v28_0_rinkeby",
      web3Provider:  process.env.ARC_WEB3PROVIDER || "wss://rinkeby.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2",
      web3ProviderRead:  process.env.ARC_WEB3PROVIDERREAD || "wss://rinkeby.infura.io/ws/v3/e0cdf3bfda9b468fa908aa6ab03d5ba2",
      ipfsProvider: process.env.ARC_IPFSPROVIDER || {
        "host": process.env.ARC_IPFSPROVIDER_HOST || "api.thegraph.com",
        "port": process.env.ARC_IPFSPROVIDER_PORT || "443",
        "protocol": process.env.ARC_IPFSPROVIDER_PROTOCOL || "https",
        "api-path": process.env.ARC_IPFSPROVIDER_API_PATH || "/ipfs-daostack/api/v0/"
      }
    }

  } else if (NETWORK === "local") {
    settings = {
      graphqlHttpProvider: "http://127.0.0.1:8000/subgraphs/name/daostack",
      graphqlWsProvider: "ws://127.0.0.1:8001/subgraphs/name/daostack",
      web3Provider: "ws://127.0.0.1:8545",
      web3ProviderRead: "ws://127.0.0.1:8545",
      ipfsProvider: "localhost"
    }


  } else {
    throw Error(`unknown network ${NETWORK}`)
  }
  const arc = new Arc(settings)
  await arc.fetchContractInfos()

  const ACCOUNT = arc.web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY)
  arc.web3.eth.accounts.wallet.add(PRIVATE_KEY)
  console.log(`using account ${ACCOUNT.address}`)
  arc.web3.eth.defaultAccount = ACCOUNT.address

  async function getAccountInfo() {
    const balance = await arc.GENToken().balanceOf(ACCOUNT.address).first()
    log(`account ${ACCOUNT.address}`)
    log(`balance: ${weiToEth(balance)} GEN`)
    const ethBalance = new BN(await arc.web3.eth.getBalance(ACCOUNT.address))
    log(`balance: ${weiToEth(ethBalance)} ETH`)
  }
  await getAccountInfo()
  return arc
}

function linkToProposal(daoId, proposalId) {
  const link = `https://alchemy.daostack.io/dao/${daoId}/proposal/${proposalId}`
  return link
}

async function waitUntilTrue(test) {
  return new Promise((resolve) => {
    (async function waitForIt() {
      if (await test()) { return resolve() }
      setTimeout(waitForIt, 100)
    })()
  })
}

module.exports = {
  setupArc,
  weiToEth,
  linkToProposal,
  log,
  logMessages,
  waitUntilTrue
}
