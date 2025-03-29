import { FanbetLotteryClient } from "../contracts/FanbetLottery";
import { FanbetPlayerClient } from "../contracts/FanbetPlayer";
import { algorand } from "../utils/constants";
import { LOTTERY_APP_ID } from "../utils/constants";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";
import { decodeAddress } from "algosdk";

async function retrieve() {
  const deployer = algorand.account.fromMnemonic(
    process.env.DEPLOYER_MNEMONIC!
  );

  await algorand.account.ensureFundedFromEnvironment(
    deployer.addr,
    new AlgoAmount({ algos: 1000000 })
  );

  const lotteryClient = algorand.client.getTypedAppClientById(
    FanbetLotteryClient,
    {
      appId: BigInt(LOTTERY_APP_ID),
      appName: "FANBET LOTTERY APP",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
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

  const encoder = new TextEncoder();
  const playerBoxRef = new Uint8Array([
    ...encoder.encode("p_"),
    ...decodeAddress(deployer.addr.toString()).publicKey,
  ]);

  const playerBoxValue = await lotteryClient.appClient.getBoxValue(
    playerBoxRef
  );

  const playerDataview = new DataView(playerBoxValue.buffer);
  const playerAppID = BigInt(playerDataview.getBigUint64(0).toString());

  const playerClient = algorand.client.getTypedAppClientById(
    FanbetPlayerClient,
    {
      appId: playerAppID,
      appName: "FANBET PLAYER",
      defaultSender: deployer.addr,
      defaultSigner: deployer.signer,
    }
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

retrieve()
  .then(() => console.log("Retrieved"))
  .catch(console.error);
