import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import dotenv from "dotenv";
dotenv.config();

export const network: "testnet" | "localnet" | "mainnet" =
  process.env.NETWORK == "mainnet"
    ? "mainnet"
    : process.env.NETWORK == "testnet"
      ? "testnet"
      : "localnet";

export const algorand =
  network == "mainnet"
    ? AlgorandClient.mainNet()
    : network == "testnet"
      ? AlgorandClient.testNet()
      : AlgorandClient.defaultLocalNet();
