import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/constants";
import { LOTTERY_APP_ID, RANDONMESS_BEACON_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";

async function reset() {
  const deployer = algorand.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!
  );

  const lotteryClient = algorand.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
    }
  );

  const ticketToken = await lotteryClient.state.global.ticketToken();

  if (!ticketToken) {
    throw new Error("Invalid Ticket Token");
  }

  await lotteryClient.send.resetLottery({
    args: {},
    appReferences: [BigInt(RANDONMESS_BEACON_APP_ID)],
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
    assetReferences: [ticketToken],
  });
}

reset()
  .then(() => console.log("Reset"))
  .catch(console.error);
