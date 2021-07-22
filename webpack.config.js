var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
// var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
// 	.BundleAnalyzerPlugin;

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "./www/js"),
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

    plugins: [],
    devServer: {
        contentBase: path.join(__dirname, "./www"),
        compress: true,
        port: 3000,
    },
};
