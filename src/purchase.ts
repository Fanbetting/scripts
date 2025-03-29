import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { algorand } from "../utils/constants";
import { LOTTERY_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { generateTickets } from "../utils/helpers";

const NUMBER_OF_TICKETS = 100;

async function purchase() {
  const dispenser = await algorand.account.dispenserFromEnvironment();
  const deployer = algorand.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!,
  );

  const buyer = algorand.account.random();
  await algorand.account.ensureFunded(
    buyer,
    dispenser,
    new AlgoAmount({ algo: 10000000 }),
  );

  const lotteryClient = algorand.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: buyer.addr,
      defaultSigner: buyer.signer,
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

  await algorand.send.assetOptIn({
    assetId: ticketToken,
    sender: buyer.addr,
    signer: buyer.signer,
  });

  await algorand.send.assetTransfer({
    assetId: ticketToken,
    receiver: buyer.addr,
    sender: deployer.addr,
    signer: deployer.signer,
    amount: ticketPrice * BigInt(NUMBER_OF_TICKETS * 10),
  });

  const storageCost = await lotteryClient.getStorageCost({
    args: {
      numOfTickets: NUMBER_OF_TICKETS,
    },
  });

  const paymentAmount = new AlgoAmount({ microAlgos: storageCost });
  const paymentTxn = await algorand.createTransaction.payment({
    receiver: lotteryClient.appAddress,
    amount: paymentAmount,
    sender: buyer.addr,
  });

  const transferAmount = ticketPrice * BigInt(NUMBER_OF_TICKETS);
  const transferTxn = await algorand.createTransaction.assetTransfer({
    assetId: ticketToken,
    sender: buyer.addr,
    receiver: lotteryClient.appAddress,
    amount: transferAmount,
  });

  await lotteryClient
    .newGroup()
    .buyTickets({
      args: {
        payTxn: paymentTxn,
        axferTxn: transferTxn,
        guesses: generateTickets(NUMBER_OF_TICKETS),
      },
      maxFee: new AlgoAmount({ algos: 1 }),
    })
    .send({
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
    });
}

purchase()
  .then(() => console.log("Purchased"))
  .catch(console.error);
