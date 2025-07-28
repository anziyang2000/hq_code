/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Contract } = require('fabric-contract-api');
const _ = require('lodash');
const { contractCode, uuidPrefix } = require('../const/constants');
const errorObj = require('./error');
const Ajv = require('ajv');

class verify extends Contract {
    constructor() {
        super();
        this.ErrorObj = new errorObj();
        // this.ajv = new Ajv();
    }

    // 将两个 js 对象的相同的属性名的值赋值(obj2 的值赋值给 obj1中的相同属性名的)
    // 允许在对象中查找并更新键值对，如果未找到相应键，则添加新的键值对(更灵活)
    // obj1 是规定的顺序
    // mergeDeep(obj1, obj2) {
    //     // Deep copy obj1
    //     let result = _.cloneDeep(obj1);

    //     // Define updateDeep function
    //     function updateDeep(obj, key, value) {
    //         for (let k in obj) {
    //             if (obj.hasOwnProperty(k)) {
    //                 if (k === key) {
    //                     // Find the matching key and update the value
    //                     obj[k] = value;
    //                     return true; // Mark as found and update
    //                 }

    //                 if (typeof obj[k] === 'object' && obj[k] !== null) {
    //                     // If the value is an object, search recursively
    //                     if (updateDeep(obj[k], key, value)) {
    //                         return true; // If found in the child object, exit the current loop
    //                     }
    //                 }
    //             }
    //         }
    //         return false; // If no matching key is found, return false
    //     }

    //     for (let key in obj2) {
    //         if (obj2.hasOwnProperty(key)) {
    //             if (updateDeep(result, key, obj2[key])) {
    //                 // If the value is found and updated, no need to continue searching
    //                 continue;
    //             }
    //             // If no matching key is found in result
    //             if (Object.keys(result).indexOf(key) === -1) {
    //                 // Add attributes directly to result
    //                 result[key] = obj2[key];
    //             }
    //         }
    //     }

    //     return result; // 返回更新后的 result
    // }
    mergeDeep(obj1, obj2) {
        // 深度拷贝 obj1
        let result = _.cloneDeep(obj1);

        // 定义递归函数
        function updateDeep(target, source) {
            for (let key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null) {
                        // 如果 source[key] 是对象，则继续递归
                        if (typeof target[key] === 'object' && target[key] !== null) {
                            // 如果 target[key] 也是对象，则继续递归
                            updateDeep(target[key], source[key]);
                        } else {
                            // 如果 target[key] 不是对象，则直接复制
                            target[key] = _.cloneDeep(source[key]);
                        }
                    } else {
                        // 如果 source[key] 不是对象，则直接赋值
                        target[key] = source[key];
                    }
                }
            }
        }

        // 调用递归函数
        updateDeep(result, obj2);

        return result; // 返回更新后的 result
    }

    // 检查两个 js 对象所有层级的属性名必须相同(意外的和缺失的都报错)，且属性值的数据类型必须一致
    // structure 是规定的结构
    validateStructure(obj, structure, path = '') {
        if (typeof obj !== typeof structure) {
            throw this.ErrorObj.createError(
                contractCode.businessError.type,
                `validateStructure: Type mismatch at ${path}: expected ${typeof structure}, got ${typeof obj}`
            );
        }

        if (typeof structure === 'object') {
            if (Array.isArray(structure)) {
                if (!Array.isArray(obj)) {
                    throw this.ErrorObj.createError(
                        contractCode.businessError.type,
                        `validateStructure: Type mismatch at ${path}: expected array, got ${typeof obj}`
                    );
                }
                obj.forEach((item, index) => this.validateStructure(item, structure[0], `${path}[${index}]`));
            } else {
                // Check for extra properties
                for (const key in obj) {
                    if (!structure.hasOwnProperty(key)) {
                        throw this.ErrorObj.createError(
                            contractCode.businessError.type,
                            `validateStructure: Unexpected property ${key} at ${path}`
                        );
                    }
                }
                for (const key in structure) {
                    if (!obj.hasOwnProperty(key)) {
                        throw this.ErrorObj.createError(
                            contractCode.businessError.type,
                            `validateStructure: Missing property ${key} at ${path}`
                        );
                    }
                    this.validateStructure(obj[key], structure[key], path ? `${path}.${key}` : key);
                }
            }
        }
    }

    // 这个函数是封装的 ajv 的使用
    validateData(schema, data) {
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const valid = validate(data);
        if (!valid) {
            console.log('### validate_errors', validate.errors);
            throw this.ErrorObj.createError(
                contractCode.businessError.type,
                `validateData error: Property: ${validate.errors[0].instancePath}, Message: ${validate.errors[0].message}`
            );
        }
    }

    // 只允许在 obj1 中存在的键进行更新，不允许添加新键，且类型必须匹配(更严格)
    mergeDeep2(obj1, obj2, path = '') {
        // 深拷贝 obj1
        let result = _.cloneDeep(obj1);

        // 定义updateDeep函数
        function updateDeep(obj1, obj2, path) {
            for (let key in obj2) {
                if (obj2.hasOwnProperty(key)) {
                    const newPath = path ? `${path}.${key}` : key;

                    if (obj1.hasOwnProperty(key)) {
                        // 如果类型不同，抛出错误
                        if (typeof obj1[key] !== typeof obj2[key]) {
                            throw this.ErrorObj.createError(
                                contractCode.businessError.type,
                                `Type mismatch at ${newPath}: expected ${typeof obj1[key]}, got ${typeof obj2[key]}`
                            );
                        }

                        // 如果值是对象，递归检查
                        if (typeof obj1[key] === 'object' && obj1[key] !== null && typeof obj2[key] === 'object' && obj2[key] !== null) {
                            updateDeep(obj1[key], obj2[key], newPath);
                        } else {
                            // 更新值
                            obj1[key] = obj2[key];
                        }
                    } else {
                        // 抛出一个错误，指示没有找到匹配的键
                        throw this.ErrorObj.createError(
                            contractCode.businessError.notFound,
                            `Key '${key}' not found at path '${newPath}' in the result object.`
                        );
                    }
                }
            }
        }

        updateDeep(result, obj2, path);

        return result; // 返回更新后的 result
    }

    // 用于检查字符串变量不可以为空
    checkFieldsNotEmpty(fields) {
        Object.entries(fields).forEach(([name, value]) => {
            if (!value || !value.trim()) {
                throw this.ErrorObj.createError(
                    contractCode.businessError.notFound,
                    `checkFieldsNotEmpty: ${name} should not be empty`
                );
            }
        });
    }

    checkObjectNotEmpty(object, objectName) {
        if (!object || Object.keys(object).length === 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.notFound,
                `checkObjectNotEmpty: ${objectName} should not be empty`
            );
        }
    }

    validateArray(input, name) {
        if (!Array.isArray(input)) {
            throw this.ErrorObj.createError(
                contractCode.businessError.type,
                `validateArray: ${name} is not an array`
            );
        }
    }

    // 检查 UUID 是否存在
    async checkUUIDExists(ctx, uuid) {
        const uuidKey = uuidPrefix + uuid;
        const uuidExists = await ctx.stub.getState(uuidKey);

        if (uuidExists && uuidExists.length > 0) {
            throw this.ErrorObj.createError(
                contractCode.businessError.conflict,
                `The UUID ${uuid} already exists`
            );
        }
    }

}

module.exports = verify;