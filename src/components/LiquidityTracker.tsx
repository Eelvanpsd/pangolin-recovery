import React, { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import toast from 'react-hot-toast'
import { BeakerIcon, EyeIcon, ChevronRightIcon, MinusCircleIcon } from '@heroicons/react/24/outline'
import { BrowserProvider, Contract } from 'ethers'

import { CONTRACTS, ALL_PANGOLIN_TOKENS } from '../contracts/addresses'

interface LiquidityPosition {
  pairAddress: string
  token0Symbol: string
  token1Symbol: string
  balance: string
}

export const LiquidityTracker: React.FC = () => {
  const { address, isConnected } = useAccount()
  const [liquidityPositions, setLiquidityPositions] = useState<LiquidityPosition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [removingPosition, setRemovingPosition] = useState<string | null>(null)
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanTotal, setScanTotal] = useState(0)
  const [foundCount, setFoundCount] = useState(0)

  useEffect(() => {
    if (isConnected && address) {
      checkLiquidityPositions()
    } else {
      setLiquidityPositions([])
    }
  }, [isConnected, address])

  const handleRemoveLiquidity = async (position: LiquidityPosition) => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    setRemovingPosition(position.pairAddress)
    
    try {
      console.log('Starting liquidity removal for:', position)
      console.log('Pair contract address:', position.pairAddress)
      console.log('Router address:', CONTRACTS.PANGOLIN_ROUTER)
      
      // FIRST VALIDATE PAIR CONTRACT
      toast.loading('Validating pair contract...', { duration: 5000 })
      
      // Get token0 and token1 addresses from pair contract
      const token0Response = await fetch('https://api.avax.network/ext/bc/C/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: position.pairAddress,
            data: '0x0dfe1681' // token0() function signature
          }, 'latest'],
          id: Math.floor(Math.random() * 1000000)
        })
      })
      
      const token1Response = await fetch('https://api.avax.network/ext/bc/C/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [{
            to: position.pairAddress,
            data: '0xd21220a7' // token1() function signature
          }, 'latest'],
          id: Math.floor(Math.random() * 1000000)
        })
      })
      
      const token0Result = await token0Response.json()
      const token1Result = await token1Response.json()
      
      if (token0Result.result && token1Result.result) {
        const token0Address = '0x' + token0Result.result.slice(-40)
        const token1Address = '0x' + token1Result.result.slice(-40)
        
        console.log('Pair validation:')
        console.log('Token0 address:', token0Address)
        console.log('Token1 address:', token1Address)
        
        // Validate that both tokens are in our token list
        const token0Valid = ALL_PANGOLIN_TOKENS.some(t => t.address.toLowerCase() === token0Address.toLowerCase())
        const token1Valid = ALL_PANGOLIN_TOKENS.some(t => t.address.toLowerCase() === token1Address.toLowerCase())
        
        if (!token0Valid || !token1Valid) {
          console.warn('⚠️ Unknown token pair - one or both tokens not in Pangolin list')
          console.warn('Token0:', token0Address, 'Valid:', token0Valid)
          console.warn('Token1:', token1Address, 'Valid:', token1Valid)
          // Continue anyway - user might have LP tokens in custom pairs
        }
        
        console.log('✅ Pair validation successful')
        
        // Get token symbols from our list
        const token0Info = ALL_PANGOLIN_TOKENS.find(t => t.address.toLowerCase() === token0Address.toLowerCase())
        const token1Info = ALL_PANGOLIN_TOKENS.find(t => t.address.toLowerCase() === token1Address.toLowerCase())
        
        console.log('Token0:', token0Info?.symbol || 'UNKNOWN', '-', token0Address)
        console.log('Token1:', token1Info?.symbol || 'UNKNOWN', '-', token1Address)
        
        toast.dismiss()
        toast.success('Pair validated successfully!')
        
        // READ CURRENT LP BALANCE FROM ON-CHAIN
        console.log('Reading current LP token balance from blockchain...')
        const balanceResponse = await fetch('https://api.avax.network/ext/bc/C/rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [{
              to: position.pairAddress,
              data: `0x70a08231${address.slice(2).padStart(64, '0')}` // balanceOf(address)
            }, 'latest'],
            id: Math.floor(Math.random() * 1000000)
          })
        })
        
        const balanceResult = await balanceResponse.json()
        
        if (!balanceResult.result || balanceResult.result === '0x' || balanceResult.result === '0x0') {
          console.error('❌ NO LP TOKENS FOUND!')
          toast.dismiss()
          toast.error('No LP tokens found in your wallet. They may have already been removed.')
          
          // Refresh positions
          await checkLiquidityPositions()
          return
        }
        
        const currentBalance = BigInt(balanceResult.result)
        console.log('Current LP balance from blockchain:', currentBalance.toString())
        console.log('Displayed balance (may be outdated):', parseEther(position.balance).toString())
        
        if (currentBalance === 0n) {
          console.error('❌ LP TOKEN BALANCE IS ZERO')
          toast.dismiss()
          toast.error('LP tokens already removed. Refreshing...')
          await checkLiquidityPositions()
          return
        }
        
        const lpAmount = currentBalance
        
        console.log('LP amount to burn (current):', lpAmount.toString())
        
        // Pangolin Liquidity Removal: Burn LP tokens
        toast.loading('Burning LP tokens and recovering underlying assets...', { duration: 10000 })
        
        // OFFICIAL PANGOLIN ROUTER APPROACH - Correct router and ABI
        console.log('Using official Pangolin Router for liquidity removal...')
        
        // Pangolin Router V2 address (Avalanche mainnet) - Correct address
        const PANGOLIN_ROUTER_ADDRESS = '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106' as `0x${string}`
        
        console.log('===== TRANSACTION DETAILS =====')
        console.log('LP amount to remove:', lpAmount.toString())
        console.log('Router address:', PANGOLIN_ROUTER_ADDRESS)
        console.log('Pair contract address:', position.pairAddress)
        console.log('User address:', address)
        console.log('===============================')
        
        // Show info to user about the 2-step process
        toast(
          '📝 Liquidity removal requires 2 transactions:\n' +
          '1. Approve LP tokens\n' +
          '2. Remove liquidity',
          { 
            duration: 6000,
            icon: 'ℹ️'
          }
        )
        
        try {
          // 1. Approve LP tokens to Router
          console.log('Step 1: Approving LP tokens to router...')
          console.log('Approval details:', {
            pairAddress: position.pairAddress,
            routerAddress: PANGOLIN_ROUTER_ADDRESS,
            lpAmount: lpAmount.toString(),
            userAddress: address
          })
          
          let approveTxHash: `0x${string}` | undefined
          
          try {
            // USING ETHERS.JS FOR MANUAL SIGNING - Bypassing MetaMask simulation
            console.log('🚀 Sending transaction...')
            
            if (!window.ethereum) {
              throw new Error('No ethereum provider found')
            }
            
            // Create Ethers provider
            const provider = new BrowserProvider(window.ethereum as any)
            const signer = await provider.getSigner()
            
            console.log('Signer address:', await signer.getAddress())
            
            // ERC20 ABI for approve
            const ERC20_MINIMAL_ABI = [
              'function approve(address spender, uint256 amount) external returns (bool)'
            ]
            
            // LP token contract
            const lpTokenContract = new Contract(
              position.pairAddress,
              ERC20_MINIMAL_ABI,
              signer
            )
            
            console.log('Calling approve:')
            console.log('  Spender:', PANGOLIN_ROUTER_ADDRESS)
            console.log('  Amount:', lpAmount.toString())
            
            // Send approve transaction
            const approveTx = await lpTokenContract.approve(
              PANGOLIN_ROUTER_ADDRESS,
              lpAmount.toString()
            )
            
            approveTxHash = approveTx.hash as `0x${string}`
            
            console.log('✅ Approval transaction submitted!')
            console.log('Transaction hash:', approveTxHash)
            
            if (!approveTxHash) {
              throw new Error('No transaction hash returned from approval')
            }
            
            // Wait for transaction confirmation
            toast.loading('Waiting for approval...', { id: 'approval-wait' })
            await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds
            toast.success('Approved!', { id: 'approval-wait' })
            
          } catch (approveError: any) {
            console.error('❌ APPROVAL FAILED')
            console.error('Approve error:', approveError)
            console.error('Error message:', approveError?.message)
            console.error('Error code:', approveError?.code)
            console.error('Error cause:', approveError?.cause)
            console.error('Error details:', approveError?.details)
            console.error('Error name:', approveError?.name)
            console.error('Error shortMessage:', approveError?.shortMessage)
            
            // MetaMask user rejection
            if (approveError?.code === 4001) {
              toast.error('Transaction rejected by user')
              return
            }
            
            // Contract revert
            if (approveError?.name === 'ContractFunctionExecutionError') {
              console.error('🔴 CONTRACT EXECUTION FAILED')
              console.error('Cause:', approveError?.cause)
              if (approveError?.cause?.message) {
                console.error('Cause message:', approveError.cause.message)
              }
              if (approveError?.cause?.reason) {
                console.error('Revert reason:', approveError.cause.reason)
              }
              toast.error('Contract rejected approval - check console for details')
              throw approveError
            }
            
            // RPC Error details
            console.error('Full error stringify:', JSON.stringify(approveError, Object.getOwnPropertyNames(approveError), 2))
            
            toast.error('Approval failed: ' + (approveError?.shortMessage || approveError?.message))
            throw approveError
          }
          // Note: We could check allowance here with a read contract call
          // But for now let's continue
          
          // 2. Call Router's STANDARD removeLiquidity function
          console.log('Step 2: Calling router removeLiquidity...')
          const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600)
          console.log('Deadline:', deadline.toString())
          
          // Use the actual token addresses from the pair
          // Token order doesn't matter for removeLiquidity, router handles it
          const tokenA = token0Address
          const tokenB = token1Address
          
          console.log('Using tokenA:', tokenA, `(${token0Info?.symbol || 'UNKNOWN'})`)
          console.log('Using tokenB:', tokenB, `(${token1Info?.symbol || 'UNKNOWN'})`)
          
          console.log('RemoveLiquidity call parameters:', {
            routerAddress: PANGOLIN_ROUTER_ADDRESS,
            tokenA,
            tokenB,
            liquidity: lpAmount.toString(),
            amountAMin: '0',
            amountBMin: '0',
            to: address,
            deadline: deadline.toString()
          })
          
          try {
            // Prepare transaction
            console.log('🚀 Preparing removeLiquidity transaction...')
            
            toast.dismiss()
            toast.loading('Please confirm the transaction in MetaMask...', { duration: 30000 })
            
            // Get provider and signer
            const provider = new BrowserProvider(window.ethereum as any)
            const signer = await provider.getSigner()
            
            // Get gas price
            const feeData = await provider.getFeeData()
            const gasPrice = feeData.gasPrice || BigInt(25000000000) // 25 gwei fallback
            
            console.log('Gas price:', gasPrice.toString(), 'wei')
            
            console.log('Transaction parameters:')
            console.log('  TokenA:', tokenA)
            console.log('  TokenB:', tokenB)
            console.log('  Liquidity:', lpAmount.toString())
            console.log('  AmountAMin: 0')
            console.log('  AmountBMin: 0')
            console.log('  To:', address)
            console.log('  Deadline:', deadline.toString())
            
            // FINAL SOLUTION: Use contract.removeLiquidity() directly with custom gas settings
            // This bypasses MetaMask simulation by providing explicit gas parameters
            console.log('🎯 Calling removeLiquidity via contract interface...')
            
            toast.dismiss()
            toast.loading('Sending transaction...', { id: 'remove-tx' })
            
            // Router contract ABI (just removeLiquidity function)
            const ROUTER_ABI = [
              {
                "inputs": [
                  {"internalType": "address", "name": "tokenA", "type": "address"},
                  {"internalType": "address", "name": "tokenB", "type": "address"},
                  {"internalType": "uint256", "name": "liquidity", "type": "uint256"},
                  {"internalType": "uint256", "name": "amountAMin", "type": "uint256"},
                  {"internalType": "uint256", "name": "amountBMin", "type": "uint256"},
                  {"internalType": "address", "name": "to", "type": "address"},
                  {"internalType": "uint256", "name": "deadline", "type": "uint256"}
                ],
                "name": "removeLiquidity",
                "outputs": [
                  {"internalType": "uint256", "name": "amountA", "type": "uint256"},
                  {"internalType": "uint256", "name": "amountB", "type": "uint256"}
                ],
                "stateMutability": "nonpayable",
                "type": "function"
              }
            ]
            
            const routerContract = new Contract(
              PANGOLIN_ROUTER_ADDRESS,
              ROUTER_ABI,
              signer
            )
            
            let txHash: string
            
            try {
              // Call removeLiquidity with explicit gas limit (no estimation = no simulation)
              const tx = await routerContract.removeLiquidity(
                tokenA,
                tokenB,
                lpAmount.toString(),
                '0', // amountAMin
                '0', // amountBMin
                address,
                deadline.toString(),
                {
                  gasLimit: BigInt(500000), // Explicit gas limit skips estimation
                  gasPrice: gasPrice
                }
              )
              
              txHash = tx.hash
              console.log('✅ Transaction sent! Hash:', txHash)
            } catch (error: any) {
                console.error('Transaction error:', error)
                
                // Re-throw to let outer catches handle it properly
                throw error
              }
              
              toast.dismiss()
              toast.loading('Transaction submitted! Waiting for confirmation...', { id: 'remove-wait' })
              
              // Wait for transaction confirmation
              let receipt = null
              let attempts = 0
              const maxAttempts = 60 // 60 seconds
              
              while (!receipt && attempts < maxAttempts) {
                try {
                  receipt = await provider.getTransactionReceipt(txHash)
                  if (receipt) break
                } catch (e) {
                  // No receipt yet, continue
                }
                
                await new Promise(resolve => setTimeout(resolve, 1000))
                attempts++
                
                if (attempts % 5 === 0) {
                  console.log(`Waiting for confirmation... (${attempts}s)`)
                }
              }
              
              if (receipt) {
                console.log('✅ Transaction confirmed!')
                console.log('Receipt:', receipt)
                
                if (receipt.status === 1) {
                  toast.dismiss()
                  toast.success('Liquidity removed successfully! 🎉', { id: 'remove-wait', duration: 5000 })
                } else {
                  toast.dismiss()
                  toast.error('Transaction failed on blockchain. Your LP tokens may have already been removed.')
                }
              } else {
                console.log('⏱️ Transaction timeout - but may still succeed')
                toast.dismiss()
                toast.success('Transaction sent! Waiting for blockchain confirmation...', { duration: 5000 })
              }
              
              // Refresh positions
              setTimeout(() => {
                checkLiquidityPositions()
              }, 3000)
            
          } catch (removeError: any) {
            console.error('❌ REMOVE LIQUIDITY FAILED')
            console.error('Remove error:', removeError)
            console.error('Error message:', removeError?.message)
            console.error('Error code:', removeError?.code)
            console.error('Error reason:', removeError?.reason)
            
            toast.dismiss()
            
            // Check for specific error types
            if (removeError?.reason === 'ds-math-sub-underflow' || 
                removeError?.message?.includes('underflow') ||
                removeError?.message?.includes('insufficient')) {
              console.error('🔴 INSUFFICIENT LP TOKEN BALANCE')
              console.error('This usually means:')
              console.error('1. LP tokens have already been removed')
              console.error('2. LP tokens were transferred to another address')
              console.error('3. The displayed balance is outdated')
              
              toast.error('LP tokens already removed or insufficient balance. Refreshing...')
              
              // Refresh positions to show current state
              await checkLiquidityPositions()
              return
            }
            
            // MetaMask user rejection
            if (removeError?.code === 4001 || removeError?.code === 'ACTION_REJECTED') {
              toast.error('Transaction rejected by user')
              return
            }
            
            // Deadline expired
            if (removeError?.message?.includes('EXPIRED') || removeError?.message?.includes('deadline')) {
              toast.error('Transaction deadline expired. Please try again.')
              return
            }
            
            // Generic error message
            let errorMsg = 'Failed to remove liquidity'
            
            if (removeError?.message) {
              // Extract readable error message
              if (removeError.message.includes('gas')) {
                errorMsg = 'Insufficient gas or gas price too low'
              } else if (removeError.message.includes('revert')) {
                errorMsg = 'Transaction reverted. Your LP tokens may have already been removed.'
              } else if (removeError.message.length < 100) {
                errorMsg = removeError.message
              }
            }
            
            toast.error(errorMsg)
            
            // Full error for debugging
            console.error('Full error stringify:', JSON.stringify(removeError, Object.getOwnPropertyNames(removeError), 2))
            
            // Refresh positions to show current state
            setTimeout(() => {
              checkLiquidityPositions()
            }, 2000)
          }
          
        } catch (error: any) {
          console.error('❌ Router operation failed!')
          console.error('==================== ERROR DETAILS ====================')
          console.error('Error type:', typeof error)
          console.error('Error constructor:', error?.constructor?.name)
          console.error('Error message:', error?.message)
          console.error('Error code:', error?.code)
          console.error('Error reason:', error?.reason)
          console.error('Error shortMessage:', error?.shortMessage)
          console.error('Error metaMessages:', error?.metaMessages)
          console.error('Error cause:', error?.cause)
          console.error('Error details:', error?.details)
          console.error('Error data:', error?.data)
          
          // Try to parse the actual revert reason
          if (error?.cause) {
            console.error('Error cause details:', error.cause)
            if (error.cause?.data) {
              console.error('Error cause data:', error.cause.data)
            }
            if (error.cause?.message) {
              console.error('Error cause message:', error.cause.message)
            }
          }
          
          // Viem specific errors
          if (error?.walk) {
            const contractError = error.walk((err: any) => err?.name === 'ContractFunctionRevertedError')
            if (contractError) {
              console.error('Contract revert found:', contractError)
              console.error('Contract revert reason:', contractError?.reason)
              console.error('Contract revert data:', contractError?.data)
            }
          }
          
          // Try to extract revert reason from data
          if (error?.data?.message) {
            console.error('Revert message from data:', error.data.message)
          }
          
          console.error('Full error object (stringified):')
          try {
            console.error(JSON.stringify(error, null, 2))
          } catch (e) {
            console.error('Could not stringify error')
            console.error('Raw error:', error)
          }
          console.error('======================================================')
          
          // User-friendly error message
          let errorMsg = 'Transaction failed'
          
          if (error?.message?.toLowerCase().includes('insufficient')) {
            errorMsg = 'Insufficient balance or allowance'
          } else if (error?.message?.toLowerCase().includes('expired')) {
            errorMsg = 'Transaction deadline expired'
          } else if (error?.message?.toLowerCase().includes('pair')) {
            errorMsg = 'Invalid pair or pair not found'
          } else if (error?.reason) {
            errorMsg = `Contract error: ${error.reason}`
          } else if (error?.shortMessage) {
            errorMsg = error.shortMessage
          } else if (error?.message) {
            errorMsg = error.message
          }
          
          toast.error(errorMsg)
          throw error
        }
        
        toast.dismiss()
          toast.success(`Successfully removed ${position.token0Symbol}/${position.token1Symbol} liquidity!`)
          
          // Refresh positions
          setTimeout(() => {
            console.log('Refreshing positions...')
            checkLiquidityPositions()
          }, 5000)
        
      } else {
        console.error('Failed to get token addresses from pair contract')
        toast.dismiss()
        toast.error('Failed to validate pair contract')
        return
      }
      
    } catch (error: any) {
      toast.dismiss()
      console.error('Validation error:', error)
      toast.error('Pair validation failed: ' + (error?.message || 'Unknown error'))
    } finally {
      setRemovingPosition(null)
    }
  }

  // Dynamically discover user's pairs from Factory
  // Optimized version with batch RPC calls for all 263 tokens
  const discoverUserPairs = async (userAddress: string) => {
    console.log('🔍 Discovering pairs for user:', userAddress)
    console.log(`📊 Scanning ${ALL_PANGOLIN_TOKENS.length} tokens from Pangolin list`)
    const foundPairs: LiquidityPosition[] = []
    
    try {
      // Strategy: Scan all token combinations in batches
      // We'll use PRIORITY_TOKENS for common pairs first, then scan all others
      
      const tokensToScan = ALL_PANGOLIN_TOKENS
      const batchSize = 50 // Process 50 pair checks at once
      let scannedPairs = 0
      let totalPairs = 0
      
      // Calculate total pairs to scan
      for (let i = 0; i < tokensToScan.length; i++) {
        totalPairs += tokensToScan.length - i - 1
      }
      
      console.log(`🎯 Total pair combinations to check: ${totalPairs}`)
      
      // Initialize progress
      setScanTotal(totalPairs)
      setScanProgress(0)
      setFoundCount(0)
      
      // Scan all token combinations
      for (let i = 0; i < tokensToScan.length; i++) {
        for (let j = i + 1; j < tokensToScan.length; j += batchSize) {
          const batch = []
          const batchEnd = Math.min(j + batchSize, tokensToScan.length)
          
          // Create batch of pair checks
          for (let k = j; k < batchEnd; k++) {
            const tokenA = tokensToScan[i]
            const tokenB = tokensToScan[k]
            
            batch.push({ tokenA, tokenB })
          }
          
          // Process batch in parallel
          const batchResults = await Promise.allSettled(
            batch.map(async ({ tokenA, tokenB }) => {
              try {
                // Get pair address from Factory
                const response = await fetch('https://api.avax.network/ext/bc/C/rpc', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_call',
                    params: [{
                      to: CONTRACTS.PANGOLIN_FACTORY,
                      data: `0xe6a43905${tokenA.address.slice(2).padStart(64, '0')}${tokenB.address.slice(2).padStart(64, '0')}`
                    }, 'latest'],
                    id: Math.floor(Math.random() * 1000000)
                  })
                })
                
                const result = await response.json()
                
                if (result.result && result.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                  const pairAddress = '0x' + result.result.slice(-40)
                  
                  // Check user balance in this pair
                  const balanceHex = await checkPairBalance(pairAddress, userAddress)
                  const balance = parseInt(balanceHex, 16)
                  
                  if (balance > 0 && balanceHex !== '0x0' && balanceHex !== '0x') {
                    const balanceInEther = formatEther(BigInt(balance))
                    const formattedBalance = parseFloat(balanceInEther).toFixed(6)
                    
                    console.log(`✅ Found LP: ${tokenA.symbol}/${tokenB.symbol} - ${formattedBalance} LP`)
                    
                    return {
                      pairAddress,
                      token0Symbol: tokenA.symbol,
                      token1Symbol: tokenB.symbol,
                      balance: formattedBalance
                    }
                  }
                }
                return null
              } catch (error) {
                // Silently skip errors for individual pairs
                return null
              }
            })
          )
          
          // Collect successful results
          batchResults.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
              foundPairs.push(result.value)
            }
          })
          
          // Update progress after each batch
          scannedPairs += batch.length
          setScanProgress(scannedPairs)
          setFoundCount(foundPairs.length)
          
          // Progress update every 100 pairs
          if (scannedPairs % 100 === 0) {
            console.log(`📈 Progress: ${scannedPairs}/${totalPairs} pairs scanned, ${foundPairs.length} positions found`)
          }
        }
      }
      
      console.log(`🎉 Scan complete! Found ${foundPairs.length} LP positions out of ${totalPairs} pairs checked`)
      return foundPairs
      
    } catch (error) {
      console.error('Error discovering pairs:', error)
      return foundPairs // Return what we found so far
    }
  }

  const checkLiquidityPositions = async () => {
    if (!address) return
    
    setIsLoading(true)
    setLiquidityPositions([]) // Clear old positions first
    
    try {
      console.log('=== Starting dynamic liquidity position discovery ===')
      console.log('User address:', address)
      
      // Dynamically discover user's pairs
      const foundPositions = await discoverUserPairs(address)
      
      console.log('=== Final results ===')
      console.log('Valid positions found:', foundPositions.length)
      console.log('Positions:', foundPositions)
      
      setLiquidityPositions(foundPositions)
      
      if (foundPositions.length === 0) {
        console.log('No liquidity positions found for this address')
      }
      
    } catch (error) {
      console.error('Error checking liquidity positions:', error)
      toast.error('Failed to check liquidity positions')
      setLiquidityPositions([])
    } finally {
      setIsLoading(false)
      // Reset progress
      setScanProgress(0)
      setScanTotal(0)
      setFoundCount(0)
    }
  }

  // Helper function to check balance for a single pair
  const checkPairBalance = async (pairAddress: string, userAddress: string): Promise<string> => {
    console.log(`Checking balance for pair ${pairAddress} and user ${userAddress}`)
    
    const response = await fetch('https://api.avax.network/ext/bc/C/rpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{
          to: pairAddress,
          data: `0x70a08231000000000000000000000000${userAddress.slice(2).toLowerCase()}` // balanceOf(address)
        }, 'latest'],
        id: Date.now()
      })
    })
    
    const result = await response.json()
    console.log(`Response for ${pairAddress}:`, result)
    
    if (result.error) {
      console.error(`RPC error for ${pairAddress}:`, result.error)
      throw new Error(result.error.message)
    }
    
    const balance = result.result || '0x0'
    console.log(`Balance for ${pairAddress}: ${balance} (${parseInt(balance, 16)})`)
    
    return balance
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="pangolin-card">
      <div className="flex items-center mb-3" style={{ gap: '8px' }}>
        <BeakerIcon className="icon-sm" style={{ color: '#ff8800' }} />
        <div>
          <h3 className="text-base font-semibold text-white">Pangolin Liquidity Recovery</h3>
          <p className="text-gray-400 text-xs">Detect and remove your LP positions from Pangolin DEX</p>
        </div>
        <button
          onClick={() => {
            console.log('Force refresh triggered - clearing all state')
            setLiquidityPositions([])
            setExpandedPosition(null)
            checkLiquidityPositions()
          }}
          disabled={isLoading}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            color: '#ff8800',
            cursor: isLoading ? 'default' : 'pointer',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <EyeIcon className="icon-xs" />
          {isLoading ? 'Scanning...' : 'Refresh'}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center" style={{ padding: '24px' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
          <p className="text-gray-400 text-xs">Scanning blockchain for your old Pangolin LP positions...</p>
          <p className="text-gray-400 text-xs mt-1">
            Discovering liquidity pairs dynamically, it will take a while
          </p>
          
          {/* Progress Bar */}
          {scanTotal > 0 && (
            <div style={{ marginTop: '20px', maxWidth: '400px', margin: '20px auto 0' }}>
              {/* Progress Bar Container */}
              <div style={{
                width: '100%',
                height: '24px',
                background: 'rgba(255, 136, 0, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 136, 0, 0.3)',
                position: 'relative'
              }}>
                {/* Progress Fill */}
                <div style={{
                  width: `${(scanProgress / scanTotal) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ff8800, #ffaa00)',
                  transition: 'width 0.3s ease',
                  borderRadius: '12px',
                  boxShadow: '0 0 10px rgba(255, 136, 0, 0.5)'
                }}></div>
                
                {/* Progress Text */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  zIndex: 1
                }}>
                  {((scanProgress / scanTotal) * 100).toFixed(1)}%
                </div>
              </div>
              
              {/* Stats */}
              <div style={{ 
                marginTop: '12px', 
                display: 'flex', 
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                <span className="text-green-400">
                  Found: {foundCount} position{foundCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : liquidityPositions.length > 0 ? (
        <div className="space-y-3">
          <div className="text-center" style={{ marginBottom: '16px' }}>
            <p className="text-green-400 text-xs font-medium">
              ✓ Found {liquidityPositions.length} active position{liquidityPositions.length > 1 ? 's' : ''} on blockchain
            </p>
          </div>
          {liquidityPositions.map((position, index) => (
            <div
              key={index}
              className="info-box"
              style={{ 
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(255, 136, 0, 0.1), rgba(255, 136, 0, 0.05))',
                border: '1px solid rgba(255, 136, 0, 0.2)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setExpandedPosition(
                expandedPosition === position.pairAddress ? null : position.pairAddress
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: '12px' }}>
                  <div className="flex items-center" style={{ 
                    background: 'rgba(255, 136, 0, 0.2)', 
                    borderRadius: '8px', 
                    padding: '8px',
                    minWidth: '60px',
                    justifyContent: 'center'
                  }}>
                    <span className="text-white font-bold text-sm">
                      {position.token0Symbol}/{position.token1Symbol}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {position.balance} LP tokens
                    </div>
                    <div className="text-gray-400 text-xs">
                      Click to view details
                    </div>
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Contract:</div>
                    <div className="text-xs text-white font-mono">
                      {position.pairAddress.slice(0, 6)}...{position.pairAddress.slice(-4)}
                    </div>
                  </div>
                  <ChevronRightIcon 
                    className="icon-xs" 
                    style={{ 
                      color: '#ff8800',
                      transform: expandedPosition === position.pairAddress ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }} 
                  />
                </div>
              </div>
              
              {/* Expanded Details */}
              {expandedPosition === position.pairAddress && (
                <div style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid rgba(255, 136, 0, 0.2)' 
                }}>
                  <div className="grid grid-cols-2" style={{ gap: '12px' }}>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-700/30 rounded-lg">
                        <div className="text-xs text-gray-400">Pair Contract</div>
                        <div className="text-white font-mono text-xs">{position.pairAddress}</div>
                      </div>
                      <div className="p-2 bg-gray-700/30 rounded-lg">
                        <div className="text-xs text-gray-400">Your LP Balance</div>
                        <div className="text-white font-medium text-sm">{position.balance} LP</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2 bg-gray-700/30 rounded-lg">
                        <div className="text-xs text-gray-400">Pool Type</div>
                        <div className="text-white font-medium text-sm">{position.token0Symbol}-{position.token1Symbol}</div>
                      </div>
                      <div className="p-2 bg-gray-700/30 rounded-lg">
                        <div className="text-xs text-gray-400">Status</div>
                        <div className="text-green-400 font-medium text-sm">✓ Active Position</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveLiquidity(position)
                      }}
                      disabled={removingPosition === position.pairAddress}
                      className="w-full pangolin-button-primary"
                      style={{
                        opacity: removingPosition === position.pairAddress ? 0.6 : 1,
                        padding: '10px 16px'
                      }}
                    >
                      {removingPosition === position.pairAddress ? (
                        <>
                          <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                          Removing Liquidity...
                        </>
                      ) : (
                        <>
                          <MinusCircleIcon className="icon-sm" />
                          Remove All Liquidity
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center" style={{ marginTop: '8px' }}>
                    <p className="text-gray-400 text-xs">
                      This will return both {position.token0Symbol} and {position.token1Symbol} tokens to your wallet
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="text-center" style={{ marginTop: '16px' }}>
            <p className="text-gray-400 text-xs">
              💡 Click on any position to view details and remove liquidity
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center" style={{ padding: '24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
          <p className="text-gray-400 text-sm font-medium">No liquidity positions found</p>
          <p className="text-gray-400 text-xs mt-2">
            Your wallet doesn't have any LP tokens in the scanned
          </p>
          <p className="text-gray-400 text-xs">
            Our tool scans all major token pairs dynamically.
          </p>
          <p className="text-gray-400 text-xs mt-3">
            💡 If you have LP tokens in other pools, they may not be detected yet.
          </p>
        </div>
      )}
    </div>
  )
}