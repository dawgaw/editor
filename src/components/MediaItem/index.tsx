import React from "react";
import { FaFileVideo, FaFileAudio, FaFileImage } from 'react-icons/fa';
import { IMedia } from "../../@types/media";
import styles from "./index.module.css"

export function MediaItem({ onclick, media }: { onclick: () => Promise<void>, media: IMedia }) {
	const onDragStart = function (ev: React.DragEvent<HTMLDivElement>) {
		ev.dataTransfer?.setData("mediaId", media.id!.toString());
	}
	let type = media.type;
	let icon = (type === "audio" ? <FaFileAudio /> : (type === "video" ? <FaFileVideo /> : <FaFileImage />))
	return (
		<div onClick={onclick} className={styles.item} draggable onDragStart={onDragStart}>
			{icon}
			<p className={styles.item_name}>{media.file!.name + media.id}</p>
		</div>
	);
}
