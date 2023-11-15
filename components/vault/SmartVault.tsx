import { useEffect, useState } from "react";
import { Address, useAccount, usePublicClient, } from "wagmi";
import { getAddress } from "viem";
import { useAtom } from "jotai";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { NumberFormatter, formatAndRoundNumber, formatNumber } from "@/lib/utils/formatBigNumber";
import MarkdownRenderer from "@/components/vault/MarkdownRenderer";
import AssetWithName from "@/components/vault/AssetWithName";
import VaultInputs from "@/components/vault/VaultInputs";
import Accordion from "@/components/common/Accordion";
import TokenIcon from "@/components/common/TokenIcon";
import Title from "@/components/common/Title";
import { Token, VaultData } from "@/lib/types";
import calculateAPR from "@/lib/gauges/calculateGaugeAPR";
import { MutateTokenBalanceProps } from "pages/vaults";


function getTokenOptions(vaultData: VaultData, zapAssets?: Token[]): Token[] {
  const tokenOptions = [vaultData.vault, vaultData.asset]
  if (!!vaultData.gauge) tokenOptions.push(vaultData.gauge)
  if (zapAssets) tokenOptions.push(...zapAssets.filter(asset => getAddress(asset.address) !== getAddress(vaultData.asset.address)))
  return tokenOptions;
}

interface SmartVaultsProps {
  vaultData: VaultData;
  searchString: string;
  mutateTokenBalance: (props: MutateTokenBalanceProps) => void;
  zapAssets?: Token[];
  deployer?: Address;
}

export default function SmartVault({
  vaultData,
  searchString,
  mutateTokenBalance,
  zapAssets,
  deployer,
}: SmartVaultsProps) {
  const publicClient = usePublicClient();
  const [yieldOptions] = useAtom(yieldOptionsAtom);
  const { address: account } = useAccount();
  const vault = vaultData.vault;
  const asset = vaultData.asset;
  const gauge = vaultData.gauge;
  const tokenOptions = getTokenOptions(vaultData, zapAssets);

  const [apy, setApy] = useState<number | undefined>(0);

  useEffect(() => {
    if (!apy) {
      // @ts-ignore
      yieldOptions?.getApy(vaultData.chainId, vaultData.metadata.optionalMetadata.resolver, vaultData.asset.address).then(res => setApy(!!res ? res.total : 0))
    }
  }, [apy])

  const [gaugeApr, setGaugeApr] = useState<number[]>([]);

  useEffect(() => {
    if (vault?.price && gaugeApr.length === 0 && !!gauge) {
      calculateAPR({ vaultPrice: vault?.price, gauge: gauge?.address, publicClient }).then(res => setGaugeApr(res))
    }
  }, [vault, gaugeApr])

  // Is loading / error
  if (!vaultData || tokenOptions.length === 0) return <></>
  // Dont show if we filter by deployer
  if (!!deployer && getAddress(deployer) !== getAddress(vaultData?.metadata?.creator)) return <></>
  // Vault is not in search term
  if (searchString !== "" &&
    !vault.name.toLowerCase().includes(searchString) &&
    !vault.symbol.toLowerCase().includes(searchString) &&
    !vaultData.metadata.optionalMetadata.protocol?.name.toLowerCase().includes(searchString)) return <></>
  return (<Accordion
    header={
      <div className="w-full flex flex-row flex-wrap items-center justify-between">

        <div className="flex items-center justify-between select-none w-full md:w-4/12">
          <AssetWithName vault={vaultData} />
        </div>


        <div className="hidden md:block w-1/12 mt-6 md:mt-0">
          <p className="text-primaryLight font-normal">{zapAssets && zapAssets?.length > 0 && "⚡ Zap available"}</p>
        </div>

        <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
          <p className="text-primaryLight font-normal">Your Wallet</p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {formatAndRoundNumber(asset.balance, asset.decimals)}
            </Title>
            <span className="text-secondaryLight text-base inline">{asset.symbol.slice(0, 12)}</span>
          </p>
        </div>

        <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
          <p className="text-primaryLight font-normal">Your Deposit</p>
          <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
              {account ? (!!gauge ?
                formatAndRoundNumber(gauge?.balance || 0, gauge.decimals) :
                formatAndRoundNumber(vault.balance, vault.decimals)
              ) : "-"}
            </Title>
            <span className="text-secondaryLight text-base inline">{asset.symbol.slice(0, 12)}</span>
          </div>
        </div>

        <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
          <p className="font-normal text-primaryLight">vAPY</p>
          <Title as="span" level={2} fontWeight="font-normal">
            {apy ? `${NumberFormatter.format(apy)} %` : "0 %"}
          </Title>
          {gaugeApr.length > 0 && <span className="text-secondaryLight text-base inline">{`+ (${formatNumber(gaugeApr[0])} % - ${formatNumber(gaugeApr[1])} %)`}</span>}
        </div>

        <div className="w-1/2 md:w-1/12 mt-6 md:mt-0">
          <p className="leading-6 text-primaryLight">TVL</p>
          <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
            $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
          </Title>
        </div>

        <div className="block md:hidden w-full mt-6 md:mt-0">
          <p className="text-primaryLight font-normal">{zapAssets && zapAssets?.length > 0 && "⚡ Zap available"}</p>
        </div>

      </div>
    }
  >
    <div className="flex flex-col md:flex-row mt-8 gap-8">

      <section className="flex flex-col w-full md:w-4/12 gap-8">
        <div className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
          <VaultInputs
            vault={vault}
            asset={asset}
            gauge={gauge}
            tokenOptions={tokenOptions}
            chainId={vaultData.chainId}
            mutateTokenBalance={mutateTokenBalance}
          />
        </div>
      </section>

      <section className="bg-white rounded-lg border border-customLightGray w-full md:w-8/12 p-6 md:p-8 hidden md:flex flex-col">
        <div className="flex flex-row items-center">
          <TokenIcon token={asset} icon={asset.logoURI} chainId={vaultData.chainId} imageSize="w-8 h-8" />
          <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
            {asset.name}
          </Title>
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# ${vaultData.metadata.optionalMetadata?.token?.name} \n${vaultData.metadata.optionalMetadata?.token?.description}`} />
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# ${vaultData.metadata.optionalMetadata?.protocol?.name} \n${vaultData.metadata.optionalMetadata?.protocol?.description}`} />
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# Strategies \n${vaultData.metadata.optionalMetadata?.strategy?.description}`} />
        </div>
      </section>

    </div>
  </Accordion>
  )
}