/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountAbstractionProvider } from "@web3auth/account-abstraction-provider";
import type { IProvider } from "@web3auth/base";
import { ethers } from "ethers";

const getChainId = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    // Get the connected Chain's ID
    const networkDetails = await ethersProvider.getNetwork();
    return networkDetails.chainId.toString();
  } catch (error) {
    return error;
  }
};

const getAccounts = async (provider: IProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get user's Ethereum public address
    const address = signer.getAddress();

    return await address;
  } catch (error) {
    return error;
  }
};

const getBalance = async (provider: IProvider): Promise<string> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get user's Ethereum public address
    const address = signer.getAddress();

    // Get user's balance in ether
    const balance = ethers.formatEther(
      await ethersProvider.getBalance(address), // Balance is in wei
    );

    return balance;
  } catch (error) {
    return error as string;
  }
};

const sendTransaction = async (provider: AccountAbstractionProvider): Promise<any> => {
  try {
    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const destination = "0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56";

    const amount = 100000000000000n;
    // const fees = await ethersProvider.getFeeData();
    console.log(signer.address);

    const bundlerClient = provider.bundlerClient!;
    const smartAccount = provider.smartAccount!;

    const userOpHash = await bundlerClient.sendUserOperation({
      account: smartAccount,
      calls: [
        {
          to: destination,
          value: amount,
          // data: "0xAA01", // Empty data field, or use "0x" + your_hex_data if needed
        },
      ],
    });

    // Retrieve user operation receipt
    const receipt = await bundlerClient.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return receipt;
  } catch (error) {
    return error as string;
  }
};

const signMessage = async (provider: IProvider): Promise<any> => {
  try {
    // For ethers v5
    // const ethersProvider = new ethers.providers.Web3Provider(provider);
    const ethersProvider = new ethers.BrowserProvider(provider);

    // For ethers v5
    // const signer = ethersProvider.getSigner();
    const signer = await ethersProvider.getSigner();
    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await signer.signMessage(originalMessage);

    return signedMessage;
  } catch (error) {
    return error as string;
  }
};

const exports = { getChainId, getAccounts, getBalance, sendTransaction, signMessage };
export default exports;
