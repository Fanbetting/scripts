import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/constants";
import { LOTTERY_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { generateTickets } from "../utils/helpers";

async function buy() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!
  );

  await algorand.account.ensureFundedFromEnvironment(
    executor.addr,
    new AlgoAmount({ algos: 1000000 })
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
  const paymentTxn = await algorand.createTransaction.payment({
    receiver: lotteryClient.appAddress,
    amount: paymentAmount,
    sender: executor.addr,
  });

  const transferAmount = ticketPrice * BigInt(CURR_NUMBER);
  const transferTxn = await algorand.createTransaction.assetTransfer({
    assetId: ticketToken,
    sender: executor.addr,
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
}

buy()
  .then(() => console.log("Bought"))
  .catch(console.error);
