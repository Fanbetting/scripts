import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import dotenv from "dotenv";

dotenv.config();

export const network: "testnet" | "localnet" = "localnet";

export const price = 10000;

export const resetDelay = network == "localnet" ? 1 : 200;
export const revealDelay = network == "localnet" ? 1 : 1000;

export const algorandClient =
  network == "localnet"
    ? AlgorandClient.defaultLocalNet()
    : AlgorandClient.testNet();
