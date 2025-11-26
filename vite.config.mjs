import {resolve} from "node:path";
import pkg from "./package.json" with {type: "json"};

/** @type {import('vite').UserConfig} */
export default {
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/handy-scroll.mjs"),
      name: "HandyScroll",
      fileName: "handy-scroll",
      formats: ["es"],
    },
    target: "esnext",
    rollupOptions: {
      output: {
        entryFileNames: "[name].mjs",
      },
    },
    emptyOutDir: false,
  },
  esbuild: {
    banner: `/*!
${pkg.name} v${pkg.version}
${pkg.homepage}
(c) ${new Date().getUTCFullYear()} ${pkg.author}
*/`,
  },
};
