import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { FanbetPlayerClient } from "../contracts/FanbetPlayer";
import { algorandClient } from "../utils/constants";
import { LOTTERY_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { generateTickets } from "../utils/helpers";
import { decodeAddress } from "algosdk";
import { pid } from "process";
import { populateAppCallResources } from "@algorandfoundation/algokit-utils";

async function purchase() {
  const deployer = algorandClient.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!,
  );

  await algorandClient.account.ensureFundedFromEnvironment(
    deployer.addr,
    new AlgoAmount({ algos: 1000000 }),
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
  const gameRound = await lotteryClient.state.global.gameRound();

  if (!ticketPrice) {
    throw new Error("Invalid Ticket Price");
  }

  if (!ticketToken) {
    throw new Error("Invalid Ticket Token");
  }

  if (!gameRound) {
    throw new Error("Invalid Game Round");
  }

  const CURR_NUMBER = 100;

  const storageCost = await lotteryClient.getStorageCost({
    args: {
      numOfTickets: CURR_NUMBER,
    },
  });

  const paymentAmount = new AlgoAmount({ microAlgos: storageCost });
  const paymentTxn = await algorandClient.createTransaction.payment({
    receiver: lotteryClient.appAddress,
    amount: paymentAmount,
    sender: deployer.addr,
  });

  const transferAmount = ticketPrice * BigInt(CURR_NUMBER);
  const transferTxn = await algorandClient.createTransaction.assetTransfer({
    assetId: ticketToken,
    sender: deployer.addr,
    receiver: lotteryClient.appAddress,
    amount: transferAmount,
  });

  await lotteryClient
    .newGroup()
    .buyTickets({
      args: {
        payTxn: paymentTxn,
        axferTxn: transferTxn,
        guesses: generateTickets(CURR_NUMBER),
      },
      maxFee: new AlgoAmount({ algos: 1 }),
    })
    .send({
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
    });

  const encoder = new TextEncoder();

  const playerBoxRef = new Uint8Array([
    ...encoder.encode("p_"),
    ...decodeAddress(deployer.addr.toString()).publicKey,
  ]);

  const playerBoxValue =
    await lotteryClient.appClient.getBoxValue(playerBoxRef);

  const playerDataview = new DataView(playerBoxValue.buffer);
  const playerAppID = BigInt(playerDataview.getBigUint64(0).toString());

  const playerClient = algorandClient.client.getTypedAppClientById(
    FanbetPlayerClient,
    {
      appId: playerAppID,
      appName: "FANBET PLAYER",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
    },
  );

  const ticketsLength = await playerClient.getTicketsLength({
    args: {
      gameRound,
    },
  });

  console.log(`Tickets Length: ${ticketsLength}`);

  const tickets = await playerClient.getTickets({
    args: {
      gameRound,
      start: 0,
      stop: 100,
    },
    staticFee: new AlgoAmount({ algos: 1 }),
  });

  console.log(JSON.stringify(tickets));
}

purchase()
  .then(() => console.log("Purchased"))
  .catch(console.error);
