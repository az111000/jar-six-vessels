// Shared helper for the API functions. Files starting with "_" are not
// exposed as endpoints by Vercel, so this file is never reachable directly.
//
// The Harvard API key is read from the HARVARD_API_KEY environment variable,
// which is set in the Vercel dashboard. It is never sent to the browser.

const BASE = "https://api.harvardartmuseums.org/object";

// The six objects in the exhibition (Harvard object IDs).
const EXHIBITION_IDS = [288118, 304069, 288856, 200906, 196997, 70504];

const FIELDS = "id,objectnumber,title,dated,culture,medium,dimensions,creditline,url,primaryimageurl,imagepermissionlevel,images";

// Fields for the "More information" panel.
const DETAIL_FIELDS = FIELDS + ",period,century,technique,classification,people,description,labeltext,provenance,commentary";

function fail(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// path is "" for a search, or "/<id>" for one object.
async function harvard(params, { path = "", fields = FIELDS } = {}) {
  const key = process.env.HARVARD_API_KEY;
  if (!key) {
    const err = new Error("HARVARD_API_KEY is not set");
    err.status = 503;
    throw err;
  }
  const url = new URL(BASE + path);
  url.search = new URLSearchParams({ ...params, fields, apikey: key });
  const r = await fetch(url);
  if (r.status === 404) throw fail(404, "Not found");
  if (!r.ok) {
    // Never forward Harvard's response body: it could echo the request URL, which contains the key.
    const err = new Error("Harvard API returned " + r.status);
    err.status = 502;
    throw err;
  }
  return r.json();
}

// Only pass along images the museum marks as free to display (permission level 0),
// and only the fields the page uses.
function clean(rec) {
  const img = rec.imagepermissionlevel === 0 && (rec.images?.[0]?.baseimageurl || rec.primaryimageurl);
  return {
    id: rec.id,
    objectnumber: rec.objectnumber,
    title: rec.title,
    dated: rec.dated,
    culture: rec.culture,
    medium: rec.medium,
    dimensions: rec.dimensions,
    creditline: rec.creditline,
    url: rec.url,
    image: img ? img + "?width=900" : null,
    alt: rec.images?.[0]?.alttext || null,
  };
}

// Everything clean() returns, plus the longer texts. Harvard's texts are plain
// text; the page inserts them with textContent, never as HTML.
function detail(rec) {
  const people = (rec.people || []).map((p) => [p.role, p.name].filter(Boolean).join(": "));
  return {
    ...clean(rec),
    period: rec.period,
    century: rec.century,
    technique: rec.technique,
    classification: rec.classification,
    people,
    description: rec.description,
    labeltext: rec.labeltext,
    commentary: rec.commentary,
    provenance: rec.provenance,
  };
}

function send(res, fn) {
  return fn().then(
    (body) => {
      // Cache on Vercel's servers for a day, so most visits never reach Harvard.
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
      res.status(200).json(body);
    },
    (err) => {
      if (err.status !== 400 && err.status !== 404) console.error(err.message);
      res.setHeader("Cache-Control", "no-store");
      const message =
        err.status === 400 ? err.message :
        err.status === 404 ? "No record found." :
        "Collection data is unavailable right now.";
      res.status(err.status || 500).json({ error: message });
    }
  );
}

module.exports = { harvard, clean, detail, send, fail, EXHIBITION_IDS, DETAIL_FIELDS };
