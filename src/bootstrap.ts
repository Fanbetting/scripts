import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { FanbetDiscounterClient } from "../contracts/FanbetDiscounter";
import {
  algorandClient,
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
} from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";

async function bootstrap() {
  const deployer = algorandClient.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!,
  );

  const lotteryClient = algorandClient.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
    },
  );

  const discountClient = algorandClient.client.getTypedAppClientById(
    FanbetDiscounterClient,
    {
      appId: BigInt(DISCOUNTER_APP_ID),
      appName: "DISCOUNT APP",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
    },
  );

  const { assetId } = await algorandClient.send.assetCreate({
    decimals: 4,
    total: BigInt(1100000000000),
    defaultFrozen: false,
    manager: deployer,
    assetName: "FanBet",
    reserve: deployer,
    unitName: "FBET",
    sender: deployer,
    signer: deployer,
  });

  await algorandClient.send.payment({
    receiver: lotteryClient.appAddress,
    amount: AlgoAmount.Algos(5),
    sender: deployer,
    signer: deployer,
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
    },
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
    assetReferences: [assetId],
  });

  await algorandClient.send.payment({
    receiver: discountClient.appAddress,
    amount: AlgoAmount.Algos(5),
    sender: deployer,
    signer: deployer,
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

  await discountClient.send.addLegacyHolders({
    args: {
      holders: [deployer.addr.toString()],
    },
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE) * 2),
    populateAppCallResources: true,
  });
}

bootstrap()
  .then(() => console.log("Bootstrapped"))
  .catch(console.error);
