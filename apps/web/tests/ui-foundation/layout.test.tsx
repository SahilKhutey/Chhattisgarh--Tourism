import { render, screen } from "@testing-library/react";
import { Container } from "@/ui/layout/Container";
import { Section } from "@/ui/layout/Section";
import { Stack } from "@/ui/layout/Stack";
import { Grid } from "@/ui/layout/Grid";
import { Page } from "@/ui/layout/Page";

describe("Layout Primitives", () => {
  describe("Container", () => {
    it("renders content with max width", () => {
      render(
        <Container>
          <p>Tourism content</p>
        </Container>,
      );

      const content = screen.getByText("Tourism content");
      expect(content).toBeInTheDocument();
      expect(content.parentElement).toHaveClass("max-w-[80rem]");
    });
  });

  describe("Section", () => {
    it("renders section wrapped in container by default", () => {
      const { container } = render(
        <Section>
          <h2>Bastar Corridor</h2>
        </Section>,
      );

      expect(screen.getByText("Bastar Corridor")).toBeInTheDocument();
      expect(container.querySelector("section")).toBeInTheDocument();
      expect(container.querySelector(".max-w-\\[80rem\\]")).toBeInTheDocument();
    });

    it("renders plain section when container is false", () => {
      const { container } = render(
        <Section container={false}>
          <h2>Full Bleed Hero</h2>
        </Section>,
      );

      expect(screen.getByText("Full Bleed Hero")).toBeInTheDocument();
      expect(container.querySelector(".max-w-\\[80rem\\]")).toBeNull();
    });
  });

  describe("Stack", () => {
    it("renders column stack by default", () => {
      const { container } = render(
        <Stack gap={6}>
          <span>Item 1</span>
          <span>Item 2</span>
        </Stack>,
      );

      const stackEl = container.firstChild as HTMLElement;
      expect(stackEl).toHaveClass("flex");
      expect(stackEl).toHaveClass("flex-col");
      expect(stackEl).toHaveClass("gap-6");
    });

    it("renders row stack when specified", () => {
      const { container } = render(
        <Stack direction="row" gap={2} align="center">
          <span>Icon</span>
          <span>Text</span>
        </Stack>,
      );

      const stackEl = container.firstChild as HTMLElement;
      expect(stackEl).toHaveClass("flex-row");
      expect(stackEl).toHaveClass("gap-2");
      expect(stackEl).toHaveClass("items-center");
    });
  });

  describe("Grid", () => {
    it("renders grid with responsive columns", () => {
      const { container } = render(
        <Grid cols={1} smCols={2} mdCols={3} lgCols={4} gap={4}>
          <div>Card 1</div>
          <div>Card 2</div>
        </Grid>,
      );

      const gridEl = container.firstChild as HTMLElement;
      expect(gridEl).toHaveClass("grid");
      expect(gridEl).toHaveClass("grid-cols-1");
      expect(gridEl).toHaveClass("sm:grid-cols-2");
      expect(gridEl).toHaveClass("md:grid-cols-3");
      expect(gridEl).toHaveClass("lg:grid-cols-4");
    });
  });

  describe("Page", () => {
    it("renders page with main landmark and skip-to id", () => {
      render(
        <Page>
          <h1>Discover Chhattisgarh</h1>
        </Page>,
      );

      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("id", "main-content");
      expect(screen.getByText("Discover Chhattisgarh")).toBeInTheDocument();
    });
  });
});
