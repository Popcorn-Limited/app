import { Yearn } from "@yfi/sdk";
import { RPC_PROVIDERS } from "lib/utils";
import { useMemo } from "react";

export const useClient = ({ chainId }) => {
  const client = useMemo(() => {
    return new Yearn(chainId, {
      provider: RPC_PROVIDERS[chainId],
      subgraph: {
        mainnetSubgraphEndpoint: "https://api.thegraph.com/subgraphs/name/rareweasel/yearn-vaults-v2-subgraph-mainnet",
      },
    });
  }, [chainId]);
  return client;
};
