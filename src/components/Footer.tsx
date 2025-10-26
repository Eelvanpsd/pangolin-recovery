import React from 'react'
import { HeartIcon } from '@heroicons/react/24/solid'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-700/50 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-base font-semibold mb-3 text-orange-500">Pangolin Recovery Tool</h3>
            <p className="text-gray-400 text-xs">
              A secure recovery tool for the Pangolin protocol on Avalanche C-Chain.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Supported Operations</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Token Recovery</li>
              <li>• Liquidity Withdrawal</li>
              <li>• Staking Rewards</li>
              <li>• Emergency Withdraw</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold mb-3 text-white">Security</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• Official Contracts</li>
              <li>• Open Source</li>
              <li>• Community Verified</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700/50 mt-6 pt-4 text-center">
          <p className="text-gray-400 text-xs flex items-center justify-center">
            Made with <HeartIcon className="icon-xs text-red-500 mx-1" /> for Avalanche Community
          </p>
        </div>
      </div>
    </footer>
  )
}