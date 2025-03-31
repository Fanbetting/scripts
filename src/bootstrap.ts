import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { FanbetDiscounterClient } from "../contracts/FanbetDiscounter";
import {
  algorand,
  payoutDuration,
  legacyDiscount,
  regularDiscount,
  price,
  revealDuration,
  submissionsDuration,
  LOTTERY_APP_ID,
  DISCOUNTER_APP_ID,
  RANDONMESS_BEACON_APP_ID,
  REGISTRY_APP_ID,
  LEGACY_HOLDERS,
  PERCENTS,
} from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";
import { getManagers } from "../utils/helpers";

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

  await lotteryClient.send.bootstrap({
    args: {
      price,
      assetId,
      payoutDuration,
      revealDuration,
      submissionsDuration,
      decimals: 4,
      discountId: DISCOUNTER_APP_ID,
      beaconId: RANDONMESS_BEACON_APP_ID,
      allocationPercents: PERCENTS,
    },
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
    assetReferences: [assetId],
  });

  const managers = await getManagers(assetId);

  for (let i = 0; i < managers.length; i++) {
    await lotteryClient.send.updateManagerAccount({
      args: {
        newManager: managers[i],
        index: i,
      },
    });
  }

  await algorand.send.payment({
    receiver: discountClient.appAddress,
    amount: AlgoAmount.Algos(1),
    sender: executor,
    signer: executor,
  });

  await discountClient.send.bootstrap({
    args: {
      legacyDiscount,
      regularDiscount,
      registryId: REGISTRY_APP_ID,
    },
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
  });

  await discountClient.send.addLegacyHolders({
    args: {
      holders: LEGACY_HOLDERS.slice(0, 8),
    },
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE) * 2),
    populateAppCallResources: true,
  });

  await discountClient.send.addLegacyHolders({
    args: {
      holders: LEGACY_HOLDERS.slice(8),
    },
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE) * 2),
    populateAppCallResources: true,
  });
}

bootstrap()
  .then(() => console.log("Bootstrapped"))
  .catch(console.error);
