import { DEMO_TALENTS } from "@/lib/talent/demo-data";

it("keeps the requested talent portfolio structure", () => {
  const ouyang = DEMO_TALENTS.find((talent) => talent.id === "ouyang");
  const lin = DEMO_TALENTS.find((talent) => talent.id === "lin-yifan");
  const uploaded = DEMO_TALENTS.filter((talent) => talent.id !== "ouyang" && talent.id !== "lin-yifan");

  expect(ouyang?.works).toHaveLength(1);
  expect(ouyang?.works[0].type).toBe("website");
  expect(ouyang?.avatarPath).toBe("case-site/cases/aigc-talent/avatars/ouyang-v2.webp");
  expect(lin?.works).toHaveLength(2);
  expect(lin?.works.every((work) => work.type === "website")).toBe(true);
  expect(lin?.avatarPath).toBe("case-site/cases/aigc-talent/avatars/lin-yifan.webp");
  expect(uploaded).toHaveLength(3);
  expect(uploaded.every((talent) => talent.avatarPath?.startsWith("case-site/cases/aigc-talent/avatars/") && talent.works.length === 1)).toBe(true);
  expect(uploaded.map((talent) => talent.works[0].mediaPaths?.length)).toEqual([3, 3, 4]);
  expect(DEMO_TALENTS.flatMap((talent) => talent.works).every((work) => work.coverPath?.startsWith("case-site/cases/aigc-talent/covers/"))).toBe(true);
});
