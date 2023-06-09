import { ChainId } from "lib/utils/connectors";
import { useNamedAccounts } from "lib/utils";
import { useMemo } from "react";

export const useDefaultTokenList = (chainId: ChainId) => {
  const [dai, usdc, usdt] = useNamedAccounts(String(chainId) as any, ["dai", "usdc", "usdt", ""]);
  return useMemo(() => [dai, usdc, usdt].filter((token) => !!token), [chainId]);
};
