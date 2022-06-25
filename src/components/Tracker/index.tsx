import { useMemo, useState } from "react";
import styles from "./index.module.css"
function Tracker({ pos, setPos, onMouseStop }: { pos: number, setPos: (pos: number) => void, onMouseStop: (ev: MouseEvent) => void }) {

	return (
		<div id={styles.tracker}
			style={{ left: ((pos / 100) + "px") }}
			onMouseDown={() => {
				let mouseHander = (ev: MouseEvent) => {
					if (ev.clientX > 3)
						setPos((ev.clientX - 3) * 100)
				}
				let mouseUpHandler = (ev: MouseEvent) => {
					document.removeEventListener("mousemove", mouseHander)
					document.removeEventListener("mouseup", mouseUpHandler)
					onMouseStop(ev);
				}
				document.addEventListener("mousemove", mouseHander)
				document.addEventListener("mouseup", mouseUpHandler)
			}}>
		</div >

	)
}
export default Tracker;