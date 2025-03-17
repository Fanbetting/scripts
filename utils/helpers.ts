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
