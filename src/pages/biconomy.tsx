'use client';
import { createNexusClient, createBicoPaymasterClient, NexusClient } from "@biconomy/sdk";
import { baseSepolia } from "viem/chains";
import { http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useEffect, useState } from "react";

import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3Auth } from "@web3auth/modal";
import { ethers } from "ethers";

const bundlerUrl = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL;
const paymasterUrl = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL;

// WARNING this code is highly sensitive to the bundler and paymaster urls
// I could only get this bundlerURL to work: NEXT_PUBLIC_BICONOMY_BUNDLER_URL=https://sdk-relayer.staging.biconomy.io/api/v3/84532/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44

const clientId = "BJmYNZMKxLHdmXdffnYBaK0OD4NFGHsCXuYWcAwUUvofNqr3vdlg_whLI4wWYm1An5TFHJN9PkEDEElEYaOIkZA"; //  get from https://dashboard.web3auth.io
const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x14a34",
    rpcTarget: "https://sepolia.base.org/",
    displayName: "Base Sepolia",
    blockExplorer: "https://sepolia.basescan.org/",
    ticker: "ETH",
    tickerName: "Ethereum",
    // Add these required properties:
    decimals: 18,
};
const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
const web3AuthOptions = {
    clientId,
    chainConfig,
    enableLogging: true,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    privateKeyProvider
};
const web3auth = new Web3Auth(web3AuthOptions);

export default function Biconomy() {
    const [address, setAddress] = useState<string | null>(null);
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
    const [nexusClient, setNexusClient] = useState<NexusClient | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [smartAccountBalance, setSmartAccountBalance] = useState<string | null>(null);
    const setup = async () => {
        const ethersProvider = new ethers.BrowserProvider(privateKeyProvider as any);
        const web3AuthSigner = await ethersProvider.getSigner();
        const eoa = await web3AuthSigner.getAddress();
        console.log("EOA: ", eoa);
        setAddress(eoa);
        const eoaBalance = await ethersProvider.getBalance(eoa);
        console.log("Balance: ", eoaBalance);
        setBalance(eoaBalance.toString());

        const newNexusClient = await createNexusClient({
            signer: web3AuthSigner,
            chain: baseSepolia,
            transport: http(),
            bundlerTransport: http(bundlerUrl),
            paymaster: createBicoPaymasterClient({ paymasterUrl })
        });

        setNexusClient(newNexusClient);
        const smartAccountAddress = await newNexusClient.account.address;
        setSmartAccountAddress(smartAccountAddress);
        console.log("Smart account address: ", smartAccountAddress);

        const smartAccountBalance = await ethersProvider.getBalance(smartAccountAddress);
        console.log("Smart account balance: ", smartAccountBalance);
        setSmartAccountBalance(smartAccountBalance.toString());
    };

    const init = async () => {
        await web3auth.initModal();
        if (web3auth.connected) {
            setLoggedIn(true);
            setup();
        }
    };
    useEffect(() => {
        init();
    }, []);

    const [userOpHash, setUserOpHash] = useState<string>("");
    const [txHash, setTxHash] = useState<string>("");
    const sendGaslessTransaction = async () => {
        if (!nexusClient) return;
        const userOpHash = await nexusClient.sendUserOperation({
            calls: [{
                to: '0xF15A780336068B58997bFd4640F008349c27636C',
                value: parseEther('0.0002')
            }],

        });
        console.log("User Op Hash: ", userOpHash);
        setUserOpHash(userOpHash);
        const receipt = await nexusClient.waitForUserOperationReceipt({ hash: userOpHash });
        console.log("Receipt: ", receipt);
        setTxHash(receipt.receipt.transactionHash);
    }

    const [loggedIn, setLoggedIn] = useState(false);
    const login = async () => {
        // IMP START - Login
        const web3authProvider = await web3auth.connect();

        if (web3auth.connected) {
            setLoggedIn(true);
            setup();
        }
    };
    const logout = async () => {
        // IMP START - Logout
        await web3auth.logout();
        setLoggedIn(false);
    };

    const loggedInView = (
        <>
            <div className="flex-container">
                Address: {address}
            </div>
            <div>
                Balance: {balance}
            </div>
            <button onClick={logout}>Logout</button>
        </>
    );

    const unloggedInView = (
        <button onClick={login} className="card">
            Login
        </button>
    );

    return <div>
        Web3Auth
        <br />
        <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
        <hr />
        Biconomy
        {smartAccountAddress ? <div>Smart account address: {smartAccountAddress}</div> : <div>Loading...</div>}
        {smartAccountBalance ? <div>Smart account balance: {smartAccountBalance}</div> : <div>Loading...</div>}
        <button onClick={sendGaslessTransaction}>Send gasless transaction</button>
        <hr />
        {userOpHash ? <div>User Op Hash: {userOpHash}</div> : <div>No user op hash</div>}
        {txHash ? <div>Transaction hash: {txHash}</div> : <div>No transaction hash</div>}
    </div>;
}