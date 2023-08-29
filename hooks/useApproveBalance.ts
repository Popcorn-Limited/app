import type { ContractWriteArgs } from "lib/types";
import { ChainId } from "lib/utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { constants } from "ethers";

const useApproveBalance = (
  assetAddress: string,
  spender: string,
  chainId: ChainId,
  wagmiConfig?: ContractWriteArgs,
) => {
  const { config } = usePrepareContractWrite({
    address: assetAddress,
    abi: ["function approve(address spender, uint256 amount) public"],
    functionName: "approve",
    args: [spender, 115792089237316195423570985008687907853269984665640], // approve maxUint256 / 1e27 cause metaMask rounds stuff weirdly when you are above 18 decimals
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};

export default useApproveBalance;
