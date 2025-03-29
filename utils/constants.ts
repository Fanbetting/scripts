import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { network } from "./config";
import { WASI } from "wasi";
import { AlgoAmount } from "@algorandfoundation/algokit-utils/types/amount";

export const LOTTERY_APP_ID =
  network == "localnet" ? 1002 : network == "testnet" ? 736077070 : 0;

export const DISCOUNTER_APP_ID =
  network == "localnet" ? 1005 : network == "testnet" ? 736077084 : 0;

export const RANDONMESS_BEACON_APP_ID =
  network == "localnet" ? 1007 : network == "testnet" ? 600011887 : 1615566206;

export const REGISTRY_APP_ID =
  network == "localnet" ? 1008 : network == "testnet" ? 84366825 : 760937186;

export const legacyDiscount = 10;
export const regularDiscount = 5;

export const price = network == "localnet" ? 10 : 10000;

export const payoutDuration =
  network == "localnet" ? 1 : network == "testnet" ? 100 : 4000;

export const submissionsDuration =
  network == "localnet" ? 1 : network == "testnet" ? 100 : 4000;

export const revealDuration =
  network == "localnet" ? 1 : network == "testnet" ? 25 : 1000;

export const algorand =
  network == "localnet"
    ? AlgorandClient.defaultLocalNet()
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

const MANAGERS = [
  "PIJYCQY2ZNTO63OTP7PZ6MPNNAUHRVSDAM7EDGAPTUVJK4YKYVSFMKZBLM",
  "TIA2KQAOK6AZTROWSUBECAD2AJIYBZLOH27745T5D4SA6SMAJETQF3KJTI",
];

export const getManagers = async (ticketToken: bigint) => {
  if (network != "localnet") {
    return MANAGERS;
  }

  const managers = [algorand.account.random(), algorand.account.random()];
  const dispenser = await algorand.account.localNetDispenser();

  for (const manager of managers) {
    await algorand.account.ensureFunded(
      manager,
      dispenser,
      AlgoAmount.Algo(100),
    );

    await algorand.send.assetOptIn({
      sender: manager,
      assetId: ticketToken,
    });
  }

  return Array.from(managers.map((manager) => manager.addr.toString()));
};
