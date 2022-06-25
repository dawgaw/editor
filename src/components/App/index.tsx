import React, { useRef } from "react";
import styles from "./index.module.css"
import MediaFilesContainer from "../../containers/MediaFilesContainer";
import MediaStorageProvider from "../../contexts/mediaStorageContext"
import EditZone from "../../containers/EditZone";
import MediaEditorProvider from "../../contexts/mediaEditorContext";



function App() {

	let videoElement = useRef<HTMLVideoElement>(null);
	return (
		<MediaEditorProvider>
			<MediaStorageProvider>
				<div id={styles.main}>
					<header id={styles.appBar}>
						<h1 id={styles.appBar_title}>VidEd</h1>
					</header>
					<div id={styles.containerForvideoAndFiles}>
						<MediaFilesContainer />
						<video ref={videoElement} id={styles.videoPlayer} controls />
					</div>
					<div id={styles.editZone}>
						<EditZone videoElement={videoElement} />
					</div>
				</div>
			</MediaStorageProvider>
		</MediaEditorProvider>
	);
}

export default App;
