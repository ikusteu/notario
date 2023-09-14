import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";

import { browser } from "$app/environment";
import { base } from "$app/paths";

import { createDB } from "$lib/db";

import type { LayoutLoad } from "./$types";

// Paths which are valid (shouldn't return 404, but don't have any content and should get redirected to the default route "/inventory/stock/all")
const redirectPaths = ["", "/", "/project", "/project/"];

export const load: LayoutLoad = async ({ url }) => {
	const { pathname } = url;

	if (redirectPaths.includes(pathname)) {
		// * Important: trailing slash is required here
		// * otherwise sveltekit will attempt to add it, and in doing so will strip `base`
		throw redirect(307, "/project/project-1/sections");
	}

	// If in browser, we init the db, otherwise this is a prerender, for which we're only building basic html skeleton
	if (browser) {
		// We should init the db first. If there is an existing remote config, the replicator we create next will need it
		const db = await createDB();

		db._pouch.sync("http://admin:admin@127.0.0.1:4000/notario", { live: true, retry: false });

		return {
			db
		};
	}

	return {};
};
export const prerender = true;
export const trailingSlash = "always";
