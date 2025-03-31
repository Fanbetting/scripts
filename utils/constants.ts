import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { network } from "./config";

export const LOTTERY_APP_ID =
  network == "localnet" ? 1002 : network == "testnet" ? 736653573 : 2881824977;

export const DISCOUNTER_APP_ID =
  network == "localnet" ? 1005 : network == "testnet" ? 736077084 : 2881825331;

export const RANDONMESS_BEACON_APP_ID =
  network == "localnet" ? 1007 : network == "testnet" ? 600011887 : 1615566206;

export const REGISTRY_APP_ID =
  network == "localnet" ? 1008 : network == "testnet" ? 84366825 : 760937186;

export const legacyDiscount = 10;
export const regularDiscount = 5;

export const price = network == "localnet" ? 10 : 10000;

export const payoutDuration =
  network == "localnet" ? 1 : network == "testnet" ? 100 : 10000;

export const submissionsDuration =
  network == "localnet" ? 1 : network == "testnet" ? 100 : 10000;

export const revealDuration =
  network == "localnet" ? 1 : network == "testnet" ? 25 : 200;

export const algorand =
  network == "localnet"
    ? AlgorandClient.defaultLocalNet()
    : network == "mainnet"
      ? AlgorandClient.mainNet()
      : AlgorandClient.testNet();

export const LEGACY_HOLDERS = [
  "RSGDEUMXJHFI76AN4PCEXXI3456TRBSROZUZ6FAVYPF53HGUZONUHLRYKU",
  "6UE6PHOA6234L5HTVRMJGN7TKLGCTVLLFTI5DMWUUHJ6OZFGPXFE7QQENU",
  "4QUG5LE5DI7ENE6EWY235CE6TDYZN3BA6T7ICEQNBHMSBXI3RBCPDMSJJQ",
  "FJQUONNMB2XMR5PYVXXFC5XYGOCI7PKE4QHPLEL5KF5CCIKB5YCKRZOFTU",
  "7ZC4L3HJH2BBEM55RRLO4UMU2UUGL72OOOI3WJNVB472LRFMG5JQPXX2U4",
  "YNZKXW42NZRJOIFLSOMPTS4O3WPSVAQXXWZFHBNE3DPEZYQC3T5TLH37YA",
  "OPTGBLHKTP7LV2WLD22PSOBCVXBKCBLWVGDHKZ34T4YPK3DOMMCNGGQXLY",
  "XLPVADBFOI4HSWT7OTPDQVOPDHH6QBT7V6EPFGUXBMWZAM2FR2GLM764CY",
  "PTL3W7VCUL6EL7CNWLYUQ7HETO5MP7V3EVVD4SB7BPJY3RYNZK3MSKBWGM",
  "KPJZ7JYPKL3JAYVTP3M5DMQAXTW5Y7XKN74HDJJWIPOHZGIYDBPJSVMVTU",
  "TJXU3MFEK4PJHQNNR5XBPRIMCYWU3FCS6GYPAMSUFAJ4YUKVNCL5NYV26M",
];

export const MANAGERS = [
  "PIJYCQY2ZNTO63OTP7PZ6MPNNAUHRVSDAM7EDGAPTUVJK4YKYVSFMKZBLM",
  "TIA2KQAOK6AZTROWSUBECAD2AJIYBZLOH27745T5D4SA6SMAJETQF3KJTI",
];

type Percent = {
  threeMatch: bigint;
  fourMatch: bigint;
  fiveMatch: bigint;
  managers: bigint;
};

export const PERCENTS: Percent = {
  threeMatch: BigInt(10),
  fourMatch: BigInt(25),
  fiveMatch: BigInt(55),
  managers: BigInt(10),
};
