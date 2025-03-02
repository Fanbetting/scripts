import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorandClient } from "../utils/constants";
import { LOTTERY_APP_ID } from "../utils/constants";

async function payout() {
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

  await lotteryClient.send.openPayout({
    args: {},
    assetReferences: [ticketToken],
  });
}

payout()
  .then(() => console.log("Enabled Payout"))
  .catch(console.error);
