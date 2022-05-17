const path = require("path");
// var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
// 	.BundleAnalyzerPlugin;

module.exports = (env, argv) => ({
    entry: "./src/entry.tsx",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "www"),
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
            {
                test: /\.(png|svg|jpg|jpeg)$/i,
                loader: "file-loader",
                options: {
                    name: "assets/icons/[name].[ext]",
                },
            },
            {
                test: /\.gif$/i,
                loader: "file-loader",
                options: {
                    name: "assets/gifs/[name].[ext]",
                },
            },
            {
                test: /\.(mp3|wav|ogg)$/i,
                loader: "file-loader",
                options: {
                    name: "assets/audio/[name].[ext]",
                },
            },
        ],
    },

    plugins: [
        // new BundleAnalyzerPlugin({
        // 	analyzerMode: "static",
        // }),
    ],
    devServer: {
        contentBase: path.join(__dirname, "./www"),
        compress: true,
        port: 3000,
    },
});
