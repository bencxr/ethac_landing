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

    const sendGaslessTransaction = async () => {
        if (!nexusClient) return;
        const hash = await nexusClient.sendTransaction({
            calls: [{
                to: '0xF15A780336068B58997bFd4640F008349c27636C',
                value: parseEther('0.0002')
            }],

        });
        console.log("Transaction hash: ", hash);
    }

    useEffect(() => {
        setup();
    }, []);

    /*
    const hash = await nexusClient.sendTransaction({
        calls:
            [{ to: '0xf5715961C550FC497832063a98eA34673ad7C816', value: parseEther('0.0001') }]
    },
    );
    console.log("Transaction hash: ", hash)
    const receipt = await nexusClient.waitForTransactionReceipt({ hash });
    */

    return <div>Biconomy
        {smartAccountAddress ? <div>Smart account address: {smartAccountAddress}</div> : <div>Loading...</div>}
        <button onClick={sendGaslessTransaction}>Send gasless transaction</button>
    </div>;
}