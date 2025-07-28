/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = (env = {}) => ({
  entry: {
    popup: path.join(__dirname, "src/popup/index.tsx"),
    eventPage: path.join(__dirname, "src/event-page.ts"),
    contentScript: path.join(__dirname, "src/content-script.ts"),
    sdk: path.join(__dirname, "src/sdk.ts"),
    provider: path.join(__dirname, "src/provider.ts"),
  }, output: {
    path: path.join(__dirname, "dist/js"), filename: "[name].js"
  }, module: {
    rules: [{
      exclude: /node_modules/, test: /\.tsx?$/, use: "ts-loader"
    }, {
      exclude: /node_modules/, test: /\.less$/, use: [{
        loader: "style-loader", // Creates style nodes from JS strings
        options: {
          insertAt: 'bottom'
        },
      }, {
        loader: "css-loader" // Translates CSS into CommonJS
      }, {
        loader: "less-loader" // Compiles Less to CSS
      }]
    }, 
    {
      include: /node_modules/, test: /\.css$/, use: [{
        loader: "style-loader", // Creates style nodes from JS strings
        options: {
          insertAt: 'bottom'
        },
      }, {
        loader: "css-loader" // Translates CSS into CommonJS
      }]
    }, 
    {
      include: path.resolve(__dirname, './src/iconsvg'),
      test: /\.svg$/,
      use: [{
        loader: 'svg-sprite-loader',
      },
    ]
    },{
      include: path.resolve(__dirname, './src/'),
      test: /\.png$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
    ]
    }]
  }, resolve: {
    extensions: [".ts", ".tsx", ".js"]
  }, plugins: [new CopyPlugin({
    patterns: [{ from: "node_modules/tea-component/dist/tea-themeable.css", to: "../css/tea.css" }, 
      { from: "node_modules/tea-component/dist/themes/default-light.css", to: "../css/tea-theme.css" },{
      from: "src/img", to: "../img"
    }, { from: "src/popup.html", to: "../" }, { from: "src/options.html", to: "../" }, {
      from: "src/options-container.html",
      to: "../"
    },{
      from: "src/beacon_web.min.js",
      to: "../js"
    }],
  }), new webpack.DefinePlugin({
    CHAIN_MAKER: JSON.stringify(require('./package.json').chainMaker),
    PROD: env.prod
  })],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, 'src'),
      '@web-sdk': path.resolve(__dirname, 'src/web-sdk'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@popup': path.resolve(__dirname, 'src/popup'),
    },
    extensions: ['.tsx', '.ts', '.js']
  },
});


// const svgRule = config.module.rule('svg');
//     // 清除已有的所有 loader。
//     // 如果你不这样做，接下来的 loader 会附加在该规则现有的 loader 之后。
//     svgRule.uses.clear();
//     svgRule
//       .test(/\.svg$/)
//       .include.add(path.resolve(__dirname, './src/assets/svgs'))
//       .end()
//       .use('svg-sprite-loader')
//       .loader('svg-sprite-loader')
//       .options({
//         symbolId: 'icon-[name]',
//       });
//     const fileRule = config.module.rule('file');
//     fileRule.uses.clear();
//     fileRule
//       .test(/\.svg$/)
//       .exclude.add(path.resolve(__dirname, './src/assets/svgs'))
//       .end()
//       .use('file-loader')
//       .loader('file-loader');