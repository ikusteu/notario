export enum MsgType {
	AddNote = "@@notario/add-note"
}

export interface AddNoteMsg {
	type: MsgType.AddNote;
	content: string;
}

export interface AddNoteAction {
	type: MsgType.AddNote;
	source: string;
	content: string;
}
