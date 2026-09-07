import { ApiError, getApiBaseUrl } from "./client";

describe("ApiError", () => {
  it("is an instance of Error", () => {
    const err = new ApiError("something went wrong", 404, { detail: "x" });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it("preserves name, status, and body", () => {
    const err = new ApiError("not found", 404, { id: "abc" });
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(404);
    expect(err.body).toEqual({ id: "abc" });
    expect(err.message).toBe("not found");
  });

  it("works without body", () => {
    const err = new ApiError("timeout", 408);
    expect(err.body).toBeUndefined();
  });
});

describe("getApiBaseUrl", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("returns localhost:4000 when NEXT_PUBLIC_API_URL is not set", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getApiBaseUrl()).toBe("http://localhost:4000");
  });

  it("strips trailing slash from NEXT_PUBLIC_API_URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com/";
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });

  it("strips /api/v1 suffix from NEXT_PUBLIC_API_URL", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com/api/v1";
    expect(getApiBaseUrl()).toBe("https://api.example.com");
  });
});
