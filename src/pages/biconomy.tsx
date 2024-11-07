'use client';
import { createNexusClient, createBicoPaymasterClient, NexusClient } from "@biconomy/sdk";
import { baseSepolia } from "viem/chains";
import { http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { useEffect, useState } from "react";

const privateKey = process.env.NEXT_PUBLIC_BICONOMY_PRIVATE_KEY;
const account = privateKeyToAccount(`0x${privateKey}`);
const bundlerUrl = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL;
const paymasterUrl = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL;

// WARNING this code is highly sensitive to the bundler and paymaster urls
// I could only get this bundlerURL to work: NEXT_PUBLIC_BICONOMY_BUNDLER_URL=https://sdk-relayer.staging.biconomy.io/api/v3/84532/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44

export default function Biconomy() {

    const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
    const [nexusClient, setNexusClient] = useState<NexusClient | null>(null);

    const setup = async () => {
        const newNexusClient = await createNexusClient({
            signer: account,
            chain: baseSepolia,
            transport: http(),
            bundlerTransport: http(bundlerUrl),
            paymaster: createBicoPaymasterClient({ paymasterUrl })
        });

        setNexusClient(newNexusClient);
        const smartAccountAddress = await newNexusClient.account.address;
        setSmartAccountAddress(smartAccountAddress);
        console.log("Smart account address: ", smartAccountAddress);
    };

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

    useEffect(() => {
        setup();
    }, []);

    return <div>
        Web3Auth
        <br />
        <hr />
        Biconomy
        {smartAccountAddress ? <div>Smart account address: {smartAccountAddress}</div> : <div>Loading...</div>}
        <button onClick={sendGaslessTransaction}>Send gasless transaction</button>
        <hr />
        {userOpHash ? <div>User Op Hash: {userOpHash}</div> : <div>No user op hash</div>}
        {txHash ? <div>Transaction hash: {txHash}</div> : <div>No transaction hash</div>}
    </div>;
}