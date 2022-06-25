import React, { PropsWithChildren, useMemo, useState } from 'react';
import { IMedia, IMediaStorage, typeOfFile } from '../@types/media';
import { Media } from '../media_classes/Media';

export const MediaStorageContext = React.createContext<IMediaStorage | null>(null);

const MediaStorageProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
	const [media, setMedia] = useState<IMedia[]>([])
	const getId = useMemo(() => {
		let curId = 0;
		return () => curId++;
	}, [])

	async function addFile(file: File) {

		let type: typeOfFile;
		const t = file.type.split("/")[0];
		if (t === "video" || t === "audio" || t === "image")
			type = t;
		else
			type = "undefined";


		if (type === 'video' || type === "audio") {
			// store mime for later

			var blob = new Blob([await file?.arrayBuffer()!], { type: file!.type }), // create a blob of buffer
				url = (URL || webkitURL).createObjectURL(blob), // create o-URL of blob
				video = document.createElement("video"); // create video element

			video.src = url; // start video load
			video.onloadedmetadata = () => {

				let newMedia: IMedia = new Media(type, file, getId(), Math.round(video.duration * 1000));
				setMedia([...media, newMedia]);
				URL.revokeObjectURL(url)
			}

		} else if (type === "image") {
			let newMedia: IMedia = new Media(type, file, getId(), undefined);
			setMedia([...media, newMedia]);
		}
	};

	function addFiles(files: File[]) {
		files.forEach(addFile);
	}
	function getById(id: number) {
		return media.find((e) => e.id === id);
	}
	function removeFile(file: number | IMedia) {
		if (typeof file === "number")
			setMedia(media.filter((e) => e.id !== file));
		else setMedia(media.filter((e) => e.id !== file.id));
	}
	return <MediaStorageContext.Provider value={{ addFile, removeFile, addFiles, media, getById }}>{children}</MediaStorageContext.Provider>;
};

export default MediaStorageProvider;