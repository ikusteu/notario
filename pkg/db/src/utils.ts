import { distinctUntilChanged, Subject, Observable, type Subscription, firstValueFrom, from, concat, map } from "rxjs";

export const runAfterCondition = async <R>(cb: () => Promise<R>, condition: Observable<boolean>): Promise<R> => {
	// Create a stream to emit the result of the 'cb' function
	// thus resolving this function as with the result of the 'cb'
	const resultStream = new Subject<R>();

	let timeout: NodeJS.Timeout | null = null;
	let subscription: Subscription | null = null;

	// Cue the 'cb' function to run as soon as the condition is met/resolved
	subscription = condition
		// We wish to prevent the subscription callback run on the same value multiple times.
		//
		// distinctUntilChanged() will turn this stream:
		// |-false--false--false--true--true-->
		// into:
		// |-false----------------true-------->
		.pipe(distinctUntilChanged())
		.subscribe((ready) => {
			// The condition is met, cancel the timeout and run the 'cb' function
			if (ready) {
				if (timeout) {
					clearTimeout(timeout);
				}
				// Unsubscribe from the condition stream as we need to run the 'cb' function only once.
				if (subscription) {
					subscription.unsubscribe();
				}
				cb().then((result) => {
					// Stream the result of the 'cb' function to the result stream
					// thus resolving the promise returned by this function
					resultStream.next(result);
				});
			} else {
				// If the condition is not met after 2 seconds, stop the execution and throw an error.
				// There can be only one timeout as we wish the function to timeout from the first run.
				if (!timeout) {
					timeout = setTimeout(() => {
						subscription?.unsubscribe();
						throw new Error("Error performing 'runWithcondition': Timed out");
					}, 5000);
				}
			}
		});

	// Return a promise from result stream, eventually resolving to the result of the 'cb' function
	return firstValueFrom(resultStream);
};

/**
 * New document stream is a helper function that creates a new observable stream
 * for a given document. Whenever the document changes, it will be passed to a selector (optional) and the result will be streamed to a subscriber.
 * If no selector is provided, it falls back to an identity function.
 * @param db pouchdb instance
 * @param id document id
 */
export const newDocumentStream = <M extends Record<string, any>>(db: PouchDB.Database, id: string, fallbackDoc: M = {} as M) =>
	new Observable<M>((subscriber) => {
		// Each subscription creates a new pouchdb change emitter
		// so that we can cancel the emitter when the subscription is cancelled.
		// This allows us to isolate the change emitter to a single subscription and make sure all
		// unused emitters are cancelled from.
		const emitter = newChangeEmitter<M>(db, id);

		const initialPromise = db
			.get<M>(id)
			.then((res) => {
				return res;
			})
			// This shouldn't really happen, but as an edge case, we don't want to break the entire app
			.catch((err) => {
				return fallbackDoc;
			});

		const initialState = from(initialPromise);
		const changeStream = newChangesStream<M>(emitter).pipe(map(({ doc }) => doc));

		concat(initialState, changeStream).subscribe((doc) => subscriber.next(doc));

		return () => emitter.cancel();
	});

export const newChangesStream = <Model extends Record<any, any>>(emitter: PouchDB.Core.Changes<Model>) =>
	new Observable<PouchDB.Core.ChangesResponseChange<Model>>((subscriber) => {
		emitter.on("change", (change) => {
			subscriber.next(change);
		});
		return () => emitter.cancel();
	});

/**
 * New change emitter creates a new pouchdb `changes` emitter for a given document id.
 * @param db pouchdb instance
 * @param id document id
 */
const newChangeEmitter = <M extends Record<string, unknown> = Record<string, unknown>>(db: PouchDB.Database, id: string) =>
	db.changes<M>({
		since: "now",
		live: true,
		include_docs: true,
		filter: (doc) => doc._id === id
	});

export const processId = (prefix: string, id: string) => {
	// If id is a single segment, just prefix it
	if (id.split("/").length === 1) {
		return [prefix, id].join("/");
	}

	// If id has more than one segment, make sure it's namespaced under the desired prefix
	if (id.startsWith(prefix)) {
		return id;
	}

	throw new Error("Id namespace mismatch:" + `  expected id to be prefixed with: ${prefix}` + `  id: ${id}`);
};
