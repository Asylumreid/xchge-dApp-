'use client';

import * as anchor from '@coral-xyz/anchor';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { useProgram } from '@/hooks/useProgram';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';


interface ListingStatus {
  active?: boolean;
  completed?: boolean;
}

interface Listing {
  publicKey: anchor.web3.PublicKey;
  account: {
    receiver: anchor.web3.PublicKey;
    amount: anchor.BN;
    received_amount: anchor.BN;
    title: string;
    description: string;
    status: ListingStatus;
    creation_time: anchor.BN;
  };
}

export default function Marketplace() {
  const { publicKey } = useWallet();
  const { program } = useProgram();
  const [listings, setListings] = useState<Listing[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!program) return;

    console.log("useEffect triggered");

    const fetchListings = async () => {
      try {
        // @ts-expect-error - Issue with TypeScript types when compiling but works
        const accounts = await program.account.listing.all();
        console.log("Fetched Listings:", accounts);
        // Map and normalize fetched accounts
        // @ts-expect-error - Issue with TypeScript types when compiling but works
        const formattedListings = accounts.map(({ publicKey, account }) => ({
          publicKey,
          account: {
            receiver: account.receiver,
            amount: new anchor.BN(account.amount, 16), // Parse hex string
            received_amount: new anchor.BN(account.receivedAmount, 16), // Parse hex string
            title: account.title,
            description: account.description,
            status: account.status,
            creation_time: new anchor.BN(account.creationTime, 16), // Parse hex string
          },
        }));

        // Filter only active listings
        const activeListings = formattedListings.filter(
          // @ts-expect-error - Issue with TypeScript types when compiling but works
          (listing) => listing.account.status.active
        );

        setListings(activeListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();

    // Poll listings periodically
    const intervalId = setInterval(fetchListings, 1500);
    return () => clearInterval(intervalId);
  }, [program]);

  const handleDonate = async (listing: Listing) => {
    if (!publicKey || !program) return;

    try {
      const donationAmount = 1 * LAMPORTS_PER_SOL;

      await program.methods
        .donate(new anchor.BN(donationAmount))
        .accounts({
          listing: listing.publicKey,
          donor: publicKey,
          receiver: listing.account.receiver,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      setShowSuccess(true); // Show the success popup
      setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
    } catch (error) {
      console.error("Error donating:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-100">Active Fundraisers</h1>
      
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Successfully donated!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.publicKey.toString()}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 p-6 rounded-lg"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-100">
              {listing.account.title}
            </h2>
            <p className="text-gray-400 mb-4">{listing.account.description}</p>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Progress</span>
                <span>
                  {(
                    (Number(listing.account.received_amount) /
                      Number(listing.account.amount)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                <div
                  className="bg-[#00f8ff] rounded-full h-2"
                  style={{
                    width: `${
                      (Number(listing.account.received_amount) /
                        Number(listing.account.amount)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-gray-400">Target</span>
              <span className="text-2xl font-bold text-[#00f8ff]">
                {Number(listing.account.amount) / LAMPORTS_PER_SOL} SOL
              </span>
            </div>
            <button
              onClick={() => handleDonate(listing)}
              disabled={!publicKey}
              className="w-full bg-[#39ff14] text-black px-4 py-2 rounded-lg font-semibold 
                        hover:bg-opacity-80 transition-colors disabled:opacity-50 
                        disabled:cursor-not-allowed"
            >
              {publicKey ? "Donate 1 SOL" : "Connect Wallet to Donate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}