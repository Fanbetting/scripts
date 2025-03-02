import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import dotenv from "dotenv";

dotenv.config();

export const network: "testnet" | "localnet" | "mainnet" = "localnet";

export const price = 10000;

export const payoutDuration =
  network == "localnet" ? 1 : network == "testnet" ? 100 : 4000;

export const submissionsDuration =
  network == "localnet" ? 1 : network == "testnet" ? 100 : 4000;

export const revealDuration =
  network == "localnet" ? 1 : network == "testnet" ? 25 : 1000;

export const algorandClient =
  network == "localnet"
    ? AlgorandClient.defaultLocalNet()
    : AlgorandClient.testNet();
