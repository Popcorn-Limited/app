import { useContractRead } from "wagmi";
import { BigNumber } from 'ethers';

interface ClaimableTokensArgs {
    address: `0x${string}`;
    user: `0x${string}`;
    timestamp: number;
    chainId?: number;
}

export const useClaimableTokens = ({ chainId, address, user, timestamp }: ClaimableTokensArgs): { data: BigNumber } => {
    const { data: userBalance }: { data: BigNumber } = useContractRead({
        abi: ["function getUserBalanceAtTimestamp(address calldata user, uint256 calldata timestamp) external view returns (uint256)"],
        address,
        functionName: "getUserBalanceAtTimestamp",
        chainId: chainId,
        args: [user, timestamp],
    });
    // console.log("PING", user, timestamp, userBalance);
    return { data: userBalance };
};
