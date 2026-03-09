import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			obsidian: path.resolve(__dirname, "tests/mocks/obsidian.ts"),
		},
	},
	test: {
		coverage: {
			exclude: [
				"coverage/**",
				"main.js",
				"tests/**",
				"version-bump.mjs",
				"vitest.config.ts",
				"esbuild.config.mjs",
				"src/vendor.d.ts",
			],
			include: ["main.ts", "src/**/*.ts"],
			provider: "v8",
			reporter: ["text", "html"],
			thresholds: {
				lines: 90,
				functions: 90,
				statements: 90,
				branches: 85,
			},
		},
		environment: "jsdom",
		include: ["tests/**/*.test.ts"],
	},
});
