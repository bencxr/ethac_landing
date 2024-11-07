"use client";
/* eslint-disable */
import type { NextPage } from "next";
import { useEffect, useState } from "react";

import { Web3Auth } from "@web3auth/modal";

import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { AccountAbstractionProvider, SafeSmartAccount } from "@web3auth/account-abstraction-provider";

import {
    ADAPTER_EVENTS,
    CHAIN_NAMESPACES,
    IAdapter,
    IProvider,
    UX_MODE,
    WALLET_ADAPTERS,
    WEB3AUTH_NETWORK,
} from "@web3auth/base";

import { getInjectedAdapters } from "@web3auth/default-evm-adapter";
import { AuthAdapter, WHITE_LABEL_THEME, WhiteLabelData } from "@web3auth/auth-adapter";

import RPC from "./ethersRPC";

const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x2105",
    rpcTarget: "https://rpc.ankr.com/base",
    displayName: "Base",
    blockExplorer: "https://basescan.org/",
    ticker: "ETH",
    tickerName: "Ethereum",
    // Add these required properties:
    decimals: 18,
    networkId: "8453",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });
const pimlicoAPIKey = "pim_ggWVh99izrsA8rmbSvRNRa";
const accountAbstractionProvider = new AccountAbstractionProvider({
    config: {
        chainConfig,
        smartAccountInit: new SafeSmartAccount(),
        bundlerConfig: {
            // Get the pimlico API Key from dashboard.pimlico.io
            url: `https://api.pimlico.io/v2/8453/rpc?apikey=pim_ggWVh99izrsA8rmbSvRNRa`,
        },
        paymasterConfig: {
            // Get the pimlico API Key from dashboard.pimlico.io
            url: `https://api.pimlico.io/v2/8453/rpc?apikey=pim_ggWVh99izrsA8rmbSvRNRa`,
        },
    },
});

// const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // this is the web3auth demo default
const clientId = "BJmYNZMKxLHdmXdffnYBaK0OD4NFGHsCXuYWcAwUUvofNqr3vdlg_whLI4wWYm1An5TFHJN9PkEDEElEYaOIkZA"; //  get from https://dashboard.web3auth.io

const web3AuthOptions = {
    clientId,
    chainConfig,
    enableLogging: true,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    privateKeyProvider,
    accountAbstractionProvider,
    useAAWithExternalWallet: false
};

const web3auth = new Web3Auth(web3AuthOptions);

const Web3AuthStarter: NextPage = () => {
    const [provider, setProvider] = useState<AccountAbstractionProvider | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                // IMP START - Configuring External Wallets

                const adapters = await getInjectedAdapters({ options: web3AuthOptions });
                const authAdapter = new AuthAdapter({
                    adapterSettings: {
                        clientId, //Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
                        network: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET, // Optional - Provide only if you haven't provided it in the Web3Auth Instantiation Code
                        uxMode: UX_MODE.REDIRECT,
                        /*
                        whiteLabel: {
                            appName: "W3A Heroes",
                            appUrl: "https://web3auth.io",
                            logoLight: "https://web3auth.io/images/web3auth-logo.svg",
                            logoDark: "https://web3auth.io/images/web3auth-logo---Dark.svg",
                            defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl, tr
                            mode: "dark", // whether to enable dark mode. defaultValue: auto
                            theme: {
                                primary: "#00D1B2",
                            } as WHITE_LABEL_THEME,
                            useLogoLoader: true,
                        } as WhiteLabelData,*/
                    },
                    privateKeyProvider,
                });

                web3auth.configureAdapter(authAdapter);

                adapters.forEach((adapter: IAdapter<unknown>) => {
                    console.log(adapter.name);
                    web3auth.configureAdapter(adapter);
                });
                // IMP END - Configuring External Wallets
                // IMP START - SDK Initialization
                await web3auth.initModal();
                console.log("initModal");
                // IMP END - SDK Initialization
                setProvider(accountAbstractionProvider);

                if (web3auth.connected) {
                    setLoggedIn(true);
                }
                web3auth.on(ADAPTER_EVENTS.CONNECTED, () => {
                    setLoggedIn(true);
                });
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, []);


    const login = async () => {
        // IMP START - Login
        const web3authProvider = await web3auth.connect();
        // IMP END - Login
        setProvider(accountAbstractionProvider);
        if (web3auth.connected) {
            setLoggedIn(true);
        }
    };

    const getUserInfo = async () => {
        // IMP START - Get User Information
        const user = await web3auth.getUserInfo();
        // IMP END - Get User Information
        uiConsole(user);
    };

    const logout = async () => {
        // IMP START - Logout
        await web3auth.logout();
        // IMP END - Logout
        setProvider(null);
        setLoggedIn(false);
        uiConsole("logged out");
    };

    function uiConsole(...args: any[]): void {
        const el = document.querySelector("#console>p");
        if (el) {
            el.innerHTML = JSON.stringify(args || {}, null, 2);
            console.log(...args);
        }
    }

    // IMP START - Blockchain Calls
    // Check the RPC file for the implementation
    const getChainId = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const chainId = await RPC.getChainId(provider);
        uiConsole(chainId);
    };


    // IMP START - Blockchain Calls
    // Check the RPC file for the implementation
    const getAccounts = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const signerAddress = await RPC.getAccounts(privateKeyProvider);
        const smartContractAddress = await RPC.getAccounts(accountAbstractionProvider);
        uiConsole(`
            signerAddress: ${signerAddress}
            smartContractAddress: ${smartContractAddress}
            `);
    };

    const getBalance = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const balance = await RPC.getBalance(provider);
        uiConsole(balance);
    };

    const signMessage = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        const signedMessage = await RPC.signMessage(provider);
        uiConsole(signedMessage);
    };

    const sendTransaction = async () => {
        if (!provider) {
            uiConsole("provider not initialized yet");
            return;
        }
        uiConsole("Sending Transaction...");
        const transactionReceipt = await RPC.sendTransaction(provider);
        console.log(transactionReceipt);
        uiConsole(`
            transactionReceipt.receipt.transactionHash: ${transactionReceipt.receipt.transactionHash}
            transactionReceipt.userOpHash: ${transactionReceipt.userOpHash}
            transactionReceipt.receipt.status: ${transactionReceipt.receipt.status}
            transactionReceipt.receipt.logs: ${transactionReceipt.receipt.logs.length}
            `);
    };
    // IMP END - Blockchain Calls

    const loggedInView = (
        <>
            <div className="flex-container">
                <div>
                    <button onClick={getUserInfo} className="card">
                        Get User Info
                    </button>
                </div>
                <div>
                    <button onClick={getChainId} className="card">
                        Get Chain Id
                    </button>
                </div>
                <div>
                    <button onClick={getAccounts} className="card">
                        Get Accounts
                    </button>
                </div>
                <div>
                    <button onClick={getBalance} className="card">
                        Get Balance
                    </button>
                </div>
                <div>
                    <button onClick={signMessage} className="card">
                        Sign Message
                    </button>
                </div>
                <div>
                    <button onClick={sendTransaction} className="card">
                        Send Transaction
                    </button>
                </div>
                <div>
                    <button onClick={logout} className="card">
                        Log Out
                    </button>
                </div>
            </div>
        </>
    );

    const unloggedInView = (
        <button onClick={login} className="card">
            Login
        </button>
    );

    return (
        <>
            <div className="text-center mt-8 bg-secondary p-10">
                <h1 className="text-4xl my-0">Web3Auth usage</h1>
                <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
                <div id="console" style={{ whiteSpace: "pre-line" }}>
                    <p style={{ whiteSpace: "pre-line" }}></p>
                </div>
            </div>
        </>
    );
};

export default Web3AuthStarter;
