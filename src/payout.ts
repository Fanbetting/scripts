import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { ALGO_LOTTERY_APP_ID, INFO } from "../utils/constants";
import { FanbetAlgoLotteryClient } from "../contracts/FanbetAlgoLottery";

async function payout() {
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

  await algoLotteryClient.send.payoutManager({
    args: {
      index: 0,
    },
    validityWindow: 1000,
    populateAppCallResources: true,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.Algo(1),
  });

  await algoLotteryClient.send.payoutManager({
    args: {
      index: 1,
    },
    validityWindow: 1000,
    populateAppCallResources: true,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.Algo(1),
  });

  for (const [asset, { lotteryAppId }] of Object.entries(INFO)) {
    console.log(`Payout Managers for ${asset} Lottery...`);

    const lotteryClient = algorand.client.getTypedAppClientById(
      FanbetLotteryClient,
      {
        appId: BigInt(lotteryAppId),
        appName: "FANBET LOTTERY APP",
        defaultSender: executor.addr,
        defaultSigner: executor.signer,
      },
    );

    await lotteryClient.send.payoutManager({
      args: {
        index: 0,
      },
      validityWindow: 1000,
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
      maxFee: AlgoAmount.Algo(1),
    });

    await lotteryClient.send.payoutManager({
      args: {
        index: 1,
      },
      validityWindow: 1000,
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
      maxFee: AlgoAmount.Algo(1),
    });
  }
}

payout()
  .then(() => console.log("Paid Out Managers"))
  .catch(console.error);
