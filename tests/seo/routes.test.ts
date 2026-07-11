import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

it("publishes the single-page experience in sitemap", () => {
  const urls = sitemap().map((entry) => entry.url);
  expect(urls).toEqual(["http://localhost:3000/"]);
});
it("keeps API routes out of search results", () => expect(robots().rules).toEqual(expect.objectContaining({ disallow: "/api/" })));
