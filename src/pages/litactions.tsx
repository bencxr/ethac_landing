/**
 * https://developer.litprotocol.com/sdk/access-control/quick-start
 * https://chronicle-yellowstone-faucet.getlit.dev/
 * Needs TSTLIT tokens go to https://explorer.litprotocol.com/, and add capacity credits there
 * 
 * Decrypting securely within LIT Action:
 * https://developer.litprotocol.com/sdk/serverless-signing/combining-decryption-shares
 * 
 * On immutability:
 * https://developer.litprotocol.com/sdk/serverless-signing/immutability
 * 
 * To make a lit action actually meaningful, it needs to be minted to a PKP.
 * https://github.com/LIT-Protocol/custom-auth-telegram-example/tree/8f6017dd90228291e0f6b0268ac4127bc8a100cb/src
 * 
 */

import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { useEffect, useState } from "react";
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
    LitActionResource,
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

    const _litActionCode = async () => {
        if (magicNumber >= 42) {
            LitActions.setResponse({ response: "The number is greater than or equal to 42!" });
        } else {
            LitActions.setResponse({ response: "The number is less than 42!" });
        }
    }

    const litActionCode = `(${_litActionCode.toString()})();`;

    const [sessionSigs, setSessionSigs] = useState<LitJsSdk.SessionSigs | null>(null);

    const getLitSessionSigs = async () => {
        const sessionSigs = await client!.getSessionSigs({
            chain: "ethereum",
            expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
            resourceAbilityRequests: [
                {
                    resource: new LitActionResource("*"),
                    ability: LitAbility.LitActionExecution,
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

    const [result, setResult] = useState<string | null>("");
    const execute = async () => {
        const executionResult = await client!.executeJs({
            sessionSigs,
            code: litActionCode,
            jsParams: {
                magicNumber: 43,
            }
        });

        console.log("Execution result", executionResult);
        setResult(JSON.stringify(executionResult));
    }

    const [isClient, setIsClient] = useState(false)
    useEffect(() => {
        setIsClient(true);
        start();
    }, []);

    return <div>
        <button onClick={start}>Start</button>
        <br />
        <button onClick={getLitSessionSigs}>Get Session Sigs</button>
        <br />
        <button onClick={execute}>Execute</button>
        <hr />
        <p>Result: {result}</p>
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
