import { DEMO_TALENTS } from "@/lib/talent/demo-data";

it("keeps the requested talent portfolio structure", () => {
  const ouyang = DEMO_TALENTS.find((talent) => talent.id === "ouyang");
  const lin = DEMO_TALENTS.find((talent) => talent.id === "lin-yifan");
  const uploaded = DEMO_TALENTS.filter((talent) => talent.id !== "ouyang" && talent.id !== "lin-yifan");
  const uploadedWorks = uploaded.flatMap((talent) => talent.works);

  expect(DEMO_TALENTS).toHaveLength(12);
  expect(ouyang?.works).toHaveLength(1);
  expect(ouyang?.works[0].type).toBe("website");
  expect(ouyang?.works[0].title).toBe("AI视觉创作者 / AIGC内容运营");
  expect(ouyang?.avatarPath).toBe("case-site/cases/aigc-talent/avatars/ouyang-v2.webp");
  expect(lin?.works).toHaveLength(2);
  expect(lin?.works.every((work) => work.type === "website")).toBe(true);
  expect(lin?.works.map((work) => work.title)).toEqual([
    "AI视觉创作者 / 新媒体视觉设计 / AI创意策划",
    "AI电商视觉设计师 / 短视频创作者",
  ]);
  expect(lin?.avatarPath).toBe("case-site/cases/aigc-talent/avatars/lin-yifan.webp");
  expect(uploaded).toHaveLength(10);
  expect(uploaded.map((talent) => talent.name)).toEqual(["李娜", "王浩然", "张敏", "刘洋", "陈杰", "杨磊", "赵静怡", "黄伟", "吴婷婷", "周鹏飞"]);
  expect(uploaded.every((talent) => talent.avatarPath?.startsWith("case-site/cases/aigc-talent/avatars/") && talent.works.length === 1)).toBe(true);
  expect(uploadedWorks.every((work) => work.type === "video" && work.mediaPaths?.length === 1)).toBe(true);
  expect(new Set(uploadedWorks.map((work) => work.coverPath)).size).toBe(10);
  expect(DEMO_TALENTS.flatMap((talent) => talent.works).every((work) => work.coverPath?.startsWith("case-site/cases/aigc-talent/covers/"))).toBe(true);
});
