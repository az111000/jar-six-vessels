// GET /api/more: other jars from the collection that have displayable images.
// Takes no input from the visitor; the query is fixed here.
const { harvard, clean, send, EXHIBITION_IDS } = require("./_harvard");

module.exports = (req, res) =>
  send(res, async () => {
    const data = await harvard({
      title: "jar",
      classification: "Vessels",
      hasimage: 1,
      sort: "totalpageviews",
      sortorder: "desc",
      size: 30,
    });
    const records = (data.records || [])
      .filter((r) => !EXHIBITION_IDS.includes(r.id))
      .map(clean)
      .filter((r) => r.image)
      .slice(0, 12);
    return { records };
  });
