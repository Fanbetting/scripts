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

export const getManagers = async (ticketToken: bigint | number) => {
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
      assetId: BigInt(ticketToken),
    });
  }

  return Array.from(managers.map((manager) => manager.addr.toString()));
};
