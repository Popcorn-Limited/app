import { FC } from "react";
import Image from "next/image";
import { ChainId, networkLogos } from "lib/utils";

interface NetworkStickerProps {
  chainId?: ChainId;
}

export const NetworkSticker: FC<NetworkStickerProps> = ({ chainId }) => {
  return (
    <div className="absolute top-0 -left-2 md:-left-3">
      <Image
        src={networkLogos[chainId]}
        alt={ChainId[chainId]}
        height="20"
        width="20"
      />
    </div>
  );
};
