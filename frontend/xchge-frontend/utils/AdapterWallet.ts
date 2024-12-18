import { Transaction } from '@solana/web3.js';

export class AdapterWallet {
  private adapter: any;

  constructor(adapter: any) {
    this.adapter = adapter;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this.adapter.signTransaction) {
      throw new Error('Wallet does not support transaction signing');
    }
    return await this.adapter.signTransaction(tx);
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    if (!this.adapter.signAllTransactions) {
      throw new Error('Wallet does not support signing multiple transactions');
    }
    return await this.adapter.signAllTransactions(txs);
  }

  get publicKey() {
    return this.adapter.publicKey;
  }
}
