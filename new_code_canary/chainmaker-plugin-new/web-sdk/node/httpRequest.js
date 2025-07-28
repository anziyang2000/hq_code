// const requestParamsMaps = {
//   parametersList: 'parameters',
//   endorsersList: 'endorsers',
// };
const transformParams = ({ params, transformMaps = {}, transformer }) => {
  // const type = Object.prototype.toString.call(params);
  if (!params || typeof params !== 'object') return params;

  const results = Object.prototype.toString.call(params) === '[object Array]' ? [] : {};
  Object.keys(params).forEach((key) => {
    const targetKey = transformMaps[key] || (typeof transformer === 'function' && transformer(key));
    results[targetKey || key] = transformParams({ params: params[key], transformMaps, transformer });
  });
  return results;
};

const defaultResponse = {
  code: 0,
  message: '',
  txId: '',
  txTimestamp: 0,
  txBlockHeight: 0,
};

const responseTransformer = (params) => {
  const res = transformParams({
    params,
    transformer(key) {
      let newKey = '';
      key.split('_').forEach((ele, index) => {
        newKey += index > 0 ? ele[0].toUpperCase() + ele.substring(1) : ele;
      });
      return newKey;
    },
  });
  return Object.assign({}, defaultResponse, res);
};

export const sendHttpsRequest = (request, meta) =>
  new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('post', meta.url, true);
      xhr.setRequestHeader('content-type', 'application/json');
      const sendData = transformParams({
        params: request.toObject(),
        transformer(key) {
          return key.replace(/sList$/, 's');
        },
      });
      xhr.onerror = (err) => {
        console.error('onerror', err);
        reject(err);
      };
      xhr.onabort = (err) => {
        console.error('onerror', err);
        reject(err);
      };
      xhr.send(JSON.stringify(sendData));
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(responseTransformer(JSON.parse(xhr.responseText)));
        } else {
          reject(new Error(`xhr request failed,status:${xhr.status}`));
        }
      };
    } catch (error) {
      reject(error);
    }
  });
