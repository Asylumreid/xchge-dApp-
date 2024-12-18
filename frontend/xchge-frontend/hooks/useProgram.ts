import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, clusterApiUrl, Connection } from '@solana/web3.js';
import { useMemo } from 'react';
import idl from '../target/idl/xchge.json';

const programId = new PublicKey("EfoXx4qV31vftc8zbridvZ1cc62o5UvmGFk7zfooyCXP");

export type XchgeProgram = Program<Idl>;

export function useProgram() {
  // Use a Devnet connection explicitly
  const wallet = useWallet();

  const connection = useMemo(
    () => new Connection(clusterApiUrl("devnet"), "confirmed"),
    [] // Dependency array ensures `connection` is created only once
  );

  const provider = useMemo(
    () =>
      new AnchorProvider(
        connection,
        wallet as any, // Ensure the wallet is connected to Devnet
        AnchorProvider.defaultOptions()
      ),
    [connection, wallet] // Recreate only if `connection` or `wallet` changes
  );

  const program = useMemo(
    () => new Program(idl as Idl, provider),
    [provider]
  );

  return { program, provider };
}

export async function findListingPDA(receiver: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("listing"), receiver.toBuffer()],
    programId
  )[0];
}
