import React, { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import toast from 'react-hot-toast'
import { ArrowRightIcon, GiftIcon } from '@heroicons/react/24/outline'
import { MINICHEF_V2_ABI } from '../contracts/abis'
import { CONTRACTS } from '../contracts/addresses'

export const StakingRecovery: React.FC = () => {
  const { address } = useAccount()
  const [poolId, setPoolId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { writeContract } = useWriteContract()

  // Pool bilgilerini kontrol et
  const { data: userInfo } = useReadContract({
    abi: MINICHEF_V2_ABI,
    address: CONTRACTS.MINICHEF_V2,
    functionName: 'userInfo',
    args: poolId && address ? [BigInt(poolId), address as `0x${string}`] : undefined,
    query: {
      enabled: !!poolId && !!address
    }
  }) as { data: [bigint, bigint] | undefined }

  // Pending rewards kontrol et
  const { data: pendingReward } = useReadContract({
    abi: MINICHEF_V2_ABI,
    address: CONTRACTS.MINICHEF_V2,
    functionName: 'pendingReward',
    args: poolId && address ? [BigInt(poolId), address as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(poolId && address)
    }
  })

  const handleStakingRecovery = async () => {
    if (!poolId || !address) {
      toast.error('Please enter pool ID and connect wallet')
      return
    }
    
    setIsLoading(true)
    try {
      toast.loading('Preparing withdraw and harvest transaction...')
      
      const result = await writeContract({
        abi: MINICHEF_V2_ABI,
        address: CONTRACTS.MINICHEF_V2,
        functionName: 'withdrawAndHarvest',
        args: [BigInt(poolId), (userInfo as [bigint, bigint] | undefined)?.[0] || 0n, address]
      })
      
      toast.dismiss()
      toast.success('Withdraw and harvest transaction sent!')
      console.log('Staking recovery transaction:', result)
      
    } catch (error: any) {
      toast.dismiss()
      console.error('Staking recovery error:', error)
      
      if (error?.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user')
      } else {
        toast.error('Transaction failed: ' + (error?.shortMessage || error?.message || 'Unknown error'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmergencyWithdraw = async () => {
    if (!poolId || !address) {
      toast.error('Please enter pool ID and connect wallet')
      return
    }
    
    setIsLoading(true)
    try {
      toast.loading('Preparing emergency withdraw transaction...')
      
      const result = await writeContract({
        abi: MINICHEF_V2_ABI,
        address: CONTRACTS.MINICHEF_V2,
        functionName: 'emergencyWithdraw',
        args: [BigInt(poolId), address]
      })
      
      toast.dismiss()
      toast.success('Emergency withdraw transaction sent!')
      console.log('Emergency withdraw transaction:', result)
      
    } catch (error: any) {
      toast.dismiss()
      console.error('Emergency withdraw error:', error)
      
      if (error?.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user')
      } else {
        toast.error('Transaction failed: ' + (error?.shortMessage || error?.message || 'Unknown error'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4" style={{ gap: '8px' }}>
        <GiftIcon className="icon-sm" style={{ color: '#f97316' }} />
        <div>
          <h3 className="text-base font-semibold text-white">Staking Recovery</h3>
          <p className="text-gray-400 text-xs">Withdraw your staked tokens and rewards from MiniChefV2</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Pool ID
            </label>
            <input
              type="number"
              value={poolId}
              onChange={(e) => setPoolId(e.target.value)}
              placeholder="0"
              className="pangolin-input"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={handleStakingRecovery}
              disabled={!poolId || isLoading}
              className="w-full pangolin-button-primary"
              style={{ opacity: (!poolId || isLoading) ? 0.5 : 1 }}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <span>Harvest + Withdraw</span>
                  <ArrowRightIcon className="icon-xs" />
                </>
              )}
            </button>

            <button
              onClick={handleEmergencyWithdraw}
              disabled={!poolId || isLoading}
              className="w-full pangolin-button-secondary"
              style={{ opacity: (!poolId || isLoading) ? 0.5 : 1 }}
            >
              <span>Emergency Withdraw</span>
              <ArrowRightIcon className="icon-xs" />
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 p-3 rounded-lg">
          <h4 className="text-base font-semibold text-white mb-3">Staking Information</h4>
          <div className="space-y-2">
            <div className="p-2 bg-gray-700/50 rounded-lg">
              <div className="text-xs text-gray-400">Staked Amount</div>
              <div className="text-white font-medium text-sm">
                {(userInfo as [bigint, bigint] | undefined)?.[0] ? `${(userInfo as [bigint, bigint])[0].toString()} LP Token` : '- LP Token'}
              </div>
            </div>
            <div className="p-2 bg-gray-700/50 rounded-lg">
              <div className="text-xs text-gray-400">Pending Rewards</div>
              <div className="text-white font-medium text-sm">
                {pendingReward ? `${pendingReward.toString()} PNG Token` : '- PNG Token'}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              <p><strong>Normal Withdraw:</strong> Withdraws both staked tokens and rewards</p>
              <p><strong>Emergency Withdraw:</strong> Only withdraws staked tokens, forfeits rewards</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}