import {
  writeDocumentPartsToStream,
  validateApplicationJson,
  generate,
} from "@algorandfoundation/algokit-client-generator";
import fs from "fs";

import lotteryArc32Json from "../dist/FanbetLottery.arc32.json";

async function main() {
  const appJsonFromObject = validateApplicationJson(
    lotteryArc32Json,
    "../dist/FanbetLottery.arc32.json",
  );

  const fileStream = fs.createWriteStream("contracts/FanbetLottery.ts", {
    flags: "w",
  });

  writeDocumentPartsToStream(generate(appJsonFromObject), fileStream);
}

main()
  .then(() => {
    console.log("Process completed");
  })
  .catch((e) => {
    console.error(e);
  });
