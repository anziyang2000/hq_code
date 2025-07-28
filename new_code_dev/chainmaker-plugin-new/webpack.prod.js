/*
 *
 *  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
 *  SPDX-License-Identifier: Apache-2.0
 *
 */

const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env = {}) => merge(common(env), {
  mode: "production", optimization: {
    minimize: true, minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          drop_debugger: true
        },
      }
    })]
  }
});
