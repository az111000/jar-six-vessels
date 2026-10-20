// GET /api/search?q=<words>&page=<n>&scope=jars|vessels
// Searches the collection for visitors. Because this takes visitor input, it
// only accepts plain words and passes them through Harvard's "keyword" search,
// never as raw query syntax, and results are always limited to vessels.
const { harvard, clean, send, fail } = require("./_harvard");

const PAGE_SIZE = 12;
const MAX_PAGE = 20;

module.exports = (req, res) =>
  send(res, async () => {
    const raw = String(req.query.q ?? "");
    if (raw.length > 80) throw fail(400, "Search is too long.");
    // Letters (any language), numbers, spaces, hyphens and apostrophes only.
    const q = raw.normalize("NFC").replace(/[^\p{L}\p{N}\s'-]/gu, " ").replace(/\s+/g, " ").trim().toLowerCase();

    const page = Number(req.query.page ?? 1);
    if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) throw fail(400, "Invalid page.");

    const scope = req.query.scope === "vessels" ? "vessels" : "jars";
    if (!q && scope === "vessels") throw fail(400, "Type something to search.");

    const params = { classification: "Vessels", hasimage: 1, size: PAGE_SIZE, page };
    if (q) params.keyword = q;
    if (scope === "jars") params.q = "title:jar";
    if (!q) Object.assign(params, { sort: "totalpageviews", sortorder: "desc" });

    const data = await harvard(params);
    const info = data.info || {};
    return {
      query: q,
      scope,
      page,
      total: info.totalrecords || 0,
      pages: Math.min(info.pages || 0, MAX_PAGE),
      records: (data.records || []).map(clean),
    };
  });
