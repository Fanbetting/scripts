import { AppDetails } from "@algorandfoundation/algokit-utils/types/app-client";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import {
  algorandClient,
  price,
  resetDelay,
  revealDelay,
} from "../utils/config";
import {
  LOTTERY_APP_ADDRESS,
  LOTTERY_APP_ID,
  RANDONMESS_BEACON_APP_ID,
} from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";

async function bootstrap() {
  const deployer = algorandClient.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!
  );

  const suggestedParams = await algorandClient.client.algod
    .getTransactionParams()
    .do();

  const lotteryClient = new FanbetLotteryClient(
    {
      resolveBy: "id",
      id: LOTTERY_APP_ID,
      sender: deployer,
    } as AppDetails,
    algorandClient.client.algod
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
    receiver: LOTTERY_APP_ADDRESS,
    amount: AlgoAmount.Algos(0.5),
    sender: deployer,
    signer: deployer,
  });

  await lotteryClient.bootstrap(
    {
      price,
      resetDelay,
      revealDelay,
      assetId,
      beaconAppId: RANDONMESS_BEACON_APP_ID,
    },
    {
      assets: [Number(assetId)],
      sendParams: {
        fee: AlgoAmount.MicroAlgos(Number(suggestedParams.minFee) * 2),
      },
      sender: deployer,
    }
  );
}

bootstrap()
  .then(() => console.log("Bootstrapped"))
  .catch(console.error);
