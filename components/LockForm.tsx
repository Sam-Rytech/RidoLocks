'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { contractAddress, contractABI } from '../utils/contract'

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LockForm() {
  const [tokenAddress, setTokenAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [unlockTime, setUnlockTime] = useState('')
  const [status, setStatus] = useState('')

  const approveAndLock = async () => {
    if (!window.ethereum) return alert('Please connect MetaMask')

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, contractABI, signer)
    const erc20 = new ethers.Contract(
      tokenAddress,
      ['function approve(address spender, uint amount) public returns (bool)'],
      signer
    )

    try {
      const parsedAmount = ethers.parseUnits(amount, 18)
      const approveTx = await erc20.approve(contractAddress, parsedAmount)
      await approveTx.wait()

      const tx = await contract.lock(
        tokenAddress,
        parsedAmount,
        Number(unlockTime)
      )
      await tx.wait()

      setStatus('✅ Lock successful!')
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`)
    }
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl max-w-xl w-full">
      <h2 className="text-xl mb-4 font-semibold">🔒 Lock Your Tokens</h2>
      <input
        type="text"
        placeholder="ERC20 Token Address"
        className="w-full mb-2 p-2 rounded bg-gray-800"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        className="w-full mb-2 p-2 rounded bg-gray-800"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input
        type="number"
        placeholder="Unlock Time (UNIX timestamp)"
        className="w-full mb-4 p-2 rounded bg-gray-800"
        value={unlockTime}
        onChange={(e) => setUnlockTime(e.target.value)}
      />
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={approveAndLock}
      >
        Approve & Lock
      </button>
      {status && <p className="mt-2 text-sm text-gray-300">{status}</p>}
    </div>
  )
}
