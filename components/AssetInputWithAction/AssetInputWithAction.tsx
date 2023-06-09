import { FormEventHandler, useMemo, useState } from "react";
import { Address, useAccount, useBalance, useNetwork, useSwitchNetwork, useToken } from "wagmi";
import { BigNumber, constants, utils } from "ethers";
import toast from "react-hot-toast";

import { validateInput } from "./internals/input";

import useWaitForTx from "lib/utils/hooks/useWaitForTx";
import useApproveBalance from "hooks/useApproveBalance";
import InputTokenWithError from "components/InputTokenWithError";
import { useContractMetadata } from "lib/Contract";
import useMainAction from "./internals/useMainAction";
import MainActionButton from "components/MainActionButton";
import { formatUnits, parseUnits } from "ethers/lib/utils.js";
import { ChainId, useConsistentRepolling } from "lib/utils";
import { useSpendableBalance } from "lib/POP";

const safeRound = (bn: BigNumber, decimals = 18) => {
  const roundingValue = parseUnits("1", decimals > 8 ? 8 : 2)
  return Number(formatUnits(bn.div(roundingValue).mul(roundingValue), decimals))
}

function AssetInputWithAction({
  assetAddress,
  target,
  chainId,
  action,
  disabled,
  allowance,
  getTokenUrl,
  children,
}: {
  assetAddress: string;
  target: string;
  chainId: any;
  action: ActionOrCallback;
  disabled?: boolean;
  allowance: BigNumber;
  getTokenUrl?: string;
  children: (props: {
    ActionableComponent: () => JSX.Element;
    data: {
      balance: {
        value: BigNumber;
        formatted: number;
      };
    };
  }) => JSX.Element;
}) {
  const { waitForTx } = useWaitForTx();
  const { address: account } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const [inputBalance, setInputBalance] = useState<number>();
  const { data: metadata } = useContractMetadata({ chainId, address: assetAddress });
  const { data: asset } = useToken({ chainId, address: assetAddress as Address });
  const { data: tokenBalance } = useConsistentRepolling(
    useBalance({
      chainId,
      address: account,
      enabled: Boolean(account && assetAddress && metadata?.name !== "Popcorn"),
      token: assetAddress as any,
    }),
  );
  const { data: popBalance } = useSpendableBalance({
    chainId,
    address: assetAddress,
    account,
    enabled: Boolean(chainId === ChainId.Ethereum && account && metadata?.name === "Popcorn"),
  });
  const userBalance = chainId === ChainId.Ethereum && metadata?.name === "Popcorn" ? popBalance : tokenBalance;

  const formattedInputBalance = useMemo(() => {
    return utils.parseUnits(validateInput(inputBalance || "0").formatted, asset?.decimals);
  }, [inputBalance, asset?.decimals]);

  const ACTION = typeof action === "function" ? action(formattedInputBalance) : action;

  const {
    write: approve = noOp,
    isSuccess: isApproveSuccess,
    isLoading: isApproveLoading,
  } = useApproveBalance(assetAddress, target, chainId, {
    onSuccess: (tx) => {
      waitForTx(tx, {
        successMessage: "Assets approved!",
        errorMessage: "Something went wrong",
      });
    },
    onError: () => {
      toast.error("User rejected the transaction", {
        position: "top-center",
      });
    },
  });

  const { write: mainAction = noOp } = useMainAction(
    target,
    ACTION.functionName,
    ACTION.abi,
    chainId,
    ACTION.args || [formattedInputBalance],
    {
      onSuccess: (tx) => {
        waitForTx(tx, {
          successMessage: ACTION.successMessage,
          errorMessage: "Something went wrong",
        });
        setInputBalance("" as any);
      },
      onError: () => {
        toast.error("User rejected the transaction", {
          position: "top-center",
        });
      },
    },
  );

  // When approved asume allowance has been approved
  const showApproveButton = isApproveSuccess ? false : formattedInputBalance.gt(allowance || 0);

  async function handleDeposit() {
    if ((inputBalance || 0) == 0) return;
    // Early exit if value is ZERO

    if (chain.id !== Number(chainId)) switchNetwork?.(Number(chainId));

    if (showApproveButton) return approve();
    // When approved continue to deposit
    mainAction();
  }

  const handleChangeInput: FormEventHandler<HTMLInputElement> = ({ currentTarget: { value } }) => {
    setInputBalance(validateInput(value).isValid ? (value as any) : 0);
  };

  const handleMaxClick = () => setInputBalance(safeRound(userBalance?.value || constants.Zero, userBalance?.decimals));

  const errorMessage = useMemo(() => {
    return (inputBalance || 0) > Number(userBalance?.formatted) ? "* Balance not available" : "";
  }, [inputBalance, userBalance?.formatted]);

  const isEmptyBalance = formattedInputBalance.eq(0) || userBalance?.value.eq(0);
  const hideMainButton = isEmptyBalance || isApproveLoading || errorMessage != "";

  function ActionableComponent() {
    return (
      <MainActionButton
        disabled={disabled || hideMainButton}
        handleClick={handleDeposit}
        type="button"
        label={showApproveButton ? "Approve" : ACTION.label}
      />
    );
  }

  return (
    <>
      <InputTokenWithError
        captionText={`${ACTION.label} Amount`}
        onSelectToken={() => { }}
        onMaxClick={handleMaxClick}
        chainId={chainId}
        value={inputBalance}
        onChange={handleChangeInput}
        selectedToken={
          {
            ...metadata,
            decimals: asset?.decimals,
            address: assetAddress,
            balance: userBalance?.value || constants.Zero,
          } as any
        }
        errorMessage={errorMessage}
        tokenList={
          [] // Working with vault asset only for now
        }
        getTokenUrl={getTokenUrl}
      />
      {children({
        ActionableComponent,
        data: {
          balance: {
            formatted: inputBalance || 0,
            value: formattedInputBalance,
          },
        },
      })}
    </>
  );
}

type AssetAction = {
  label: string;
  abi: string[];
  args?: any[];
  functionName: string;
  successMessage: string;
};

type ActionOrCallback = AssetAction | ((balance: BigNumber) => AssetAction);

function noOp() { }

export default AssetInputWithAction;
