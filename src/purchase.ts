import { decodeAddress } from "algosdk";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorandClient } from "../utils/constants";
import { LOTTERY_APP_ADDRESS, LOTTERY_APP_ID } from "../utils/constants";
import { BoxReference } from "@algorandfoundation/algokit-utils/types/app-manager";

async function purchase() {
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

  const ticketPrice = await lotteryClient.state.global.ticketPrice();
  const ticketToken = await lotteryClient.state.global.ticketToken();

  if (!ticketPrice) {
    throw new Error("Invalid Ticket Price");
  }

  if (!ticketToken) {
    throw new Error("Invalid Ticket Token");
  }

  const purchaseAmount = Number(ticketPrice) * 1e4;
  const transferTxn = await algorandClient.createTransaction.assetTransfer({
    assetId: ticketToken,
    sender: deployer.addr,
    receiver: LOTTERY_APP_ADDRESS,
    amount: BigInt(purchaseAmount),
  });

  const encoder = new TextEncoder();

  const boxRef: BoxReference = {
    appId: BigInt(LOTTERY_APP_ID),
    name: new Uint8Array([
      ...encoder.encode("p_"),
      ...decodeAddress(deployer.addr.toString()).publicKey,
    ]),
  };

  await lotteryClient
    .newGroup()
    .buyTicket({
      args: {
        axferTxn: transferTxn,
        guess: [4, 8, 12, 16, 20],
      },
      boxReferences: [boxRef],
    })
    .send();
}

purchase()
  .then(() => console.log("Purchased"))
  .catch(console.error);
