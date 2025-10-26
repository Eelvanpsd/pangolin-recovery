import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { config } from './config/web3.ts'
import { ConnectWallet } from './components/ConnectWallet.tsx'
import { LiquidityTracker } from './components/LiquidityTracker.tsx'
import { Header } from './components/Header.tsx'
import { Footer } from './components/Footer.tsx'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a' }}>
            <Header />
            <main className="main-content">
              <div className="container">
                {/* Stats Section */}
                <div className="grid grid-cols-2 mb-4">
                  <div className="pangolin-stats-card">
                    <div className="text-gray-400 text-sm mb-1">Recovery Tool</div>
                    <div className="text-white text-xl font-bold">Active</div>
                    <div className="text-gray-400 text-xs">{new Date().toLocaleDateString()} (UTC)</div>
                  </div>
                  <div className="pangolin-stats-card">
                    <div className="text-gray-400 text-sm mb-1">Network</div>
                    <div className="text-white text-xl font-bold">Avalanche</div>
                    <div className="text-gray-400 text-xs">C-Chain Mainnet</div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold pangolin-gradient-text mb-2">
                      Pangolin Recovery Tool
                    </h1>
                    <p className="text-gray-400 text-sm" style={{ maxWidth: '500px', margin: '0 auto' }}>
                      Safely recover your tokens and liquidity from the Pangolin protocol on Avalanche C-Chain.
                    </p>
                  </div>
                  
                  <ConnectWallet />
                  <LiquidityTracker />
                </div>
              </div>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#2d2d2d',
                  color: '#fff',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                },
              }}
            />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
