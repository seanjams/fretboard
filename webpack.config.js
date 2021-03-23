var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
// var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
// 	.BundleAnalyzerPlugin;

module.exports = {
	entry: "./src/index.tsx",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "./dist"),
	},

	resolve: {
		// Add '.ts', '.tsx', and '.js' as resolvable extensions.
		extensions: [".ts", ".tsx", ".js"],
	},

	module: {
		rules: [
			{
				test: /.ts(x?)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader",
					},
				],
			},
			{
                test: /\.css$/,
                include: /node_modules/,
                use: ["style-loader", "css-loader"],
            },
		],
	},

	plugins: [
		new HtmlWebpackPlugin({
			title: "Fretboard",
			inject: "head",
		}),
		// new BundleAnalyzerPlugin({
		// 	analyzerMode: "static",
		// }),
	],
	devServer: {
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		port: 3000,
	},
};
