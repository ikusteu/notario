export type CouchDocument<T extends {} = {}> = {
	_id: string;
	_rev?: string;
} & T;
