// Pangolin contract addresses on Avalanche C-Chain
export const CONTRACTS = {
  // PangolinFactory - Pair creation contract
  PANGOLIN_FACTORY: '0xefa94DE7a4656D787667C749f7E1223D71E9FD88' as const,
  
  // MiniChefV2 - Staking contract
  MINICHEF_V2: '0x1f806f7C8dED893fd3caE279191ad7Aa3798E928' as const,
  
  // PangolinRouter - Liquidity operations
  PANGOLIN_ROUTER: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106' as const,
  
  // Common token addresses
  TOKENS: {
    PNG: '0x60781C2586D68229fde47564546784ab3fACA982' as const,
    AVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' as const, // WAVAX
    USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' as const, // USDC (native)
    USDCe: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' as const, // USDC.e (bridged)
    USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7' as const, // USDT (native)
    USDTe: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118' as const, // USDT.e (bridged)
    DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70' as const, // DAI.e
    WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB' as const, // WETH.e
    WBTC: '0x50b7545627a5162F82A992c33b87aDc75187B218' as const, // WBTC.e
    LINK: '0x5947BB275c521040051D82396192181b413227A3' as const, // LINK.e
    QI: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5' as const, // QI
    XAVA: '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4' as const, // XAVA
    JOE: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd' as const, // JOE
    YAK: '0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7' as const, // YAK
    SNOB: '0xC38f41A296A4493Ff429F1238e030924A1542e50' as const, // SNOB
  }
} as const

// Pool IDs for MiniChefV2 staking
export const POOL_IDS = {
  AVAX_PNG: 0,
  USDC_AVAX: 1,
  USDT_AVAX: 2,
  WETH_AVAX: 3,
  USDC_PNG: 4,
} as const

// Import all tokens from auto-generated file
export { ALL_PANGOLIN_TOKENS } from './all-tokens'

// Main tokens - These are the most popular tokens to scan first (optimized for speed)
// After these, we'll scan ALL_PANGOLIN_TOKENS for comprehensive coverage
export const PRIORITY_TOKENS = [
  // Core tokens (always scan)
  { symbol: 'WAVAX', address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' }, // Wrapped AVAX
  { symbol: 'PNG', address: '0x60781C2586D68229fde47564546784ab3fACA982' }, // Pangolin
  
  // Stablecoins (high volume)
  { symbol: 'USDC', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E' }, // Native USDC
  { symbol: 'USDC.e', address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' }, // Bridged USDC
  { symbol: 'USDT', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7' }, // Native USDT
  { symbol: 'USDT.e', address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118' }, // Bridged USDT
  { symbol: 'DAI.e', address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70' }, // DAI
  { symbol: 'FRAX', address: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64' }, // Frax
  
  // Major crypto assets
  { symbol: 'WETH.e', address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB' }, // Wrapped Ethereum
  { symbol: 'WBTC.e', address: '0x50b7545627a5162F82A992c33b87aDc75187B218' }, // Wrapped Bitcoin
  { symbol: 'LINK.e', address: '0x5947BB275c521040051D82396192181b413227A3' }, // Chainlink
  { symbol: 'AAVE.e', address: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9' }, // Aave
  { symbol: 'BNB', address: '0x264c1383EA520f73dd837F915ef3a732e204a493' }, // Binance
  
  // Avalanche DeFi ecosystem
  { symbol: 'QI', address: '0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5' }, // Benqi
  { symbol: 'XAVA', address: '0xd1c3f94DE7e5B45fa4eDBBA472491a9f4B166FC4' }, // Avalaunch
  { symbol: 'JOE', address: '0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd' }, // Trader Joe
  { symbol: 'YAK', address: '0x59414b3089ce2AF0010e7523Dea7E2b35d776ec7' }, // Yield Yak
  { symbol: 'SNOB', address: '0xC38f41A296A4493Ff429F1238e030924A1542e50' }, // Snowball
  { symbol: 'PEFI', address: '0xe896CDeaAC9615145c0cA09C8Cd5C25bced6384c' }, // Penguin Finance
  { symbol: 'LYD', address: '0x4C9B4E1AC6F24CdE3660D5E4Ef1eBF77C710C084' }, // Lydia Finance
  { symbol: 'GDL', address: '0xD606199557c8Ab6F4Cc70bD03FaCc96ca576f142' }, // Gondola
  { symbol: 'CYCLE', address: '0x81440C939f2C1E34fc7048E518a637205A632a74' }, // Cycle
  { symbol: 'SHERPA', address: '0xa5E59761eBD4436fa4d20E1A27cBa29FB2471Fc6' }, // Sherpa
  
  // Additional popular tokens
  { symbol: 'sAVAX', address: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE' }, // Staked AVAX (Benqi)
  { symbol: 'GMX', address: '0x62edc0692BD897D2295872a9FFCac5425011c661' }, // GMX
  { symbol: 'THOR', address: '0x8F47416CaE600bccF9530E9F3aeaA06bdD1Caa79' }, // THORSwap
] as const

// Export ALL tokens for comprehensive scanning
// Use PRIORITY_TOKENS first for common pairs, then use ALL_PANGOLIN_TOKENS for full coverage