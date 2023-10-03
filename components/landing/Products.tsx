import React from "react";
import Product from "@/components/landing/Product";
import usetVaultTvl from "@/lib/useVaultTvl";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";
import PopSmileyIcon from "@/components/svg/popcorn/PopSmileyIcon";
import SmileyIcon from "@/components/svg/popcorn/SmileyIcon";
import HandIcon from "@/components/svg/popcorn/HandIcon";
import PopIcon from "@/components/svg/popcorn/PopIcon";

export default function Products(): JSX.Element {
  const vaultTvl = usetVaultTvl();
  return (
    <>
      {/* @dev Product.tsx has `md:mx-2` so with `md:mx-6` that adds up to consistent mx-8*/}
      <section className="pt-4 pb-12 mx-8 md:mx-6">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between">
          <Product
            title={
              <>
                Smart <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={<PopSmileyIcon size={"60"} color={"black"} className="group-hover:fill-[#FFA0B4]" />}
            description="Single-asset vaults to earn yield on your digital assets "
            stats={[
              {
                label: "TVL",
                content: `$${NumberFormatter.format(vaultTvl)}`,
                infoIconProps: {
                  title: "Total Value Locked",
                  content: "The total value of assets held by the underlying smart contracts.",
                  id: "sweet-vault-tvl",
                },
              },
            ]}
            route="vaults"
          />
          <Product
            title={
              <>
                Vault <br className="hidden md:inline" />
                Boosts
              </>
            }
            customContent={<SmileyIcon size={"60"} color={"black"} className="group-hover:fill-[#C391FF]" />}
            description="Lock stake your POP LP to boost your rewards with call options on POP"
            stats={[
              {
                label: "TVL",
                content: <p>Coming soon</p>,
              },
            ]}
            route=""
          />
          <Product
            title={
              <>
                VaultCraft
              </>
            }
            customContent={<HandIcon size={"60"} color={"black"} className="group-hover:fill-[#FFE650]" />}
            description="Create custom automated asset strategies in minutes with VaultCraft"
            stats={[]}
            route="https://vaultcraft.io/"
          />
          <Product
            title={
              <>
                Archive
              </>
            }
            customContent={<PopIcon size={"60"} color={"black"} className="group-hover:fill-[#80FF77]" />}
            description="Find all of our old and discontinued products here"
            stats={[]}
            route="https://archive.pop.network"
          />
        </div>
      </section>
    </>
  );
};