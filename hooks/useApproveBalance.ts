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
    args: [spender, constants.MaxUint256],
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};

export default useApproveBalance;
