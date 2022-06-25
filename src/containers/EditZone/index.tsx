import { useContext, useState } from "react";
import styles from "./index.module.css"
import AppStyles from "../../components/App/index.module.css"
import { MediaEditorContext } from "../../contexts/mediaEditorContext"
import { IEditedMedia, IMediaEditor, IMediaStorage } from "../../@types/media";
import { MediaStorageContext } from "../../contexts/mediaStorageContext";
import VisTrack from "../Track";
import Tracker from "../../components/Tracker";
import { Track } from "../../media_classes/Track";
import { Timer } from "../../utils/Timer";
import { Interval } from "../../utils/Interval";
function EditZone({ videoElement }: { videoElement: React.RefObject<HTMLVideoElement> }) {
	const editor = useContext(MediaEditorContext) as IMediaEditor
	const mediaStorage = useContext(MediaStorageContext) as IMediaStorage
	let [trackerPos, setTrackerPos] = useState(0);
	let [isPlaying, setPlayingState] = useState(false);
	let [isStopped, setStoppedState] = useState(true);
	let [mediaPlayers, setMediaPlayers] = useState<HTMLVideoElement[]>([])
	let [timeouts, setTimeouts] = useState<Timer[]>([])
	let [trackerIntervalStopper, setTrackerIntervalStopper] = useState<Timer>()
	let [trackerInterval, setTrackerInterval] = useState<Interval>()
	function onMouseStop(ev: MouseEvent) {
		//playTrack((ev.clientX - 3) * 100, 0, false);
	}
	function trackerMovementHandler(pos: number) {
		if (!isStopped) {
			stop();
		}
		setTrackerPos(pos)
	}

	function playTrack(intiailPos: number, index: number, needToPlay: boolean = true) {

		let current = 0;
		let track: Track;
		if (index === 0) {
			track = editor.videoTrack;
		} else {
			track = editor.audioTracks[index - 1];
		}
		if (track.duration > intiailPos) {
			let curtime = 0;
			for (const i of track.media) {
				if (intiailPos > curtime + i.getDuration()) {
					current++;
					curtime += i.getDuration();
				} else {
					break;
				}
			}
			playNextMedia(null, intiailPos - curtime);
		}
		async function playNextMedia(data: { player: HTMLVideoElement, durationToPlay: number } | null = null, start: number = 0) {
			if (data !== null) {
				if (track === editor.videoTrack) {
					data.player.id = AppStyles.videoPlayer
					document.getElementById(AppStyles.videoPlayer)!.replaceWith(data.player)
					data.player.muted = true
				}
				if (needToPlay) {
					current++
					data.player.play()
					if (current < track.media.length) {
						let newData = await createNewPlayer(track.media[current], start);
						timeouts[index] = new Timer(() => {
							(URL || webkitURL).revokeObjectURL(data.player.src);
							data.player.pause()
							playNextMedia(newData)
						}, data.durationToPlay)
					} else {
						timeouts[index] = new Timer(() => {
							data.player.pause();
							setMediaPlayers(mediaPlayers.filter((el) => el === data.player))
							setTimeouts(timeouts.filter((el) => el === timeouts[index]));
						}, data.durationToPlay)

					}
					setTimeouts([...timeouts])
				}
				mediaPlayers[index] = data.player;
				setMediaPlayers([...mediaPlayers]);
			} else {
				let newData = await createNewPlayer(track.media[current], start);
				playNextMedia(newData)

			}

			async function createNewPlayer(editedMedia: IEditedMedia, start: number) {
				let newPlayer = document.createElement("video")
				let type = editedMedia.media.type
				let durationToPlay = editedMedia.getDuration() - start;
				if (editedMedia.media.file === null) {
					return { durationToPlay, player: newPlayer };
				} else {
					let blob = new Blob([await editedMedia.media.file!.arrayBuffer()], { type: editedMedia.media.file!.type });
					let url = (URL || webkitURL).createObjectURL(blob);
					if (type === "image") {
						newPlayer.poster = url;
					} else {
						if (type === "audio" || type === "video") {
							newPlayer.src = url;
							newPlayer.load();
							newPlayer.currentTime = start / 1000;

							if (editedMedia.skiped !== null) {
								newPlayer.currentTime += (editedMedia.skiped / 1000)
							}
						}
					}
				}
				return { player: newPlayer, durationToPlay };
			}
		}
	}

	function play(pos: number) {

		if (!isStopped) {
			if (!isPlaying) {
				setPlayingState(true);
				mediaPlayers.forEach(e => e.play());
				timeouts.forEach(e => e.resume());
				trackerInterval?.resume()
				trackerIntervalStopper?.resume()

			}
		} else {
			setStoppedState(false)
			setPlayingState(true)
			let length = 0;
			if (editor.videoTrack.duration !== 0) {
				length = editor.videoTrack.duration;
				playTrack(pos, 0)
			}
			for (const i in editor.audioTracks) {
				mediaPlayers[i] = document.createElement("video");
				if (editor.audioTracks[i].duration > length)
					length = editor.audioTracks[i].duration;
				playTrack(pos, (+i) + 1)
			}
			setMediaPlayers([...mediaPlayers]);
			let trackerInt = new Interval(() => { setTrackerPos((last) => (last + 100)) }, 100)
			setTrackerInterval(trackerInt)
			setTrackerIntervalStopper(new Timer(() => {
				trackerInt.destroy();
				setTrackerIntervalStopper(undefined);
				setTrackerInterval(undefined)
				setTrackerPos(100)
				stop()
			}, length - pos))
		}
	}
	function stop() {
		if (trackerInterval) {
			trackerInterval.destroy()
			trackerIntervalStopper?.destroy()
			setTrackerInterval(undefined)
			setTrackerIntervalStopper(undefined)
		}
		for (const i of mediaPlayers) {
			i.pause();
		}
		console.log(timeouts);

		for (const i of timeouts) {
			i?.destroy()
		}


		(document.getElementById(AppStyles.videoPlayer)! as HTMLVideoElement).pause();
		setStoppedState(true)
		setMediaPlayers([])
		setTimeouts([]);
	}
	function pause() {
		if (trackerInterval) {
			trackerInterval.pause()
			trackerIntervalStopper?.pause()
		}
		for (const i of timeouts) {
			i?.pause()
		}
		for (const i of mediaPlayers) {
			i.pause();
		}
		(document.getElementById(AppStyles.videoPlayer)! as HTMLVideoElement).pause();
		setPlayingState(false)

	}
	const drop = (ev: React.DragEvent<HTMLDivElement>, track: number) => {
		let media = mediaStorage.getById(+ev.dataTransfer.getData("mediaId"))
		console.log(media, track);
		if (media) {
			switch (media.type) {
				case "image":
					editor.addImage(media, 5000)
					break;
				case "audio":
					editor.addAudio(media, track! - 1, null);
					break;
				case "video":
					editor.addVideo(media, null)
					break;
				default:
					break;
			}
		}
		stop()
		ev.preventDefault();
	}
	function render() {
		stop();
		let d = document.createElement("div")
		d.style.display = "flex";
		d.style.alignItems = "center"
		d.style.justifyContent = "center"
		d.style.position = "fixed"
		d.style.inset = "0";
		d.style.backgroundColor = "black"
		document.body.appendChild(d);
		editor.render(mediaStorage.media, d)
	}
	function removeSelected() {
		stop();
		editor.removeSelectedMedia()
	}
	function removeSelectedReplacment() {
		stop();
		editor.removeSelectedReplacment()
	}
	function split() {
		stop();
		editor.splitSelected(trackerPos)
	}
	return (
		<div id={styles.editZone}>
			<div id={styles.editZone_container}>
				<div id={styles.mediotr}>
					<div>
						<Tracker pos={trackerPos} setPos={trackerMovementHandler} onMouseStop={onMouseStop} />
						<VisTrack key={0} type={"video"} track={editor.videoTrack} onDrop={(ev) => drop(ev, 0)} />
						{
							editor.audioTracks.map((at, index) => <VisTrack type={"audio"} key={index + 1} track={at} onDrop={(ev) => drop(ev, index + 1)} />)
						}
					</div>
				</div>
			</div>
			<div id={styles.editZone_buttons}>
				<button onClick={render}>render</button>
				<button onClick={() => play(trackerPos)}>play</button>
				<button onClick={pause}>pause</button>
				<button onClick={removeSelected}>remove selected</button>
				<button onClick={removeSelectedReplacment}>remove selected with replacment</button>
				<button onClick={split}>split selected</button>
			</div>
		</div >

	)
}
export default EditZone;