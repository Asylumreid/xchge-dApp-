# Xchge

**Xchge** is a decentralized donation platform built on the Solana blockchain. It allows individuals to create donation listings with specific funding goals and enables donors to contribute directly to these causes in a secure and trustless manner.

---

## Demo and Deployment

- **Frontend Website**: [Xchge Donations](https://xchge.vercel.app/)  
- **Video Demo**
  https://github.com/user-attachments/assets/fdae9024-eaa8-4387-9e48-c5e809fabbb8

- **Anchor Program Deployment**:
  - **Program ID**: `EfoXx4qV31vftc8zbridvZ1cc62o5UvmGFk7zfooyCXP`
  - **ProgramData Address**: `3RNJhiJ8XVwumhUqUMseAS7HBvmozPMDXHeceZPTkB5z`
  - **Authority**: `Bdzsu4MjHjgsDZ6MDqkzxDgDyPAkMcDJqyqHQcdLLAmQ`
  - **Deployed Slot**: `344635902`

---

## How It Works

### Purpose
**Xchge** enables creators to raise funds for their projects or causes through a decentralized, transparent, and secure platform. The key features include:

1. **Create Listings**: Receivers can create donation listings specifying a funding goal, a title, and a description of the project or cause.
2. **Donate**: Donors can contribute SOL directly to a receiver’s wallet via an on-chain transaction.
3. **Dynamic Status**: Listings are automatically marked as completed once the funding goal is reached.

### Key Features
- **On-Chain Transactions**: All donations and listings are stored securely on the Solana blockchain.
- **Transparency**: Funds are sent directly to the receiver's wallet, eliminating intermediaries.
- **Program Derived Addresses (PDAs)**: Used to manage and identify listings.
- **Error Handling**: Custom error codes for validation.

---

## Instructions

### 1. Build and Test the Anchor Program Locally

#### Prerequisites
- [Anchor](https://project-serum.github.io/anchor/getting-started/installation.html) installed.
- Solana CLI installed and configured.

#### Steps
1. Clone the repository:
   ```bash
   cd xchge
   ```

2. Build the program:
   ```bash
   anchor build
   ```

3. Deploy the program (optional if already deployed):
   ```bash
   anchor deploy
   ```

4. Run tests:
   ```bash
   anchor test
   ```

   - Tests include:
     - **Happy Paths**: Successful creation of listings, donations, and listing completion.
     - **Error Paths**: Invalid amounts, empty or excessively long titles/descriptions, and donations to inactive listings.

---

### 2. Run the Frontend Locally

#### Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [Yarn](https://yarnpkg.com/) or npm installed.

#### Steps
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   cd xchge-frontend
   ```

2. Install dependencies:
   ```bash
   npm run build
   ```

3. Start the development server:
   ```bash
   npm run start
   ```

4. Open your browser and navigate to:
   ```plaintext
   http://localhost:3000
   ```

   The frontend connects to the Solana Devnet to interact with the deployed Anchor program.

---

## Technical Highlights

1. **Program Derived Addresses (PDAs)**:
   - PDAs are used for managing listings, ensuring unique and predictable account identifiers.
   - Example seed: `[b"listing", receiver.key().as_ref()]`.

2. **Custom Error Handling**:
   - Validation for invalid amounts, empty titles, excessively long fields, and inactive listings.

3. **Frontend**:
   - Built with **Next.js** and integrated with the Solana Wallet Adapter for easy wallet connection and transactions.

4. **Dynamic Listing Status**:
   - Listings dynamically transition to `Completed` once the funding goal is reached.

---

## Contribution

Hopefully this is enough to pass! 

---

