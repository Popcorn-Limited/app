import StatusWithLabel from "@/components/common/StatusWithLabel";
import { vaultsAtom } from "@/lib/atoms/vaults";
import { Networth, getTotalNetworth, getVaultNetworthByChain } from "@/lib/getNetworth";
import { SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Address, useAccount } from "wagmi";

export default function Hero(): JSX.Element {
  const { address: account } = useAccount();
  const [vaults] = useAtom(vaultsAtom)
  const [networth, setNetworth] = useState<Networth>({ pop: 0, stake: 0, vault: 0, total: 0 });
  const [tvl, setTvl] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    // fetch and set tvl
    fetch("https://api.llama.fi/protocol/popcorn").then(
      res => res.json().then(
        res => setTvl(NumberFormatter.format(res.currentChainTvls.Ethereum + res.currentChainTvls.staking))
      ))
  }, [])


  useEffect(() => {
    async function fetchNetworth() {
      const vaultNetworth = SUPPORTED_NETWORKS.map(chain => getVaultNetworthByChain({ vaults, chainId: chain.id })).reduce((a, b) => a + b, 0)
      const totalNetworth = await getTotalNetworth({ account: account as Address })
      setNetworth({ ...totalNetworth.total, vault: vaultNetworth, total: totalNetworth.total.total + vaultNetworth });
      setLoading(false);
    }
    if (account && loading && vaults.length > 0) fetchNetworth()
  }, [account]);


  return (
    <section className="pt-4 mb-10 pb-6 border-b border-[#EBE7D4] bg-[#FAF9F4]">
      <div className="flex flex-col smmd:flex-row smmd:items-center justify-between mx-8">
        <div className="flex flex-col sm:flex-row sm:space-x-28 smmd:space-x-10">
          <StatusWithLabel
            label={"Deposits"}
            content={<p className="text-3xl font-bold text-black">$ {loading ? "..." : NumberFormatter.format(networth.vault)}</p>}
          />
          <div className="flex flex-row space-x-28 smmd:space-x-10 items-center mt-4 sm:mt-0">
            <StatusWithLabel
              label={"Staked"}
              content={<p className="text-3xl font-bold text-black">$ {loading ? "..." : NumberFormatter.format(networth.stake)}</p>}
            />
            <StatusWithLabel
              label={"VCX in Wallet"}
              content={<p className="text-3xl font-bold text-black">$ {loading ? "..." : NumberFormatter.format(networth.pop)}</p>}
            />
          </div>
        </div>
        <p className="uppercase smmd:hidden mt-12 text-primary text-sm mb-2">Platform</p>
        <div className="flex flex-row items-center space-x-10">
          <StatusWithLabel
            label={"Total Locked Value"}
            content={<p className="text-3xl font-bold text-black">$ {tvl}</p>}
            infoIconProps={{
              id: "tvl",
              title: "Total Value Locked",
              content: "Total value locked (TVL) is the amount of user funds deposited in popcorn products.",
            }}
          />
          <StatusWithLabel
            label={"My Networth"}
            content={<p className="text-3xl font-bold text-black">$ {loading ? "..." : NumberFormatter.format(networth.total)}</p>}
            infoIconProps={{
              id: "networth",
              title: "My Networth",
              content: "This value aggregates your Popcorn-related holdings across all blockchain networks.",
            }}
          />
        </div>
      </div>
      <div></div>
    </section>
  );
}
