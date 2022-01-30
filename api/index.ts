import { VercelRequest, VercelResponse } from "@vercel/node";
import { parse, Node } from "node-html-parser";

const kernelUrl = "https://www.kernel.org/";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!!global.__RESULT_CACHE__) console.log("result in cache");
  if (!global.__RESULT_CACHE__) {
    console.log("result not in cache");
    const fetch = await import('node-fetch').then(mod => mod.default)
    const html = await fetch(kernelUrl).then((res) => res.text());

    const dom = parse(html);

    const result = dom
      .querySelector(
        "html body#index.home aside#featured.body article table#releases"
      )
      .childNodes.filter((node) => {
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
        const packageName = `linux${version.split("-")[0].replace(".", "").split('.')[0]}`
        return {
          category: categoryNode.textContent.replace(":", ""),
          version,
          date: dateNode.textContent,
          packageName,
        };
      });

    global.__RESULT_CACHE__ = result;
  }

  const params = req.query as {
    category: string;
    version: string;
  };

  res.status(200).json(
    global.__RESULT_CACHE__
      .filter((el) => {
        return !params.category || el.category === params.category;
      })
      .filter((el) => {
        return !params.version || el.version.startsWith(params.version);
      })
  );
}
