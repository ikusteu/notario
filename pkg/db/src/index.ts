import PouchDB from "pouchdb";
import { concat, from, Observable, switchMap } from "rxjs";

import { newResourceInterface, ResourceData, type ResourceInterface } from "./resource";
import { newProjectInterface, type ProjectInterface } from "./project";

import { CouchDocument, NoteDataClient } from "./types";
import { newChangesStream } from "./utils";
import { NoteData } from "./note";

export * from "./types";

export interface DatabaseStream {
	noteMap: Observable<Map<string, NoteDataClient>>;
}

export interface DatabaseInterface {
	_pouch: PouchDB.Database;
	resource(id?: string): ResourceInterface;
	project(id?: string): ProjectInterface;
	stream(): {
		noteMap: Observable<Map<string, NoteDataClient>>;
	};
}

class Database implements DatabaseInterface {
	_pouch: PouchDB.Database;

	constructor(db: PouchDB.Database) {
		this._pouch = db;
	}

	resource(id?: string): ResourceInterface {
		return newResourceInterface(this, id);
	}

	project(id?: string): ProjectInterface {
		return newProjectInterface(this, id);
	}

	stream(): DatabaseStream {
		return {
			noteMap: new NoteMap(this).stream()
		};
	}
}

class NoteMap {
	#db: DatabaseInterface;

	options = {};

	constructor(db: DatabaseInterface) {
		this.#db = db;
	}

	private changes() {
		return this.#db._pouch.changes({
			include_docs: false,
			since: "now",
			live: true
		});
	}

	private changesStream() {
		return newChangesStream(this.changes());
	}

	private async query() {
		return this.#db._pouch
			.allDocs({ startkey: "resources/", endkey: "resources/\uffff", include_docs: true })
			.then(({ rows }) => rows.map(({ doc }) => doc as unknown as CouchDocument<ResourceData> | CouchDocument<NoteData>))
			.then((docs) => aggregateNoteMap(docs));
	}

	stream() {
		return concat(from(Promise.resolve()), this.changesStream()).pipe(switchMap(() => this.query()));
	}
}

const aggregateNoteMap = (docs: Array<CouchDocument<ResourceData> | CouchDocument<NoteData>>) => {
	const r = new Map<string, { resourceURL: string; resourceName: string }>();
	const addResource = (data: CouchDocument<ResourceData>) => {
		r.set(data._id, { resourceURL: data.path, resourceName: data.name });
	};

	const m = new Map<string, NoteDataClient>();
	const addNote = (data: CouchDocument<NoteData>) => {
		const resourceId = data._id.split("/").slice(0, 2).join("/");
		const resourceData = r.get(resourceId) as { resourceURL: string; resourceName: string };
		const shortId = data._id.split("/").pop() as string;
		m.set(data._id, { id: data._id, content: data.content, ...resourceData });
		m.set(shortId, { id: data._id, content: data.content, ...resourceData });
	};

	for (const doc of docs) {
		switch (doc.docType) {
			case "resource": {
				addResource(doc);
				break;
			}
			case "note": {
				addNote(doc);
			}
		}
	}

	return m;
};

export const newDatabaseInterface = (pouch: PouchDB.Database): DatabaseInterface => new Database(pouch);
