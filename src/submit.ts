import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorandClient } from "../utils/constants";
import { LOTTERY_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";

async function submit() {
  const deployer = algorandClient.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!,
  );

  await algorandClient.account.ensureFundedFromEnvironment(
    deployer.addr,
    new AlgoAmount({ algos: 1000000 }),
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

  await lotteryClient.send.submitTickets({
    args: {},
    populateAppCallResources: true,
    staticFee: new AlgoAmount({ algos: 1 }),
  });
}

submit()
  .then(() => console.log("Submitted"))
  .catch(console.error);
