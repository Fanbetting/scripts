import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { INFO } from "../utils/constants";

async function commit() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!,
  );

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
