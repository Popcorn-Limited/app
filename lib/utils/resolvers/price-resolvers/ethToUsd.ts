import axios from 'axios';
import { ethers } from 'ethers';

async function getEthToUsdPrice(): Promise<number> {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        return response.data.ethereum.usd;
    } catch (error) {
        throw new Error('Failed to fetch ETH price from CoinGecko');
    }
}

export async function convertEthToUsd(ethAmount: number): Promise<number> {
    const ethToUsdPrice = await getEthToUsdPrice();
    return ethAmount * ethToUsdPrice;
}
