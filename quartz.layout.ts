import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [
    Component.Navbar(),
  ],
  afterBody: [],
  footer: Component.Footer({
    links: {
      "About": "/about",
      "Tags": "/tags",
      "Contact": "/contact",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Breadcrumbs(),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.PageTitle(),
    Component.ContentMeta(),
    Component.TagList(),
  ],
  left: [
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
        { Component: Component.ReaderMode() },
      ],
    }),
    Component.Explorer({
      title: "Explore the Garden",
      folderClickBehavior: "link",
      folderDefaultState: "collapsed",
    }),
  ],
  center: [
    Component.Content(),
    Component.ConditionalRender({
      component: Component.Graph(),
      condition: (page) => page.fileData.slug === "index",
    }),
  ],
  right: [
    Component.RecentNotes({
      title: "Related Notes",
      limit: 5
    }),
    Component.DesktopOnly(Component.TableOfContents()),
    Component.Backlinks(),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.PageTitle(), Component.ContentMeta(), Component.ArticleTitle()],
  left: [
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer({
      title: "Explore the Garden",
      folderClickBehavior: "link",
      folderDefaultState: "collapsed",
    }),
  ],
  right: [],
}