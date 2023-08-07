interface Note {
	content: string;
	source: string;
}

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "add-note",
		title: "Add Note",
		contexts: ["selection"]
	});

	chrome.contextMenus.create({
		id: "abstract",
		parentId: "add-note",
		title: "Abstract",
		contexts: ["selection"]
	});
	chrome.contextMenus.create({
		id: "main",
		parentId: "add-note",
		title: "Main",
		contexts: ["selection"]
	});
	chrome.contextMenus.create({
		id: "summary",
		parentId: "add-note",
		title: "Summary",
		contexts: ["selection"]
	});
});

const sections: Record<string, Note[]> = {
	abstract: [],
	main: [],
	summary: []
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.parentMenuItemId === "add-note") {
		sections[info.menuItemId].push({
			content: info.selectionText || "",
			source: tab?.title || ""
		});
	}

	console.log(sections);
});

chrome.runtime.onMessage.addListener((e: any) => {
	console.log(e);
	return true;
});
