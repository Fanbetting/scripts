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
