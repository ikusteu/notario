const plugins = require("../../pkg/scaffold/tailwind.plugins.cjs");

module.exports = {
	content: ["./src/**/*.{html,js,svelte,ts}", "./node_modules/@notario/ui/dist/**/*.{html,js,svelte,ts}"],
	plugins
};
