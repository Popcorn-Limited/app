import { ChainId, formatNumber, networkMap } from "lib/utils";
import MainActionButton from "components/MainActionButton";
import TokenIcon from "components/TokenIcon";
import { StakingType } from "hooks/staking/useAllStakingAddresses";
import { useRouter } from "next/router";
import ContentLoader from "react-content-loader";
import { Tvl } from "lib/Contract";
import { Staking, Contract } from "lib";
import { ValueOfBalance } from "lib/Erc20";
import { Address } from "wagmi";
import { NetworkSticker } from "components/NetworkSticker";
import { usePrice } from "lib/Price";
import { useBalanceOf } from "lib/Erc20/hooks";
import { pop } from "lib/utils/resolvers/price-resolvers/resolvers";

const ignoreList = [
  // "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45", // Unknown poly?
  // "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45", // Arrakis Eth
  // "0x584732f867a4533BC349d438Fba4fc2aEE5f5f83", // 3x
  // "0x27A9B8065Af3A678CD121A435BEA9253C53Ab428", // butter
]

const POP = {
  1: "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4",
  10: "0x6F0fecBC276de8fC69257065fE47C5a03d986394",
  137: "0xC5B57e9a1E7914FDA753A88f24E5703e617Ee50c",
}

const stakingAddressToAsset = {
  // mainnet
  "0x27A9B8065Af3A678CD121A435BEA9253C53Ab428": { address: "0x109d2034e97eC88f50BEeBC778b5A5650F98c124", symbol: "BTR" },  // butter
  "0x584732f867a4533BC349d438Fba4fc2aEE5f5f83": { address: "0x8b97ADE5843c9BE7a1e8c95F32EC192E31A46cf3", symbol: "3X" },  // 3x
  "0xeB906A75838A8078B181815969b1DCBC20eaF7c0": { address: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8", symbol: "XEN" }, // xen
  "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45": { address: "0xbba11b41407df8793a89b44ee4b50afad4508555", symbol: "POP-LP" }, // popUsdc Arrakis
  // polygon
  "0xd3836EF639A74EA7398d34c66aa171b1564BE4bc": { address: "0x6dE0500211bc3140409B345Fa1a5289cb77Af1e4", symbol: "POP-LP" } // popUsdc Arrakis
}


interface StakeCardProps {
  stakingAddress: string;
  stakingType: StakingType;
  chainId: ChainId;
}

const StakeCard: React.FC<StakeCardProps> = ({ stakingAddress, stakingType, chainId }) => {
  const { data: price } = usePrice({
    address: "0x6F0fecBC276de8fC69257065fE47C5a03d986394",
    chainId: 10,
    resolver: "pop"
  })

  const { data: tokenStaked } = useBalanceOf(stakingType === StakingType.PopLocker ?
    { address: POP[chainId], chainId, account: stakingAddress } :
    { address: stakingAddressToAsset[stakingAddress].address, chainId, account: stakingAddress });

  const router = useRouter();

  function onSelectPool() {
    router?.push(
      `/${networkMap[chainId]?.toLowerCase()}/staking/${stakingType === StakingType.PopLocker ? "pop" : stakingAddress
      }`,
    );
  }

  if (ignoreList.includes(stakingAddress)) return <></>
  return (
    <Staking.StakingToken address={stakingAddress} chainId={chainId}>
      {(stakingToken) => (
        <Contract.Metadata address={stakingToken} chainId={chainId}>
          {(metadata) => (
            <>
              <div className={`my-4 ${metadata ? "hidden" : ""}`}>
                <ContentLoader viewBox="0 0 450 60" backgroundColor={"#EBE7D4"} foregroundColor={"#d7d5bc"}>
                  {/*eslint-disable */}
                  <rect x="0" y="0" rx="8" ry="8" width="450" height="60" />
                  {/*eslint-enable */}
                </ContentLoader>
              </div>
              <div
                className={`border-b border-b-customLightGray border-opacity-40 cursor-pointer hover:scale-102 hover:border-opacity-60 
                transition duration-500 ease-in-out transform relative ${metadata === undefined ? "hidden" : ""}`}
                onClick={onSelectPool}
              >
                <div className="py-8 md:p-8">
                  <div className="flex flex-row items-center justify-between pl-4 md:pl-0">
                    <div className="flex items-center">
                      <div className="relative">
                        <NetworkSticker chainId={chainId} />
                        <TokenIcon token={stakingToken} chainId={chainId} fullsize />
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center ml-2 md:ml-0">
                        <h3 className="text-3xl md:text-4xl md:ml-2 mb-2 md:mb-0 font-normal leading-9">
                          {metadata?.name}
                        </h3>
                      </div>
                    </div>
                    <div className="hidden smmd:block">
                      <MainActionButton label="View" handleClick={onSelectPool} />
                    </div>
                  </div>
                  <div className="flex flex-row flex-wrap items-center mt-0 md:mt-6 justify-between">
                    <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                      <p className="text-primaryLight leading-6">vAPR</p>
                      <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        0.00 %
                      </p>
                    </div>
                    <div className="w-1/2 md:w-1/4 mt-6 md:mt-0">
                      <p className="text-primaryLight leading-6">Total Staked</p>
                      <div className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        {`${formatNumber(Number(tokenStaked?.value) / 1e18)} 
                        ${stakingType === StakingType.PopLocker ? "POP" : stakingAddressToAsset[stakingAddress].symbol}`
                        }
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 mt-6 md:mt-0">
                      <p className="text-primaryLight leading-6">Status</p>
                      <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        <span className=" text-tokenTextGray text-xl">
                          Paused
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="w-full mt-6 smmd:hidden">
                    <MainActionButton label="View" handleClick={onSelectPool} />
                  </div>
                </div>
              </div>
            </>
          )}
        </Contract.Metadata>
      )}
    </Staking.StakingToken>
  );
};

export default StakeCard;
