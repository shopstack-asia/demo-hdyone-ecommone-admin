import { describe, it, expect } from "vitest";
import { paginate, searchFilter } from "@/repositories/utils/pagination";

describe("paginate", () => {
  it("returns correct page of items", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    const result = paginate(items, { page: 2, pageSize: 10 });
    expect(result.data).toHaveLength(10);
    expect(result.data[0].id).toBe(10);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
  });
});

describe("searchFilter", () => {
  it("filters items by search term", () => {
    const items = [
      { name: "Brand Alpha", code: "BR001" },
      { name: "Brand Beta", code: "BR002" },
    ];
    const result = searchFilter(items, "alpha", ["name", "code"]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Brand Alpha");
  });

  it("returns all items when search is empty", () => {
    const items = [{ name: "Test", code: "T001" }];
    expect(searchFilter(items, undefined, ["name"])).toHaveLength(1);
  });
});
