import './globals.css'
import { Inter } from 'next/font/google'
import { SolanaProvider } from '@/context/SolanaProvider'
import { Layout } from '@/components/Layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'XCHGE - Decentralized Fundraising',
  description: 'Peer-to-peer marketplace for fundraising and crowdfunding.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaProvider>
          <Layout>
            {children}
          </Layout>
        </SolanaProvider>
      </body>
    </html>
  )
}