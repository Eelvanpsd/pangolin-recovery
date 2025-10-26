import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { TokenRecovery } from './TokenRecovery'
import { LiquidityRecovery } from './LiquidityRecovery.tsx'
import { StakingRecovery } from './StakingRecovery.tsx'
import { 
  CurrencyDollarIcon, 
  BeakerIcon, 
  GiftIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline'

type Tab = 'tokens' | 'liquidity' | 'staking'

export const PangolinRecovery: React.FC = () => {
  const { isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<Tab>('tokens')

  const tabs = [
    { id: 'tokens' as Tab, name: 'Token Recovery', icon: CurrencyDollarIcon },
    { id: 'liquidity' as Tab, name: 'Liquidity Recovery', icon: BeakerIcon },
    { id: 'staking' as Tab, name: 'Staking Recovery', icon: GiftIcon },
  ]

  if (!isConnected) {
    return (
      <div className="pangolin-card text-center">
        <InformationCircleIcon className="icon-md" style={{ color: '#9ca3af', margin: '0 auto 16px' }} />
        <h3 className="text-lg font-semibold text-white mb-2">Wallet Connection Required</h3>
        <p className="text-gray-400 text-sm">
          Please connect your wallet first to start recovery operations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="pangolin-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Recovery Operations</h2>
          <div className="text-xs text-gray-400">Select Operation Type</div>
        </div>
        
        <div className="flex" style={{ gap: '4px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pangolin-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="icon-xs" />
                <span className="font-medium" style={{ fontSize: '10px' }}>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pangolin-card">
        {activeTab === 'tokens' && <TokenRecovery />}
        {activeTab === 'liquidity' && <LiquidityRecovery />}
        {activeTab === 'staking' && <StakingRecovery />}
      </div>
    </div>
  )
}