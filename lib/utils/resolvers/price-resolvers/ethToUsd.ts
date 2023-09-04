import { useState, useEffect } from 'react';
import axios from 'axios';
import { BigNumber, utils } from 'ethers';

// Fetches the current ETH to USD price.
async function getEthToUsdPrice(): Promise<number> {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        return response.data.ethereum.usd;
    } catch (error) {
        throw new Error('Failed to fetch ETH price from CoinGecko');
    }
}

// Converts an ETH amount (represented as a BigNumber) to its equivalent in USD as a BigNumber.
async function convertEthToUsd(ethAmount: BigNumber): Promise<BigNumber> {
    const ethToUsdPrice = await getEthToUsdPrice();
    const ethAmountFloat = parseFloat(utils.formatEther(ethAmount));
    const usdValue = ethAmountFloat * ethToUsdPrice;
    return utils.parseUnits(usdValue.toString(), 'ether'); // Note: We're using 'ether' as a way to handle 18 decimals.
}

// Custom hook to get the USD value for an ETH amount represented as a BigNumber.
export function useEthToUsd(ethAmount: BigNumber) {
    const [usdValue, setUsdValue] = useState<BigNumber | null>(null);

    useEffect(() => {
        async function fetchUsdValue() {
            try {
                const value = await convertEthToUsd(ethAmount);
                setUsdValue(value);
            } catch (error) {
                console.error(error);
            }
        }

        fetchUsdValue();
    }, [ethAmount]);

    return usdValue;
}
