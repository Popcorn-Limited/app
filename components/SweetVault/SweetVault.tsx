import { useState } from "react";
import { useAccount } from "wagmi";
import { constants } from "ethers";

import { ChainId } from "lib/utils";
import Title from "components/content/Title";
import { useApy } from "lib/Staking";
import MarkdownRenderer from "./MarkdownRenderer";
import Accordion from "../Accordion";
import TokenIcon from "components/TokenIcon";
import { formatAndRoundNumber, formatNumber } from "lib/utils/formatBigNumber";
import useVaultMetadata, { VaultTag } from "lib/Vault/hooks/useVaultMetadata";

import { useBaseVaultInputToken } from "lib/Vault/hooks/utils";
import { AssetWithName } from "./AssetWithName";
import VaultInputs from "./VaultInputs";

const VAULT_APY_RESOLVER = {
  "Beefy": "beefy",
  "Yearn": "yearnAsset",
  "Origin": "ousd",
  "Flux": "llama",
  "Idle": "idle",
  "Aura": "aura",
  "Balancer": "balancer",
}

function SweetVault({
  vaultAddress,
  gaugeAddress,
  chainId,
  searchString,
  selectedTags,
  deployer,
}: {
  chainId: ChainId,
  vaultAddress: string,
  gaugeAddress: string,
  searchString: string,
  selectedTags: string[],
  deployer?: string
}) {
  const { address: account } = useAccount();
  const baseToken = useBaseVaultInputToken({ vaultAddress, gaugeAddress, chainId, account });
  const vaultMetadata = useVaultMetadata(vaultAddress, chainId);
  const asset = baseToken[0];
  const vault = baseToken[1];
  const gauge = gaugeAddress ? baseToken[2] : undefined;

  const [gaugeApr, setGaugeApr] = useState([0, 0])
  const { data: apy } = useApy({ resolver: VAULT_APY_RESOLVER[vaultMetadata?.metadata?.protocol?.name], address: vaultAddress, chainId })
  // calculateAPR(vault?.price, gaugeAddress).then((apr) => setGaugeApr(apr))

  // Is loading / error
  if (!vaultMetadata || baseToken.length === 0) return <></>
  // Vault is not in search term
  if (searchString !== "" &&
    !vault?.name.toLowerCase().includes(searchString) &&
    !vault?.symbol.toLowerCase().includes(searchString) &&
    !vaultMetadata?.metadata?.protocol?.name.toLowerCase().includes(searchString)) return <></>
  // Vault is not in selected tags
  if (selectedTags.length > 0 && !vaultMetadata?.metadata?.tags?.some((tag) => selectedTags.includes(VaultTag[tag]))) return <></>
  return (
    <Accordion
      header={
        <div className="w-full flex flex-row items-center">
          <div className="w-4/12">
            <AssetWithName token={asset} vault={vaultMetadata} chainId={chainId} />
          </div>

          <div className="w-2/12">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {formatAndRoundNumber(asset?.balance, asset?.decimals)}
            </Title>
            <span className="text-secondaryLight text-base inline">{asset?.symbol.slice(0, 12)}</span>
          </div>

          <div className="w-2/12">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {account ? (gaugeAddress ?
                formatAndRoundNumber(gauge.balance, vault.decimals) :
                formatAndRoundNumber(vault.balance, vault.decimals)
              ) : "-"}
            </Title>
            <span className="text-secondaryLight text-base inline">{asset?.symbol.slice(0, 12)}</span>
          </div>

          <div className="w-2/12 bg-[#FAF9F4] rounded-r-3xl">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              $ {formatNumber((gaugeAddress ?
                gauge.balance / (10 ** vault.decimals) :
                vault.balance / (10 ** vault.decimals))
                * vault.price)}
            </Title>
          </div>

          <div className="w-2/12">
            <Title level={2} fontWeight="font-normal" as="div" className="mr-1 text-primary">
              {apy?.formatted || "0"} %
            </Title>
            {gaugeApr && <div className="text-secondaryLight text-base inline">+ ({formatNumber(gaugeApr[0])} % - {formatNumber(gaugeApr[1])} %)</div>}
          </div>
        </ div >
      }>
      <div className="flex flex-col md:flex-row mt-8 gap-8">

        <section className="flex flex-col w-full md:w-4/12 gap-8">
          <div className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
            <VaultInputs
              tokenOptions={baseToken}
              hasGauge={!!gaugeAddress}
            />
          </div>
        </section>

        <section className="bg-white rounded-lg border border-customLightGray w-full md:w-8/12 p-6 md:p-8 hidden md:flex flex-col">
          <div className="flex flex-row items-center">
            <TokenIcon token={asset?.address} icon={asset?.icon} chainId={chainId} imageSize="w-8 h-8" />
            <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
              {asset?.name}
            </Title>
          </div>
          <div className="mt-8">
            <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.token?.name} \n${vaultMetadata?.metadata?.token?.description}`} />
          </div>
          <div className="mt-8">
            <MarkdownRenderer content={`# ${vaultMetadata?.metadata?.protocol?.name} \n${vaultMetadata?.metadata?.protocol?.description}`} />
          </div>
          <div className="mt-8">
            <MarkdownRenderer content={`# Strategies \n${vaultMetadata?.metadata?.strategy?.description}`} />
          </div>
        </section>

      </div>
    </Accordion>
  )
}

export default SweetVault;
