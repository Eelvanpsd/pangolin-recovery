import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { avalanche, avalancheFuji } from 'wagmi/chains'
import { http, fallback } from 'viem'

export const config = getDefaultConfig({
  appName: 'Pangolin Recovery Tool',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [avalanche, avalancheFuji],
  ssr: false,
  transports: {
    [avalanche.id]: fallback([
      http('https://api.avax.network/ext/bc/C/rpc'),
      http('https://rpc.ankr.com/avalanche'),
      http('https://avalanche.drpc.org'),
    ]),
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
  },
})

// Contract addresses
export const CONTRACT_ADDRESSES = {
  PANGOLIN_PAIR: import.meta.env.VITE_PANGOLIN_PAIR_ADDRESS || '0xbd918Ed441767fe7924e99F6a0E0B568ac1970D9',
  MINICHEF_V2: import.meta.env.VITE_MINICHEF_V2_ADDRESS || '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928',
  PANGOLIN_ROUTER: import.meta.env.VITE_PANGOLIN_ROUTER_ADDRESS || '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
} as const

// Network configuration
export const NETWORK_CONFIG = {
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '43114'),
  testnetChainId: parseInt(import.meta.env.VITE_TESTNET_CHAIN_ID || '43113'),
  rpcUrl: import.meta.env.VITE_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc',
  testnetRpcUrl: import.meta.env.VITE_AVALANCHE_TESTNET_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
  blockExplorerUrl: import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://snowtrace.io',
} as const