import { caseStudies } from "@/content/cases";

it("contains all eight project placeholders", () => {
  expect(caseStudies).toHaveLength(8);
  expect(caseStudies.map((item) => item.title)).toEqual(expect.arrayContaining(["疯狂的荔枝", "苏东坡的荔枝狂想", "阳仔 IP 动画视频"]));
});

it("supports project episodes without media paths", () => {
  const commerce = caseStudies.find((item) => item.title === "苏东坡带货视频");
  expect(commerce?.episodes.map((episode) => episode.title)).toEqual(["横屏版", "竖屏版"]);
  expect(commerce?.episodes.every((episode) => episode.videoPath === null)).toBe(true);
});

it("uses only the approved case categories", () => {
  expect(new Set(caseStudies.map((item) => item.category))).toEqual(new Set(["宣传片", "广告片", "短剧"]));
  expect(caseStudies.find((item) => item.title === "疯狂的荔枝")?.category).toBe("短剧");
  expect(caseStudies.find((item) => item.title === "苏东坡的荔枝狂想")?.category).toBe("宣传片");
});
