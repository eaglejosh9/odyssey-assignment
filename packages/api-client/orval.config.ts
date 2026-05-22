import { defineConfig } from "orval";

export default defineConfig({
  odyssey: {
    input: {
      target: "../../services/backend/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/generated/api.ts",
      schemas: "./src/generated/schemas",
      client: "react-query",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "./src/mutator.ts",
          name: "apiFetch",
        },
        query: {
          useQuery: true,
          useMutation: true,
          signal: true,
          options: {
            staleTime: 30_000,
          },
        },
      },
      prettier: false,
    },
  },
});
