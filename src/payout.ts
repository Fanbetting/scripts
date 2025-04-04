import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { LOTTERY_APP_ID } from "../utils/constants";

async function payout() {
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

  await lotteryClient.send.payoutManager({
    args: {
      index: 0,
    },
    populateAppCallResources: true,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.Algo(1),
  });

  await lotteryClient.send.payoutManager({
    args: {
      index: 1,
    },
    populateAppCallResources: true,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.Algo(1),
  });
}

payout()
  .then(() => console.log("Paid Out Managers "))
  .catch(console.error);
