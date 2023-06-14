import { useContractRead } from "wagmi";

const useAdapterAddress = (address: string, chainId?: any) => {
  return useContractRead({
    abi: ["function adapter() external view returns (address)"],
    address,
    functionName: "adapter",
    chainId,
  }) as ReturnType<typeof useContractRead> & { data: string };
};

export default useAdapterAddress;
