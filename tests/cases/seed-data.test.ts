import { seedCases } from "@/lib/cases/seed-data";

it("contains all eleven uploaded projects", () => {
  expect(seedCases).toHaveLength(11);
  expect(seedCases.map((item) => item.title)).toEqual(expect.arrayContaining(["漢·生生不息", "疯狂的荔枝", "苏东坡的荔枝狂想", "阳仔学英语", "阳光小镇"]));
});

it("keeps the requested editorial order", () => {
  expect(seedCases.map((item) => item.title)).toEqual([
    "漢·生生不息",
    "苏东坡的荔枝狂想",
    "苏东坡带货增城荔枝",
    "苏东坡与六榕寺",
    "疯狂的荔枝",
    "南得遇见你",
    "家无定址，心有归期",
    "小小心事也值得被听见",
    "阳仔，你听见了吗",
    "阳仔学英语",
    "阳光小镇",
  ]);
});

it("maps project episodes to private OSS object keys", () => {
  const commerce = seedCases.find((item) => item.title === "苏东坡带货增城荔枝");
  expect(commerce?.episodes[0].videoPath).toBe("case-site/cases/苏东坡带货视频/case1.mp4");
  expect(commerce?.episodes.map((episode) => episode.orientation)).toEqual(["portrait", "landscape"]);
  expect(seedCases.find((item) => item.title === "疯狂的荔枝")?.episodes.every((episode) => episode.orientation === "portrait")).toBe(true);
  expect(seedCases.every((item) => item.coverPath?.endsWith("/cover.png"))).toBe(true);
});

it("uses only the approved case categories", () => {
  expect(new Set(seedCases.map((item) => item.category))).toEqual(new Set(["宣传片", "广告片", "短剧", "IP创造"]));
  expect(seedCases.find((item) => item.title === "疯狂的荔枝")?.category).toBe("短剧");
  expect(seedCases.find((item) => item.title === "苏东坡的荔枝狂想")?.category).toBe("宣传片");
  expect(seedCases.find((item) => item.title === "苏东坡与六榕寺")?.summary).toBe("广州六榕寺文旅宣传片。");
  expect(seedCases.find((item) => item.title === "苏东坡带货增城荔枝")?.summary).toBe("增城荔枝创意广告。");
  expect(seedCases.find((item) => item.title === "阳仔学英语")?.category).toBe("IP创造");
  expect(seedCases.find((item) => item.title === "阳光小镇")?.category).toBe("IP创造");
});
