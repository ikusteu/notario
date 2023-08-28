import PouchDB from "pouchdb";
import MemoryAdapter from "pouchdb-adapter-memory";

import { newDatabaseInterface } from "..";

export const getTestPouch = () => {
	PouchDB.plugin(MemoryAdapter);

	const name = new Date().toISOString();

	return new PouchDB(name, { adapter: "memory" });
};

export const getTestDBInterface = () => newDatabaseInterface(getTestPouch());
