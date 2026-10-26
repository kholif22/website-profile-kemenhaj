// Menormalkan query string page/limit agar nilai tidak valid (?page=abc,
// limit negatif, atau limit sangat besar) tidak menghasilkan SQL yang error
// atau membebani server.
export function getPagination(query = {}, { defaultLimit = 10, maxLimit = 100 } = {}) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);

  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, maxLimit) : defaultLimit;

  return { page: safePage, limit: safeLimit, offset: (safePage - 1) * safeLimit };
}
