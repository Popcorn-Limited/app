import { useToken } from "wagmi";
import useVaultTokenAddress from "./useVaultTokenAddress";
import { useEffect, useState } from "react";
import { ChainId } from "lib/utils";

const EMPTY_TOKEN = {
  1: "https://etherscan.io/images/main/empty-token.png",
  1337: "https://etherscan.io/images/main/empty-token.png",
  5: "https://etherscan.io/images/main/empty-token.png",
  137: "https://polygonscan.com/images/main/empty-token.png",
  10: "/images/icons/empty-op.svg",
  42161: "https://arbiscan.io/images/main/empty-token.png",
  56: "/images/icons/empty-bnb.svg",
  250: "https://ftmscan.com/images/main/empty-token.png"
}

function getProtocolIcon(address: string, name: string, symbol: string, chainId: ChainId): string | undefined {
  // CURVE
  if (name.includes("Curve")) {
    // TODO fill this with curve lp icon
    return undefined;
  }
  // VELODROME 
  else if (name.includes("StableV1 AMM")) {
    // TODO fill this with velodrome lp icon
    return undefined;
  }
  return undefined;
}

async function fetchTokenIcon(address: string, name: string, symbol: string, chainId: ChainId): Promise<string> {
  console.log({ address, name, symbol, chainId })
  // TODO wait for zerion api key and fetch the token result first (should be unlocked on the 30.08.23)
  // 1. fetch token result from zerion and return the icon if not undefined
  // 2. if undefined test for protocols
  // 3. if undefined test for tokenlist?
  // 4. if undefined return empty network token
  return EMPTY_TOKEN[chainId]
}

function useVaultToken(vaultAddress: string, chainId: ChainId) {
  const { data: vaultTokenAddr } = useVaultTokenAddress(vaultAddress, chainId);
  const { data: tokenResult, isSuccess } = useToken({
    address: vaultTokenAddr as any,
    chainId,
  });
  const [tokenIcon, setTokenIcon] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isSuccess) {
      fetchTokenIcon(tokenResult?.address, tokenResult?.name, tokenResult?.symbol, chainId).then((icon) => {
        setTokenIcon(icon);
      });
    }
  }, [isSuccess])

  return { ...tokenResult, data: { ...tokenResult, icon: tokenIcon } };
}

export default useVaultToken;
