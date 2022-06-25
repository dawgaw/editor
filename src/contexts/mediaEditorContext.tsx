import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { IEditedMedia, IMedia, IMediaEditor } from '../@types/media';
import { EditedMedia } from '../media_classes/EditedMedia';
import { Track } from '../media_classes/Track';
import { createFFmpeg, fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import { Media } from '../media_classes/Media';

export const MediaEditorContext = React.createContext<IMediaEditor | null>(null);

const MediaEditorProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
	const [videoTrack, setVideoTrack] = useState<Track>(new Track())
	const [audioTracks, setAudioTracks] = useState<Track[]>([new Track()])
	const [selectedMedia, setSelectedMedia] = useState<{ track: Track, media: IEditedMedia, target: EventTarget & HTMLDivElement } | null>(null)
	const ffmpeg: FFmpeg = useMemo(() => createFFmpeg({ log: true, corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js" }), []);
	const getId = useMemo(() => {
		let curId = 0;
		return () => curId++;
	}, [])
	useEffect(() => {
		window.onbeforeunload = () => "are you sure";
		window.onunload = () => {
			if (ffmpeg.isLoaded())
				ffmpeg.exit();
		};
		ffmpeg.load();
	}, [])
	function setSelectedMediafn(item: { track: Track, media: IEditedMedia, target: EventTarget & HTMLDivElement }) {
		if (selectedMedia?.target !== item.target) {

			selectedMedia?.target.classList.remove("selected")
			item?.target.classList.add("selected")
		}
		setSelectedMedia(item)
	}
	async function addVideo(media: IMedia, duration: number | null = null) {
		let audiotracksCount = 0;
		ffmpeg.setLogger((e) => {
			if (/Audio/.test(e.message)) {
				audiotracksCount++;
				console.log(e.message);

			}
			if (/Stream.+ (\d+)x(\d+)/.test(e.message)) {
				let a = /Stream.+ (\d+)x(\d+)/.exec(e.message)!
				if (+a[1] !== 0)
					media.resolution = { x: +a[1], y: +a[2] }
			}
		})
		ffmpeg.FS("writeFile", `out.${getExt(media)}`, await fetchFile(media.file!))
		await ffmpeg.run("-i", `out.${getExt(media)}`);
		ffmpeg.FS("unlink", `out.${getExt(media)}`)
		ffmpeg.setLogger(() => { })

		let editedMedia = new EditedMedia(media, getId(), duration, null);
		let start = videoTrack.duration;
		videoTrack.push(editedMedia);



		for (let index = 0; index < audiotracksCount; index++) {

			let inserted = false;
			let newMedia = new Media(media.type, media.file, media.id, media.duration)
			newMedia.audioTrackIndex = index;
			let editedMediaAudio = new EditedMedia(newMedia, getId(), duration, null);

			for (const i of audioTracks) {
				if (i.insert(editedMediaAudio, start, getId)) {
					inserted = true
					break;
				}
			}
			if (!inserted) {
				let newtr = new Track();
				newtr.insert(editedMediaAudio, start, getId);
				audioTracks.push(newtr);
			}
		}
		setVideoTrack(new Track(videoTrack));
		setAudioTracks([...audioTracks]);
	}
	async function addImage(media: IMedia, duration: number) {
		ffmpeg.setLogger((e) => {

			if (/Stream.+ (\d+)x(\d+)/.test(e.message)) {

				let a = /Stream.+ (\d+)x(\d+)/.exec(e.message)!
				media.resolution = { x: +a[1], y: +a[2] }
			}
		})
		ffmpeg.FS("writeFile", `out.${getExt(media)}`, await fetchFile(media.file!))
		await ffmpeg.run("-i", `out.${getExt(media)}`);
		ffmpeg.FS("unlink", `out.${getExt(media)}`)
		ffmpeg.setLogger(() => { })
		console.log(media);
		let editedMedia = new EditedMedia(media, getId(), duration, null);
		videoTrack.push(editedMedia);
		setVideoTrack(new Track(videoTrack));
	}
	function addAudio(media: IMedia, trackIndex: number, duration: number | null = null) {

		let editedMedia = new EditedMedia(media, getId(), duration, null);
		audioTracks[trackIndex].push(editedMedia);
		setAudioTracks([...audioTracks]);
	}
	function removeSelectedMedia() {
		if (selectedMedia?.media) {
			selectedMedia.track.remove(selectedMedia.media.id, getId)
			selectedMedia?.target.classList.remove("selected")
			setSelectedMedia(null)
		}
	}
	function removeMedia(media: number | IEditedMedia) {
		let id: number;
		if (typeof media === "number") id = media;
		else id = media.id;

		videoTrack.remove(id, getId)
		setVideoTrack(new Track(videoTrack));

		for (const i in audioTracks) {
			audioTracks[i].remove(id, getId)
			setAudioTracks([...audioTracks]);
		}
	}
	function splitSelected(pos: number) {
		if (selectedMedia) {
			let currentTime = 0;
			for (const i of selectedMedia.track.media) {
				if (i !== selectedMedia.media)
					currentTime += i.getDuration();
				else
					break;
			}

			if ((selectedMedia.media.getDuration() + currentTime > pos) && currentTime < pos) {
				selectedMedia.track.splitItem(selectedMedia.media, pos - currentTime, getId);
				setSelectedMedia(null)
			}
		}
	}
	function getExt(m: IMedia) {
		return m.file!.name.split(".").pop()
	}
	async function render(allMedia: IMedia[], div: HTMLDivElement) {
		let label = document.createElement("label")
		let input = document.createElement("input")
		let btn = document.createElement("button")
		input.style.color = "black"
		label.innerText = "fps";
		label.appendChild(input);
		div.appendChild(label)
		btn.textContent = "ok";
		btn.style.backgroundColor = "black"
		div.appendChild(btn)
		btn.onclick = async () => {
			div.removeChild(btn)
			div.removeChild(label)
			let sizex = 0, sizey = 0, fps = 60;
			for (const i of videoTrack.media) {
				if (i.media.file) {
					if (sizex < i.media.resolution!.x)
						sizex = i.media.resolution!.x
					if (sizey < i.media.resolution!.y)
						sizey = i.media.resolution!.y
				}
			}

			let maxLength = videoTrack.duration;
			for (const i of audioTracks) {
				if (i.duration > maxLength)
					maxLength = i.duration;
			}
			if (videoTrack.duration < maxLength)
				videoTrack.push(new EditedMedia(new Media("image", null, null, undefined), getId(), maxLength - videoTrack.duration))
			for (const i of audioTracks) {
				if (i.duration < maxLength)
					i.push(new EditedMedia(new Media("image", null, null, undefined), getId(), maxLength - i.duration))
			}


			for (const i of allMedia) {
				ffmpeg.FS("writeFile", `i${i.id}.${getExt(i)}`, await fetchFile(i.file!))
			}

			let allinputs = [];
			let mediaMap = [];
			let curIndex = 0;

			for (const i in videoTrack.media) {
				let cur = videoTrack.media[i];
				if (cur.media.file) {
					if (cur.media.type === 'image') {
						//allinputs.push("-loop", "1", "-i", `i${cur.media.id}.${getExt(cur.media)}`, "-c:v", "ibx264", "-t", `${cur.getDuration()}ms`, "pix_fmt", "yuv420p");
					} else
						//trim=start=${cur.skiped ?? 0}ms:duration=${cur.getDuration()},
						allinputs.push("-ss", `${cur.skiped ?? 0}ms`, "-to", `${(cur.skiped ?? 0) + cur.getDuration()}ms`, "-i", `i${cur.media.id}.${getExt(cur.media)}`,);
					mediaMap[cur.id] = curIndex++;
				}
			}
			for (const track of audioTracks) {
				for (const i in track.media) {
					let cur = track.media[i];
					if (cur.media.file) {
						allinputs.push("-ss", `${cur.skiped ?? 0}ms`, "-to", `${(cur.skiped ?? 0) + cur.getDuration()}ms`, "-i", `i${cur.media.id}.${getExt(cur.media)}`);
						mediaMap[cur.id] = curIndex++;
					} else {
						allinputs.push("-f", "lavfi", "-t", `${cur.duration}ms`, "-i", "anullsrc")
						mediaMap[cur.id] = curIndex++;
					}
				}
			}

			let filterArgs = ["-filter_complex"]
			let filter = ""// `nullsrc=s=${sizex}x${sizey}`
			for (const i in videoTrack.media) {
				let cur = videoTrack.media[i];
				if (cur.media.file) {
					filter += `[${mediaMap[cur.id]}:v:0]pad=${sizex}:${sizey}:-1:-1:color=black,framerate=fps=${fps}[vsf${mediaMap[cur.id]}];`;
				}
				else {
					mediaMap[cur.id] = curIndex++;
					filter += `color=c=Black:s=${sizex}x${sizey}:duration=${cur.duration}ms:rate=${fps}[vsf${mediaMap[cur.id]}];`;
				}
			}


			for (const tracki in audioTracks) {
				for (const i in audioTracks[tracki].media) {
					let cur = audioTracks[tracki].media[i];
					if (cur.media.file) {
						if (cur.media.type === "video")
							filter += `[${mediaMap[cur.id]}:a:${cur.media.audioTrackIndex}]`
						else
							filter += `[${mediaMap[cur.id]}:a:0]`
					} else {
						filter += `[${mediaMap[cur.id]}]`
					}
				}
				filter += `concat=n=${audioTracks[tracki].media.length}:v=0:a=1[outa${tracki}];`
			}
			for (const tracki in audioTracks) {
				filter += `[outa${tracki}]`
			}
			filter += `amix=inputs=${audioTracks.length}:duration=first:dropout_transition=0[outa];`

			for (const i in videoTrack.media) {
				let cur = videoTrack.media[i];
				filter += `[vsf${mediaMap[cur.id]}]`;
			}
			filter += `concat=n=${videoTrack.media.length}:v=1[outv]`
			filterArgs.push(filter, "-map", "[outv]", "-map", "[outa]")
			allinputs.push(...filterArgs, "out.mp4")
			ffmpeg.setLogger((ev) => {
				div.innerText = ev.message;
			})

			await ffmpeg.run(...allinputs);
			let data = ffmpeg.FS("readFile", "out.mp4")
			let url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
			let video = document.createElement("video");
			video.controls = true
			div.innerText = ""
			video.src = url;
			video.style.maxHeight = "100%"
			video.style.maxWidth = "100%"
			div.appendChild(video);
			video.onclick = (ev) => ev.stopPropagation()
			div.onclick = () => document.body.removeChild(div)
		}
	}
	function removeSelectedReplacment() {
		if (selectedMedia?.media) {
			selectedMedia.track.removeReplacment(selectedMedia.media.id, getId)
			selectedMedia?.target.classList.remove("selected")
			setSelectedMedia(null)
		}
	}
	return <MediaEditorContext.Provider value={{ removeSelectedReplacment, ffmpeg, render, splitSelected, removeMedia, removeSelectedMedia, selectedMedia, setSelectedMedia: setSelectedMediafn, audioTracks, videoTrack, addAudio, addImage, addVideo }}>{children}</MediaEditorContext.Provider>;
};

export default MediaEditorProvider;