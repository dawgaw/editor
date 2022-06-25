
import styles from "./index.module.css"
import { IMediaEditor, typeOfFile } from "../../@types/media";
import { MediaEditorContext } from "../../contexts/mediaEditorContext";
import { useContext } from "react";
import { Track } from "../../media_classes/Track";
import { FaFileAudio, FaFileVideo } from "react-icons/fa";
const VisTrack: React.FC<{ track: Track, type: typeOfFile, onDrop: (ev: React.DragEvent<HTMLDivElement>) => void }> = ({ track, type, onDrop: onDrag }) => {
	const editor = useContext(MediaEditorContext) as IMediaEditor
	const dragOver = function (ev: React.DragEvent<HTMLDivElement>) {
		ev.preventDefault();
		ev.dataTransfer.dropEffect = "copy";
	}
	let icon = (type === "audio" ? <FaFileAudio size={42} /> : <FaFileVideo size={42} />)
	return (
		<div className={styles.track} onDrop={onDrag} onDragOver={dragOver}>

			{
				track.media.map(m =>
					<div
						onClick={(ev) => { editor.setSelectedMedia({ media: m, track, target: ev.currentTarget }); }}
						key={m.id} style={{ width: (m.getDuration() / 100) + "px" }}
						className={styles.media}>
						{m.media.file !== null ? m.media.file.name : ""}
					</div>)
			}
		</div >
	)
}
export default VisTrack;