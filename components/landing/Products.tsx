import React, { Fragment } from "react";
import { formatUnits } from "ethers/lib/utils";

import { ChainId } from "lib/utils/connectors";
import Product from "components/landing/Product";
import { useNamedAccounts } from "lib/utils/hooks";
import { useFeatures } from "hooks/useFeatures";
import AllSweetVaultsTVL from "lib/Vault/AllSweetVaultsTVL";
import usePopLockerTvl from "lib/PopLocker/hooks/usePopLockerTvl";

import styles from "./Products.module.css";
import { constants } from "ethers";

const NumberFormatter = Intl.NumberFormat("en", {
  //@ts-ignore
  notation: "compact",
});

const Products = () => {
  const { Ethereum, Polygon, Optimism } = ChainId;

  const [popStaking] = useNamedAccounts("1", ["popStaking"]);
  const [popStakingPolygon] = useNamedAccounts("137", ["popStaking"]);
  const [popStakingOptimism] = useNamedAccounts("10", ["popStaking"]);

  const {
    features: { sweetVaults: displaySweetVaults },
  } = useFeatures();

  const { data: ethStakingTVL } = usePopLockerTvl({ chainId: Ethereum, address: popStaking?.address });
  const { data: polyStakingTVL } = usePopLockerTvl({ chainId: Polygon, address: popStakingPolygon?.address });
  const { data: opStakingTVL } = usePopLockerTvl({ chainId: Optimism, address: popStakingOptimism?.address });

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
          {displaySweetVaults && (
            <Product
              title={
                <Fragment>
                  Sweet <br className="hidden md:inline" />
                  Vaults
                </Fragment>
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
                  content: <AllSweetVaultsTVL />,
                  infoIconProps: {
                    title: "Total Value Locked",
                    content: "The total value of assets held by the underlying smart contracts.",
                    id: "sweet-vault-tvl",
                  },
                },
              ]}
              route="sweet-vaults"
              badge="/images/newProductBadge.svg"
            />
          )}
          <Product
            title={
              <Fragment>
                Pop <br className="hidden md:inline" />
                Staking
              </Fragment>
            }
            customContent={
              <svg width="61" height="60" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="group-hover:fill-[#78E69B]"
                  d="M21 39.9999C21 51.0449 29.955 59.9999 41 59.9999C52.045 59.9999 61 51.0449 61 39.9999H21Z"
                  fill="black"
                />
                <path
                  className="group-hover:fill-[#78E69B]"
                  d="M15.9999 50C17.2799 50 18.5599 49.5116 19.5349 48.535C21.4882 46.5816 21.4882 43.4166 19.5349 41.4633L9.53488 31.4633C7.58154 29.51 4.41656 29.51 2.46322 31.4633C0.509888 33.4166 0.509888 36.5816 2.46322 38.535L12.4632 48.535C13.4399 49.5116 14.7199 50 15.9982 50H15.9999Z"
                  fill="black"
                />
                <path
                  className="group-hover:fill-[#78E69B]"
                  d="M21 4.99994V34.9999C21 37.7616 23.2383 39.9999 26 39.9999C28.7617 39.9999 31 37.7616 31 34.9999C31 37.7616 33.2383 39.9999 36 39.9999C38.7617 39.9999 41 37.7616 41 34.9999C41 37.7616 43.2383 39.9999 46 39.9999C48.7617 39.9999 51 37.7616 51 34.9999C51 37.7616 53.2383 39.9999 56 39.9999C58.7617 39.9999 61 37.7616 61 34.9999V4.99994C61 2.23827 58.7617 -6.10352e-05 56 -6.10352e-05C53.2383 -6.10352e-05 51 2.23827 51 4.99994V24.9999C51 22.2383 48.7617 19.9999 46 19.9999C43.2383 19.9999 41 22.2383 41 24.9999C41 22.2383 38.7617 19.9999 36 19.9999C33.2383 19.9999 31 22.2383 31 24.9999V4.99994C31 2.23827 28.7617 -6.10352e-05 26 -6.10352e-05C23.2383 -6.10352e-05 21 2.23827 21 4.99994Z"
                  fill="black"
                />
              </svg>
            }
            description="Farm POP for vlPOP to participate in PopcornDAO governance."
            stats={[
              {
                label: "TVL",
                content:
                  ethStakingTVL && polyStakingTVL && opStakingTVL
                    ? `$${NumberFormatter.format(
                      parseInt(
                        formatUnits(
                          constants.Zero.add(ethStakingTVL?.value || constants.Zero).add(
                            polyStakingTVL?.value || constants.Zero).add(
                              opStakingTVL?.value || constants.Zero))))}`
                    : "$0",
                infoIconProps: {
                  title: "Total Value Locked",
                  content: "The total value of assets held by the underlying smart contracts.",
                  id: "staking-tvl",
                },
              },
            ]}
            route={`staking`}
          />
          <Product
            title={
              <Fragment>
                Vaults for <br className="hidden md:inline" />
                Good
              </Fragment>
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
            route="/sweet-vaults"
          />
        </div>
      </div>
    </section>
  );
};

function Rotable({ label, badge }: { label: string; badge: string }) {
  return (
    <li className="flex items-start -space-y-8 space-x-1 text-black/20">
      <sup className="text-xs h-0">{badge}</sup>
      <p className="text-4xl xl:text-7xl whitespace-nowrap">{label}</p>
    </li>
  );
}

export default Products;
