import fs from "fs";
import showdown from "showdown";

const converter = new showdown.Converter();
const foundPaths: {
  filename: string;
  route: string;
}[] = [];

export const PAGES_BASE_PATH = "pages";

/**
 * Crawls the `pages` directory to construct a list of objects that are used to
 * build Express routes.
 * @remarks Any files named `index.md` are used for its parent directory's base
 * path. For example, a file named `pages/blog/index.md` is served at the
 * location `/blog`.
 * @remarks All other files use their name (without extension) as their
 * pathname when served. For instance, a file named `pages/blog/ireland.md`
 * is accessible at `/blog/ireland`.
 * @param current The current directory to crawl.
 * @returns A list of objects with `filename` and `route` for each discovered
 * page.
 */
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

      foundPaths.push({
        filename,
        route,
      });
    }
  });

  return foundPaths;
}

/**
 * Takes a given file and returns its HTML version.
 * @param filename The location of the file to parse.
 * @param withLayout Whether to inject the contents into `public/index.html`.
 * This could be useful if you need to only get a file's HTML without the full
 * layout.
 * @returns The file's contents converted to HTML format.
 */
export function getPageHTML(filename: string, withLayout: boolean = true) {
  const contents = fs.readFileSync(filename, "utf-8");
  const pageHtml = converter.makeHtml(contents);

  if (!withLayout) {
    return pageHtml;
  }

  const indexHtml = fs.readFileSync("public/index.html", "utf-8");
  const appHtml = indexHtml.replace("%APP%", pageHtml);

  return appHtml;
}
