import { build } from "vite";
await build({
  configFile: false,
  build: {
    target: "es2022",
    outDir: "work/worker",
    emptyOutDir: true,
    lib: {
      entry: "server/index.js",
      formats: ["es"],
      fileName: () => "worker.js",
    },
    minify: false,
  },
});
