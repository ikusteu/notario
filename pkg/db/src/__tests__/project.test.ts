import { describe, test, expect } from "vitest";

import { CouchDocument } from "@/types";

import { Project, ProjectData } from "../project";

import { getDB } from "../__testUtils__/pouchdb";
import { PosiblyEmpty, EMPTY, waitFor } from "../__testUtils__/misc";

describe("Project", () => {
	const defaultData = {
		_id: "projects/project-1",
		_rev: expect.any(String),
		docType: "project",
		name: "",
		sections: []
	};

	test("should create a document with zero values for each property on 'create'", async () => {
		const db = getDB();
		const project = new Project(db, "project-1");

		await project.create();
		const data = await project.get();

		expect(data).toEqual(defaultData);
	});

	test("should update the properties using their respective methods", async () => {
		const db = getDB();
		const project = new Project(db, "project-1");

		await project.create();

		// Set name
		await project.setName("High Frequency Trading");
		let data = await project.get();
		expect(data).toEqual({
			...defaultData,
			name: "High Frequency Trading"
		});

		// Set sections
		await project.setSections(["Introduction", "Literature Review"]);
		data = await project.get();
		expect(data).toEqual({
			...defaultData,
			name: "High Frequency Trading",
			sections: ["Introduction", "Literature Review"]
		});

		// Add section
		await project.addSection("Conclusion");
		data = await project.get();
		expect(data).toEqual({
			...defaultData,
			name: "High Frequency Trading",
			sections: ["Introduction", "Literature Review", "Conclusion"]
		});
	});

	test("should stream document as it gets updated", async () => {
		const db = getDB();
		const project = new Project(db, "project-1");

		let data: PosiblyEmpty<CouchDocument<ProjectData>> = EMPTY;
		project
			.stream()
			.doc()
			.subscribe((doc) => (data = doc));

		// Initial stream: The doc doesn't exist yet
		expect(data).toEqual(EMPTY);

		// Create the doc
		await project.create();
		await waitFor(() => expect(data).toEqual(defaultData));

		// Set name
		await project.setName("High Frequency Trading");
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "High Frequency Trading"
			})
		);

		// Set sections
		await project.setSections(["Introduction", "Literature Review"]);
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "High Frequency Trading",
				sections: ["Introduction", "Literature Review"]
			})
		);

		// Add section
		await project.addSection("Conclusion");
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				name: "High Frequency Trading",
				sections: ["Introduction", "Literature Review", "Conclusion"]
			})
		);
	});

	test("when adding a duplicate section, noop", async () => {
		const db = getDB();
		const project = new Project(db, "project-1");

		// Setup
		await project.create();
		await project.addSection("Introduction");
		let data = await project.get();
		expect(data).toEqual({
			...defaultData,
			sections: ["Introduction"]
		});

		// Add a duplicate section
		await project.addSection("Introduction");
		data = await project.get();
		expect(data).toEqual({
			...defaultData,
			sections: ["Introduction"]
		});
	});

	test("if no id provided, should generate a new uuid", async () => {
		const db = getDB();
		const project = new Project(db);

		await project.create();
		const data = await project.get();

		expect(data).toEqual({
			...defaultData,
			_id: expect.stringMatching(/^projects\/[a-z0-9-]+$/)
		});
	});
});
