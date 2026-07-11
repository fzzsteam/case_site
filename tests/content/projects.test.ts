import { caseStudies, caseVideos } from "@/content/cases";

it("contains all ten uploaded projects", () => {
  expect(caseStudies).toHaveLength(10);
  expect(caseStudies.map((item) => item.title)).toEqual(expect.arrayContaining(["疯狂的荔枝", "苏东坡的荔枝狂想", "阳仔学英语", "阳光小镇"]));
});

it("provides one continuous previous and next video sequence", () => {
  expect(caseVideos).toHaveLength(17);
  expect(caseVideos[0]).toEqual(expect.objectContaining({ projectTitle: "南得遇见你", orientation: "portrait" }));
  expect(caseVideos.at(-1)).toEqual(expect.objectContaining({ projectTitle: "阳光小镇", orientation: "landscape" }));
});

it("maps project episodes to private OSS object keys", () => {
  const commerce = caseStudies.find((item) => item.title === "苏东坡带货视频");
  expect(commerce?.episodes.map((episode) => episode.title)).toEqual(["竖屏版", "横屏版"]);
  expect(commerce?.episodes[0].videoPath).toBe("case-site/cases/苏东坡带货视频/case1.mp4");
  expect(commerce?.episodes.map((episode) => episode.orientation)).toEqual(["portrait", "landscape"]);
  expect(caseStudies.find((item) => item.title === "疯狂的荔枝")?.episodes.every((episode) => episode.orientation === "portrait")).toBe(true);
  expect(caseStudies.every((item) => item.coverPath?.endsWith("/cover.png"))).toBe(true);
});

it("uses only the approved case categories", () => {
  expect(new Set(caseStudies.map((item) => item.category))).toEqual(new Set(["宣传片", "广告片", "短剧"]));
  expect(caseStudies.find((item) => item.title === "疯狂的荔枝")?.category).toBe("短剧");
  expect(caseStudies.find((item) => item.title === "苏东坡的荔枝狂想")?.category).toBe("宣传片");
});
