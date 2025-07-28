#
# /*
#  Copyright (C) THL A29 Limited, a Tencent company. All rights reserved.
#  SPDX-License-Identifier: Apache-2.0
#  */
#

# 拉取指定版本的PB文件，生成grpc-web代码
rm -rf chainmaker-pb-files grpc-web

git clone git@git.code.tencent.com:ChainMaker/pb.git chainmaker-pb-files
cd chainmaker-pb-files
git checkout v2.3.1.2_qc
cd ../
cp -r google chainmaker-pb-files

# 只读文件夹
src_path=chainmaker-pb-files
# 只读文件夹
out_path=grpc-web

import_style=import_style=commonjs,binary:
grpc_if=${src_path}/api/rpc_node.proto

# 根据proto文件生成JS/TS
function gen_protoc_js() {
    protoc \
        --proto_path=${src_path} \
        --js_out=${import_style}${out_path} \
        --grpc-web_out=import_style=commonjs+dts,mode=grpcweb:${out_path} $@
}

function gen_proto_js_all() {
        find ${src_path} -type f -name "*.proto" | while IFS= read -r fname; do
            gen_protoc_js $fname
        done
}

rm -rf $out_path?
rm -rf $src_path?
mkdir $out_path
gen_proto_js_all


# protoc --proto_path=/Users/liman/Desktop/chainmaker/chainmaker-smartplugin/web-sdk/chainmaker-pb-files/accesscontrol/ member.proto \
#     --js_out=import_style=commonjs:~/Desktop \
#     --grpc-web_out=import_style=commonjs,mode=grpcwebtext:~/Desktop