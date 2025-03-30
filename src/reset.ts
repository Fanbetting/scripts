import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/constants";
import { LOTTERY_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";

async function reset() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!
  );

  const lotteryClient = algorand.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: executor.addr,
      defaultSigner: executor.signer,
    }
  );

  const ticketToken = await lotteryClient.state.global.ticketToken();

  if (!ticketToken) {
    throw new Error("Invalid Ticket Token");
  }

  await lotteryClient.send.resetLottery({
    args: {},
    populateAppCallResources: true,
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
  });
}

reset()
  .then(() => console.log("Reset"))
  .catch(console.error);
