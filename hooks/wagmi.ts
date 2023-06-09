import type { ContractWriteArgs } from "lib/types";
import { useContractRead } from "wagmi";

export const useTypedReadCall = <TypeData>(config: ContractWriteArgs) => {
  const chainId = config?.chainId;
  return useContractRead({
    ...(config as any),
    chainId: chainId ? Number(chainId) : chainId,
  }) as ReturnType<typeof useContractRead> & { data?: TypeData };
};
