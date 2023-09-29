import NetworkSticker from "@/components/network/NetworkSticker";
import TokenIcon from "@/components/common/TokenIcon";
import { ChainId } from "@/lib/utils/connectors";
import { Vault } from "@/lib/vault/getVault";
import { Token } from "@/lib/types";

const protocolNameToLlamaProtocol: { [key: string]: string } = {
  "Aave": "aave",
  "Aura": "aura",
  "Balancer": "balancer",
  "Beefy": "beefy",
  "Compound": "compound",
  "Convex": "convex",
  "Curve": "curve",
  "Flux": "flux-finance",
  "Idle": "idle",
  "Origin": "origin-defi",
  "Stargate": "stargate",
  "Yearn": "yearn-finance",
}

export default function AssetWithName({ vault }: { vault: Vault }) {
  const protocolName = vault.metadata.optionalMetadata?.protocol?.name
  const protocolIcon = protocolName ? protocolNameToLlamaProtocol[protocolName] : "popcorn"

  return <div className="flex items-center gap-4">
    <div className="relative">
      <NetworkSticker chainId={vault.chainId} />
      <TokenIcon token={vault.asset} icon={vault.asset.logoURI} chainId={vault.chainId} imageSize="w-8 h-8" />
    </div>
    <h2 className="text-gray-900 text-2xl font-bold mt-1">
      {vault.metadata.vaultName || vault.asset.name}
    </h2>
    <div className="bg-[#ebe7d466] border border-[#ebe7d4cc] rounded-lg py-1 px-3 flex flex-row items-center">
      <img
        src={protocolIcon ? `https://icons.llamao.fi/icons/protocols/${protocolIcon}?w=48&h=48` : "/images/icons/POP.svg"}
        className="w-6 h-6 mr-1 rounded-full border border-[#ebe7d4cc]"
      />
      <p className="mt-1 text-[#55503D] font-medium">{protocolName}</p>
    </div>
  </div>
}