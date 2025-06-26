import { QuartzTransformerPlugin } from "../types"

export const Garden: QuartzTransformerPlugin = () => {
  return {
    name: "Garden",
    externalResources: () => {
      return {
        js: [
          {
            src: "https://cdn.jsdelivr.net/npm/d3@7",
            loadTime: "beforeDOMReady",
            contentType: "external",
          },
          {
            src: "/static/scripts/garden.js",
            loadTime: "afterDOMReady",
            contentType: "external",
          },
        ],
      }
    },
  }
}
