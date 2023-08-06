import { defineConfig } from "vite";
import path from "path";

export default defineConfig(() => ({
	build: {
		target: "esnext",
		outDir: "dist",
		lib: {
			entry: {
				index: path.join(__dirname, "src", "index.ts"),
				background: path.join(__dirname, "src", "background.ts")
			}
		},
		rollupOptions: {
			external: ["chrome"],
			input: {
				index: path.join(__dirname, "src", "index.ts"),
				background: path.join(__dirname, "src", "background.ts")
			},
			output: [
				{
					dir: "dist",
					entryFileNames: "[name].js",
					format: "cjs" as const,
					sourcemap: true
				}
			]
		}
	}
}));
