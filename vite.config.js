import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, copyFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";

const passthroughFiles = [
  "CNAME",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "llms.txt"
];

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

      const resourceFiles = execFileSync(
        "git",
        ["ls-files", "-co", "--exclude-standard", "-z", "--", "src/resource"],
        { encoding: "buffer" }
      ).toString().split("\0").filter(Boolean);
      for (const file of resourceFiles) {
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
