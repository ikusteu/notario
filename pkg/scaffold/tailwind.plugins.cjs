module.exports = [
	function ({ addComponents }) {
		addComponents({
			".button": { "@apply px-4 py-1.5 text-lg": {} },
			".button-light-gray": { "@apply bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-200": {} },
			".button-gray": { "@apply bg-gray-400/50 text-gray-700": {} },
			".button-green": { "@apply bg-green-400 text-white hover:bg-green-500 active:bg-green-400": {} },
			".button-red": { "@apply bg-red-300 text-white hover:bg-red-400 active:bg-red-300": {} }
		});
	}
];
