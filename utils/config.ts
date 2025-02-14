import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import dotenv from "dotenv";

dotenv.config();

export const network: "testnet" | "localnet" = "localnet";

export const price = 10000;

export const resetDelay = 100;
export const revealDelay = 1000;

export const algorandClient =
  network == "localnet"
    ? AlgorandClient.defaultLocalNet()
    : AlgorandClient.testNet();
