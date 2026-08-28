import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { listCases } from "@/lib/cases/queries";
import { listTalentProfiles } from "@/lib/talent/queries";

vi.mock("@/lib/cases/queries", () => ({ listCases: vi.fn() }));
vi.mock("@/lib/talent/queries", () => ({ listTalentProfiles: vi.fn() }));

it("publishes the static pages and every case detail page in the sitemap", async () => {
  vi.mocked(listCases).mockResolvedValue([
    { id: "1", slug: "an-li-yi", title: "案例一", category: "宣传片", summary: "简介", detail: "详情", coverPath: "cover.png", createdAt: new Date("2026-01-01"), episodes: [] },
  ]);
  vi.mocked(listTalentProfiles).mockResolvedValue([
    { id: "ouyang", name: "欧阳", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "lin-yifan", name: "林一帆", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "gu-qinghe", name: "顾清禾", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "xu-zhixing", name: "许知行", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "shen-wanqing", name: "沈晚晴", role: "", intro: "", bio: "", skills: [], works: [] },
  ]);
  const urls = (await sitemap()).map((entry) => entry.url);
  expect(urls).toEqual([
    "http://localhost:3000/",
    "http://localhost:3000/cases",
    "http://localhost:3000/about",
    "http://localhost:3000/edu",
    "http://localhost:3000/edu/talent",
    "http://localhost:3000/cases/an-li-yi",
    "http://localhost:3000/edu/talent/ouyang",
    "http://localhost:3000/edu/talent/lin-yifan",
    "http://localhost:3000/edu/talent/gu-qinghe",
    "http://localhost:3000/edu/talent/xu-zhixing",
    "http://localhost:3000/edu/talent/shen-wanqing",
  ]);
});
it("keeps API routes and the admin backend out of search results", () => expect(robots().rules).toEqual(expect.objectContaining({ disallow: ["/api/", "/admin"] })));
