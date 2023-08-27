import { describe, test, expect } from "vitest";

import { Resource } from "../resource";

import { getDB } from "../__testUtils__/pouchdb";

describe("Note", async () => {
	const defaultData = {
		_id: "resources/resource-1/notes/note-1",
		_rev: expect.any(String),
		docType: "note",
		content: ""
	};

	test("should create a document with zero values for each property on 'create'", async () => {
		const db = getDB();
		const note = await new Resource(db, "resource-1").note("note-1").create();

		await note.create();
		const data = await note.get();

		expect(data).toEqual(defaultData);
	});

	test("should create a resource (if one doesn't exist) add itself to resource's notes on 'create'", async () => {
		// Setup
		const db = getDB();
		await new Resource(db, "resource-1").note("note-1").create();

		const resourceData = await new Resource(db, "resource-1").get();

		expect(resourceData).toEqual({
			_id: "resources/resource-1",
			_rev: expect.any(String),
			docType: "resource",
			name: "",
			path: "",
			authors: [],
			year: 0
		});
	});

	test("should update the properties using their respective methods", async () => {
		const db = getDB();
		const note = await new Resource(db, "resource-1").note("note-1").create();

		// Set content
		const content =
			"The traditional financial models, such as CAPM don't take into account the market microstructure and it's impact on the price formation process.";
		await note.setContent(content);
		let data = await note.get();
		expect(data).toEqual({
			...defaultData,
			content
		});
	});

	test("if no id provided, should generate a new uuid", async () => {
		const db = getDB();
		const note = new Resource(db, "resource-1").note();

		await note.create();
		const data = await note.get();

		expect(data).toEqual({
			...defaultData,
			_id: expect.stringMatching(/^resources\/resource-1\/notes\/[a-z0-9-]+$/)
		});
	});
});
