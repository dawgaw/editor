import { IMedia, typeOfFile } from "../@types/media";

class Media implements IMedia {
	constructor(type: typeOfFile, file: File | null, id: number | null, duration: number | undefined) {
		this.id = id;
		this.file = file;
		this.type = type
		this.duration = duration
	}
	resolution: { x: number, y: number } | undefined
	audioTrackIndex: number | undefined;
	duration: number | undefined;
	type: typeOfFile;
	id: number | null;
	file: File | null;
}
export { Media };
