import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/constants";
import { LOTTERY_APP_ID, RANDONMESS_BEACON_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";

async function commit() {
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

  await lotteryClient.send.submitCommit({
    args: {},
    appReferences: [BigInt(RANDONMESS_BEACON_APP_ID)],
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
  });
}

commit()
  .then(() => console.log("Committed"))
  .catch(console.error);
