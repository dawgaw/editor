import { IEditedMedia, IMedia } from "../@types/media";
import { Media } from "./Media";

class EditedMedia implements IEditedMedia {
	constructor(
		media: Media,
		id: number,
		duration: number | null = null,
		skiped: number | null = null,
	) {
		this.media = media;
		this.id = id;
		this.skiped = skiped;
		this.duration = duration;
		this.getDuration = this.getDuration.bind(this)
	}
	getDuration() {
		return (this.duration ?? this.media.duration!)
	}
	id: number;
	media: IMedia;
	skiped: number | null = null;
	duration: number | null;
}

export { EditedMedia };
