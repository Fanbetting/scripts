import { Account, Address, decodeAddress, decodeUint64 } from "algosdk";
import { LOTTERY_APP_ID } from "../utils/constants";
import { TransactionSignerAccount } from "@algorandfoundation/algokit-utils/types/account";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { generateTickets } from "../utils/helpers";
import { ALGORAND_MIN_TX_FEE } from "@algorandfoundation/algokit-utils";
import { algorand } from "../utils/config";
import { FanbetPlayerClient } from "../contracts/FanbetPlayer";

const NUMBER_OF_TICKETS = 800;
const PLAYERS = 100;
const ROUNDS = 10;

const players: (Address & TransactionSignerAccount & { account: Account })[] =
  [];

async function flow() {
  const executor = algorand.account.fromMnemonic(
    process.env.EXECUTOR_MNEMONIC!
  );

  for (let i = 0; i < PLAYERS; i++) {
    const player = algorand.account.random();

    players.push(player);
  }

  for (let round = 1; round <= ROUNDS; round++) {
    for (const player of players) {
      console.log(`Player address: ${player.addr}`);

      const lotteryClient = algorand.client.getTypedAppClientById(
        FanbetLotteryClient,
        {
          appId: BigInt(LOTTERY_APP_ID),
          appName: "FANBET LOTTERY APP",
          defaultSender: player.addr,
          defaultSigner: player.signer,
        }
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

      const boxes = await lotteryClient.appClient.getBoxNames();
      const encoder = new TextEncoder();

      const playerBoxName = new Uint8Array([
        ...encoder.encode("p_"),
        ...decodeAddress(player.toString()).publicKey,
      ]);

      const registered = boxes.some(
        (box) => box.nameRaw.toString() == playerBoxName.toString()
      );

      if (!registered) {
        const registrationCost = await lotteryClient.getRegistrationCost();
        const paymentAmount = new AlgoAmount({ microAlgos: registrationCost });

        const paymentTxn = await algorand.createTransaction.payment({
          sender: player.addr,
          amount: paymentAmount,
          receiver: lotteryClient.appAddress,
        });

        await lotteryClient
          .newGroup()
          .register({
            args: {
              payTxn: paymentTxn,
            },
            maxFee: AlgoAmount.Algos(0.5),
          })
          .send({
            populateAppCallResources: true,
            coverAppCallInnerTransactionFees: true,
          });
      } else {
        const playerBoxValue = await lotteryClient.appClient.getBoxValue(
          playerBoxName
        );
        const playerAppID = decodeUint64(playerBoxValue);

        console.log(`Player App ID: ${playerAppID}`);
      }

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
      }
    );

    await lotteryClient.send.submitCommit({
      args: {},
    });

    console.log("\n\n === Committed successfully === \n\n");

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
        }
      );

      await lotteryClient.send.submitTickets({
        args: {},
        maxFee: AlgoAmount.Algos(1),
        populateAppCallResources: true,
        coverAppCallInnerTransactionFees: true,
      });
    }

    console.log("\n\n === Users Submitted Tickets successfully === \n\n");

    await lotteryClient.send.openPayout({
      args: {},
    });

    console.log("\n\n === Payout Opened successfully === \n\n");

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
        }
      );

      const encoder = new TextEncoder();

      const playerBoxName = new Uint8Array([
        ...encoder.encode("p_"),
        ...decodeAddress(player.toString()).publicKey,
      ]);

      const playerBoxValue = await lotteryClient.appClient.getBoxValue(
        playerBoxName
      );

      const playerAppID = decodeUint64(playerBoxValue);

      const playerClient = algorand.client.getTypedAppClientById(
        FanbetPlayerClient,
        {
          appId: BigInt(playerAppID),
          appName: "FANBET PLAYER APP",
          defaultSender: player.addr,
          defaultSigner: player.signer,
        }
      );

      const matches = await playerClient.getMatches();

      if (
        matches.fiveMatch > 0 ||
        matches.fourMatch > 0 ||
        matches.threeMatch > 0
      ) {
        console.log(
          `Player ${player.addr} has won ${matches.fiveMatch} five-match, ${matches.fourMatch} four-match, and ${matches.threeMatch} three-match`
        );
      }

      await lotteryClient.send.payoutWinnings({
        args: {},
        maxFee: AlgoAmount.Algos(1),
        populateAppCallResources: true,
        coverAppCallInnerTransactionFees: true,
      });
    }

    console.log("\n\n === Paid Out Winners successfully === \n\n");

    await lotteryClient.send.resetLottery({
      args: {},
      populateAppCallResources: true,
      extraFee: AlgoAmount.MicroAlgos(Number(ALGORAND_MIN_TX_FEE)),
    });

    console.log(`\t\t\t Round ${round} completed`);
    console.log("\n\n === Reset Lottery successfully === \n\n");
  }
}

flow()
  .then(() => console.log("Lottery Flow Completed"))
  .catch(console.error);

async function prepareUser(
  user: Address & TransactionSignerAccount & { account: Account },
  executor: Address & TransactionSignerAccount & { account: Account },
  ticketToken: bigint,
  ticketPrice: bigint
) {
  const dispenser = await algorand.account.localNetDispenser();

  await algorand.account.ensureFunded(
    user.addr,
    dispenser.addr,
    AlgoAmount.Algos(1000)
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
