import express from "express";
import fs from "fs";
import showdown from "showdown";

const app = express();
const port = 8000;
const pages = fs.readdirSync("src/pages");
const converter = new showdown.Converter();

pages.forEach((page) => {
  let path = page.replace(".md", "");

  if (path === "index") {
    path = "/";
  }

  app.get(path, (req, res) => {
    const contents = fs.readFileSync(`./src/pages/${page}`, "utf-8");
    const html = converter.makeHtml(contents);

    res.send(html);
  });
});

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
