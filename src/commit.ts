import { FanbetAlgoLotteryClient } from "../contracts/FanbetAlgoLottery";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { ALGO_LOTTERY_APP_ID, INFO } from "../utils/constants";

async function commit() {
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

  await algoLotteryClient.send.submitCommit({
    args: {},
    validityWindow: 1000,
    populateAppCallResources: true,
  });

  for (const [asset, { lotteryAppId }] of Object.entries(INFO)) {
    console.log(`Submitting Commit for ${asset} Lottery...`);

    const lotteryClient = algorand.client.getTypedAppClientById(
      FanbetLotteryClient,
      {
        appId: BigInt(lotteryAppId),
        appName: "FANBET LOTTERY APP",
        defaultSender: executor.addr,
        defaultSigner: executor.signer,
      },
    );

    await lotteryClient.send.submitCommit({
      args: {},
      validityWindow: 1000,
      populateAppCallResources: true,
    });
  }
}

commit()
  .then(() => console.log("Committed"))
  .catch(console.error);
