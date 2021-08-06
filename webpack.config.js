var path = require("path");
var HtmlWebpackPlugin = require("html-webpack-plugin");
// var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
// 	.BundleAnalyzerPlugin;

module.exports = (env, argv) => ({
    entry:
        argv.mode === "production"
            ? "./www/src/cordova_entry.tsx"
            : "./www/src/web_entry.tsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "./www/dist"),
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
        contentBase: path.join(__dirname, "./www/dist"),
        compress: true,
        port: 3000,
    },
});
