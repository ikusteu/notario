/* eslint-disable @typescript-eslint/no-empty-function */
import { type Readable, derived } from "svelte/store";
import type { ChangeEventHandler } from "svelte/elements";

type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>] | Array<Readable<any>>;
type StoresValues<T> = T extends Readable<infer U>
	? U
	: {
			[K in keyof T]: T[K] extends Readable<infer U> ? U : never;
	  };

export const composeDestroy = (...callbacks: (() => void)[]) => ({
	destroy: callbacks.reduce(
		(acc, cb) => () => (acc(), cb()),
		() => {}
	)
});

export const applyDestroyListeners =
	<N extends HTMLElement>(node: N) =>
	(...listeners: Array<(node: N) => () => void>) =>
		listeners.reduce(
			(acc, l) => {
				const listener = l(node);
				return () => (acc(), listener());
			},
			() => {}
		);

export const click = (handler: () => void) => (node: HTMLElement) => {
	node.addEventListener("click", handler);
	return () => {
		node.removeEventListener("click", handler);
	};
};

export const change =
	<N extends HTMLElement>(handler: ChangeEventHandler<N>) =>
	(node: N) => {
		node.addEventListener("change", handler);
		return () => node.removeEventListener("change", handler);
	};

export const subscribeCondition = <S extends Stores>(
	stores: S,
	condition: (values: StoresValues<S>) => boolean,
	callback: ((v: boolean) => void) | undefined
) => derived(stores, condition).subscribe((c) => callback?.(c));

export const applyIf =
	<S extends Stores, N extends HTMLElement>(
		stores: S,
		condition: (values: StoresValues<S>) => boolean,
		registerEventListener: (node: N) => () => void
	) =>
	(node: N) => {
		const unregister = registerEventListener(node);
		const unsubscribe = derived(stores, condition).subscribe((c) => (c ? registerEventListener(node) : unregister()));

		return () => {
			unregister();
			unsubscribe();
		};
	};
