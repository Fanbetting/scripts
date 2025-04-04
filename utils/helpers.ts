import { TransactionSignerAccount } from "@algorandfoundation/algokit-utils/types/account";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { Account, Address, decodeAddress } from "algosdk";
import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { FanbetPlayerClient } from "../contracts/FanbetPlayer";
import { MANAGERS } from "./constants";
import { algorand, network } from "./config";

type Ticket = [
  number | bigint,
  number | bigint,
  number | bigint,
  number | bigint,
  number | bigint,
];

const randomTicket = (): Ticket => {
  const ticket: Ticket = [0, 0, 0, 0, 0];

  for (let i = 0; i < 5; i++) {
    let uniqueNumber;

    while (!uniqueNumber || ticket.includes(uniqueNumber)) {
      uniqueNumber = Math.floor(Math.random() * 32) + 1;
    }

    ticket[i] = uniqueNumber;
  }

  return ticket;
};

export const generateTickets = (numTickets: number): Ticket[] => {
  const tickets: Ticket[] = [];

  for (let i = 0; i < numTickets; i++) {
    tickets.push(randomTicket());
  }

  return tickets;
};

export function decodeTickets(data: Uint8Array): Ticket[] {
  const ticketsLength = Buffer.from(data.slice(0, 2)).readIntBE(0, 2);

  const tickets: Ticket[] = [];

  for (let i = 0; i < ticketsLength; i++) {
    const digits = data.slice(2 + i * 5, 2 + (i + 1) * 5);
    const ticket: Ticket = [
      digits[0],
      digits[1],
      digits[2],
      digits[3],
      digits[4],
    ];

    tickets.push(ticket);
  }

  return tickets;
}

export async function getTickets(
  lotteryClient: FanbetLotteryClient,
  player: Address & TransactionSignerAccount & { account: Account },
) {
  const gameRound = await lotteryClient.state.global.gameRound();

  if (!gameRound) {
    throw new Error("Invalid Game Round");
  }

  const boxes = await lotteryClient.appClient.getBoxNames();

  let tickets: Ticket[] = [];

  const encoder = new TextEncoder();
  const playerBox = new Uint8Array([
    ...encoder.encode("p_"),
    ...decodeAddress(player.addr.toString()).publicKey,
  ]);

  const present = boxes.some(
    (box) => box.nameRaw.toString() == playerBox.toString(),
  );

  if (present) {
    const playerBoxValue = await lotteryClient.appClient.getBoxValue(playerBox);

    const playerDataview = new DataView(playerBoxValue.buffer);
    const playerAppID = BigInt(playerDataview.getBigUint64(0).toString());

    const playerClient = algorand.client.getTypedAppClientById(
      FanbetPlayerClient,
      {
        appId: playerAppID,
        appName: "FANBET PLAYER",
        defaultSender: player.addr,
        defaultSigner: player.signer,
      },
    );

    const ticketsLength = await playerClient.getTicketsLength({
      args: {
        gameRound,
      },
    });

    let i = BigInt(0);

    while (i < ticketsLength) {
      const size = ticketsLength - i > 100 ? 100 : ticketsLength - i;

      const start = i;
      const stop = i + BigInt(size);

      const ticketPage = await playerClient.getTickets({
        args: {
          gameRound,
          start,
          stop,
        },
        staticFee: new AlgoAmount({ algos: 1 }),
      });

      tickets = tickets.concat(ticketPage);
      i += BigInt(size);
    }
  }

  return tickets;
}

export const getManagers = async (ticketToken: bigint) => {
  if (network != "localnet") {
    return MANAGERS;
  }

  const managers = [algorand.account.random(), algorand.account.random()];
  const dispenser = await algorand.account.localNetDispenser();

  for (const manager of managers) {
    await algorand.account.ensureFunded(
      manager,
      dispenser,
      AlgoAmount.Algo(100),
    );

    await algorand.send.assetOptIn({
      sender: manager,
      assetId: ticketToken,
    });
  }

  return Array.from(managers.map((manager) => manager.addr.toString()));
};
