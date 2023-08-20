import { BehaviorSubject, firstValueFrom, Observable, ReplaySubject, share } from "rxjs";

import type { CouchDocument } from "./types";

import { newDocumentStream, runAfterCondition } from "./utils";

interface GetOpts {
	cached?: boolean;
}

interface DocumentNodeInterface<D extends {}> {
	_id: string;
	create(): Promise<DocumentNodeInterface<D>>;
	get(opts?: GetOpts): Promise<CouchDocument<Required<D>> | undefined>;
	set(data: Partial<D>): Promise<DocumentNodeInterface<D>>;
	update(cb: (data: CouchDocument<Required<D>>) => Partial<D>, opts?: GetOpts): Promise<DocumentNodeInterface<D>>;
	delete(): Promise<void>;
	exists(): Promise<boolean>;
}

export class DocumentNode<D extends {}> implements DocumentNodeInterface<D> {
	#db: PouchDB.Database;

	_id: string;

	#zeroValues: Required<D>;
	private data: CouchDocument<Required<D>>;

	#stream: Observable<CouchDocument<D>>;

	#initialised = new BehaviorSubject(false);
	#exists = false;

	constructor(db: PouchDB.Database, _id: string, zeroValues: Required<D>) {
		this.#db = db;

		this._id = _id;

		this.#zeroValues = zeroValues;
		this.data = { ...zeroValues, _id };

		const cache = new ReplaySubject<CouchDocument<D>>(1);
		this.#stream = newDocumentStream<CouchDocument<D>>(this.#db, _id).pipe(
			share({ connector: () => cache, resetOnComplete: false, resetOnError: false, resetOnRefCountZero: false })
		);

		firstValueFrom(this.#stream).then(() => this.#initialised.next(true));

		this.#stream.subscribe(this.updateData);
	}

	private updateField(field: string, value?: any) {
		if (!Object.keys(this.data).includes(field) && value === undefined) {
			return;
		}

		this.data[field as keyof CouchDocument<D>] = value as any;
		this.#exists = true;

		return this;
	}

	private updateData(doc: Partial<CouchDocument<D>>) {
		for (const [key, value] of Object.entries(doc)) {
			this.updateField(key, value);
		}
	}

	exists() {
		return runAfterCondition(() => {
			return Promise.resolve(this.#exists);
		}, this.#initialised);
	}

	async create() {
		const exists = await this.exists();
		if (exists) {
			return Promise.resolve(this);
		}
		return this.set(this.data);
	}

	async get(opts: GetOpts = { cached: true }): Promise<CouchDocument<Required<D>> | undefined> {
		const exists = await this.exists();
		if (exists) {
			// If cached is ok (which it should be most of the time) return the cached doc
			if (opts.cached) {
				return Promise.resolve<CouchDocument<Required<D>>>(this.data);
			}
			// Return fresh query if so specified
			return this.#db.get(this.data._id);
		}
		// If initialised, but doesn't exist, return 'undefined'
		return Promise.resolve(undefined);
	}

	set(data: Partial<D>): Promise<DocumentNode<D>> {
		return runAfterCondition(async () => {
			const { _id, _rev } = this.data;
			await this.#db.put({ ...this.#zeroValues, ...data, _rev, _id });
			return this;
		}, this.#initialised);
	}

	update(cb: (data: CouchDocument<Required<D>>) => Partial<D>, opts?: GetOpts) {
		return runAfterCondition(async () => {
			const data = await this.get(opts);
			return this.set(cb(data!));
		}, this.#initialised);
	}

	async delete() {
		return;
	}
}
