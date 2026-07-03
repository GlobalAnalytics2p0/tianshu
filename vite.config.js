import { cpSync, existsSync, mkdirSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

const passthroughFiles = [
  "CNAME",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "llms.txt"
];

const RESOURCE_ROOT = "src/resource/";

function publishedResourcePaths() {
  const manifestPath = `${RESOURCE_ROOT}manifest.json`;
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const paths = new Set([manifestPath]);

  for (const book of manifest.books || []) {
    for (const chapter of book.chapters || []) {
      if (chapter?.path) paths.add(chapter.path);
    }
    for (const imagePath of [book.coverImage, book.heroImage]) {
      if (imagePath) paths.add(imagePath);
    }
  }

  for (const path of paths) {
    if (!path.startsWith(RESOURCE_ROOT)) {
      throw new Error(`Published resource path must stay inside ${RESOURCE_ROOT}: ${path}`);
    }
  }
  return [...paths];
}

function copyStaticSiteContent() {
  return {
    name: "copy-tianshu-static-content",
    closeBundle() {
      const dist = resolve("dist");
      mkdirSync(dist, { recursive: true });

      if (existsSync("public")) {
        cpSync("public", resolve(dist, "public"), {
          recursive: true,
          filter: (source) => !source.endsWith(".DS_Store")
        });
      }

      for (const file of publishedResourcePaths()) {
        if (!existsSync(file) || file.endsWith(".DS_Store")) continue;
        const target = resolve(dist, file);
        mkdirSync(dirname(target), { recursive: true });
        copyFileSync(file, target);
      }

      for (const file of passthroughFiles) {
        if (existsSync(file)) copyFileSync(file, resolve(dist, file));
      }
    }
  };
}

function cleanBuildOutput() {
  return {
    name: "clean-tianshu-build-output",
    apply: "build",
    buildStart() {
      rmSync(resolve("dist"), { recursive: true, force: true, maxRetries: 5, retryDelay: 120 });
    }
  };
}

export default defineConfig({
  base: "/",
  publicDir: false,
  server: {
    port: 4173,
    strictPort: true
  },
  preview: {
    port: 4174,
    strictPort: true
  },
  plugins: [cleanBuildOutput(), copyStaticSiteContent()],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: resolve("index.html"),
        admin: resolve("admin.html")
      }
    }
  },
  test: {
    environment: "node",
    include: ["src/web/**/*.test.js"]
  }
});
