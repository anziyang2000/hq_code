export const isChinese = (str: string) => {
  var regex = /^[\u4E00-\u9FA5]+$/;
  if (!regex.test(str)) {
    return false;
  } else {
    return true;
  }
};

//判断字符串是否为数字和字母组合
export const isNumAlphabet = (nubmer: string) => {
  var re = /^[0-9a-zA-Z]*$/g;
  if (!re.test(nubmer)) {
    return false;
  } else {
    return true;
  }
};

export const isNumberRate = (number: string) => {
  var reg = /^\d{1,}$/;
  var re = new RegExp(reg);
  if (!re.test(number)) {
    return false;
  } else {
    return true;
  }
};
