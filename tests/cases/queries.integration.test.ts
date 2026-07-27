import { createCase, deleteCase, getCaseById, listCases, reorderCases, updateCase, videoPathExists } from "@/lib/cases/queries";

const hasMysql = Boolean(process.env.MYSQL_URL);

describe.skipIf(!hasMysql)("case queries against a real MySQL database", () => {
  it("supports create, update, reorder, delete and video path lookup", async () => {
    const id1 = await createCase({
      title: "集成测试案例一",
      category: "宣传片",
      summary: "第一个测试案例",
      detail: "第一个测试案例的详情正文",
      coverPath: "case-site/cases/uploads/test-cover-1.png",
      episodes: [{ videoPath: "case-site/cases/uploads/test-video-1.mp4", orientation: "landscape", durationSeconds: 92 }],
    });
    const id2 = await createCase({
      title: "集成测试案例二",
      category: "短剧",
      summary: "第二个测试案例",
      detail: "第二个测试案例的详情正文",
      coverPath: "case-site/cases/uploads/test-cover-2.png",
      episodes: [
        { videoPath: "case-site/cases/uploads/test-video-2a.mp4", orientation: "portrait", durationSeconds: null },
        { videoPath: "case-site/cases/uploads/test-video-2b.mp4", orientation: "landscape", durationSeconds: null },
      ],
    });

    try {
      const created = await listCases();
      expect(created.map((item) => item.title)).toEqual(expect.arrayContaining(["集成测试案例一", "集成测试案例二"]));
      const secondCase = created.find((item) => item.id === id2);
      expect(secondCase?.episodes).toHaveLength(2);
      expect(secondCase?.episodes.map((episode) => episode.orientation)).toEqual(["portrait", "landscape"]);

      await updateCase(id1, {
        title: "集成测试案例一（已更新）",
        category: "广告片",
        summary: "更新后的简介",
        detail: "更新后的详情正文",
        coverPath: "case-site/cases/uploads/test-cover-1.png",
        episodes: [{ videoPath: "case-site/cases/uploads/test-video-1-new.mp4", orientation: "portrait", durationSeconds: null }],
      });
      const updated = await getCaseById(id1);
      expect(updated?.title).toBe("集成测试案例一（已更新）");
      expect(updated?.category).toBe("广告片");
      expect(updated?.episodes).toHaveLength(1);
      expect(updated?.episodes[0].videoPath).toBe("case-site/cases/uploads/test-video-1-new.mp4");

      expect(await videoPathExists("case-site/cases/uploads/test-video-2a.mp4")).toBe(true);
      expect(await videoPathExists("does/not/exist.mp4")).toBe(false);

      await reorderCases([id2, id1]);
      const reordered = (await listCases()).filter((item) => item.id === id1 || item.id === id2);
      expect(reordered.map((item) => item.id)).toEqual([id2, id1]);
    } finally {
      await deleteCase(id1);
      await deleteCase(id2);
    }

    const afterDelete = await listCases();
    expect(afterDelete.some((item) => item.id === id1 || item.id === id2)).toBe(false);
  });
});
