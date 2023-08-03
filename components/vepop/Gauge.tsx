import Accordion from "components/Accordion";
import { NetworkSticker } from "components/NetworkSticker";
import { AssetWithName } from "components/SweetVault/SweetVault";
import TokenIcon from "components/TokenIcon";
import Title from "components/content/Title";
import useAdapterToken from "hooks/useAdapter";
import useVaultToken from "hooks/useVaultToken";
import { Gauge } from "lib/Gauges/useGauges";
import useVaultMetadata from "lib/Vault/hooks/useVaultMetadata";
import Slider from "rc-slider";
import { useState } from "react";
import { Address, useToken } from "wagmi";

export default function Gauge({ gauge, index, avVotes, handleChange }: { gauge: Gauge, index: number, avVotes: number, handleChange: Function }): JSX.Element {
  const { data: vault } = useToken({ address: gauge.vault as Address, chainId: gauge.chainId })
  const { data: token } = useVaultToken(gauge.vault, gauge.chainId);
  const { data: adapter } = useAdapterToken(gauge.vault, gauge.chainId);
  const vaultMetadata = useVaultMetadata(gauge.vault, token, adapter, gauge.chainId);

  const [amount, setAmount] = useState(0);

  function onChange(value) {
    if (value > avVotes + amount) value = avVotes + amount;
    handleChange(value - amount, index);
    setAmount(value);
  }

  return (
    <Accordion
      header={
        <div className="flex flex-row flex-wrap items-center justify-between w-full">

          <div className="flex items-center justify-between w-4/12">
            <AssetWithName token={token} vault={vaultMetadata} chainId={gauge.chainId} />
          </div>

          <div className="w-8/12 text-start">

            <div className="flex flex-row items-center w-full">

              <div className="w-3/12">
                <p className="text-primaryLight font-normal">Previous Votes</p>
              </div>

              <div className="w-3/12">
                <p className="text-primaryLight font-normal">Total Votes</p>
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
                <p className=" text-primary text-3xl">
                  6600
                </p>
              </div>

              <div className="w-3/12">
                <p className=" text-primary text-3xl text-start">
                  {4200 + amount}
                </p>
              </div>

              <div className="w-3/12">
                <p className=" text-primary text-3xl">
                  {((amount / 10000) * 100).toFixed(2)} %
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
      <div className="flex flex-row space-x-8 mt-8">
        <div className="border border-[#F0EEE0] rounded-lg bg-white w-1/2 p-6">
          <span className="flex flex-row items-center justify-between">
            <p className="text-primaryLight font-normal">Gauge address:</p>
            <p className="font-bold text-primary">
              {gauge.address.slice(0, 6)}...{gauge.address.slice(-6)}
            </p>
          </span>

          <span className="flex flex-row items-center justify-between">
            <p className="text-primaryLight font-normal">Vault address:</p>
            <p className="font-bold text-primary">
              {gauge.vault.slice(0, 6)}...{gauge.vault.slice(-6)}
            </p>
          </span>

        </div>
        <div className="border border-[#F0EEE0] rounded-lg bg-white w-1/2 p-6">
          <span className="flex flex-row items-center justify-between">
            <p className="text-primaryLight font-normal">Last Epochs Votes:</p>
            <p className="font-bold text-primary">
              GaugeController.get_gauge_weight(addr: address)
            </p>
          </span>
        </div>
      </div>
    </Accordion>)
}