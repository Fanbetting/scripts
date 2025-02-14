import { AppDetails } from "@algorandfoundation/algokit-utils/types/app-client";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorandClient } from "../utils/config";
import { LOTTERY_APP_ID, RANDONMESS_BEACON_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";

async function reset() {
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

  await lotteryClient.resetLottery(
    {},
    {
      apps: [RANDONMESS_BEACON_APP_ID],
      sendParams: {
        fee: AlgoAmount.MicroAlgos(Number(suggestedParams.minFee) * 2),
      },
      sender: deployer,
    }
  );
}

reset()
  .then(() => console.log("Reset"))
  .catch(console.error);
