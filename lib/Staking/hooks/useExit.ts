import type { ContractWriteArgs } from "lib/types";
import { ChainId } from "lib/utils";
import { useContractWrite, usePrepareContractWrite } from "wagmi";

const useExit = (address: string, chainId: ChainId, wagmiConfig?: ContractWriteArgs) => {
  const { config } = usePrepareContractWrite({
    address,
    abi: ["function exit() external"],
    functionName: "exit",
    chainId: Number(chainId),
  });

  return useContractWrite({
    ...(wagmiConfig as any),
    ...config,
  });
};

export default useExit;
