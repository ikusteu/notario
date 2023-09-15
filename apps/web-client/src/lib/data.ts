export const projects = ["Discertation", "Case Study: 1"].map((name) => ({
	name,
	href: "",
	current: false
}));

export const resources = [
	"High frequency trading",
	"Does Algorythmic Trading Improve Liquidity",
	"Foucault (2023)",
	"High Frequency Trading and Price Discovery"
].map((name) => ({
	name,
	href: "",
	current: false
}));

export const notes = [
	{
		id: "note-1",
		content:
			"High-frequency trading (HFT) has revolutionized the way financial markets operate, offering quicker trade executions and drastically reducing the time it takes for new information to be incorporated into prices. HFT, in many cases, has increased the availability of liquidity by narrowing bid-ask spreads and providing more depth in order books.",
		resourceName: "Menkveld 2011",
		resourceURL: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1967574"
	},
	{
		id: "note-2",
		content:
			"There's a counter-argument that HFT can sometimes 'consume' liquidity. During periods of market stress, some HFT strategies may exacerbate price movements by quickly pulling out of the market, leading to a sudden drop in available liquidity.",
		resourceName: "Brogaard 2012",
		resourceURL: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1967574"
	},
	{
		id: "note-3",
		content:
			"Studies have indicated that market makers employing HFT strategies contribute significantly to short-term liquidity. However, the nature of this liquidity is ephemeral as it might vanish during episodes of high volatility.",
		resourceName: "Hasbrouck and Saar 2013",
		resourceURL: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1967574"
	},
	{
		id: "note-4",
		content:
			"Flash events, such as the 2010 Flash Crash, brought attention to potential pitfalls of HFT. There's a debate about whether HFT was the primary cause, but it's undeniable that such events raise concerns about the stability and reliability of HFT-provided liquidity.",
		resourceName: "Kirilenko et al. 2017",
		resourceURL: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1967574"
	},
	{
		id: "note-5",
		content:
			"The adaptive algorithms employed by HFT systems can quickly adjust to market conditions. While this allows them to protect their own positions, it can sometimes result in a feedback loop where multiple HFT systems respond in a way that amplifies market moves, potentially harming market liquidity.",
		resourceName: "Farmer and Skouras 2018",
		resourceURL: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1967574"
	}
];

export const noteLookup = new Map(notes.map((note) => [note.id, note] as [string, typeof note]));

const createSubsections = (sectionId: string) => [
	{
		id: `${sectionId}-subsection-1`,
		name: "This is a long subsection name to test the UI when wrapping the name, ,long as it is... 1",
		notes: ["note-1", "note-2"]
	},
	{ id: `${sectionId}-subsection-2`, name: "Subsection 2", notes: ["note-3", "note-4"] },
	{ id: `${sectionId}-subsection-3`, name: "Subsection 3", notes: ["note-5"] }
];

export const sections = [
	{ id: "intro", name: "Intro", notes, subsections: createSubsections("intro") },
	{ id: "met", name: "Methodology", notes, subsections: createSubsections("met") },
	{ id: "res", name: "Results", notes, subsections: createSubsections("res") },
	{ id: "conc", name: "Conclusion", notes, subsections: createSubsections("conc") }
];

export const createRoutes = (projectId: string) => [
	{
		label: "Sections",
		href: `/project/${projectId}/sections`
	},
	{
		label: "Subsections",
		href: `/project/${projectId}/subsections`
	}
];
