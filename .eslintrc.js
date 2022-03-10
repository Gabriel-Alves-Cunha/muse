// eslint-disable-next-line no-undef
module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		"plugin:@typescript-eslint/recommended",
		"plugin:react-hooks/recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"eslint:recommended",
		"prettier",
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		sourceType: "module",
		ecmaVersion: 13,
	},
	plugins: ["react", "@typescript-eslint", "react-hooks"],
	rules: {
		"react-hooks/rules-of-hooks": "error",
		"react-hooks/exhaustive-deps": "warn",
		"@typescript-eslint/ban-ts-comment": [
			"error",
			{ "ts-ignore": "allow-with-description" },
		],
		quotes: ["error", "double"],
		semi: ["error", "always"],
		"no-unused-vars": "off",
		"no-undef": "off",
	},
	settings: {
		react: {
			version: "detect",
		},
	},
};
