import { FanbetAlgoLotteryClient } from "../contracts/FanbetAlgoLottery";
import {
  INFO,
  DISCOUNTER_APP_ID,
  PERCENTS,
  PAYOUT_DURATION,
  REVEAL_DURATION,
  SUBMISSIONS_DURATION,
  BEACON_APP_ID,
  ADMINISTRATOR_ADDRESS,
  ALGO_LOTTERY_PRICE,
  ALGO_LOTTERY_APP_ID,
  ALGO_LOTTERY_DECIMALS,
  MANAGERS,
} from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";
import { algorand } from "../utils/config";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";

const ASSET: keyof typeof INFO = "IPT";

async function bootstrap() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!,
  );

  const deployer = algorand.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!,
  );

  const managers = MANAGERS;

  const algoLotteryClient = algorand.client.getTypedAppClientById(
    FanbetAlgoLotteryClient,
    {
      appId: BigInt(ALGO_LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
    },
  );

  await algoLotteryClient.send.bootstrap({
    args: {
      price: ALGO_LOTTERY_PRICE,
      decimals: ALGO_LOTTERY_DECIMALS,
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

  for (let i = 0; i < managers.length; i++) {
    await algoLotteryClient.send.updateManagerAccount({
      args: {
        newManager: managers[i],
        index: i,
      },
    });
  }

  await algoLotteryClient.send.updateAdminAccount({
    args: {
      newAdmin: ADMINISTRATOR_ADDRESS,
    },
  });

  const { lotteryAppId, decimals, price, assetId } = INFO[ASSET];

  const lotteryClient = algorand.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(lotteryAppId),
      appName: "FANBET LOTTERY APP",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
    },
  );

  await lotteryClient.send.bootstrap({
    args: {
      price,
      assetId,
      decimals,
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

  for (let i = 0; i < managers.length; i++) {
    await lotteryClient.send.updateManagerAccount({
      args: {
        newManager: managers[i],
        index: i,
      },
    });
  }

  await lotteryClient.send.updateExecutorAccount({
    args: {
      newExecutor: executor.addr.toString(),
    },
  });

  await lotteryClient.send.updateAdminAccount({
    args: {
      newAdmin: ADMINISTRATOR_ADDRESS,
    },
  });
}

bootstrap()
  .then(() => console.log("Bootstrapped"))
  .catch(console.error);
