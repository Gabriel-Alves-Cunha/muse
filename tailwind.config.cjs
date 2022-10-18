/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/renderer/**/*.{html,tsx}"],
	theme: {
		extend: {
			animation: { loading: "rotating 1s ease infinite" },
			keyframes: { rotating: { to: { transform: "rotate(1turn)" } } },
		},
		fontFamily: {
			secondary: ["Source Sans Pro", "sans-serif"],
			primary: ["Assistant", "sans-serif"],
		},
	},
	plugins: [],
};
