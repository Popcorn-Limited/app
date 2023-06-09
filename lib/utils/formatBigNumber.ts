import { BigNumber, constants, utils } from "ethers";
import { parseUnits } from "ethers/lib/utils";

const MILLION = 1e6;
const THOUSAND = 1e3;

export function formatAndRoundBigNumber(value: BigNumber, decimals: number): string {
  if (BigNumber.isBigNumber(value)) {
    const formatedValue = Number(utils.formatUnits(value, decimals));

    if (formatedValue > MILLION) {
      return `${(formatedValue / MILLION).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}M`;
    }

    if (formatedValue > THOUSAND) {
      return `${(formatedValue / THOUSAND).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      })}k`;
    }

    return parseFloat(formatedValue.toFixed(6)).toLocaleString(undefined, {
      maximumFractionDigits: formatedValue > 1 ? 2 : 6,
      // If number < 1, max fractional units are 6, else 2
    });
  }
  return `Invalid val: ${value}`;
}

export function formatNumber(value: number): string {
  if (value > MILLION) {
    return `${(value / MILLION).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}M`;
  }

  if (value > THOUSAND) {
    return `${(value / THOUSAND).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}k`;
  }

  return parseFloat(value.toFixed(6)).toLocaleString(undefined, {
    maximumFractionDigits: value > 1 ? 2 : 6,
    // If number < 1, max fractional units are 6, else 2
  });
}

export function numberToBigNumber(value: number | string, decimals: number): BigNumber {
  if (typeof value === "number") {
    return BigNumber.from(parseUnits(String(value), decimals));
  } else if (typeof value === "string") {
    if (value == "" || value == ".") value = "0";
    return BigNumber.from(parseUnits(value, decimals));
  }
  return constants.Zero;
}
