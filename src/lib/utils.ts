import fs from "fs";
import showdown from "showdown";

const converter = new showdown.Converter();
const paths: {
  filename: string;
  route: string;
}[] = [];

export const PAGES_BASE_PATH = "src/pages";

export function getPages(current: string = PAGES_BASE_PATH) {
  const items = fs.readdirSync(current, { withFileTypes: true });

  items.forEach((item) => {
    const filename = `${item.path}/${item.name}`;

    if (item.isDirectory()) {
      getPages(filename);
    } else {
      const relativePath = item.path.replace(PAGES_BASE_PATH, "");
      const route =
        item.name === "index.md"
          ? `${relativePath}${relativePath.length > 0 ? "" : "/"}`
          : `${relativePath}/${item.name.replace(".md", "")}`;

      paths.push({
        filename,
        route,
      });
    }
  });

  return paths;
}

export function getPageHTML(filename: string) {
  const contents = fs.readFileSync(filename, "utf-8");

  return converter.makeHtml(contents);
}
