import {
  writeDocumentPartsToStream,
  validateApplicationJson,
  generate,
} from "@algorandfoundation/algokit-client-generator";
import fs from "fs";

import lotteryArc32Json from "../dist/FanbetLottery.arc32.json";
import playerArc32Json from "../dist/FanbetPlayer.arc32.json";
import discounterArc32Json from "../dist/FanbetDiscounter.arc32.json";

async function main() {
  const lotteryJsonFromObject = validateApplicationJson(
    lotteryArc32Json,
    "../dist/FanbetLottery.arc32.json",
  );

  const playerJsonFromObject = validateApplicationJson(
    playerArc32Json,
    "../dist/FanbetPlayer.arc32.json",
  );

  const discounterJsonFromObject = validateApplicationJson(
    discounterArc32Json,
    "../dist/FanbetDiscounter.arc32.json",
  );

  const lotteryfileStream = fs.createWriteStream("contracts/FanbetLottery.ts", {
    flags: "w",
  });

  writeDocumentPartsToStream(
    generate(lotteryJsonFromObject),
    lotteryfileStream,
  );

  const playerfileStream = fs.createWriteStream("contracts/FanbetPlayer.ts", {
    flags: "w",
  });

  writeDocumentPartsToStream(generate(playerJsonFromObject), playerfileStream);

  const discounterfileStream = fs.createWriteStream(
    "contracts/FanbetDiscounter.ts",
    {
      flags: "w",
    },
  );

  writeDocumentPartsToStream(
    generate(discounterJsonFromObject),
    discounterfileStream,
  );
}

main()
  .then(() => {
    console.log("Process completed");
  })
  .catch((e) => {
    console.error(e);
  });
