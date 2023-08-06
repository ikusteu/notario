import { AddNoteMsg, MsgType } from "./types";

window.addEventListener("message", (event: MessageEvent<AddNoteMsg>) => {
	if (event.data.type === MsgType.AddNote) {
		chrome.runtime.sendMessage({
			type: MsgType.AddNote,
			source: event.origin,
			content: event.data.content
		});
	}
});
