import React, { useContext } from "react";
import styles from "./index.module.css"
import { MediaItem } from "../../components/MediaItem";
import { MediaStorageContext } from "../../contexts/mediaStorageContext";
import { IMedia, IMediaEditor, IMediaStorage } from "../../@types/media";
import { MediaEditorContext } from "../../contexts/mediaEditorContext";
import { fetchFile } from "@ffmpeg/ffmpeg";

function MediaFilesContainer() {
	const mediaStorage = useContext(MediaStorageContext) as IMediaStorage
	const editor = useContext(MediaEditorContext) as IMediaEditor

	const dragOver = function (ev: React.DragEvent<HTMLDivElement>) {
		ev.preventDefault();
		ev.dataTransfer.dropEffect = "copy";
	}
	const drop = async (ev: React.DragEvent<HTMLDivElement>) => {
		ev.preventDefault();
		let files = [...ev.dataTransfer.files];
		mediaStorage.addFiles(files);
	}
	async function click(media: IMedia) {
		var mime = media.file!.type; // store mime for later

		var blob = new Blob([await media.file?.arrayBuffer()!], { type: mime }), // create a blob of buffer
			url = (URL || webkitURL).createObjectURL(blob), // create o-URL of blob
			video = document.createElement("video"); // create video element

		video.src = url; // start video load
		video.onloadedmetadata = () => console.log(video.duration)
		video.play();

	}
	return (
		<div onDrop={drop} onDragOver={dragOver} className={styles.MediaFilesContainer}>
			{mediaStorage.media.map(e => <MediaItem key={e.id} media={e} onclick={() => click(e)}></MediaItem>)}
		</div >
	)
}
export default MediaFilesContainer;