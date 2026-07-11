import { render } from "@testing-library/react";
import { InkClouds } from "@/components/home/ink-clouds";
import { InkBirds } from "@/components/home/ink-birds";

it("renders layered vector clouds without bitmap images", () => {
  const { container } = render(<InkClouds className="transition-cloud" />);
  expect(container.querySelector("svg.transition-cloud")).toBeInTheDocument();
  expect(container.querySelectorAll("path").length).toBeGreaterThanOrEqual(5);
  expect(container.querySelector("image")).not.toBeInTheDocument();
});

it("renders distinct flying bird silhouettes", () => {
  const { container } = render(<InkBirds />);
  expect(container.querySelectorAll(".sketch-bird")).toHaveLength(5);
  expect(container.querySelectorAll(".sketch-wing")).toHaveLength(10);
});
