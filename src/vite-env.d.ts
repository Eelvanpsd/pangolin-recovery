/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AVALANCHE_RPC_URL: string
  readonly VITE_AVALANCHE_TESTNET_RPC_URL: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_TESTNET_CHAIN_ID: string
  readonly VITE_PANGOLIN_PAIR_ADDRESS: string
  readonly VITE_MINICHEF_V2_ADDRESS: string
  readonly VITE_PANGOLIN_ROUTER_ADDRESS: string
  readonly VITE_NETWORK_NAME: string
  readonly VITE_NATIVE_CURRENCY_NAME: string
  readonly VITE_NATIVE_CURRENCY_SYMBOL: string
  readonly VITE_NATIVE_CURRENCY_DECIMALS: string
  readonly VITE_BLOCK_EXPLORER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}