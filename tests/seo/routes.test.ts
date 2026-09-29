import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { listCases } from "@/lib/cases/queries";

vi.mock("@/lib/cases/queries", () => ({ listCases: vi.fn() }));

it("publishes only the main-site pages and case details in the sitemap", async () => {
  vi.mocked(listCases).mockResolvedValue([
    { id: "1", slug: "an-li-yi", title: "案例一", category: "宣传片", summary: "简介", detail: "详情", coverPath: "cover.png", createdAt: new Date("2026-01-01"), episodes: [] },
  ]);
  const urls = (await sitemap()).map((entry) => entry.url);
  expect(urls).toEqual([
    "http://localhost:3000/",
    "http://localhost:3000/cases",
    "http://localhost:3000/about",
    "http://localhost:3000/cases/an-li-yi",
  ]);
});
it("keeps API routes and the admin backend out of search results", () => {
  expect(robots().rules).toEqual(expect.arrayContaining([
    expect.objectContaining({ userAgent: "*", allow: ["/", "/api/media/image/"], disallow: ["/api/", "/admin"] }),
    expect.objectContaining({ userAgent: "OAI-SearchBot", allow: ["/", "/api/media/image/"] }),
  ]));
});
