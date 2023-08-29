import { Accordion, MobileAccordion } from "components/Accordion";
import { AssetWithName } from "components/SweetVault/SweetVault";
import useAdapterToken from "hooks/useAdapter";
import useVaultToken from "hooks/useVaultToken";
import useCurrentGaugeWeight from "lib/Gauges/useCurrentGaugeWeight";
import { Gauge } from "lib/Gauges/useGauges";
import useUpcomingGaugeWeight from "lib/Gauges/useUpcomingGaugeWeight";
import useVaultMetadata from "lib/Vault/hooks/useVaultMetadata";
import { BigNumberWithFormatted } from "lib/types";
import Slider from "rc-slider";
import { useState, useEffect } from "react";
import { getVeAddresses } from "lib/utils/addresses";

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses();

function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}


export default function Gauge({ gauge, index, votes, handleVotes, veBal }: { gauge: Gauge, index: number, votes: number[], handleVotes: Function, veBal: BigNumberWithFormatted }): JSX.Element {
  const { data: token } = useVaultToken(gauge.vault, gauge.chainId);
  const { data: adapter } = useAdapterToken(gauge.vault, gauge.chainId);
  const vaultMetadata = useVaultMetadata(gauge.vault, gauge.chainId);

  const { data: currentGaugeWeight } = useCurrentGaugeWeight({ address: GAUGE_CONTROLLER, account: gauge.address, chainId: gauge.chainId })
  const { data: upcomingGaugeWeight } = useUpcomingGaugeWeight({ address: GAUGE_CONTROLLER, account: gauge.address, chainId: gauge.chainId })

  const [amount, setAmount] = useState(0);

  function onChange(value) {
    const currentVoteForThisGauge = votes[index];
    const potentialNewTotalVotes = votes.reduce((a, b) => a + b, 0) - currentVoteForThisGauge + value;

    if (potentialNewTotalVotes <= 10000) {
      handleVotes(value, index);
      setAmount(value);
    }
  }

  const isMobile = useIsMobile();

  const AccordionComponent = isMobile ? MobileAccordion : Accordion;

  return (
    <AccordionComponent
      header={
        <div className="flex flex-row flex-wrap items-center justify-between w-full">

          <div className="flex items-center justify-between w-4/12">
            <AssetWithName
              token={token}
              vault={vaultMetadata}
              chainId={gauge.chainId}
            />
          </div>

          <div className="w-8/12 text-start">

            <div className="flex flex-row items-center w-full">

              <div className="w-3/12">
                <p className="text-primaryLight font-normal">Current Votes</p>
              </div>

              <div className="w-3/12">
                <p className="text-primaryLight font-normal">Upcoming Votes</p>
              </div>

              <div className="w-3/12">
                <p className="text-primaryLight font-normal">My Vote %</p>
              </div>

              <div className="w-3/12">
                <p className="text-primaryLight font-normal">Vote</p>
              </div>
            </div>

            <div className="flex flex-row items-center">

              <div className="w-3/12">
                <p className=" text-primary text-xl">
                  {(Number(currentGaugeWeight?.value) / 1e16).toFixed(2) || 0} %
                </p>
              </div>

              <div className="w-3/12">
                <p className=" text-primary text-xl text-start">
                  {(Number(upcomingGaugeWeight?.value) / 1e16).toFixed(2) || 0} %
                </p>
              </div>

              <div className="w-3/12">
                <p className="text-primary text-xl">
                  {(amount / 100).toFixed(2)}%
                </p>
              </div>


              <div className="w-3/12">
                <Slider
                  railStyle={{ backgroundColor: '#645F4C', height: 4 }}
                  trackStyle={{ backgroundColor: '#645F4C', height: 4 }}
                  handleStyle={{
                    height: 22,
                    width: 22,
                    marginLeft: 0,
                    marginTop: -9,
                    borderColor: '#645F4C',
                    backgroundColor: '#fff',
                  }}
                  value={amount}
                  onChange={(val) => onChange(val)}
                  max={10000}
                />
              </div>
            </div>
          </div>

        </div>
      }
    >
      <div className="lg:flex lg:flex-row lg:space-x-8 space-y-4 lg:space-y-0 mt-8">
        <div className="border border-[#F0EEE0] rounded-lg bg-white lg:w-1/2 p-6">
          <span className="flex flex-row flex-wrap items-center justify-between">
            <p className="text-primaryLight font-normal">Gauge address:</p>
            <p className="font-bold text-primary">
              {gauge.address}
            </p>
          </span>

        </div>
        <div className="border border-[#F0EEE0] rounded-lg bg-white lg:w-1/2 p-6">
          <span className="flex flex-row flex-wrap items-center justify-between">
            <p className="text-primaryLight font-normal">Vault address:</p>
            <p className="font-bold text-primary">
              {gauge.vault}
            </p>
          </span>
        </div>
      </div>
    </AccordionComponent>)
}