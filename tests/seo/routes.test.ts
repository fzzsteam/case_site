import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { getCaseSlugs } from "@/content/cases";

it("includes every public route in sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);
  expect(urls).toEqual(expect.arrayContaining(["http://localhost:3000/", "http://localhost:3000/cases", "http://localhost:3000/about", "http://localhost:3000/contact"]));
  getCaseSlugs().forEach((slug) => expect(urls).toContain(`http://localhost:3000/cases/${slug}`));
});
it("keeps API routes out of search results", () => expect(robots().rules).toEqual(expect.objectContaining({ disallow: "/api/" })));
