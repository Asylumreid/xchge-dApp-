'use client';

import * as anchor from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useCallback, useEffect } from 'react';
import { useProgram, findListingPDA } from '@/hooks/useProgram';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useRouter } from 'next/navigation';

export default function CreateListing() {
  const { publicKey } = useWallet();
  const { program } = useProgram();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [listingPDA, setListingPDA] = useState<anchor.web3.PublicKey | null>(null);

  // Precompute and cache listing PDA when `publicKey` changes
  useEffect(() => {
    if (publicKey) {
      const fetchPDA = async () => {
        try {
          const pda = await findListingPDA(publicKey);
          setListingPDA(pda);
        } catch (error) {
          console.error("Error computing PDA:", error);
        }
      };
      fetchPDA();
    }
  }, [publicKey]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!publicKey || !amount || !program || !listingPDA) return;

      try {
        setLoading(true);
        const amountLamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL);

        await program.methods
          .createListing(
            new anchor.BN(amountLamports),
            title,
            description
          )
          .accounts({
            listing: listingPDA,
            receiver: publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();

        router.push('/marketplace');
      } catch (error) {
        console.error("Error creating listing:", error);
      } finally {
        setLoading(false);
      }
    },
    [publicKey, amount, program, listingPDA, title, description, router]
  );

  if (!publicKey) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-xl text-gray-400">Please connect your wallet to create a listing</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-100">Create Fundraiser</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-400">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
            className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                     text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 
                     focus:ring-[#00f8ff] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            required
            rows={4}
            className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                     text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 
                     focus:ring-[#00f8ff] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">Target Amount (SOL)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.1"
            required
            className="mt-1 block w-full rounded-md bg-gray-800 border border-gray-700 
                     text-gray-100 px-4 py-2 focus:outline-none focus:ring-2 
                     focus:ring-[#00f8ff] focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !listingPDA}
          className="w-full bg-[#39ff14] text-black px-4 py-2 rounded-lg font-semibold 
                   hover:bg-opacity-80 transition-colors disabled:opacity-50 
                   disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Fundraiser'}
        </button>
      </form>
    </div>
  );
}
