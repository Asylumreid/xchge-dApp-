'use client';

import Link from 'next/link';
import { WalletButton } from './WalletButton';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#00f8ff] via-[#b600ff] to-[#39ff14] bg-clip-text text-transparent">
              XCHGE
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link
                  href="/marketplace"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/marketplace'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/create"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/create'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Create Listing
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
}