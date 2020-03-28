var common = require("./webpack.config.js");
var merge = require("webpack-merge");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = merge(common, {
	mode: "production",
	plugins: [
		new CompressionPlugin({
			filename: "[path]",
		}),
	],
});
