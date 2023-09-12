import Accordion from "components/Accordion";
import { AssetWithName } from "components/SweetVault/AssetWithName";
import useAdapterToken from "hooks/useAdapter";
import useVaultToken from "hooks/useVaultToken";
import useCurrentGaugeWeight from "lib/Gauges/useCurrentGaugeWeight";
import { Gauge } from "lib/Gauges/useGauges";
import useUpcomingGaugeWeight from "lib/Gauges/useUpcomingGaugeWeight";
import useVaultMetadata from "lib/Vault/hooks/useVaultMetadata";
import { BigNumberWithFormatted } from "lib/types";
import Slider from "rc-slider";
import { useState } from "react";
import { getVeAddresses } from "lib/utils/addresses";
import Title from "components/content/Title";

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses();

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

  return (
    <Accordion
      header={
        <div className="w-full flex flex-row flex-wrap items-center justify-between">

          <div className="flex items-center justify-between select-none w-full md:w-1/3">
            <AssetWithName
              token={token}
              vault={vaultMetadata}
              chainId={gauge.chainId}
            />
          </div>

          <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
            <p className="text-primaryLight font-normal">Current Weight</p>
            <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
              <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                {(Number(currentGaugeWeight?.value) / 1e16).toFixed(2) || 0} %
              </Title>
            </p>
          </div>

          <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
            <p className="text-primaryLight font-normal">Upcoming Weight</p>
            <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
              <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                {(Number(upcomingGaugeWeight?.value) / 1e16).toFixed() || 0} %
              </Title>
            </p>
          </div>

          <div className="w-1/2 md:w-2/12 mt-6 md:mt-0">
            <p className="text-primaryLight font-normal">My Votes</p>
            <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
              <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                {votes[index] / 100 || 0} %
              </Title>
            </p>
          </div>

          <div className="w-1/2 md:w-2/12 mt-6 md:mt-0 h-14">
            <p className="text-primaryLight font-normal mb-2">Vote</p>
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

          <div className="flex flex-row items-center justify-between w-full">
            <div className="w-1/4"></div>
            <div className="w-1/4"></div>
            <div className="w-1/4"></div>
            <div className="w-1/4"></div>
          </div>

        </ div>
      }
    >
      {/* Accordion Content */}
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
    </Accordion>
  );
}