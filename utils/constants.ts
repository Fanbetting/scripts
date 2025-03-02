import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { network } from "./config";

export const LOTTERY_APP_ID =
  network == "localnet" ? 1002 : network == "testnet" ? 734952532 : 0;

export const LOTTERY_APP_ADDRESS =
  network == "localnet"
    ? "O3VYQKJ45XILV2GVDO44LM2IGPUD2QYRXNFX5K4ZDC2B4BD4ZZXU5AQG24"
    : network == "testnet"
      ? "6POJM4S2YZXKYQVWXSCWXZT4YXIJ4W4GWJAJJC2X2R5MJRN7KDXHBRJZ5A"
      : "";

export const RANDONMESS_BEACON_APP_ID =
  network == "localnet" ? 1004 : network == "testnet" ? 600011887 : 1615566206;

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
