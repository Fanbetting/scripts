import { Account, Address } from "algosdk";
import { algorand, LOTTERY_APP_ID } from "../utils/constants";
import { TransactionSignerAccount } from "@algorandfoundation/algokit-utils/types/account";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { generateTickets } from "../utils/helpers";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";

const NUMBER_OF_TICKETS = 800;
const PLAYERS = 1;

const players: (Address & TransactionSignerAccount & { account: Account })[] =
  [];

async function flow() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!,
  );

  // TICKETS PURCHASE
  for (let i = 0; i < PLAYERS; i++) {
    const player = algorand.account.random();
    console.log(`Player address: ${player.addr}`);

    players.push(player);

    const lotteryClient = algorand.client.getTypedAppClientById(
      FanbetLotteryClient,
      {
        appId: BigInt(LOTTERY_APP_ID),
        appName: "FANBET LOTTERY APP",
        defaultSender: player.addr,
        defaultSigner: player.signer,
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

    await prepareUser(player, executor, ticketToken, ticketPrice);

    for (let i = 0; i < NUMBER_OF_TICKETS; i += 100) {
      const numberOfTickets =
        NUMBER_OF_TICKETS - i < 100 ? NUMBER_OF_TICKETS - i : 100;

      const storageCost = await lotteryClient.getStorageCost({
        args: {
          numOfTickets: numberOfTickets,
        },
      });

      const paymentAmount = new AlgoAmount({ microAlgos: storageCost });
      const paymentTxn = await algorand.createTransaction.payment({
        sender: player.addr,
        amount: paymentAmount,
        receiver: lotteryClient.appAddress,
      });

      const transferAmount = ticketPrice * BigInt(numberOfTickets);
      const transferTxn = await algorand.createTransaction.assetTransfer({
        sender: player.addr,
        assetId: ticketToken,
        amount: transferAmount,
        receiver: lotteryClient.appAddress,
      });

      await lotteryClient
        .newGroup()
        .buyTickets({
          args: {
            payTxn: paymentTxn,
            axferTxn: transferTxn,
            guesses: generateTickets(numberOfTickets),
          },
          maxFee: new AlgoAmount({ algos: 1 }),
        })
        .send({
          populateAppCallResources: true,
          coverAppCallInnerTransactionFees: true,
        });
    }
  }

  console.log("\n\n === Tickets purchased successfully === \n\n");

  const lotteryClient = algorand.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: executor.addr,
      defaultSigner: executor.signer,
    },
  );

  // COMMIT
  await lotteryClient.send.submitCommit({
    args: {},
  });

  console.log("\n\n === Committed successfully === \n\n");

  // REVEAL
  await lotteryClient.send.revealTicket({
    args: {},
    populateAppCallResources: true,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE) * 3),
  });

  console.log("\n\n === Revealed successfully === \n\n");

  for (const player of players) {
    const lotteryClient = algorand.client.getTypedAppClientById(
      FanbetLotteryClient,
      {
        appId: BigInt(LOTTERY_APP_ID),
        appName: "FANBET LOTTERY APP",
        defaultSender: player.addr,
        defaultSigner: player.signer,
      },
    );

    // USERS SUBMIT TICKETS
    await lotteryClient.send.submitTickets({
      args: {},
      maxFee: AlgoAmount.Algos(1),
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
    });
  }

  console.log("\n\n === Users Submitted Tickets successfully === \n\n");

  // PAYOUT
  await lotteryClient.send.openPayout({
    args: {},
  });

  console.log("\n\n === Payout Opened successfully === \n\n");

  // MANAGER PAYOUT
  await lotteryClient.send.payoutManager({
    args: {
      index: 0,
    },
    populateAppCallResources: true,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.Algo(1),
  });

  await lotteryClient.send.payoutManager({
    args: {
      index: 1,
    },
    populateAppCallResources: true,
    coverAppCallInnerTransactionFees: true,
    maxFee: AlgoAmount.Algo(1),
  });

  console.log("\n\n === Paid Out Managers successfully === \n\n");

  for (const player of players) {
    const lotteryClient = algorand.client.getTypedAppClientById(
      FanbetLotteryClient,
      {
        appId: BigInt(LOTTERY_APP_ID),
        appName: "FANBET LOTTERY APP",
        defaultSender: player.addr,
        defaultSigner: player.signer,
      },
    );

    // USERS CLAIM REWARDS
    await lotteryClient.send.payoutWinnings({
      args: {},
      maxFee: AlgoAmount.Algos(1),
      populateAppCallResources: true,
      coverAppCallInnerTransactionFees: true,
    });
  }

  console.log("\n\n === Paid Out Winners successfully === \n\n");

  // ROUND RESET

  await lotteryClient.send.resetLottery({
    args: {},
    populateAppCallResources: true,
    extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
  });

  console.log("\n\n === Reset Lottery successfully === \n\n");
}

flow()
  .then(() => console.log("Lottery Flow Completed"))
  .catch(console.error);

async function prepareUser(
  user: Address & TransactionSignerAccount & { account: Account },
  executor: Address & TransactionSignerAccount & { account: Account },
  ticketToken: bigint,
  ticketPrice: bigint,
) {
  const dispenser = await algorand.account.localNetDispenser();

  await algorand.account.ensureFunded(
    user.addr,
    dispenser.addr,
    AlgoAmount.Algos(1000),
  );

  await algorand.send.assetOptIn({
    assetId: ticketToken,
    sender: user.addr,
    signer: user.signer,
  });

  await algorand.send.assetTransfer({
    assetId: ticketToken,
    receiver: user.addr,
    sender: executor.addr,
    signer: executor.signer,
    amount: ticketPrice * BigInt(NUMBER_OF_TICKETS),
  });
}
