import { describe, test, expect } from "vitest";

import { CouchDocument } from "@/types";

import { SubsectionData } from "../subsection";

import { getTestDBInterface } from "../__testUtils__/pouchdb";
import { PosiblyEmpty, EMPTY, waitFor } from "../__testUtils__/misc";

describe("Subsection", () => {
	const defaultData = {
		_id: "projects/project-1/sections/section-1/subsections/subsection-1",
		_rev: expect.any(String),
		docType: "subsection",
		name: "",
		notes: []
	};

	test("should create a document with zero values for each property on 'create'", async () => {
		const subsection = await getTestDBInterface().project("project-1").section("section-1").subsection("subsection-1").create();

		const data = await subsection.get();

		expect(data).toEqual(defaultData);
	});

	test("should create a section (if it doesn't exist) and add itself to the section on 'create'", async () => {
		const db = getTestDBInterface();
		const section = db.project("project-1").section("section-1");

		await section.subsection("subsection-1").create();

		const sectionData = await section.get();
		expect(sectionData).toEqual({
			_id: "projects/project-1/sections/section-1",
			_rev: expect.any(String),
			docType: "section",
			name: "",
			subsections: ["projects/project-1/sections/section-1/subsections/subsection-1"],
			notes: []
		});
	});

	test("on create, if a section already exists, should not overwrite the data, save for adding itself to the list of subsections", async () => {
		// Setup
		const section = await getTestDBInterface().project("project-1").section("section-1").create();
		await section.setName("Introduction");
		await section.setSubsections([
			"projects/project-1/sections/section-1/subsections/subsection-1",
			"projects/project-1/sections/section-1/subsections/subsection-2"
		]);

		// Create a new subsection
		await section.subsection("subsection-3").create();

		// Wait for the stream to update the section data
		await new Promise((resolve) => setTimeout(resolve, 200));
		const sectionData = await section.get();
		expect(sectionData).toEqual({
			_id: "projects/project-1/sections/section-1",
			_rev: expect.any(String),
			docType: "section",
			name: "Introduction",
			notes: [],
			subsections: [
				"projects/project-1/sections/section-1/subsections/subsection-1",
				"projects/project-1/sections/section-1/subsections/subsection-2",
				"projects/project-1/sections/section-1/subsections/subsection-3"
			]
		});
	});

	test("should update the properties using their respective methods", async () => {
		const subsection = await getTestDBInterface().project("project-1").section("section-1").subsection("subsection-1").create();

		// Set name
		await subsection.setName("Introduction");
		let data = await subsection.get();
		expect(data).toEqual({
			...defaultData,
			name: "Introduction"
		});

		// Set notes
		await subsection.setNotes(["note-1", "note-2"]);
		data = await subsection.get();
		expect(data).toEqual({
			...defaultData,
			name: "Introduction",
			notes: ["note-1", "note-2"]
		});

		// Add note
		await subsection.addNote("note-3");
		data = await subsection.get();
		expect(data).toEqual({
			...defaultData,
			name: "Introduction",
			notes: ["note-1", "note-2", "note-3"]
		});
	});

	test("when adding an existing note, noop", async () => {
		const subsection = await getTestDBInterface().project("project-1").section("section-1").subsection("subsection-1").create();

		// Setup
		await subsection.setNotes(["note-1", "note-2"]);

		let data = await subsection.get();
		expect(data).toEqual({
			...defaultData,
			notes: ["note-1", "note-2"]
		});

		// Add a duplicate note
		await subsection.addNote("note-1");
		expect(data).toEqual({
			...defaultData,
			notes: ["note-1", "note-2"]
		});
	});

	test("should stream document as it gets updated", async () => {
		const subsection = getTestDBInterface().project("project-1").section("section-1").subsection("subsection-1");

		let data: PosiblyEmpty<CouchDocument<SubsectionData>> = EMPTY;
		subsection
			.stream()
			.doc()
			.subscribe((doc) => (data = doc));

		// Initial stream: The doc doesn't exist yet
		expect(data).toEqual(EMPTY);

		// Set name
		await subsection.create();
		await subsection.setName("Introduction");
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "Introduction"
			})
		);

		// Set notes
		await subsection.setNotes(["note-1", "note-2"]);
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "Introduction",
				notes: ["note-1", "note-2"]
			})
		);

		// Add note
		await subsection.addNote("note-3");
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "Introduction",
				notes: ["note-1", "note-2", "note-3"]
			})
		);
	});

	test("if no id provided, should generate a new uuid", async () => {
		const subsection = getTestDBInterface().project("project-1").section("section-1").subsection();

		await subsection.create();
		const data = await subsection.get();

		expect(data).toEqual({
			...defaultData,
			_id: expect.stringMatching(/^projects\/project-1\/sections\/section-1\/subsections\/[a-z0-9-]+$/)
		});
	});
});
