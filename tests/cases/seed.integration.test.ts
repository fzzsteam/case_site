import { getDb } from "@/lib/db/client";
import { cases } from "@/lib/db/schema";
import { listCases } from "@/lib/cases/queries";
import { seedIfEmpty } from "@/lib/cases/seed";
import { seedCases } from "@/lib/cases/seed-data";

const hasMysql = Boolean(process.env.MYSQL_URL);

describe.skipIf(!hasMysql)("startup seed", () => {
  afterEach(async () => {
    await getDb().delete(cases);
  });

  it("seeds the 11 built-in cases into an empty table in order", async () => {
    await seedIfEmpty();
    const seeded = await listCases();
    expect(seeded).toHaveLength(seedCases.length);
    expect(seeded.map((item) => item.title)).toEqual(seedCases.map((item) => item.title));
    expect(seeded[2].episodes.map((episode) => episode.orientation)).toEqual(["portrait", "landscape"]);
  });

  it("does not seed again when the table already has data", async () => {
    await seedIfEmpty();
    await seedIfEmpty();
    const seeded = await listCases();
    expect(seeded).toHaveLength(seedCases.length);
  });
});
