import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";

describe("Card components", () => {
  it("renders card hierarchy correctly", () => {
    render(
      <Card variant="elevated">
        <CardHeader>
          <CardTitle as="h2">Chitrakote Falls</CardTitle>
          <CardDescription>Known as the Niagara of India</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Located on the Indravati River in Bastar district.</p>
        </CardContent>
        <CardFooter>
          <button>View Details</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByRole("heading", { level: 2, name: "Chitrakote Falls" })).toBeInTheDocument();
    expect(screen.getByText("Known as the Niagara of India")).toBeInTheDocument();
    expect(screen.getByText("Located on the Indravati River in Bastar district.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Details" })).toBeInTheDocument();
  });

  it("applies interactive variant styles", () => {
    const { container } = render(<Card variant="interactive">Content</Card>);
    expect(container.firstChild).toHaveClass("cursor-pointer");
  });
});
