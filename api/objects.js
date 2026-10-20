// GET /api/objects: live collection data for the six jars in the exhibition.
// Takes no input from the visitor, so it can only ever fetch these six records.
const { harvard, clean, send, EXHIBITION_IDS } = require("./_harvard");

module.exports = (req, res) =>
  send(res, async () => {
    const data = await harvard({ id: EXHIBITION_IDS.join("|"), size: EXHIBITION_IDS.length });
    return { records: (data.records || []).map(clean) };
  });
