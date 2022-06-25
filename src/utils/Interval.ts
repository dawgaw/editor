class Interval {
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
			window.clearInterval(this.timerId);
			this.timerId = null;
		}
	};

	resume() {
		if (this.timerId) {
			return;
		}

		this.start = Date.now();
		this.timerId = window.setInterval(() => { this.start = Date.now(); this.callback() }, this.remaining);
	};
	destroy() {
		if (this.timerId) {
			window.clearInterval(this.timerId)
		}
	}
};

export { Interval }