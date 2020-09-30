import { Dynatron } from "./Dynatron";

const db = (tbl: string) => {
  return new Dynatron({
    table: tbl,
    clientConfigs: {
      mode: "local",
    },
  });
};

db("").Tables.create("table");
