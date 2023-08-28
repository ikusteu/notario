import PouchDB from "pouchdb";

import { newResourceInterface, type ResourceInterface } from "./resource";
import { newProjectInterface, type ProjectInterface } from "./project";

export interface DatabaseInterface {
	_pouch: PouchDB.Database;
	resource(id?: string): ResourceInterface;
	project(id?: string): ProjectInterface;
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
}

export const newDatabaseInterface = (pouch: PouchDB.Database): DatabaseInterface => new Database(pouch);
