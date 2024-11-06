/**
 * https://developer.litprotocol.com/sdk/access-control/quick-start
 * https://chronicle-yellowstone-faucet.getlit.dev/
 * Needs TSTLIT tokens go to https://explorer.litprotocol.com/, and add capacity credits there
 */

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { useEffect, useState } from "react";
import { AccessControlConditions } from '@lit-protocol/types';
import { disconnectWeb3 } from "@lit-protocol/auth-browser";
import { useEthersSigner } from "./ethersHooks";
import { useAccount, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";

import {
    createSiweMessage,
    generateAuthSig,
    LitAbility,
    LitAccessControlConditionResource,
} from "@lit-protocol/auth-helpers";

export default function Lit() {
    const signer = useEthersSigner();

    const { address, chainId, status } = useAccount();
    const balanceResult = useBalance({ address });

    const [client, setClient] = useState<LitJsSdk.LitNodeClient | null>(null);

    const start = async () => {
        const litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: LitNetwork.Datil,
        });
        setClient(litNodeClient);

        await litNodeClient.connect();
    }

    const value = ethers.utils.parseUnits("1.5", "ether").toString();
    const chain = "ethereum";
    const accessControlConditions: AccessControlConditions = [
        {
            contractAddress: "",
            standardContractType: "",
            chain,
            method: "eth_getBalance",
            parameters: [":userAddress", "latest"],
            returnValueTest: {
                comparator: ">=",
                value
            },
        },
        { operator: "and" },
        {
            contractAddress: '0xf36446105ff682999a442b003f2224bcb3d82067',
            standardContractType: 'ERC721',
            chain,
            method: 'balanceOf',
            parameters: [
                ':userAddress'
            ],
            returnValueTest: {
                comparator: '>',
                value: '0'
            }
        }
    ];

    const [sessionSigs, setSessionSigs] = useState<LitJsSdk.SessionSigs | null>(null);

    const getLitSessionSigs = async () => {
        const sessionSigs = await client!.getSessionSigs({
            chain: "ethereum",
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            resourceAbilityRequests: [
                {
                    resource: new LitAccessControlConditionResource(
                        await LitAccessControlConditionResource.generateResourceString(
                            accessControlConditions,
                            dataToEncryptHash
                        )
                    ),
                    ability: LitAbility.AccessControlConditionDecryption,
                },
            ],
            authNeededCallback: async ({
                uri,
                expiration,
                resourceAbilityRequests,
            }) => {
                console.log("Signer", signer);
                const toSign = await createSiweMessage({
                    uri,
                    expiration,
                    resources: resourceAbilityRequests,
                    walletAddress: signer._address,
                    nonce: await client!.getLatestBlockhash(),
                    litNodeClient: client!
                });

                return await generateAuthSig({
                    signer,
                    toSign,
                });
            },
        });

        console.log("Session sigs", sessionSigs);
        setSessionSigs(sessionSigs);
        return sessionSigs;
    }

    const logOut = async () => {
        await disconnectWeb3();
        client!.disconnect();
        setClient(null);
    }

    const [ciphertext, setCiphertext] = useState<string>("");
    const [dataToEncryptHash, setDataToEncryptHash] = useState<string>("");
    const encrypt = async (message: string) => {
        const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString({
            accessControlConditions,
            dataToEncrypt: message,
        }, client!);

        setCiphertext(ciphertext);
        setDataToEncryptHash(dataToEncryptHash);
        return { ciphertext, dataToEncryptHash };
    }

    const decrypt = async () => {
        const decryptionResult = await LitJsSdk.decryptToString(
            {
                chain: "ethereum",
                ciphertext,
                dataToEncryptHash,
                accessControlConditions,
                sessionSigs,
            },
            client!
        );
        console.log("Decryption result", decryptionResult);
    }

    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
        setIsClient(true);
        start();
    }, []);

    return <div>
        <button onClick={start}>Start</button>
        <br />
        <button onClick={() => encrypt("Hello, world!")}>Encrypt</button>
        <br />
        <button onClick={getLitSessionSigs}>Get Session Sigs</button>
        <br />
        <button onClick={decrypt}>Decrypt</button>
        <hr />
        <p>Ciphertext: {ciphertext}</p>
        <p>Data to encrypt hash: {dataToEncryptHash}</p>
        <button onClick={logOut}>Log out</button>
        <hr />
        <div className="hidden lg:flex space-x-4">
            <div className="flex justify-end mt-[50px]">
                <ConnectButton chainStatus="icon" />
            </div>
        </div>
        {isClient && address && (
            <div className="bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-full px-4 py-2 text-sm text-blue-500">
                <span className="font-medium">Address:</span> {address}
                <br />
                <span className="font-medium">BalanceResult:</span> {balanceResult.data?.formatted}
                <br />
                <span className="font-medium">ChainID:</span> {chainId}
                <br />
                <span className="font-medium">Status:</span> {status}
            </div>
        )}
    </div>
        ;
}
