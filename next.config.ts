import type { NextConfig } from "next";

const config: NextConfig = {
  serverExternalPackages: ["esbuild"],
  webpack(configuration) {
    configuration.resolve.extensionAlias = {
      ...(configuration.resolve.extensionAlias ?? {}),
      ".js": [".js", ".ts", ".tsx"],
    };
    return configuration;
  },
};
export default config;
