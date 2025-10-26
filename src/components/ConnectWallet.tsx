import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { WalletIcon } from '@heroicons/react/24/outline'

export const ConnectWallet: React.FC = () => {
  return (
    <div className="pangolin-card">
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          const ready = mounted && authenticationStatus !== 'loading'
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated')

          if (!ready) {
            return <div style={{ opacity: 0 }}>Loading...</div>
          }

          if (!connected) {
            return (
              <div className="text-center">
                <div className="flex items-center justify-center mb-3" style={{ gap: '8px' }}>
                  <WalletIcon className="icon-sm" style={{ color: '#ff8800' }} />
                  <span className="text-white text-sm font-medium">Connect Wallet</span>
                </div>
                <button onClick={openConnectModal} className="pangolin-button-primary w-full">
                  Connect Wallet
                </button>
              </div>
            )
          }

          if (chain.unsupported) {
            return (
              <button onClick={openChainModal} className="pangolin-button-secondary w-full">
                Wrong Network
              </button>
            )
          }

          return (
            <div className="flex items-center justify-between info-box">
              <div className="flex items-center" style={{ gap: '8px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: 'rgba(255, 136, 0, 0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <WalletIcon className="icon-xs" style={{ color: '#ff8800' }} />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">
                    {account.displayName}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {chain.name}
                  </div>
                </div>
              </div>
              <button
                onClick={openAccountModal}
                style={{
                  color: '#ff8800',
                  fontWeight: '500',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#e67700'}
                onMouseOut={(e) => e.currentTarget.style.color = '#ff8800'}
              >
                Manage
              </button>
            </div>
          )
        }}
      </ConnectButton.Custom>
    </div>
  )
}