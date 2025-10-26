import React, { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseEther, formatEther, isAddress } from 'viem'
import toast from 'react-hot-toast'
import { ArrowRightIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { ERC20_ABI } from '../contracts/abis'

export const TokenRecovery: React.FC = () => {
  const { address } = useAccount()
  const [tokenAddress, setTokenAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { writeContract } = useWriteContract()

  // Token balance kontrolü
  const { data: tokenBalance } = useReadContract({
    abi: ERC20_ABI,
    address: isAddress(tokenAddress) ? tokenAddress as `0x${string}` : undefined,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isAddress(tokenAddress))
    }
  })

  // Token symbol
  const { data: tokenSymbol } = useReadContract({
    abi: ERC20_ABI,
    address: isAddress(tokenAddress) ? tokenAddress as `0x${string}` : undefined,
    functionName: 'symbol',
    query: {
      enabled: Boolean(isAddress(tokenAddress))
    }
  })

  const handleTokenRecovery = async () => {
    if (!tokenAddress || !amount || !address) {
      toast.error('Please fill all fields and connect wallet')
      return
    }

    if (!isAddress(tokenAddress)) {
      toast.error('Invalid token address')
      return
    }
    
    setIsLoading(true)
    try {
      toast.loading('Preparing token recovery transaction...')
      
      const result = await writeContract({
        abi: ERC20_ABI,
        address: tokenAddress as `0x${string}`,
        functionName: 'transfer',
        args: [address, parseEther(amount)]
      })
      
      toast.dismiss()
      toast.success('Token recovery transaction sent!')
      console.log('Transaction sent:', result)
      
      setTokenAddress('')
      setAmount('')
      
    } catch (error: any) {
      toast.dismiss()
      console.error('Token recovery error:', error)
      
      if (error?.message?.includes('User rejected')) {
        toast.error('Transaction cancelled by user')
      } else if (error?.message?.includes('insufficient funds')) {
        toast.error('Insufficient funds for gas')
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
        <CurrencyDollarIcon className="icon-sm" style={{ color: '#ff8800' }} />
        <div>
          <h3 className="text-base font-semibold text-white">Token Recovery</h3>
          <p className="text-gray-400 text-xs">Recover ERC-20 tokens sent to wrong addresses</p>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <div className="flex items-start" style={{ gap: '8px' }}>
          <ExclamationTriangleIcon className="icon-sm" style={{ color: '#eab308', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 className="text-yellow-400 font-semibold text-sm">Important Warning</h4>
            <p className="text-yellow-200 text-xs mt-1">
              Double-check everything: Recovery transactions cannot be undone.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ gap: '16px' }}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-300 mb-1" style={{ display: 'block' }}>
              Token Contract Address
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="pangolin-input"
            />
            {tokenSymbol && (
              <p className="text-green-400 text-xs mt-1">✓ Token found: {tokenSymbol}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-gray-300 mb-1" style={{ display: 'block' }}>
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              className="pangolin-input"
            />
            {tokenBalance && (
              <p className="text-gray-400 text-xs mt-1">
                Available: {formatEther(tokenBalance)} {tokenSymbol}
              </p>
            )}
          </div>

          <button
            onClick={handleTokenRecovery}
            disabled={!tokenAddress || !amount || isLoading || !address}
            className="w-full pangolin-button-primary"
            style={{ opacity: (!tokenAddress || !amount || isLoading || !address) ? 0.5 : 1 }}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <>
                <span>Recover Tokens</span>
                <ArrowRightIcon className="icon-xs" />
              </>
            )}
          </button>
        </div>

        <div className="bg-gray-800/50 p-3 rounded-lg">
          <h4 className="text-base font-semibold text-white mb-3">Recovery Information</h4>
          <div className="space-y-2">
            <div className="p-2 bg-gray-700/50 rounded-lg">
              <div className="text-xs text-gray-400">Target Token</div>
              <div className="text-white font-medium text-sm">
                {tokenSymbol || '- Select Token'} 
              </div>
            </div>
            <div className="p-2 bg-gray-700/50 rounded-lg">
              <div className="text-xs text-gray-400">Recovery Amount</div>
              <div className="text-white font-medium text-sm">
                {amount || '0'} {tokenSymbol || 'Tokens'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}