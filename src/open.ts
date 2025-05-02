import { FanbetAlgoLotteryClient } from "../contracts/FanbetAlgoLottery";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { ALGO_LOTTERY_APP_ID, INFO } from "../utils/constants";

async function open() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!,
  );

  const algoLotteryClient = algorand.client.getTypedAppClientById(
    FanbetAlgoLotteryClient,
    {
      appId: BigInt(ALGO_LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: executor.addr,
      defaultSigner: executor.signer,
    },
  );

  await algoLotteryClient.send.openPayout({
    args: {},
    validityWindow: 1000,
    populateAppCallResources: true,
  });

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
