import { parse, Node, type HTMLElement } from "node-html-parser";

const kernelUrl = "https://www.kernel.org/";
const customDomain = "kernel.manjaro.download";
const outDir = "dist";

interface Release {
  category: string;
  version: string;
  date: string;
  packageName: string;
}

const extractData = (dom: HTMLElement): Release[] => {
  const result = dom
    ?.querySelector(
      "html body#index.home aside#featured.body article table#releases"
    )
    ?.childNodes.filter((node) => {
      return (
        node.nodeType === 1 &&
        (node as Node & { rawTagName: string }).rawTagName === "tr"
      );
    })
    .map((node) => node.childNodes)
    .map((nodeList) =>
      nodeList.filter(
        (node) => (node as Node & { rawTagName: string }).rawTagName === "td"
      )
    )
    .map((nodeList) => nodeList.map((node) => node.childNodes).flat())
    .map((nodeList) => {
      const [categoryNode, versionNode, dateNode] = nodeList;
      // EOL rows append an `[EOL]` span, leaving trailing whitespace behind;
      // the version ends up in a file path, so it has to be clean.
      const version = versionNode.childNodes[0].textContent.trim();
      const packageName = `linux${
        version.split("-")[0].replace(".", "").split(".")[0]
      }`;
      return {
        category: categoryNode.textContent.replace(":", ""),
        version,
        date: dateNode.textContent,
        packageName,
      };
    });

  if (!result?.length) throw new Error("no releases found on kernel.org");

  return result;
};

/**
 * Static files have no query string, so `?version=` turns into one file per
 * version prefix: the dot-separated ones plus the full version (`7`, `7.3`,
 * `7.3-rc3`). Matching stays `startsWith`, as in the previous worker.
 */
const versionPrefixes = (version: string) => {
  const segments = version.split("-")[0].split(".");
  const prefixes = segments.map((_, index) =>
    segments.slice(0, index + 1).join(".")
  );
  return prefixes.includes(version) ? prefixes : [...prefixes, version];
};

const html = await (await fetch(kernelUrl)).text();
const releases = extractData(parse(html));

const categories = [...new Set(releases.map((release) => release.category))];

const files = new Map<string, unknown>([["all.json", releases]]);

for (const category of categories) {
  files.set(
    `category/${category}.json`,
    releases.filter((release) => release.category === category)
  );
}

for (const prefix of new Set(
  releases.flatMap(({ version }) => versionPrefixes(version))
)) {
  files.set(
    `version/${prefix}.json`,
    releases.filter((release) => release.version.startsWith(prefix))
  );
}

// GitHub Pages drops the query string, so a stale `?category=` request lands
// here. Serving the full release array at the root would answer it with
// plausible-looking data for the wrong category, so the root is a discovery
// document instead: wrong shape, and it names its replacement.
files.set("index.json", {
  message: "Query parameters are not supported. Use the path endpoints below.",
  endpoints: {
    all: `https://${customDomain}/all.json`,
    category: `https://${customDomain}/category/{category}.json`,
    version: `https://${customDomain}/version/{prefix}.json`,
  },
  categories,
  generated: new Date().toISOString(),
});

await Promise.all([
  ...Array.from(files, ([path, content]) =>
    Bun.write(`${outDir}/${path}`, JSON.stringify(content))
  ),
  // A workflow deployment only keeps the custom domain if the artifact has it.
  Bun.write(`${outDir}/CNAME`, `${customDomain}\n`),
]);

console.log(`wrote ${files.size} files to ${outDir}/`);
for (const release of releases) {
  console.log(`${release.category}: ${release.version} (${release.packageName})`);
}
