import { formatUnits } from "ethers/lib/utils.js";
import { useAccount } from "wagmi";
import useNetworth from "hooks/useNetworth";
import Link from "next/link";
import StatusWithLabel from "components/StatusWithLabel";
import { useEffect, useState } from "react";
import TertiaryActionButton from "components/TertiaryActionButton";

const formatter: Intl.NumberFormat = Intl.NumberFormat("en", {
  //@ts-ignore
  notation: "compact",
});

export default function Hero(): JSX.Element {
  const { totalNetWorth, pop, vesting, deposits } = useNetworth();
  const [tvl, setTvl] = useState<string>("0");

  useEffect(() => {
    fetch("https://api.llama.fi/protocol/popcorn").then(
      res => res.json().then(
        res => setTvl(formatter.format(res.currentChainTvls.Ethereum + res.currentChainTvls.staking))
      ))
  }, [])


  return (
    <section className="mb-10 pb-6 mx-6 sm:mx-8 border-b border-[#EBE7D4]">
      <Link
        href="/portfolio"
        passHref
      >
        <div className="flex flex-row items-center mb-2 smmd:mb-4">
          <p className="uppercase text-primary text-sm">My Portfolio</p>
          <div className="ml-5">
            <TertiaryActionButton label="" />
          </div>
        </div>
        <div className="flex flex-col smmd:flex-row smmd:items-center justify-between">
          <div className="flex flex-col sm:flex-row sm:space-x-28 smmd:space-x-10">
            <StatusWithLabel
              label={"Deposits"}
              content={<p className="text-3xl font-bold text-black">$ {formatter.format(parseInt(formatUnits(deposits)))}</p>}
            />
            <div className="flex flex-row space-x-28 smmd:space-x-10 items-center mt-4 sm:mt-0">
              <StatusWithLabel
                label={"Vesting"}
                content={<p className="text-3xl font-bold text-black">$ {formatter.format(parseInt(formatUnits(vesting)))}</p>}
              />
              <StatusWithLabel
                label={"POP in Wallet"}
                content={<p className="text-3xl font-bold text-black">$ {formatter.format(parseInt(formatUnits(pop)))}</p>}
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
              content={<p className="text-3xl font-bold text-black">$ {formatter.format(parseInt(formatUnits(totalNetWorth)))}</p>}
              infoIconProps={{
                id: "networth",
                title: "My Networth",
                content: "This value aggregates your Popcorn-related holdings across all blockchain networks.",
              }}
            />
          </div>
        </div>
      </Link>
      <div></div>
    </section>
  );
}
