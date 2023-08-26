export const waitFor = (cb: () => void | Promise<void>, timeout = 2000) => {
	return new Promise<void>((resolve, reject) => {
		let error: any = null;

		// Retry the assertion every 50ms
		const interval = setInterval(() => {
			// Run callback as a promise (this way we're able to .then/.catch regardless of the 'cb' being sync or async)
			(async () => cb())()
				.then(() => {
					if (interval) {
						clearInterval(interval);
					}
					resolve();
				})
				.catch((err) => {
					// Store the error to reject with later (if timed out)
					error = err;
				});
		}, 50);

		// When timed out, reject with the latest error
		setTimeout(() => {
			clearInterval(interval);
			reject(error);
		}, timeout);
	});
};
