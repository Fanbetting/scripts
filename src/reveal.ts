import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorandClient } from "../utils/constants";
import { LOTTERY_APP_ID, RANDONMESS_BEACON_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";

async function reveal() {
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

  const ticketToken = await lotteryClient.state.global.ticketToken();

  if (!ticketToken) {
    throw new Error("Could not get purchase token");
  }

  await lotteryClient.send.revealTicket({
    args: {},
    assetReferences: [ticketToken],
    appReferences: [BigInt(RANDONMESS_BEACON_APP_ID)],
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
  });
}

reveal()
  .then(() => console.log("Revealed"))
  .catch(console.error);
