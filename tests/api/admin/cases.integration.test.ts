import { GET, POST } from "@/app/api/admin/cases/route";
import { GET as getOne, PATCH, DELETE } from "@/app/api/admin/cases/[id]/route";
import { PATCH as reorder } from "@/app/api/admin/cases/reorder/route";

const hasMysql = Boolean(process.env.MYSQL_URL);

describe.skipIf(!hasMysql)("admin case routes against a real database", () => {
  it("supports the full create/read/update/reorder/delete cycle end to end", async () => {
    const input = {
      title: "端到端测试案例",
      category: "宣传片",
      summary: "简介",
      coverPath: "case-site/cases/uploads/e2e-cover.png",
      episodes: [{ videoPath: "case-site/cases/uploads/e2e-video.mp4", orientation: "landscape" }],
    };
    const createResponse = await POST(new Request("http://localhost/api/admin/cases", { method: "POST", body: JSON.stringify(input) }));
    expect(createResponse.status).toBe(201);
    const { id } = (await createResponse.json()) as { id: string };

    try {
      const listResponse = await GET();
      const { cases } = (await listResponse.json()) as { cases: { id: string }[] };
      expect(cases.some((item) => item.id === id)).toBe(true);

      const getResponse = await getOne(new Request("http://localhost"), { params: Promise.resolve({ id }) });
      expect((await getResponse.json()).title).toBe("端到端测试案例");

      const patchResponse = await PATCH(
        new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ ...input, title: "端到端测试案例（更新）" }) }),
        { params: Promise.resolve({ id }) },
      );
      expect(patchResponse.status).toBe(200);
      const updated = await (await getOne(new Request("http://localhost"), { params: Promise.resolve({ id }) })).json();
      expect(updated.title).toBe("端到端测试案例（更新）");

      const reorderResponse = await reorder(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ orderedIds: [id] }) }));
      expect(reorderResponse.status).toBe(200);
    } finally {
      const deleteResponse = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id }) });
      expect(deleteResponse.status).toBe(200);
    }

    const finalGet = await getOne(new Request("http://localhost"), { params: Promise.resolve({ id }) });
    expect(finalGet.status).toBe(404);
  });
});
