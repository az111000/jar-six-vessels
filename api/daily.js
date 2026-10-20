// GET /api/daily?d=YYYY-MM-DD: the five mystery jars for "Date the Jar".
// Everyone gets the same five jars on the same day: the date seeds Harvard's
// random sort, and because the date is in the URL, Vercel caches each day's
// set, so Harvard is called about once a day.
const { harvard, send, fail, EXHIBITION_IDS } = require("./_harvard");

const ROUNDS = 5;
const MIN_YEAR = -3000;
const MAX_YEAR = 2000;

module.exports = (req, res) =>
  send(res, async () => {
    const d = String(req.query.d ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) throw fail(400, "Invalid date.");
    // Accept the visitor's local date only if it is within a day of the server's,
    // so nobody can fetch (and cache) far-future puzzles.
    const diff = Math.abs(Date.parse(d + "T00:00:00Z") - Date.now()) / 86400000;
    if (!(diff < 2)) throw fail(400, "Invalid date.");

    const data = await harvard(
      { title: "jar", classification: "Vessels", hasimage: 1, sort: "random:" + d.replaceAll("-", ""), size: 40 },
      { fields: "id,title,dated,datebegin,dateend,culture,url,primaryimageurl,imagepermissionlevel,images" }
    );

    const jars = [];
    for (const r of data.records || []) {
      const img = r.imagepermissionlevel === 0 && (r.images?.[0]?.baseimageurl || r.primaryimageurl);
      const begin = r.datebegin, end = r.dateend;
      if (!img || EXHIBITION_IDS.includes(r.id)) continue;
      if (!Number.isInteger(begin) || !Number.isInteger(end) || end < begin) continue;
      if (begin === 0 && end === 0) continue; // Harvard uses 0/0 for "no date"
      if (begin < MIN_YEAR || end > MAX_YEAR) continue;
      jars.push({ id: r.id, title: r.title, dated: r.dated, begin, end, culture: r.culture, url: r.url, image: img + "?width=700" });
      if (jars.length === ROUNDS) break;
    }
    if (jars.length < ROUNDS) throw fail(502, "Not enough jars today");
    return { date: d, min: MIN_YEAR, max: MAX_YEAR, jars };
  });
