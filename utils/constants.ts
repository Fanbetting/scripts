import { network } from "./config";

export const ALGO_DECIMALS = 1e6;
export const FBET_DECIMALS = 1e4;

export const FBET_ASSET_ID = 1002;
export const LOTTERY_APP_ID = 1026;
export const LOTTERY_APP_ADDRESS =
  "3CMZPQV3HKKYW3TNBZI4KACBMQDQUNOYSXDHWHFON7IETEEG765NIQQ33M";

export const RANDONMESS_BEACON_APP_ID = network == "testnet" ? 600011887 : 1027;
