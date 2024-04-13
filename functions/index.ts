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
  const cacheKey = `kernel-${new Date().getUTCFullYear()}-${new Date().getUTCMonth()}-${new Date().getUTCDate()}`;
  const cache = await context.env.KV.get<string>(cacheKey);

  if (!cache) {
    const html = await (await fetch(kernelUrl)).text();

    const dom = parse(html);

    const result = extractData(dom);

    await context.env.KV.put(cacheKey, JSON.stringify(result));

    return new Response(JSON.stringify(result));
  }
  return new Response(cache);
};
