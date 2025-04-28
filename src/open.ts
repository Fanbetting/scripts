import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { INFO } from "../utils/constants";

async function open() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!,
  );

  for (const [asset, { lotteryAppId }] of Object.entries(INFO)) {
    console.log(`Opening payout for ${asset} Lottery...`);

    const lotteryClient = algorand.client.getTypedAppClientById(
      FanbetLotteryClient,
      {
        appId: BigInt(lotteryAppId),
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
      validityWindow: 1000,
      populateAppCallResources: true,
    });
  }
}

open()
  .then(() => console.log("Opened Payout"))
  .catch(console.error);
