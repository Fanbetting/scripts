import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { LOTTERY_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";

async function submit() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!,
  );

  await algorand.account.ensureFundedFromEnvironment(
    executor.addr,
    new AlgoAmount({ algos: 1000000 }),
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

  await lotteryClient.send.submitTickets({
    args: {},
    populateAppCallResources: true,
    staticFee: new AlgoAmount({ algos: 1 }),
  });
}

submit()
  .then(() => console.log("Submitted"))
  .catch(console.error);
