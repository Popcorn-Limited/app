import { ChevronDownIcon } from "@heroicons/react/24/solid";
import PseudoRadioButton from "@/components/button/PseudoRadioButton";
import Image from "next/image";
import { useState } from "react";
import { ChainId, networkLogos, networkMap } from "@/lib/utils/connectors";
import PopUpModal from "../modal/PopUpModal";

interface NetworkFilterProps {
  supportedNetworks: ChainId[];
  selectNetwork: (chainId: ChainId) => void;
}

export default function NetworkFilter({ supportedNetworks, selectNetwork }: NetworkFilterProps): JSX.Element {
  const [openFilter, setOpenFilter] = useState(false);
  const [activeNetwork, setActiveNetwork] = useState(ChainId.ALL);

  const setActiveAndSelectedNetwork = (chainId: ChainId) => {
    setActiveNetwork(chainId);
    selectNetwork(chainId);
  };
  return (
    <>
      <div className="hidden md:flex flex-row items-center space-x-2">
        <PseudoRadioButton
          key={"all"}
          label={<Image src={networkLogos[ChainId.ALL]} alt={"All"} height="24" width="24" />}
          handleClick={() => setActiveAndSelectedNetwork(ChainId.ALL)}
          isActive={activeNetwork == ChainId.ALL}
          extraClasses="h-12 w-18 border border-customLightGray rounded-3xl text-primary flex justify-center items-center bg-white"
        />
        {supportedNetworks.map((network) => (
          <PseudoRadioButton
            key={network}
            label={<Image src={networkLogos[network]} alt={ChainId[network]} height="24" width="24" />}
            handleClick={() => setActiveAndSelectedNetwork(network)}
            isActive={activeNetwork == network}
            extraClasses="h-12 w-18 border border-customLightGray rounded-3xl text-primary flex justify-center items-center bg-white"
          />
        ))}
      </div>

      <div className="block md:hidden my-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            setOpenFilter(true);
          }}
          className="w-full py-3 px-5 flex flex-row items-center justify-between mt-1 space-x-1 rounded-4xl border border-gray-300 bg-white"
        >
          <div className="flex items-center">
            <Image src={networkLogos[activeNetwork]} alt={"activeNetwork"} height="24" width="24" />
            <p className="ml-4 mt-1">{activeNetwork === ChainId.ALL ? "All Networks" : ChainId[activeNetwork]}</p>
          </div>
          <ChevronDownIcon className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
      <div className="no-select-dot absolute left-0">
        <PopUpModal visible={openFilter} onClosePopUpModal={() => setOpenFilter(false)}>
          <>
            <p className="text-black mb-3 text-center">Select a Network</p>
            <div className="space-y-2">
              <PseudoRadioButton
                key={"all"}
                label={
                  <div className="flex flex-row items-center w-full ml-4">
                    <Image src={networkLogos[ChainId.ALL]} alt={"All"} height="24" width="24" />
                    <p className="ml-4 mb-0.5">All Networks</p>
                  </div>
                }
                handleClick={() => { setActiveAndSelectedNetwork(ChainId.ALL); setOpenFilter(false) }}
                isActive={activeNetwork == ChainId.ALL}
                extraClasses="h-12 w-full border border-customLightGray rounded-3xl text-primary flex justify-center items-center bg-white"
              />
              {supportedNetworks.map((network) => (
                <PseudoRadioButton
                  key={network}
                  label={
                    <div className="flex flex-row items-center w-full ml-4">
                      <Image src={networkLogos[network]} alt={ChainId[network]} height="24" width="24" />
                      <p className="ml-4 mb-0.5">{ChainId[network]}</p>
                    </div>
                  }
                  handleClick={() => { setActiveAndSelectedNetwork(network); setOpenFilter(false) }}
                  isActive={activeNetwork == network}
                  extraClasses="h-12 w-full border border-customLightGray rounded-3xl text-primary flex justify-center items-center bg-white"
                />
              ))}
            </div>
          </>
        </PopUpModal>
      </div >
    </>
  );
}
