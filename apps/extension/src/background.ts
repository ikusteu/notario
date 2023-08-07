// #region db-connection
function connect() {
	// Returning a promise to simulate the async nature of db connection
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			// Create a right-click menu entry
			chrome.contextMenus.create({
				id: "add-note",
				title: "Add Note",
				contexts: ["selection"]
			});

			// Add sections to the right-click menu entry
			sections.forEach((s) =>
				chrome.contextMenus.create({
					...s,
					parentId: "add-note",
					contexts: ["selection"]
				})
			);

			return resolve();
		}, 1000);
	});
}

function disconnect() {
	return new Promise<void>((resolve) => {
		chrome.contextMenus.removeAll(resolve);
	});
}
// #endregion db-connection

// #region on-off state
let isOn = false;

async function turnOn() {
	// Disable the action while attempting to turn on
	chrome.action.disable();

	await connect();

	isOn = true;

	// Change the icon
	chrome.action.setIcon({ path: onIcon });
	chrome.action.enable();
}

async function turnOff() {
	chrome.action.disable();

	await disconnect();

	isOn = false;

	// Change the icon
	chrome.action.setIcon({ path: offIcon });
	chrome.action.enable();
}

chrome.action.onClicked.addListener(() => {
	chrome.action.disable();

	if (isOn) {
		turnOff();
	} else {
		turnOn();
	}
});
// #endregion on-off state

// #region add-note
interface Note {
	content: string;
	source: string;
}

const noteStore: Record<string, Note[]> = {
	abstract: [],
	main: [],
	summary: []
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.parentMenuItemId === "add-note") {
		noteStore[info.menuItemId].push({
			content: info.selectionText || "",
			source: tab?.title || ""
		});
	}

	console.log(sections);
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
