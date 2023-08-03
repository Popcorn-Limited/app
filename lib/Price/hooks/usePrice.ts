import useSWR from "swr";
import { BigNumber } from "ethers";
import { resolve_price } from "lib/utils/resolvers/price-resolvers/resolve_price";
import { Pop } from "lib/types";
import { popHookAdapter } from "lib/utils/hooks/swrPopHookAdapter";
import { RPC_PROVIDERS, useNamedAccounts } from "lib/utils";
import { usePublicClient } from "wagmi";

interface Props extends Pop.StdProps {
  resolver?: string;
}
export const usePrice: Pop.Hook<{ value: BigNumber; decimals: number }> = ({ address, chainId, resolver }: Props) => {
  const publicClient = usePublicClient()
  const [metadata] = useNamedAccounts(chainId.toString() as any, (!!address && [address]) || []);
  const _resolver = resolver || (metadata?.priceResolver && metadata?.priceResolver) || undefined;
  const shouldFetch = !!address && !!chainId;

  return popHookAdapter(
    useSWR(
      shouldFetch ? [`usePrice:${chainId}:${address}:${resolver}`] : null,
      async () => !!address && resolve_price({ address, chainId, rpc: publicClient, resolver: _resolver }),
    ),
  );
};
export default usePrice;
