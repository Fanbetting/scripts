import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/config";
import { LOTTERY_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";

async function reveal() {
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

  await lotteryClient.send.revealTicket({
    args: {},
    populateAppCallResources: true,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE) * 3),
  });
}

reveal()
  .then(() => console.log("Revealed"))
  .catch(console.error);
