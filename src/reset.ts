import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { ALGO_LOTTERY_APP_ID, INFO } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";
import { FanbetAlgoLotteryClient } from "../contracts/FanbetAlgoLottery";

async function reset() {
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

  await algoLotteryClient.send.resetLottery({
    args: {},
    populateAppCallResources: true,
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
  });

  for (const [asset, { lotteryAppId }] of Object.entries(INFO)) {
    console.log(`Resetting state for ${asset} Lottery...`);

    const lotteryClient = algorand.client.getTypedAppClientById(
      FanbetLotteryClient,
      {
        appId: BigInt(lotteryAppId),
        appName: "FANBET LOTTERY APP",
        defaultSender: executor.addr,
        defaultSigner: executor.signer,
      },
    );

    await lotteryClient.send.resetLottery({
      args: {},
      populateAppCallResources: true,
      extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
    });
  }
}

reset()
  .then(() => console.log("Reset"))
  .catch(console.error);
