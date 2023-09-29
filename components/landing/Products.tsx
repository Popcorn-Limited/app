import React from "react";
import Product from "@/components/landing/Product";

import styles from "@/components/landing/Products.module.css";
import usetVaultTvl from "@/lib/useVaultTvl";
import { NumberFormatter } from "@/lib/utils/formatBigNumber";

export default function Products(): JSX.Element {
  const vaultTvl = usetVaultTvl();
  return (
    <section className="px-8 pt-4 pb-24 grid grid-cols-12 md:gap-8">
      <div className="col-span-12 md:col-span-3 flex flex-col justify-between">
        <h6 className="font-medium leading-8 whitespace-nowrap">Our products</h6>
        <span className="relative hidden lg:inline-flex overflow-hidden">
          <span className="opacity-0 py-4">
            <Rotable badge="03" label="Make Impact" />
          </span>
          <ul className={`absolute bottom-0 left-0 ${styles.animateWords}`}>
            <Rotable badge="01" label="Deposit" />
            <Rotable badge="02" label="Earn" />
            <Rotable badge="03" label="Relax" />
            <Rotable badge="04" label="Do Good" />
          </ul>
        </span>
      </div>
      <div className="col-span-12 lg:col-span-9 lg:col-start-4 pt-6">
        <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:space-x-8 xl:justify-between">
          <Product
            title={
              <>
                Sweet <br className="hidden md:inline" />
                Vaults
              </>
            }
            customContent={
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="group-hover:fill-pink-400"
                  d="M45 0C36.7163 0 30 6.71625 30 15C30 6.71625 23.2837 0 15 0C6.71625 0 0 6.71625 0 15V30C0 46.5687 13.4312 60 30 60C21.7163 60 15 53.2837 15 45H22.5C18.3575 45 15 41.6425 15 37.5C15 33.3575 18.3575 30 22.5 30C26.6425 30 30 33.3575 30 37.5C30 33.3575 33.3575 30 37.5 30C41.6425 30 45 33.3575 45 37.5C45 41.6425 41.6425 45 37.5 45H45C45 53.2837 38.2837 60 30 60C46.5687 60 60 46.5687 60 30V15C60 6.71625 53.2837 0 45 0ZM30 37.5C30 41.6425 26.6425 45 22.5 45H37.5C33.3575 45 30 41.6425 30 37.5Z"
                  fill="black"
                />
              </svg>
            }
            description="Single-asset vaults that earn yield on your crypto."
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
                Vote Locked <br className="hidden md:inline" />
                POP
              </>
            }
            customContent={
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="group-hover:fill-[#C391FF]"
                  d="M15 29.9999C23.2842 29.9999 30 23.2842 30 14.9999C30 6.71567 23.2842 -6.10352e-05 15 -6.10352e-05C6.71572 -6.10352e-05 0 6.71567 0 14.9999C0 23.2842 6.71572 29.9999 15 29.9999Z"
                  fill="black"
                />
                <path
                  className="group-hover:fill-[#C391FF]"
                  d="M45 29.9999C53.2842 29.9999 60 23.2842 60 14.9999C60 6.71567 53.2842 -6.10352e-05 45 -6.10352e-05C36.7157 -6.10352e-05 30 6.71567 30 14.9999C30 23.2842 36.7157 29.9999 45 29.9999Z"
                  fill="black"
                />
                <path
                  className="group-hover:fill-[#C391FF]"
                  d="M59.9999 29.9999C59.9999 46.5687 46.5687 59.9999 30 59.9999C13.4312 59.9999 0 46.5687 0 29.9999H59.9999Z"
                  fill="black"
                />
              </svg>
            }
            description="Vaults that fund public goods using 100% of the yield. Do some good with your crypto!"
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
                Vaults for <br className="hidden md:inline" />
                Good
              </>
            }
            customContent={
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="group-hover:fill-[#C391FF]"
                  d="M15 29.9999C23.2842 29.9999 30 23.2842 30 14.9999C30 6.71567 23.2842 -6.10352e-05 15 -6.10352e-05C6.71572 -6.10352e-05 0 6.71567 0 14.9999C0 23.2842 6.71572 29.9999 15 29.9999Z"
                  fill="black"
                />
                <path
                  className="group-hover:fill-[#C391FF]"
                  d="M45 29.9999C53.2842 29.9999 60 23.2842 60 14.9999C60 6.71567 53.2842 -6.10352e-05 45 -6.10352e-05C36.7157 -6.10352e-05 30 6.71567 30 14.9999C30 23.2842 36.7157 29.9999 45 29.9999Z"
                  fill="black"
                />
                <path
                  className="group-hover:fill-[#C391FF]"
                  d="M59.9999 29.9999C59.9999 46.5687 46.5687 59.9999 30 59.9999C13.4312 59.9999 0 46.5687 0 29.9999H59.9999Z"
                  fill="black"
                />
              </svg>
            }
            description="Vaults that fund public goods using 100% of the yield. Do some good with your crypto!"
            stats={[
              {
                label: "TVL",
                content: <p>Coming soon</p>,
              },
            ]}
            route=""
          />
        </div>
      </div>
    </section>
  );
};

function Rotable({ label, badge }: { label: string; badge: string }): JSX.Element {
  return (
    <li className="flex items-start -space-y-8 space-x-1 text-black/20">
      <sup className="text-xs h-0">{badge}</sup>
      <p className="text-4xl xl:text-7xl whitespace-nowrap">{label}</p>
    </li>
  );
}