import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],

  format: ["esm"],

  target: "esnext",
  outDir: "dist",

  // 7. Enable code splitting for shared chunks (recommended for ESM)
  splitting: false,

  // 8. Generate source maps for debugging
  sourcemap: true,

  banner: {
    js: `
    import {createRequire} from 'module';
    const require = createRequire(import.meta.url);
    `,
  },
});
