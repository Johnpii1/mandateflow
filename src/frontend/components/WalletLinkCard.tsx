import { useState } from 'react'
import { Link2, ShieldCheck, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../auth/AuthContext'
import { ApiError, apiRequest } from '../services/api'

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

interface NonceResponse {
  nonce: string
  message: string
  expiresAt: string
}

interface VerifyResponse {
  wallets: NonNullable<ReturnType<typeof useAuth>['user']>['wallets']
}

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function WalletLinkCard() {
  const { user, token, refreshUser } = useAuth()
  const [linking, setLinking] = useState(false)
  const wallets = user?.wallets ?? []

  const linkWallet = async () => {
    const provider = window.ethereum
    if (!provider) {
      toast.error('Install or unlock an EVM wallet such as MetaMask first.')
      return
    }

    setLinking(true)
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const chain = await provider.request({ method: 'eth_chainId' })
      if (!Array.isArray(accounts) || typeof accounts[0] !== 'string') {
        throw new Error('No wallet account was selected.')
      }
      if (typeof chain !== 'string' || !/^0x[\da-f]+$/i.test(chain)) {
        throw new Error('Could not read the connected wallet network.')
      }

      const address = accounts[0]
      const chainId = Number.parseInt(chain, 16)
      const challenge = await apiRequest<NonceResponse>('/api/v1/auth/wallet/nonce', {
        method: 'POST',
        token,
        body: { address, chainId },
      })
      const signature = await provider.request({
        method: 'personal_sign',
        params: [challenge.message, address],
      })
      if (typeof signature !== 'string') throw new Error('Wallet did not return a signature.')

      await apiRequest<VerifyResponse>('/api/v1/auth/wallet/verify', {
        method: 'POST',
        token,
        body: { nonce: challenge.nonce, signature },
      })
      await refreshUser()
      toast.success('Wallet verified and linked to your account.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Unable to link wallet.')
    } finally {
      setLinking(false)
    }
  }

  return (
    <section className="mb-7 flex flex-col gap-4 rounded-2xl border border-[#E8EDE8] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F8F1] text-[#00A87D]">
          <Wallet size={21} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-[#101B1B]">Verified wallets</h3>
          {wallets.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#586461]">
              {wallets.map((wallet) => (
                <span key={`${wallet.address}-${wallet.chainId}`} className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#00A87D]" />
                  {shortAddress(wallet.address)} · chain {wallet.chainId}{wallet.isPrimary ? ' · primary' : ''}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-[#929D98]">Link a wallet by signing a one-time account verification message.</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={linkWallet}
        disabled={linking || !token || wallets.length > 0}
        title={wallets.length > 0 ? 'A verified wallet is already linked to this account.' : undefined}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#CFE8DC] px-4 py-3 text-sm font-bold text-[#008A66] transition hover:bg-[#F3FBF7] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Link2 size={16} />
        {linking ? 'Verifying wallet…' : wallets.length ? 'Wallet linked' : 'Link wallet'}
      </button>
    </section>
  )
}
