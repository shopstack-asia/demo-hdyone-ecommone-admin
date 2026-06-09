import type { PaginatedResult, PaginationParams, SortParams } from "@/types/query";

export function paginate<T>(
  items: T[],
  params: PaginationParams & SortParams,
  sortFn?: (a: T, b: T) => number
): PaginatedResult<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  let sorted = [...items];
  if (sortFn) {
    sorted.sort(sortFn);
    if (params.sortOrder === "desc") {
      sorted = sorted.reverse();
    }
  }

  const total = sorted.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = sorted.slice(start, start + pageSize);

  return { data, total, page, pageSize, totalPages };
}

export function searchFilter<T>(
  items: T[],
  search: string | undefined,
  fields: (keyof T)[]
): T[] {
  if (!search) return items;
  const term = search.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return typeof value === "string" && value.toLowerCase().includes(term);
    })
  );
}
