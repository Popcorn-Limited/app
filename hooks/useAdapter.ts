import { useToken } from "wagmi";
import { useNamedAccounts } from "lib/utils";
import useAdapterAddress from "./useAdapterAddress";

function useAdapterToken(vaultAddress: string, chainId?: any) {
  const { data: vaultTokenAddr } = useAdapterAddress(vaultAddress, chainId);
  const [asset] = useNamedAccounts(chainId as any, vaultTokenAddr ? [vaultTokenAddr] : []);

  const result = useToken({
    address: vaultTokenAddr as any,
    chainId,
  });
  return {
    ...result, data: { ...result?.data, symbol: asset?.symbol || result?.data?.symbol, name: asset?.name || result?.data?.name }
  }
}

export default useAdapterToken;
