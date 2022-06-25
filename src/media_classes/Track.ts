import { IEditedMedia } from "../@types/media";
import { EditedMedia } from "./EditedMedia";
import { Media } from "./Media";


class Track {
	media: IEditedMedia[];

	constructor(track: Track | null = null) {
		if (track) {
			this.duration = track.duration;
			this.media = track.media;
		} else {
			this.duration = 0
			this.media = []
		}
	}

	push(item: IEditedMedia): number {
		this.duration += item.getDuration();
		return this.media.push(item);
	}
	addBefore(item: IEditedMedia, id: number) {
		let i = this.media.findIndex((e) => e.id === id);
		let newMedia = this.media.slice(0, i);
		newMedia.push(item);
		newMedia.push(...this.media.slice(i))
		this.media = newMedia;
		this.duration += item.getDuration()
	}
	addAfter(item: IEditedMedia, id: number) {
		let i = this.media.findIndex((e) => e.id === id);
		let newMedia = this.media.slice(0, i + 1);
		newMedia.push(item);
		newMedia.push(...this.media.slice(i + 1))
		this.media = newMedia;
		this.duration += item.getDuration()
	}
	insert(media: IEditedMedia, start: number, getId: () => number): boolean {
		let curtime = 0;
		let end = start + media.getDuration()

		for (let i = 0; i < this.media.length; i++) {
			let is = curtime;


			let ie = (curtime += this.media[i].getDuration());

			if (end >= is && ie > start) {
				if (end > ie)
					return false

				if (this.media[i].media.file !== null) {
					return false

				} else {
					let newMedia = this.media.slice(0, i);

					if (is !== start) {
						let before: IEditedMedia = new EditedMedia(new Media(media.media.type, null, null, undefined), getId(), start - is, null);
						newMedia.push(before);
					}
					if (ie !== end) {
						let after: IEditedMedia = new EditedMedia(new Media(media.media.type, null, null, undefined), getId(), ie - end, null);
						newMedia.push(after);
					}
					newMedia.push(media);
					newMedia.push(...this.media.slice(i + 1));
					this.media = newMedia;
					return true;
				}
			}

		}

		if (start - this.duration > 0) {
			let before: IEditedMedia = new EditedMedia(new Media(media.media.type, null, null, undefined), getId(), start - this.duration, null);
			console.log(before.getDuration());
			this.media.push(before)
		}
		this.media.push(media)
		this.duration += end - curtime
		return true;
	}
	splitItem(item: IEditedMedia, time: number, getId: () => number) {
		console.log(time, item.getDuration());

		let i = this.media.findIndex((e) => e.id === item.id);
		let newMedia = this.media.slice(0, i);
		if (item.media.type !== "image") {
			let firstpart = new EditedMedia(item.media, getId(), time, item.skiped);
			let secondpart = new EditedMedia(item.media, getId(), item.getDuration() - time, time + (item.skiped ?? 0));
			newMedia.push(firstpart, secondpart);

		} else {
			let firstpart = new EditedMedia(item.media, getId(), time);
			let secondpart = new EditedMedia(item.media, getId(), item.getDuration() - time);
			newMedia.push(firstpart, secondpart);
		}
		newMedia.push(...this.media.slice(i + 1))
		this.media = newMedia;
	}
	removeReplacment(id: number, getId: () => number) {
		let i = this.media.findIndex((e) => e.id === id);
		if (i !== -1) {
			if (i === this.media.length - 1) {
				let last = this.media.pop()!;
				this.duration -= last.getDuration();
				while (this.media.length > 0 && this.media[this.media.length - 1].media.file === null) {
					last = this.media.pop()!;
					this.duration -= last.getDuration();
				}
			} else {
				let countBehind = 0, countAfter = 0, mlength = 0;
				for (let j = i - 1; j >= 0; j--) {
					if (this.media[j].media.file === null) {
						countBehind++;
						mlength += this.media[j].getDuration()
					}
				}
				for (let j = i + 1; j < this.media.length; j++) {
					if (this.media[j].media.file === null) {
						countAfter++;
						mlength += this.media[j].getDuration()
					}
				}
				let newMedia = this.media.slice(0, i - countBehind)

				newMedia.push(...this.media.slice(i + countAfter + 1))
				this.media = newMedia;
			}
		}
	}
	remove(id: number, getId: () => number) {
		let i = this.media.findIndex((e) => e.id === id);
		if (i !== -1) {
			if (i === this.media.length - 1) {
				let last = this.media.pop()!;
				this.duration -= last.getDuration();
				while (this.media.length > 0 && this.media[this.media.length - 1].media.file === null) {
					last = this.media.pop()!;
					this.duration -= last.getDuration();
				}
			} else {
				let countBehind = 0, countAfter = 0, mlength = 0;
				for (let j = i - 1; j >= 0; j--) {
					if (this.media[j].media.file === null) {
						countBehind++;
						mlength += this.media[j].getDuration()
					}
				}
				for (let j = i + 1; j < this.media.length; j++) {
					if (this.media[j].media.file === null) {
						countAfter++;
						mlength += this.media[j].getDuration()
					}
				}
				let newMedia = this.media.slice(0, i - countBehind)
				let nMedia = new EditedMedia(new Media("image", null, null, undefined), getId(), mlength + this.media[i].getDuration())
				newMedia.push(nMedia);
				newMedia.push(...this.media.slice(i + countAfter + 1))
				this.media = newMedia;
			}
		}

	}
	duration: number;
}
export { Track };
