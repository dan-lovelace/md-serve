import dotenv from "dotenv";
import express from "express";
import fs from "fs";

import { cacheRoute, cacheStore, getCacheKey } from "./lib/middleware";
import { PAGES_BASE_PATH, getPageHTML, getPages } from "./lib/utils";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const port = process.env.PORT;
const pages = getPages();

pages.forEach((path) => {
  app.get(path.route, cacheRoute(), async (req, res) => {
    const pageHtml = getPageHTML(path.filename);
    const indexHtml = fs.readFileSync("public/index.html", "utf-8");
    const appHtml = indexHtml.replace("%APP%", pageHtml);

    cacheStore.set(getCacheKey(req), appHtml);
    res.send(appHtml);
  });
});

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

app.use(express.static("public"));

app.get("*", cacheRoute(), (_, res) => {
  const notFoundPagePath = `${PAGES_BASE_PATH}/404.md`;
  const notFoundPageExists = fs.existsSync(notFoundPagePath);

  res.send(
    notFoundPageExists
      ? fs.readFileSync(notFoundPagePath, "utf-8")
      : "Page Not Found"
  );
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
