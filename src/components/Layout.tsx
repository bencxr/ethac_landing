import Head from 'next/head'
import { ReactNode } from 'react'

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
    return (
        <>
            <Head>
                <title>Eth.ac Decentralized Web Gateway</title>
                <meta name="description" content="Explore the latest updates from the decentralized web" />
                <link rel="icon" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#4F46E5" />
            </Head>
            <main>{children}</main>
        </>
    )
} 