# Jar: Six Vessels

A small online exhibition of six jars from the Harvard Art Museums collection, made between about 490 BCE and the 1700s in Greece, southern Italy, Korea and China.

## Objects

1. Neck Amphora (storage jar): Nereus (or Triton) with Scepter and Dolphin; Woman Running — c. 490 BCE
2. Hydria (water jar) with Siren Attachment — c. 430–400 BCE
3. Nestoris (two-handled jar) with Mythological Scenes — 340–320 BCE
4. Round-Bottomed, Globular Jar with Flaring Lip and Two Pointed, Openwork Handles, and with Cord-Marked Decor — 1st–2nd century CE
5. Jar with cobalt-blue splashes — first half of the 8th century
6. Large, Broad-Shouldered Jar with Decoration of Two Striding Dragons, Each Pursuing a Flaming Jewel — mid-18th century

Object data comes from Harvard Art Museums collection records.

## Live collection data

The page loads larger photos, credit lines and a "More jars in the collection" section from the [Harvard Art Museums API](https://github.com/harvardartmuseums/api-docs) through two Vercel functions:

- `/api/objects` returns the six exhibition objects.
- `/api/more` returns other jars from the collection whose images the museum allows to be displayed.

The API key is **not** in this repository. The functions read it from the `HARVARD_API_KEY` environment variable, set in the Vercel project settings. If the key is missing or the API is down, the page still shows the photos and text built into `index.html`.

For local testing, `vercel env pull` writes the key to `.env.local`, which `.gitignore` keeps out of git.
