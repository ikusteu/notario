import PouchDB from "pouchdb";
import MemoryAdapter from "pouchdb-adapter-memory";

export const getDB = () => {
	PouchDB.plugin(MemoryAdapter);

	const name = new Date().toISOString();

	return new PouchDB(name, { adapter: "memory" });
};
