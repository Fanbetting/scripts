import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorandClient } from "../utils/config";
import { LOTTERY_APP_ID, RANDONMESS_BEACON_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";

async function commit() {
  const deployer = algorandClient.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!,
  );

  const lotteryClient = algorandClient.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
    },
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
