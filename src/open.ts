import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { LOTTERY_APP_ID } from "../utils/constants";

async function open() {
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

  const ticketToken = await lotteryClient.state.global.ticketToken();

  if (!ticketToken) {
    throw new Error("Could not get purchase token");
  }

  await lotteryClient.send.openPayout({
    args: {},
    populateAppCallResources: true,
  });
}

open()
  .then(() => console.log("Opened Payout"))
  .catch(console.error);
