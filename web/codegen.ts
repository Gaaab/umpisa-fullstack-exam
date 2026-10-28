import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../api/schema.gql",
  documents: ["src/**/*.{ts,tsx}", "!src/gql/**"],
  generates: {
    "src/gql/": {
      preset: "client",
      // Fragments only share field lists here, so skip masking.
      presetConfig: { fragmentMasking: false },
      config: {
        useTypeImports: true,
        nonOptionalTypename: true,
        skipTypeNameForRoot: true,
        scalars: { DateTime: "string" },
      },
    },
  },
};

export default config;
