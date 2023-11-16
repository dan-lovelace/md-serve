import dotenv from "dotenv";
import express from "express";
import fs from "fs";

import { cacheRoute, cacheStore, getCacheKey } from "./lib/cache";
import { PAGES_BASE_PATH, getPageHTML, getPages } from "./lib/pages";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const pages = getPages();
const port = process.env.PORT || 8000;

/**
 * Translate files in the pages directory to HTML.
 */
pages.forEach((path) => {
  app.get(path.route, cacheRoute(), async (req, res) => {
    const pageHtml = getPageHTML(path.filename);

    cacheStore.set(getCacheKey(req), pageHtml);
    res.send(pageHtml);
  });
});

/**
 * Browser Javascript.
 */
app.get("/js*", cacheRoute(), async (req, res) => {
  const filename = "dist/js" + req.path.replace("/js", "");

  if (!fs.existsSync(filename)) {
    return res.status(404).send("Not Found");
  }

  const javascript = fs.readFileSync(filename, "utf-8");

  cacheStore.set(getCacheKey(req), javascript);
  res.type(".js");
  res.send(javascript);
});

/**
 * Configure static directory.
 */
app.use(express.static("public"));

/**
 * Catch-all route for something like a 404 page.
 */
app.get("*", cacheRoute(), (req, res) => {
  const notFoundPagePath = `${PAGES_BASE_PATH}/404.md`;
  const notFoundPageExists = fs.existsSync(notFoundPagePath);
  const notFoundPageHtml = notFoundPageExists
    ? getPageHTML(notFoundPagePath)
    : "Page Not Found";

  cacheStore.set(getCacheKey(req), notFoundPageHtml);
  res.send(notFoundPageHtml);
});

/**
 * Listen for connections.
 */
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
