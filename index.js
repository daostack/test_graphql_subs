/**
 *
 * Bot for betting on proposals
 *
 */

const { setupArc, waitUntilTrue } = require('./utils')
const BN = require("bn.js")

async function createAProposal(
  dao,
  scheme
) {

  const options  = {
    beneficiary: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    ethReward: new BN('300'),
    externalTokenAddress: undefined,
    externalTokenReward: new BN('0'),
    nativeTokenReward: new BN('1'),
    periodLength: 0,
    periods: 1,
    reputationReward: new BN('10'),
    scheme
  }

  const response = await dao.createProposal(options).send()
  const proposal = response.result
  // wait for the proposal to be indexed
  return proposal
}

async function main() {
  const arc = await setupArc()
  const daos = await arc.daos().first()
  const dao = daos[0]
  const schemes = await dao.schemes({where: {name: 'ContributionReward'}}).first()
  const scheme = schemes[0]
  const schemeState = await scheme.state().first()
  // const proposalsToConsider = await arc.proposals({where: {stage: IProposalStage.PreBoosted}, orderBy: 'createdAt', orderDirection:'desc'}).first()
  // const proposal = proposalsToConsider[0]
  // const subscriptionResults = []
  // // subscribe to updates
  // proposal.state().subscribe((newState) => {
  //   subscriptionResults.push(newState)
  //   // console.log(newState)
  //   console.log('newState')
  //   console.log(subscriptionResults.length)
  // })
  // we stake on this proposal
  console.log(`subscribe to proposal query`)
  const subResults = []
  dao.proposals().subscribe((x) => {
    subResults.push(x)
  })
  console.log(`creating proposal (may take some time)`)
  const proposal = await createAProposal(dao, schemeState.address)
  console.log(`created proposal ${proposal.id}`)

  console.log(`waiting for subscription to return (if this times out, the subscription is not working)`)
  // console.log(result)
  await waitUntilTrue(() => {
    return subResults.length > 1
  })
  console.log(`check if proposal.id ${proposal.id} is among the results`)
  const proposalIds = subResults[subResults.length -1].map((p) => p.id)
  if (proposalIds.indexOf(proposal.id) < 0) {
    console.error(`Somethings is wrong - the new proposal id was not found among the results`)
  }

  console.log(`done`)

  process.exit(0)
}

main().catch((err) => { console.log(err); process.exit(0)})
