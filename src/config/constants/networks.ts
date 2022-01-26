import { ChainId } from '@pancakeswap/sdk'

const NETWORK_URLS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: 'https://api.avax.network/ext/bc/C/rpc',
  [ChainId.TESTNET]: 'https://api.avax-test.network/ext/bc/C/rpc',
}

export default NETWORK_URLS
