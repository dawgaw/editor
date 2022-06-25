class Timer {
	callback: () => void;

	constructor(callback: () => void, delay: number) {
		this.callback = callback;
		this.remaining = delay;
		this.timerId = null;
		this.start = 0;
		this.resume();
	}
	timerId: number | null;
	start: number;
	remaining: number;

	pause() {
		if (this.timerId) {
			window.clearTimeout(this.timerId);
			this.timerId = null;
			this.remaining -= Date.now() - this.start;
		}
	};

	resume() {
		if (this.timerId) {
			return;
		}

		this.start = Date.now();
		this.timerId = window.setTimeout(this.callback, this.remaining);
	};
	destroy() {
		if (this.timerId) {
			window.clearTimeout(this.timerId)
		}
	}
};

export { Timer }