import { ChainId } from "lib/utils/connectors";
import { useContractMetadata } from "lib/Contract";

interface TokenIconProps {
  token: string;
  icon?: string;
  fullsize?: boolean;
  imageSize?: string;
  chainId: ChainId;
}

export default function TokenIcon({
  token: address,
  icon,
  fullsize = false,
  imageSize,
  chainId,
}: TokenIconProps): JSX.Element {
  const metadata = useContractMetadata({ address, chainId });

  if (icon) {
    return <img src={icon} alt="token icon" className={imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} />
  }

  if (metadata?.data?.icons?.length > 1) {
    return (
      <div className="flex flex-row flex-shrink-0 flex-grow-0">
        <img src={metadata?.data?.icons[0]} alt="token icon" className={`${imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} rounded-full border border-gray-300`} />
        <img
          src={metadata?.data?.icons[1]}
          alt="token icon"
          className={`${imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} -ml-3 rounded-full border border-gray-300`}
        />
      </div>
    );
  }
  if (metadata?.data?.icons?.length === 1) {
    return (
      <img src={metadata?.data?.icons[0]} alt="token icon" className={imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} />
    );
  }
  // Per default show POP icon
  return (
    <img src={"/images/icons/POP.svg"} alt="token icon" className={imageSize ? imageSize : "w-6 md:w-10 h-6 md:h-10"} />
  );
}
