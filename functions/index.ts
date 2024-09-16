import { parse, Node, type HTMLElement } from "node-html-parser";

const kernelUrl = "https://www.kernel.org/";

interface Env {
  KV: KVNamespace;
}

const extractData = (dom: HTMLElement) => {
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
      const version = versionNode.childNodes[0].textContent;
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

  return result;
};

export const onRequest: PagesFunction<Env> = async (context) => {
  let cache = caches.default;
  const cachedResponse = await cache.match(context.request);

  if (cachedResponse) {
    console.log("Cache hit");
    return cachedResponse;
  }

  const url = new URL(context.request.url);
  const category = url.searchParams.get("category");
  const version = url.searchParams.get("version");
  console.log({ category, version });

  const html = await (await fetch(kernelUrl, {
    cf: {
      cacheTtl: 60 * 60,
      cacheEverything: true,
    }
  })).text();

  const dom = parse(html);

  const result = extractData(dom)
    .filter((el) => !category || el.category === category)
    .filter((el) => !version || el.version.startsWith(version));

  const response = new Response(JSON.stringify(result), {
    headers: {
      "content-type": "application/json",
      expires: new Date(Date.now() + 1000 * 60 * 60).toUTCString(),
    },
  });

  cache.put(context.request, response.clone());

  return response;
};
