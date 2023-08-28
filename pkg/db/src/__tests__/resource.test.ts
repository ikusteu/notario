import { describe, test, expect } from "vitest";

import { CouchDocument } from "@/types";

import { ResourceData } from "../resource";

import { getTestDBInterface } from "../__testUtils__/pouchdb";
import { PosiblyEmpty, EMPTY, waitFor } from "../__testUtils__/misc";

describe("Resource", () => {
	const defaultData = {
		_id: "resources/resource-1",
		_rev: expect.any(String),
		docType: "resource",
		name: "",
		year: 0,
		authors: [],
		path: ""
	};

	test("should create a document with zero values for each property on 'create'", async () => {
		const resource = getTestDBInterface().resource("resource-1");

		await resource.create();
		const data = await resource.get();

		expect(data).toEqual(defaultData);
	});

	test("should update the properties using their respective methods", async () => {
		const resource = getTestDBInterface().resource("resource-1");

		await resource.create();

		// Set authors
		await resource.setAuthors(["Charles Albert Lehelle", "Irene Aldridge"]);
		let data = await resource.get();
		expect(data).toEqual({
			...defaultData,
			authors: ["Charles Albert Lehelle", "Irene Aldridge"]
		});

		// Set year
		await resource.setYear(2021);
		data = await resource.get();
		expect(data).toEqual({
			...defaultData,
			authors: ["Charles Albert Lehelle", "Irene Aldridge"],
			year: 2021
		});

		// Set path
		await resource.setPath("file://HFT-intraday-trading.pdf");
		data = await resource.get();
		expect(data).toEqual({
			...defaultData,
			authors: ["Charles Albert Lehelle", "Irene Aldridge"],
			year: 2021,
			path: "file://HFT-intraday-trading.pdf"
		});
	});

	test("should stream document as it gets updated", async () => {
		const resource = getTestDBInterface().resource("resource-1");

		let data: PosiblyEmpty<CouchDocument<ResourceData>> = EMPTY;
		resource
			.stream()
			.doc()
			.subscribe((doc) => (data = doc));

		// Initial stream: The doc doesn't exist yet
		expect(data).toEqual(EMPTY);

		// Create the doc
		await resource.create();
		await waitFor(() => expect(data).toEqual(defaultData));

		// Set authors
		await resource.setAuthors(["Charles Albert Lehelle", "Irene Aldridge"]);
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				authors: ["Charles Albert Lehelle", "Irene Aldridge"]
			})
		);

		// Set year
		await resource.setYear(2021);
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				authors: ["Charles Albert Lehelle", "Irene Aldridge"],
				year: 2021
			})
		);

		// Set path
		await resource.setPath("file://HFT-intraday-trading.pdf");
		await waitFor(() =>
			expect(data).toEqual({
				...defaultData,
				authors: ["Charles Albert Lehelle", "Irene Aldridge"],
				year: 2021,
				path: "file://HFT-intraday-trading.pdf"
			})
		);
	});

	test("if no id provided, should generate a new uuid", async () => {
		const resource = getTestDBInterface().resource();

		await resource.create();
		const data = await resource.get();

		expect(data).toEqual({
			...defaultData,
			_id: expect.stringMatching(/^resources\/[a-z0-9-]+$/)
		});
	});

	test("should construct a note instance using 'note' method", async () => {
		const resource = getTestDBInterface().resource("test");

		await resource.create();
		const note = resource.note("note-1");

		expect(note.id()).toEqual("resources/test/notes/note-1");
	});
});
