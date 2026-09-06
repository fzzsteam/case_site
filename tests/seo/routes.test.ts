import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { listCases } from "@/lib/cases/queries";
import { listTalentProfiles } from "@/lib/talent/queries";

vi.mock("@/lib/cases/queries", () => ({ listCases: vi.fn() }));
vi.mock("@/lib/talent/queries", () => ({ listTalentProfiles: vi.fn() }));

it("publishes the static pages and every case and talent detail page in the sitemap", async () => {
  vi.mocked(listCases).mockResolvedValue([
    { id: "1", slug: "an-li-yi", title: "案例一", category: "宣传片", summary: "简介", detail: "详情", coverPath: "cover.png", createdAt: new Date("2026-01-01"), episodes: [] },
  ]);
  vi.mocked(listTalentProfiles).mockResolvedValue([
    { id: "ouyang", name: "欧阳", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "lin-yifan", name: "林一帆", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "li-na", name: "李娜", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "wang-hao", name: "王浩", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "zhang-min", name: "张敏", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "liu-yang", name: "刘洋", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "chen-jie", name: "陈杰", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "yang-lei", name: "杨磊", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "zhao-jing", name: "赵静", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "huang-wei", name: "黄伟", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "wu-ting", name: "吴婷", role: "", intro: "", bio: "", skills: [], works: [] },
    { id: "zhou-peng", name: "周鹏", role: "", intro: "", bio: "", skills: [], works: [] },
  ]);
  const urls = (await sitemap()).map((entry) => entry.url);
  expect(urls).toEqual([
    "http://localhost:3000/",
    "http://localhost:3000/cases",
    "http://localhost:3000/about",
    "http://localhost:3000/edu",
    "http://localhost:3000/edu/talent",
    "http://localhost:3000/edu/visual-lab",
    "http://localhost:3000/edu/visual-lab/talent",
    "http://localhost:3000/cases/an-li-yi",
    "http://localhost:3000/edu/talent/ouyang",
    "http://localhost:3000/edu/visual-lab/talent/ouyang",
    "http://localhost:3000/edu/talent/lin-yifan",
    "http://localhost:3000/edu/visual-lab/talent/lin-yifan",
    "http://localhost:3000/edu/talent/li-na",
    "http://localhost:3000/edu/visual-lab/talent/li-na",
    "http://localhost:3000/edu/talent/wang-hao",
    "http://localhost:3000/edu/visual-lab/talent/wang-hao",
    "http://localhost:3000/edu/talent/zhang-min",
    "http://localhost:3000/edu/visual-lab/talent/zhang-min",
    "http://localhost:3000/edu/talent/liu-yang",
    "http://localhost:3000/edu/visual-lab/talent/liu-yang",
    "http://localhost:3000/edu/talent/chen-jie",
    "http://localhost:3000/edu/visual-lab/talent/chen-jie",
    "http://localhost:3000/edu/talent/yang-lei",
    "http://localhost:3000/edu/visual-lab/talent/yang-lei",
    "http://localhost:3000/edu/talent/zhao-jing",
    "http://localhost:3000/edu/visual-lab/talent/zhao-jing",
    "http://localhost:3000/edu/talent/huang-wei",
    "http://localhost:3000/edu/visual-lab/talent/huang-wei",
    "http://localhost:3000/edu/talent/wu-ting",
    "http://localhost:3000/edu/visual-lab/talent/wu-ting",
    "http://localhost:3000/edu/talent/zhou-peng",
    "http://localhost:3000/edu/visual-lab/talent/zhou-peng",
  ]);
});
it("keeps API routes and the admin backend out of search results", () => {
  expect(robots().rules).toEqual(expect.arrayContaining([
    expect.objectContaining({ userAgent: "*", allow: ["/", "/api/media/image/"], disallow: ["/api/", "/admin"] }),
    expect.objectContaining({ userAgent: "OAI-SearchBot", allow: ["/", "/api/media/image/"] }),
  ]));
});
