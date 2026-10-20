// GET /api/object/<id>: the full record for one object, for the
// "More information" panel. The id must be a whole number.
const { harvard, detail, send, fail, DETAIL_FIELDS } = require("../_harvard");

module.exports = (req, res) =>
  send(res, async () => {
    const id = String(req.query.id ?? "");
    if (!/^\d{1,9}$/.test(id)) throw fail(400, "Invalid object id.");
    const rec = await harvard({}, { path: "/" + id, fields: DETAIL_FIELDS });
    return detail(rec);
  });
