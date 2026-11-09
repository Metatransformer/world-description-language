import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Generative World Studio",
  description: "Compose portable game worlds in JSX. Integrate them with your engine.",
  base: process.env.DOCS_BASE ?? "/",
  srcExclude: ["public/**"],
  themeConfig: {
    siteTitle: "Generative World Studio",
    search: { provider: "local" },
    nav: [{ text: "Play demo", link: "https://metatransformer.github.io/world-description-language/demo/" }, { text: "Agent quickstart", link: "/AGENT-QUICKSTART" }, { text: "Valenfeld", link: "/VALENFELD" }],
    sidebar: [
      { text: "Start", items: [{ text: "Overview", link: "/" }, { text: "Agent quickstart", link: "/AGENT-QUICKSTART" }, { text: "Play Valenfeld", link: "/VALENFELD" }] },
      { text: "Integrate", items: [{ text: "Godot recipe", link: "/INTEGRATION" }, { text: "Runtime reference", link: "/GODOT" }, { text: "Artifact contract", link: "/ARTIFACT-CONTRACT" }] },
      { text: "Author", items: [{ text: "Component packages", link: "/COMPONENT-LIBRARIES" }, { text: "JSX authoring", link: "/AUTHORING" }, { text: "Dungeons", link: "/DUNGEONS" }, { text: "Spawn provenance", link: "/SPAWN-PORT" }] },
    ],
  },
});
