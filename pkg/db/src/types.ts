/* eslint-disable @typescript-eslint/ban-types */
export type CouchDocument<T extends {} = {}> = {
	_id: string;
	_rev?: string;
} & T;

export type NotarioDocType = "resource" | "project" | "section" | "subsection" | "note";

export type NotarioDocument<T extends NotarioDocType = NotarioDocType, D extends {} = {}> = {
	docType: T;
} & D;

export type NoteDataClient = {
	id: string;
	content: string;
	resourceURL: string;
	resourceName: string;
};
