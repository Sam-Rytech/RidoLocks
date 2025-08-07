'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { contractAddress, contractABI } from '../utils/contract'

type Lock = {
  token: string
  amount: bigint
  unlockTime: bigint
  withdrawn: boolean
}

export default function LocksList() {
  const [locks, setLocks] = useState<Lock[]>([])
  const [countdowns, setCountdowns] = useState<string[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchLocks = async () => {
    setLoading(true)
    if (!window.ethereum) return alert('Please connect MetaMask')

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const contract = new ethers.Contract(contractAddress, contractABI, provider)

    try {
      const userLocks = await contract.getLocks(userAddress)
      setLocks(userLocks)
      updateCountdowns(userLocks)
    } catch (err: any) {
      setStatus(`❌ Error fetching locks: ${err.message}`)
    }
    setLoading(false)
  }

  const updateCountdowns = (userLocks: Lock[]) => {
    const now = Math.floor(Date.now() / 1000)
    const updated = userLocks.map((lock) => {
      const diff = Number(lock.unlockTime) - now
      if (lock.withdrawn) return '✅ Withdrawn'
      if (diff <= 0) return '⏱️ Ready to withdraw!'
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      return `⏳ ${h}h ${m}m ${s}s`
    })
    setCountdowns(updated)
  }

  const withdrawLock = async (lockId: number) => {
    if (!window.ethereum) return alert('Please connect MetaMask')

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, contractABI, signer)

    try {
      const tx = await contract.withdraw(lockId)
      await tx.wait()
      setStatus(`✅ Lock ${lockId} withdrawn!`)
      await fetchLocks() // Refresh list
    } catch (err: any) {
      setStatus(`❌ Withdraw error: ${err.message}`)
    }
  }

  useEffect(() => {
    fetchLocks()
    const interval = setInterval(() => updateCountdowns(locks), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-10 w-full max-w-2xl bg-gray-900 p-6 rounded-xl space-y-4">
      <h2 className="text-xl font-semibold text-center">
        🔍 Your Locked Tokens
      </h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading locks...</p>
      ) : locks.length === 0 ? (
        <p className="text-center text-gray-400">No token locks found.</p>
      ) : (
        locks.map((lock, index) => (
          <div
            key={index}
            className="bg-gray-800 p-4 rounded-md shadow flex justify-between items-center"
          >
            <div>
              <p className="text-sm">Token: {lock.token}</p>
              <p className="text-sm">
                Amount: {ethers.formatUnits(lock.amount, 18)}
              </p>
              <p className="text-sm">
                Unlock Time:{' '}
                {new Date(Number(lock.unlockTime) * 1000).toLocaleString()}
              </p>
              <p className="text-sm text-yellow-400">{countdowns[index]}</p>
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
              disabled={
                lock.withdrawn ||
                Number(lock.unlockTime) > Math.floor(Date.now() / 1000)
              }
              onClick={() => withdrawLock(index)}
            >
              Withdraw
            </button>
          </div>
        ))
      )}

      {status && (
        <p className="text-center text-sm text-gray-300 mt-2">{status}</p>
      )}
    </div>
  )
}
