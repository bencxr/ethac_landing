// Import Push SDK & Ethers
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import "dotenv/config"

// Creating a random signer from a wallet, ideally this is the wallet you will connect

const provider = new ethers.AlchemyProvider("mainnet", "vA7xTZ_8wQ7skP5dXQCNu84m07R3WA5X");

const signer = new ethers.Wallet(process.env.BACKEND_ACCOUNT_PRIVATEKEY, provider)
console.log(signer.address);

// Initialize wallet user
// 'CONSTANTS.ENV.PROD' -> mainnet apps | 'CONSTANTS.ENV.STAGING' -> testnet apps
const user = await PushAPI.initialize(signer, {
    env: CONSTANTS.ENV.PROD,
});

// List inbox notifications
const channelSubscriptions = await user.channel.subscribers();
console.log("subscriptions", channelSubscriptions);


const sendNotifRes = await user.channel.send(['*'], {
    notification: { title: 'test', body: 'helloo world ddd' },
});
//console.log("sendNotifRes", sendNotifRes.body);

/*

You will need 50 push and to create a channel to send notifications first

const response = await user.channel.create({
    name: 'The Channel',
    description: 'First channel',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAz0lEQVR4AcXBsU0EQQyG0e+saWJ7oACiKYDMEZVs6GgSpC2BIhzRwAS0sgk9HKn3gpFOAv3v3V4/3+4U4Z1q5KTy42Ql940qvFONnFSGmCFmiN2+fj7uCBlihpgh1ngwcvKfwjuVIWaIGWKNB+GdauSk8uNkJfeNKryzYogZYoZY40m5b/wlQ8wQM8TayMlKeKcaOVkJ71QjJyuGmCFmiDUe+HFy4VyEd57hx0mV+0ZliBlihlgL71w4FyMnVXhnZeSkiu93qheuDDFDzBD7BcCyMAOfy204AAAAAElFTkSuQmCC',
    url: 'https://push.org',
});

console.log("response", response);
*/