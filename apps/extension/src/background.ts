import PouchDB from "pouchdb";

// #region context-menus
function createContextMenu(props: chrome.contextMenus.CreateProperties) {
	return new Promise<void>((resolve) => chrome.contextMenus.create(props, resolve));
}

async function setUpMenus() {
	await createContextMenu({
		id: "add-note",
		title: "Add Note",
		contexts: ["selection"]
	});

	await Promise.all(
		sections.map((s) =>
			createContextMenu({
				...s,
				parentId: "add-note",
				contexts: ["selection"]
			})
		)
	);
}

function tearDownMenus() {
	return new Promise<void>((resolve) => chrome.contextMenus.removeAll(resolve));
}
// #endregion context-menus

// #region db-connection
let db: PouchDB.Database | null = null;

async function connect() {
	chrome.action.disable();
	try {
		db = new PouchDB("http://admin:admin@127.0.0.1:4000/notario");
		await db.info();
		await setUpMenus();
		await turnOn();
	} catch {
		await tearDownMenus();
		await turnOff();
	} finally {
		chrome.action.enable();
	}
}

async function disconnect() {
	await tearDownMenus();
	db = null;
	isOn = false;
}

chrome.action.onClicked.addListener(() => {
	if (isOn) {
		disconnect();
	} else {
		connect();
	}
});
// #endregion db-connection

// #region on-off state
let isOn = false;

async function turnOn() {
	chrome.action.setIcon({ path: onIcon });
	isOn = true;
}

async function turnOff() {
	chrome.action.setIcon({ path: offIcon });
	isOn = false;
}
// #endregion on-off state

// #region add-note
interface Note {
	content: string;
	source: string;
}

function addNote(note: Note) {
	if (db === null) {
		return;
	}

	return db.put({
		_id: String(new Date()),
		...note
	});
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.parentMenuItemId === "add-note") {
		addNote({
			content: info.selectionText || "",
			source: tab?.title || ""
		});
	}
});
// #endregion add-note

// #region data
const offIcon = {
	"16": "../assets/notario16.png",
	"24": "../assets/notario24.png",
	"32": "../assets/notario32.png"
};

const onIcon = {
	"16": "../assets/notario-on16.png",
	"24": "../assets/notario-on24.png",
	"32": "../assets/notario-on32.png"
};

const sections = [
	{
		id: "abstract",
		title: "Abstract"
	},
	{
		id: "main",
		title: "Main"
	},
	{
		id: "summary",
		title: "Summary"
	}
];
// #endregion data
