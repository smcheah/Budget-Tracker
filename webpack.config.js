const WebpackPwaManifest = require("webpack-pwa-manifest");
const path = require('path');

const config = {
    entry: {
        app: "./public/index.js"
    },
    output: {
        path: `${__dirname}/public/dist`,
        filename: "[name].bundle.js"
    },
    mode: "development",
    module: {
        rules: [{
            test: /\.m?js$/,
            exclude: /(node_modules)/,
            use: {
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env"]
                }
            }
        }]
    },
    plugins: [
        new WebpackPwaManifest({
            inject: false,
            fingerprints: false,
            name: "Budget Tracker",
            short_name: "Budget Tracker",
            description: "Input your transactions to track, view and plan your budget!",
            background_color: "#ffffff",
            theme_color: "#ffffff",
            start_url: "/",
            display: "standalone",
            icons: [{
                src: path.resolve("public/icons/icon-192x192.png"),
                size: [72, 96, 128, 144, 152, 192, 384, 512]
            }]
        })
    ]
};

module.exports = config;