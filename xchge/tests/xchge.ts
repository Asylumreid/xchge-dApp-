import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Xchge } from "../target/types/xchge";
import { expect } from "chai";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("xchge", () => {
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.Xchge as Program<Xchge>;
  
  let receiver: anchor.web3.Keypair;
  let donor: anchor.web3.Keypair;
  let listingPDA: PublicKey;
  
  beforeEach(async () => {
    receiver = anchor.web3.Keypair.generate();
    donor = anchor.web3.Keypair.generate();
    
    // Airdrop SOL
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(receiver.publicKey, 10 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(donor.publicKey, 10 * LAMPORTS_PER_SOL)
    );
    
    [listingPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), receiver.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("create_listing", () => {
    it("successfully creates listing", async () => {
      const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
      const title = "Help Fund My Education";
      const description = "Need help with university tuition";

      await program.methods
        .createListing(amount, title, description)
        .accounts({
          listing: listingPDA,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([receiver])
        .rpc();

      const listing = await program.account.listing.fetch(listingPDA);
      expect(listing.receiver.toString()).to.equal(receiver.publicKey.toString());
      expect(listing.amount.toString()).to.equal(amount.toString());
      expect(listing.title).to.equal(title);
      expect(listing.description).to.equal(description);
      expect(listing.status).to.deep.equal({ active: {} });
      expect(listing.receivedAmount.toString()).to.equal("0");
    });

    it("fails with zero amount", async () => {
      try {
        await program.methods
          .createListing(new anchor.BN(0), "Title", "Description")
          .accounts({
            listing: listingPDA,
            receiver: receiver.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([receiver])
          .rpc();
        expect.fail("Expected to fail");
      } catch (err: any) {
        const errMsg = err.toString();
        expect(errMsg).to.include("Error Code: InvalidAmount");
      }
    });

    it("fails with empty title", async () => {
      try {
        await program.methods
          .createListing(new anchor.BN(LAMPORTS_PER_SOL), "", "Description")
          .accounts({
            listing: listingPDA,
            receiver: receiver.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([receiver])
          .rpc();
        expect.fail("Expected to fail");
      } catch (err: any) {
        const errMsg = err.toString();
        expect(errMsg).to.include("Error Code: EmptyTitle");
      }
    });
  });

  describe("donate", () => {
    beforeEach(async () => {
      // Create listing
      const amount = new anchor.BN(5 * LAMPORTS_PER_SOL);
      await program.methods
        .createListing(amount, "Help needed", "Please help")
        .accounts({
          listing: listingPDA,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([receiver])
        .rpc();
    });

    it("successfully donates", async () => {
      const donationAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
      const receiverInitialBalance = await provider.connection.getBalance(receiver.publicKey);

      await program.methods
        .donate(donationAmount)
        .accounts({
          listing: listingPDA,
          donor: donor.publicKey,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([donor])
        .rpc();

      const listing = await program.account.listing.fetch(listingPDA);
      expect(listing.receivedAmount.toString()).to.equal(donationAmount.toString());
      
      const receiverFinalBalance = await provider.connection.getBalance(receiver.publicKey);
      expect(receiverFinalBalance).to.be.greaterThan(receiverInitialBalance);
    });

    it("fails with insufficient funds", async () => {
      const poorDonor = anchor.web3.Keypair.generate();
      try {
        await program.methods
          .donate(new anchor.BN(LAMPORTS_PER_SOL))
          .accounts({
            listing: listingPDA,
            donor: poorDonor.publicKey,
            receiver: receiver.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorDonor])
          .rpc();
        expect.fail("Expected to fail");
      } catch (err: any) {
        expect(err.toString()).to.include("custom program error: 0x1");
      }
    });

    it("completes listing when target reached", async () => {
      const donationAmount = new anchor.BN(5 * LAMPORTS_PER_SOL);
      
      await program.methods
        .donate(donationAmount)
        .accounts({
          listing: listingPDA,
          donor: donor.publicKey,
          receiver: receiver.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([donor])
        .rpc();

      const listing = await program.account.listing.fetch(listingPDA);
      expect(listing.status).to.deep.equal({ completed: {} });
    });
  });
  
});