import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../api/schema.gql",
  // Single source of truth for both clients' operations.
  documents: "../graphql/operations/*.graphql",
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
    "../mobile/lib/core/graphql/operations.g.dart": {
      plugins: ["./scripts/codegen-dart.cjs"],
    },
  },
};

export default config;
