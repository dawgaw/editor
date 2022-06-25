import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Track } from "../media_classes/Track";

export type typeOfFile = "video" | "audio" | "image" | "undefined";

export interface IMedia {
	id: number | null;
	file: File | null;
	type: typeOfFile;
	duration: number | undefined;
	audioTrackIndex: number | undefined
	resolution: { x: number, y: number } | undefined
}
export interface IEditedMedia {
	id: number;
	media: IMedia;
	skiped: number | null = null;
	duration: number | null;
	getDuration: () => number
}

export interface IMediaStorage {
	media: IMedia[];
	addFile: (file: File) => void;
	getById: (id: number) => IMedia | undefined;
	addFiles: (files: File[]) => void;
	removeFile: (file: IMedia | number) => void;
}
export interface IMediaEditor {
	ffmpeg: FFmpeg;
	render(allMedia: IMedia[], div: HTMLDivElement): void;
	addImage(media: IMedia, duration: number): void
	addVideo(media: IMedia, duration: number | null = null): void;
	addAudio(media: IMedia, trackIndex: number, duration: number | null = null): void
	audioTracks: Track[];
	videoTrack: Track;
	selectedMedia: { track: Track, media: IEditedMedia, target: EventTarget & HTMLDivElement } | null;
	setSelectedMedia(item: { track: Track, media: IEditedMedia, target: EventTarget & HTMLDivElement } | null)
	removeSelectedMedia(): void
	removeSelectedReplacment(): void
	removeMedia(media: IEditedMedia | number): void;
	splitSelected(pos: number): void;
}
