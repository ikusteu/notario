import { defineConfig } from "vite";
import path from "path";

import RollupNodePolyfill from "rollup-plugin-node-polyfills";

export default defineConfig(() => ({
	resolve: {
		alias: {
			// Alias events module to use rollup-plugin-node-polyfills as node modules (such as 'events' get externalized by vite build)
			// and we need 'events' for PouchDB to work.
			events: "rollup-plugin-node-polyfills/polyfills/events"
		}
	},
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
			],
			// This is the node modules polyfill (namely 'events') for PouchDB purposes, in production
			plugins: [
				RollupNodePolyfill({
					include: ["events"]
				}) as any
			]
		}
	}
}));
