import PouchDB from "pouchdb";

import { newDatabaseInterface, type DatabaseInterface } from "@notario/db";

let db: DatabaseInterface | undefined = undefined;

/**
 * We're using createDB() instead of exporting the db itself because we don't want to
 * instantiate the db on the server, as it leaves annoying '/dev' folder on the filesystem and
 * we're using pouch in the browser only.
 *
 * It should be initialized in the browser environment and is idempotent (if the db is already instantiated, it will return the existing instance).
 * This is to prevent expensive `db.init()` operations on each route change.
 */
export const createDB = async (): Promise<DatabaseInterface> => {
	if (db) {
		return db;
	}

	const pouch = new PouchDB("notario");
	db = newDatabaseInterface(pouch);
	// await db.init();

	return db;
};

/**
 * Get db returns the instantiated db instance. It's safe to run this in any environment (browser/server)
 * as, it will simply return undefined if the db is not instantiated.
 */
export const getDB = (): DatabaseInterface | undefined => {
	return db;
};

export const destroyDB = async () => {
	if (db) {
		await db._pouch.destroy();
		db = undefined;
	}
};
