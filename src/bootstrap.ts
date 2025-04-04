import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { FanbetDiscounterClient } from "../contracts/FanbetDiscounter";
import {
  LOTTERY_APP_ID,
  DISCOUNTER_APP_ID,
  REGISTRY_APP_ID,
  LEGACY_HOLDERS,
  PERCENTS,
  PRICE,
  PAYOUT_DURATION,
  REVEAL_DURATION,
  SUBMISSIONS_DURATION,
  DECIMALS,
  BEACON_APP_ID,
  LEGACY_DISCOUNT,
  REGULAR_DISCOUNT,
  FBET_ASSET_ID,
  ADMINISTRATOR_ADDRESS,
} from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";
import { getManagers } from "../utils/helpers";
import { algorand, network } from "../utils/config";

async function bootstrap() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!,
  );

  const lotteryClient = algorand.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: executor.addr,
      defaultSigner: executor.signer,
    },
  );

  const discountClient = algorand.client.getTypedAppClientById(
    FanbetDiscounterClient,
    {
      appId: BigInt(DISCOUNTER_APP_ID),
      appName: "DISCOUNT APP",
      defaultSender: executor.addr,
      defaultSigner: executor.signer,
    },
  );

  let token: bigint | number;

  if (network === "mainnet") {
    token = FBET_ASSET_ID;
  } else {
    const { assetId } = await algorand.send.assetCreate({
      decimals: 4,
      total: BigInt(1100000000000),
      defaultFrozen: false,
      manager: executor,
      assetName: "FanBet",
      reserve: executor,
      unitName: "FBET",
      sender: executor,
      signer: executor,
    });

    token = assetId;
  }

  await lotteryClient.send.bootstrap({
    args: {
      assetId: token,
      price: PRICE,
      decimals: DECIMALS,
      beaconId: BEACON_APP_ID,
      allocationPercents: PERCENTS,
      discountId: DISCOUNTER_APP_ID,
      payoutDuration: PAYOUT_DURATION,
      revealDuration: REVEAL_DURATION,
      submissionsDuration: SUBMISSIONS_DURATION,
    },
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
    populateAppCallResources: true,
  });

  const managers = await getManagers(token);

  for (let i = 0; i < managers.length; i++) {
    await lotteryClient.send.updateManagerAccount({
      args: {
        newManager: managers[i],
        index: i,
      },
    });
  }

  // await algorand.send.payment({
  //   receiver: discountClient.appAddress,
  //   amount: AlgoAmount.Algos(1),
  //   sender: executor,
  //   signer: executor,
  // });

  // await discountClient.send.bootstrap({
  //   args: {
  //     registryId: REGISTRY_APP_ID,
  //     legacyDiscount: LEGACY_DISCOUNT,
  //     regularDiscount: REGULAR_DISCOUNT,
  //   },
  //   extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
  // });

  // await discountClient.send.addLegacyHolders({
  //   args: {
  //     holders: LEGACY_HOLDERS.slice(0, 8),
  //   },
  //   extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE) * 2),
  //   populateAppCallResources: true,
  // });

  // await discountClient.send.addLegacyHolders({
  //   args: {
  //     holders: LEGACY_HOLDERS.slice(8),
  //   },
  //   extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE) * 2),
  //   populateAppCallResources: true,
  // });

  if (network === "mainnet") {
    await lotteryClient.send.updateAdminAccount({
      args: {
        newAdmin: ADMINISTRATOR_ADDRESS,
      },
    });

    await discountClient.send.updateAdminAccount({
      args: {
        newAdmin: ADMINISTRATOR_ADDRESS,
      },
    });
  }
}

bootstrap()
  .then(() => console.log("Bootstrapped"))
  .catch(console.error);
