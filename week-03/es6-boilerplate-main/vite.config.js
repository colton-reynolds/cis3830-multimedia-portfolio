import { defineConfig } from "vite";
import vitePluginFaviconsInject from "vite-plugin-favicons-inject";

export default defineConfig({
  base: "",
  publicDir: "static",
  build: {
    assetsDir: "assets",
    emptyOutDir: true,
    manifest: true,
    outDir: "public",
    target: "es2015"
  },
  plugins: [
    vitePluginFaviconsInject("./src/favicon/logo.png")
  ]
});
