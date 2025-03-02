import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import {
  algorandClient,
  payoutDuration,
  price,
  revealDuration,
  submissionsDuration,
} from "../utils/constants";
import {
  LOTTERY_APP_ADDRESS,
  LOTTERY_APP_ID,
  RANDONMESS_BEACON_APP_ID,
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
    amount: AlgoAmount.Algos(10),
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
      beaconId: RANDONMESS_BEACON_APP_ID,
    },
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
    assetReferences: [assetId],
  });
}

bootstrap()
  .then(() => console.log("Bootstrapped"))
  .catch(console.error);
