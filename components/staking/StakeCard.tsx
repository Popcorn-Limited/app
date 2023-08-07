import { ChainId, networkMap } from "lib/utils";
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

const ignoreList = [
  "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45", // Unknown poly?
  "0x633b32573793A67cE41A7D0fFe66e78Cd3379C45", // Arrakis Eth
  "0x584732f867a4533BC349d438Fba4fc2aEE5f5f83", // 3x
  "0x27A9B8065Af3A678CD121A435BEA9253C53Ab428", // butter
]

const POP = {
  1: "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4",
  10: "0x6F0fecBC276de8fC69257065fE47C5a03d986394",
  137: "0xC5B57e9a1E7914FDA753A88f24E5703e617Ee50c",
}


interface StakeCardProps {
  stakingAddress: string;
  stakingType: StakingType;
  chainId: ChainId;
}

const StakeCard: React.FC<StakeCardProps> = ({ stakingAddress, stakingType, chainId }) => {
  const { data: price } = usePrice(stakingType === StakingType.PopLocker ? {
    address: "0xd0cd466b34a24fcb2f87676278af2005ca8a78c4",
    chainId: 1,
    resolver: "llama"
  } :
    {
      address: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8",
      chainId: 1,
      resolver: "llama"
    })
  const { data: tokenStaked } = useBalanceOf(stakingType === StakingType.PopLocker ?
    { address: POP[chainId], chainId, account: stakingAddress } :
    { address: "0x06450dEe7FD2Fb8E39061434BAbCFC05599a6Fb8", chainId, account: stakingAddress });

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
                      <p className="text-primaryLight leading-6">TVL</p>
                      <div className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        {((Number(price?.value) / 1e18) * (Number(tokenStaked?.value) / 1e18)).toFixed(2)} $
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 mt-6 md:mt-0">
                      <p className="text-primaryLight leading-6">Token Emissions</p>
                      <p className="text-primary text-2xl md:text-3xl leading-6 md:leading-8">
                        <span className=" text-tokenTextGray text-xl">
                          <Staking.TokenEmission chainId={chainId} address={stakingAddress} /> POP / day
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
