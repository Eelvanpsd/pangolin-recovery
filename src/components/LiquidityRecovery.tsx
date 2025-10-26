import React, { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther, isAddress } from 'viem'
import toast from 'react-hot-toast'
import { ArrowRightIcon, BeakerIcon } from '@heroicons/react/24/outline'
import { PANGOLIN_ROUTER_ABI, PANGOLIN_PAIR_ABI } from '../contracts/abis'
import { CONTRACTS } from '../contracts/addresses'

export const LiquidityRecovery: React.FC = () => {
  const { address } = useAccount()
  const [pairAddress, setPairAddress] = useState('')
  const [liquidityAmount, setLiquidityAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { writeContract } = useWriteContract()

  // LP token balance kontrol et
  const { data: lpBalance } = useReadContract({
    abi: PANGOLIN_PAIR_ABI,
    address: isAddress(pairAddress) ? pairAddress as `0x${string}` : undefined,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isAddress(pairAddress))
    }
  }) as { data: bigint | undefined }

  // Token0 ve Token1 bilgilerini al
  const { data: token0 } = useReadContract({
    abi: PANGOLIN_PAIR_ABI,
    address: isAddress(pairAddress) ? pairAddress as `0x${string}` : undefined,
    functionName: 'token0',
    query: {
      enabled: Boolean(isAddress(pairAddress))
    }
  })

  const { data: token1 } = useReadContract({
    abi: PANGOLIN_PAIR_ABI,
    address: isAddress(pairAddress) ? pairAddress as `0x${string}` : undefined,
    functionName: 'token1',
    query: {
      enabled: Boolean(isAddress(pairAddress))
    }
  })

  const handleLiquidityRemoval = async () => {
    if (!pairAddress || !liquidityAmount || !address || !token0 || !token1) {
      toast.error('Please fill all fields and connect wallet')
      return
    }

    if (!isAddress(pairAddress)) {
      toast.error('Invalid pair address')
      return
    }
    
    setIsLoading(true)
    try {
      toast.loading('Preparing liquidity removal transaction...')
      
      const deadline = Math.floor(Date.now() / 1000) + 1200 // 20 minutes
      
      const result = await writeContract({
        abi: PANGOLIN_ROUTER_ABI,
        address: CONTRACTS.PANGOLIN_ROUTER,
        functionName: 'removeLiquidity',
        args: [
          token0,
          token1,
          parseEther(liquidityAmount),
          0n, // amountAMin - 0 for simplicity
          0n, // amountBMin - 0 for simplicity
          address,
          BigInt(deadline)
        ]
      })
      
      toast.dismiss()
      toast.success('Liquidity removal transaction sent!')
      console.log('Liquidity removal transaction:', result)
      
      setPairAddress('')
      setLiquidityAmount('')
      
    } catch (error: any) {
      toast.dismiss()
      console.error('Liquidity removal error:', error)
      
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
        <BeakerIcon className="icon-sm" style={{ color: '#3b82f6' }} />
        <div>
          <h3 className="text-base font-semibold text-white">Liquidity Recovery</h3>
          <p className="text-gray-400 text-xs">Withdraw LP tokens from liquidity pools</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              LP Token Pair Address
            </label>
            <input
              type="text"
              value={pairAddress}
              onChange={(e) => setPairAddress(e.target.value)}
              placeholder="0x..."
              className="pangolin-input"
            />
          </div>

                    <div>
            <label className="text-xs font-medium text-gray-300 mb-1" style={{ display: 'block' }}>
              LP Token Amount
            </label>
            <input
              type="number"
              value={liquidityAmount}
              onChange={(e) => setLiquidityAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              className="pangolin-input"
            />
            {lpBalance && (
              <p className="text-gray-400 text-xs mt-1">
                Available: {lpBalance.toString()} LP tokens
              </p>
            )}
          </div>

          <button
            onClick={handleLiquidityRemoval}
            disabled={!pairAddress || !liquidityAmount || isLoading || !address}
            className="w-full pangolin-button-primary"
            style={{ opacity: (!pairAddress || !liquidityAmount || isLoading || !address) ? 0.5 : 1 }}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <span>Withdraw Liquidity</span>
                <ArrowRightIcon className="icon-xs" />
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-800/50 p-3 rounded-lg">
          <h4 className="text-base font-semibold text-white mb-3">Liquidity Information</h4>
          <div className="space-y-2">
            <div className="p-2 bg-gray-700/50 rounded-lg">
              <div className="text-xs text-gray-400">You will receive</div>
              <div className="text-white font-medium text-sm">Token A + Token B</div>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Minimum Token A:</span>
                <span className="text-white">-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Minimum Token B:</span>
                <span className="text-white">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}