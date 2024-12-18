'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export function WalletButton() {
  const { connected, publicKey } = useWallet();
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (publicKey) {
      setAddress(publicKey.toBase58());
    }
  }, [publicKey]);

  return (
    <div className="relative group">
      <WalletMultiButton 
        className="!bg-transparent !text-white !border-2 !border-[#00f8ff] hover:!bg-[#00f8ff]/10 transition-all !h-10 !px-4 !rounded-lg"
      />
      {connected && address && (
        <div className="absolute top-full mt-2 right-0 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg border border-[#00f8ff]/20 text-xs text-[#00f8ff] opacity-0 group-hover:opacity-100 transition-opacity">
          {address}
        </div>
      )}
    </div>
  );
}