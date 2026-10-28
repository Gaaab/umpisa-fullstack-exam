import type { NextConfig } from "next";

const apiUrl = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Same-origin proxy so the API's httpOnly auth cookie lands on this domain.
  async rewrites() {
    return [{ source: "/graphql", destination: `${apiUrl}/graphql` }];
  },
};

export default nextConfig;
