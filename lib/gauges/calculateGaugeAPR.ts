import { RPC_PROVIDERS } from "lib/utils";
import { defi_llama } from "lib/utils/resolvers/price-resolvers/resolvers";
import { getVeAddresses } from "lib/utils/addresses"
import GaugeControllerAbi from "lib/utils/constants/abi/GaugeController"
import LiquidityGaugeAbi from "lib/utils/constants/abi/LiquidityGauge"
import { thisPeriodTimestamp } from "@/lib/gauges/utils";
import { Address } from "viem";

const { GaugeController: GAUGE_CONTROLLER } = getVeAddresses()

const provider = RPC_PROVIDERS[5];

async function getGaugeData(_gauge: Address) {
  const gaugeContract = new Contract(_gauge, LiquidityGaugeAbi, provider);

  const is_killed = await gaugeContract.is_killed();
  const inflation_rate = await gaugeContract.inflation_rate();
  const relative_weight = await gaugeContract.getCappedRelativeWeight(thisPeriodTimestamp());
  const tokenless_production = await gaugeContract.tokenless_production();
  const working_supply = await gaugeContract.working_supply();

  return [is_killed, Number(inflation_rate) / 1e18, Number(relative_weight) / 1e18, Number(tokenless_production), Number(working_supply) / 1e18];
}

async function getGaugeControllerData(_gauge: Address) {
  const gaugeControllerContract = new Contract(GAUGE_CONTROLLER, GaugeControllerAbi, provider);

  const gauge_exists = await gaugeControllerContract.gauge_exists(_gauge);

  return [gauge_exists];
}

export default async function calculateAPR(vaultTokenPriceUSD: number, gaugeAddress: Address) {
  /// fetch the price of token0, token1 and LIT in USD
  const popPriceUSD = await defi_llama("0x6F0fecBC276de8fC69257065fE47C5a03d986394", 10)

  /// calculate the lowerAPR and upperAPR
  let lowerAPR = 0;
  let upperAPR = 0;

  if (gaugeAddress) {
    const [is_killed, inflation_rate, relative_weight, tokenless_production, working_supply] = await getGaugeData(gaugeAddress);
    const [gauge_exists] = await getGaugeControllerData(gaugeAddress);

    /// @dev the price of oPOP is determined by applying the discount factor to the POP price.
    /// as of this writing, the discount factor of 50% but is subject to change. Additional dev
    /// work is needed to programmatically apply the discount factor at any given point in time.
    const oPopPriceUSD = (Number(popPriceUSD.value) / 1e18) * 0.5;

    if (gauge_exists == true && is_killed == false) {
      const relative_inflation = inflation_rate * relative_weight;
      if (relative_inflation > 0) {
        const annualRewardUSD = relative_inflation * 86400 * 365 * oPopPriceUSD;
        const effectiveSupply = working_supply > 0 ? working_supply : 1;
        const workingSupplyUSD = effectiveSupply * vaultTokenPriceUSD;

        lowerAPR = (((annualRewardUSD * tokenless_production) / 100) / workingSupplyUSD) * 100;
        upperAPR = (annualRewardUSD / workingSupplyUSD) * 100;
      }
    }
  } else {
    console.log('~~~~~ No Gauge Found ~~~~~');
    return;
  }

  console.log(`lowerAPR: ${Number(lowerAPR).toFixed(2)}%`);
  console.log(`upperAPR: ${Number(upperAPR).toFixed(2)}%`);

  return [lowerAPR, upperAPR];
}