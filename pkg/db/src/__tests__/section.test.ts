import { describe, test, expect } from "vitest";

import { CouchDocument } from "@/types";

import { SectionData } from "../section";

import { getTestDBInterface } from "../__testUtils__/pouchdb";
import { PosiblyEmpty, EMPTY, waitFor } from "../__testUtils__/misc";

describe("Section", () => {
	const defaultData = {
		_id: "projects/project-1/sections/section-1",
		_rev: expect.any(String),
		docType: "section",
		name: "",
		notes: [],
		subsections: []
	};

	test("should create a document with zero values for each property on 'create'", async () => {
		const section = await getTestDBInterface().project("project-1").section("section-1").create();

		const data = await section.get();

		expect(data).toEqual(defaultData);
	});

	test("should create a project (if it doesn't exist) and add itself to the project on 'create'", async () => {
		const project = getTestDBInterface().project("project-1");
		await project.section("section-1").create();

		const projectData = await project.get();
		expect(projectData).toEqual({
			_id: "projects/project-1",
			_rev: expect.any(String),
			docType: "project",
			name: "",
			sections: ["projects/project-1/sections/section-1"]
		});
	});

	test("on create, if a project already exists, should not overwrite the data, save for adding itself to the list of sections", async () => {
		// Setup
		const project = await getTestDBInterface().project("project-1").create();
		await project.setName("High Frequency Trading");
		await project.setSections(["projects/project-1/sections/section-1", "projects/project-1/sections/section-2"]);

		// Create a new section
		await project.section("section-3").create();

		const projectData = await project.get();
		expect(projectData).toEqual({
			_id: "projects/project-1",
			_rev: expect.any(String),
			docType: "project",
			name: "High Frequency Trading",
			sections: ["projects/project-1/sections/section-1", "projects/project-1/sections/section-2", "projects/project-1/sections/section-3"]
		});
	});

	test("should update the properties using their respective methods", async () => {
		const section = await getTestDBInterface().project("project-1").section("section-1").create();

		// Set name
		await section.setName("Introduction");
		let data = await section.get();
		expect(data).toEqual({
			...defaultData,
			name: "Introduction"
		});

		// Set notes
		await section.setNotes(["note-1", "note-2"]);
		data = await section.get();
		expect(data).toEqual({
			...defaultData,
			name: "Introduction",
			notes: ["note-1", "note-2"]
		});

		// Add note
		await section.addNote("note-3");
		data = await section.get();
		expect(data).toEqual({
			...defaultData,
			name: "Introduction",
			notes: ["note-1", "note-2", "note-3"]
		});

		// Set subsections
		await section.setSubsections(["subsection-1", "subsection-2"]);
		data = await section.get();
		expect(data).toEqual({
			...defaultData,
			name: "Introduction",
			notes: ["note-1", "note-2", "note-3"],
			subsections: ["subsection-1", "subsection-2"]
		});

		// Add subsection
		await section.addSubsection("subsection-3");
		data = await section.get();
		expect(data).toEqual({
			...defaultData,
			name: "Introduction",
			notes: ["note-1", "note-2", "note-3"],
			subsections: ["subsection-1", "subsection-2", "subsection-3"]
		});
	});

	test("when adding and existing note/subsection, noop", async () => {
		const subsection = getTestDBInterface().project("project-1").section("section-1");

		// Setup
		await subsection.create();
		await subsection.setNotes(["note-1", "note-2"]);
		await subsection.setSubsections(["subsection-1", "subsection-2"]);

		let data = await subsection.get();
		expect(data).toEqual({
			...defaultData,
			notes: ["note-1", "note-2"],
			subsections: ["subsection-1", "subsection-2"]
		});

		// Add a duplicate note
		await subsection.addNote("note-1");
		expect(data).toEqual({
			...defaultData,
			notes: ["note-1", "note-2"],
			subsections: ["subsection-1", "subsection-2"]
		});

		// Add a duplicate subsection
		await subsection.addSubsection("subsection-1");
		expect(data).toEqual({
			...defaultData,
			notes: ["note-1", "note-2"],
			subsections: ["subsection-1", "subsection-2"]
		});
	});

	test("should stream document as it gets updated", async () => {
		const section = getTestDBInterface().project("project-1").section("section-1");

		let data: PosiblyEmpty<CouchDocument<SectionData>> = EMPTY;
		section
			.stream()
			.doc()
			.subscribe((doc) => (data = doc));

		// Initial stream: The doc doesn't exist yet
		expect(data).toEqual(EMPTY);

		// Set name
		await section.setName("Introduction");
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "Introduction"
			})
		);

		// Set notes
		await section.setNotes(["note-1", "note-2"]);
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "Introduction",
				notes: ["note-1", "note-2"]
			})
		);

		// Add note
		await section.addNote("note-3");
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "Introduction",
				notes: ["note-1", "note-2", "note-3"]
			})
		);

		// Set subsections
		await section.setSubsections(["subsection-1", "subsection-2"]);
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "Introduction",
				notes: ["note-1", "note-2", "note-3"],
				subsections: ["subsection-1", "subsection-2"]
			})
		);

		// Add subsection
		await section.addSubsection("subsection-3");
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "Introduction",
				notes: ["note-1", "note-2", "note-3"],
				subsections: ["subsection-1", "subsection-2", "subsection-3"]
			})
		);
	});

	test("if no id provided, should generate a new uuid", async () => {
		const section = await getTestDBInterface().project("project-1").section().create();

		const data = await section.get();

		expect(data).toEqual({
			...defaultData,
			_id: expect.stringMatching(/^projects\/project-1\/sections\/[a-z0-9-]+$/)
		});
	});
});
