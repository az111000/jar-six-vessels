// Shared helper for the API functions. Files starting with "_" are not
// exposed as endpoints by Vercel, so this file is never reachable directly.
//
// The Harvard API key is read from the HARVARD_API_KEY environment variable,
// which is set in the Vercel dashboard. It is never sent to the browser.

const BASE = "https://api.harvardartmuseums.org/object";

// The six objects in the exhibition (Harvard object IDs).
const EXHIBITION_IDS = [288118, 304069, 288856, 200906, 196997, 70504];

const FIELDS = "id,objectnumber,title,dated,culture,medium,dimensions,creditline,url,primaryimageurl,imagepermissionlevel,images";

async function harvard(params) {
  const key = process.env.HARVARD_API_KEY;
  if (!key) {
    const err = new Error("HARVARD_API_KEY is not set");
    err.status = 503;
    throw err;
  }
  const url = new URL(BASE);
  url.search = new URLSearchParams({ ...params, fields: FIELDS, apikey: key });
  const r = await fetch(url);
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

function send(res, fn) {
  return fn().then(
    (body) => {
      // Cache on Vercel's servers for a day, so most visits never reach Harvard.
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");
      res.status(200).json(body);
    },
    (err) => {
      console.error(err.message);
      res.setHeader("Cache-Control", "no-store");
      res.status(err.status || 500).json({ error: "Collection data is unavailable right now." });
    }
  );
}

module.exports = { harvard, clean, send, EXHIBITION_IDS };
