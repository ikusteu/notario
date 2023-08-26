import { describe, test, expect } from "vitest";

import { DocumentNode } from "../document_node";

import { getDB } from "../__testUtils__/pouchdb";
import { waitFor } from "../__testUtils__/misc";

const EMPTY = Symbol("EMPTY");

type PossiblyEmpty<T> = T | typeof EMPTY;

describe("DocumentNode", () => {
	test("standard api", async () => {
		const db = getDB();
		type TestDoc = {
			foo: string;
			num: number;
		};
		const docNode = new DocumentNode<TestDoc>(db, "test-doc", { foo: "", num: 0 });

		// The structure has been instantiated, but the document is not created yet
		let exists = await docNode.exists();
		expect(exists).toEqual(false);

		let data = await docNode.get();
		expect(data).toEqual(undefined);

		// Create the doc
		await docNode.create();

		exists = await docNode.exists();
		data = await docNode.get();

		expect(exists).toEqual(true);
		expect(data).toEqual(expect.objectContaining({ foo: "", num: 0 }));

		// Set sets the data as received
		await docNode.set({ foo: "bar", num: 1 });

		data = await docNode.get();
		expect(data).toEqual(expect.objectContaining({ foo: "bar", num: 1 }));

		// If only part of the document structure is set, the rest is filled with the zero values for respective field
		await docNode.set({ foo: "baz" });

		data = await docNode.get();
		expect(data).toEqual(expect.objectContaining({ foo: "baz", num: 0 }));

		// Update takes the current data into account
		await docNode.update(({ foo, num }) => ({ foo: foo + "!", num: num + 2 }));

		data = await docNode.get();
		expect(data).toEqual(expect.objectContaining({ foo: "baz!", num: 2 }));

		// If only part of the document structure is updated, the rest is filled with the zero values for respective field
		await docNode.update(({ foo }) => ({ foo: foo + "!" }));

		data = await docNode.get();
		expect(data).toEqual(expect.objectContaining({ foo: "baz!!", num: 0 }));
	});

	test("stream", async () => {
		const db = getDB();
		type TestDoc = {
			foo: string;
			num: number;
		};

		const docNode = new DocumentNode<TestDoc>(db, "test-doc", { foo: "", num: 0 });

		let data: PossiblyEmpty<TestDoc> = EMPTY;
		docNode.stream().subscribe((d) => (data = d));

		// Initial stream: Doc is not yet created
		expect(data).toEqual(EMPTY);

		// Create the doc
		await docNode.create();
		await waitFor(() => expect(data).toEqual(expect.objectContaining({ foo: "", num: 0 })));

		// Set the value
		await docNode.set({ foo: "bar", num: 1 });
		await waitFor(() => expect(data).toEqual(expect.objectContaining({ foo: "bar", num: 1 })));

		// Update the value
		await docNode.update(({ foo, num }) => ({ foo: foo + "!", num: num + 2 }));
		await waitFor(() => expect(data).toEqual(expect.objectContaining({ foo: "bar!", num: 3 })));
	});
});
