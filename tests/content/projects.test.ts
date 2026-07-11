import { caseStudies, caseVideos } from "@/content/cases";

it("contains all ten uploaded projects", () => {
  expect(caseStudies).toHaveLength(10);
  expect(caseStudies.map((item) => item.title)).toEqual(expect.arrayContaining(["疯狂的荔枝", "苏东坡的荔枝狂想", "阳仔学英语", "阳光小镇"]));
});

it("provides one continuous previous and next video sequence", () => {
  expect(caseVideos).toHaveLength(17);
  expect(caseVideos[0]).toEqual(expect.objectContaining({ projectTitle: "苏东坡的荔枝狂想", orientation: "landscape" }));
  expect(caseVideos.at(-1)).toEqual(expect.objectContaining({ projectTitle: "阳光小镇", orientation: "landscape" }));
});

it("groups cases in the requested editorial order", () => {
  expect(caseStudies.map((item) => item.title)).toEqual([
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
  const commerce = caseStudies.find((item) => item.title === "苏东坡带货增城荔枝");
  expect(commerce?.episodes.map((episode) => episode.title)).toEqual(["竖屏版", "横屏版"]);
  expect(commerce?.episodes[0].videoPath).toBe("case-site/cases/苏东坡带货视频/case1.mp4");
  expect(commerce?.episodes.map((episode) => episode.orientation)).toEqual(["portrait", "landscape"]);
  expect(caseStudies.find((item) => item.title === "疯狂的荔枝")?.episodes.every((episode) => episode.orientation === "portrait")).toBe(true);
  expect(caseStudies.every((item) => item.coverPath?.endsWith("/cover.png"))).toBe(true);
});

it("uses only the approved case categories", () => {
  expect(new Set(caseStudies.map((item) => item.category))).toEqual(new Set(["宣传片", "广告片", "短剧", "IP创造"]));
  expect(caseStudies.find((item) => item.title === "疯狂的荔枝")?.category).toBe("短剧");
  expect(caseStudies.find((item) => item.title === "苏东坡的荔枝狂想")?.category).toBe("宣传片");
  expect(caseStudies.find((item) => item.title === "苏东坡与六榕寺")?.summary).toBe("广州六榕寺文旅宣传片。");
  expect(caseStudies.find((item) => item.title === "苏东坡带货增城荔枝")?.summary).toBe("增城荔枝创意广告。");
  expect(caseStudies.find((item) => item.title === "苏东坡的荔枝狂想")?.summary).toBe("增城文旅宣传片");
  expect(caseStudies.find((item) => item.title === "疯狂的荔枝")?.summary).toBe("岭南荔枝商路传奇复仇短剧。");
  expect(caseStudies.find((item) => item.title === "阳仔学英语")?.category).toBe("IP创造");
  expect(caseStudies.find((item) => item.title === "阳仔学英语")?.summary).toBe("创造衍生IP系列儿童学习短剧。");
  expect(caseStudies.find((item) => item.title === "阳光小镇")?.category).toBe("IP创造");
  expect(caseStudies.find((item) => item.title === "阳光小镇")?.summary).toBe("创造衍生IP系列儿童短剧。");
  expect(caseStudies.find((item) => item.title === "南得遇见你")?.summary).toBe("深圳市南山区城市文旅宣传片。");
  expect(caseStudies.find((item) => item.title === "家无定址，心有归期")?.summary).toBe("阳仔 AI 陪伴机新年宣传片。");
  expect(caseStudies.find((item) => item.title === "小小心事也值得被听见")?.summary).toBe("阳仔 AI 陪伴机新年 TVC。");
  expect(caseStudies.find((item) => item.title === "阳仔，你听见了吗")?.summary).toBe("阳仔 AI 陪伴机新年祝福视频。");
});
