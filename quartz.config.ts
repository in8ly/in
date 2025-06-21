// quartz.config.ts
import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    // Your site information
    pageTitle: "Resonance Intelligence",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible", // or "google"
    },
    locale: "en-US",
    
    // Important: Point this to your Obsidian vault
    // contentPath: "C:/Users/in8ly/ObsidianVaults/in_8_ly",
    
    // Ignore specific paths from your vault
    ignorePatterns: ["private", ".obsidian"],
    defaultDateType: "created",
    theme: {
      typography: {
        header: "Lora, Georgia, serif",
        body: "'Atkinson Hyperlegible', sans-serif",
        code: "'JetBrains Mono', monospace",
      },
      colors: {
        lightMode: {
          light: "#f5f3f0",
          lightgray: "#e9e5dc",
          gray: "#6a654f",
          darkgray: "#464438",
          dark: "#272520",
          secondary: "#5c7f67",
          tertiary: "#a98467",
        },
        darkMode: {
          light: "#2b2a25",
          lightgray: "#3b3a31",
          gray: "#7c7b6f",
          darkgray: "#b5b3a7",
          dark: "#f1efe8",
          secondary: "#8aac96",
          tertiary: "#c4a78c",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.TableOfContents(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "filesystem"],
      }),
      Plugin.SyntaxHighlighting(),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: true }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.CrawlLinks({ markdownLinkResolution: "relative" }),
      Plugin.Latex({ renderEngine: "katex" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config