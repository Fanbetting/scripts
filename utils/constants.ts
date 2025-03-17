import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { network } from "./config";

export const LOTTERY_APP_ID =
  network == "localnet" ? 1002 : network == "testnet" ? 734952532 : 0;

export const DISCOUNTER_APP_ID =
  network == "localnet" ? 1004 : network == "testnet" ? 0 : 0;

export const RANDONMESS_BEACON_APP_ID =
  network == "localnet" ? 1005 : network == "testnet" ? 600011887 : 1615566206;

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
