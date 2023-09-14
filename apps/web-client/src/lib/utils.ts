import type { Observable } from "rxjs";
import { readable, type Readable } from "svelte/store";

/**
 * Creates a svelte readable store from an observable stream.
 * @param observable observable stream
 * @returns readable store
 */
export const readableFromStream = <T>(observable: Observable<T> | undefined, fallback: T): Readable<T> => {
	return readable<T>(fallback, (set) => {
		if (!observable) {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			return () => {};
		}
		const observer = observable.subscribe((value) => {
			set(value || fallback);
		});
		return () => observer.unsubscribe();
	});
};
