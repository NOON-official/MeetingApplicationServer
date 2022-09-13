const _ = require('lodash');

// Array를 전달하면 String으로 반환
// **주의** 배열 내의 요소는 ','를 포함하면 안됨
const toString = (a) => {
  return a.join(',');
};

// "a,b,c" 형태의 String을 전달하면 String의 Array로 반환
const toArrayOfString = (s) => {
  return s.split(',');
};

// "a,b,c" 형태의 String을 전달하면 Number의 Array로 반환
const toArrayOfNumber = (s) => {
  // 1. 배열로 변환
  s = s.split(',');

  // 2. Number 타입으로 변환
  return s.map((i) => {
    return Number(i);
  });
};

const isArray = function (a) {
  return Array.isArray(a);
};

const isObject = function (o) {
  return o === Object(o) && !isArray(o) && typeof o !== 'function';
};

// 객체 내 property의 자료형이 Array인 경우 String으로 변환
const arrayOfObjectToString = function (o) {
  if (isObject(o)) {
    const n = {};

    for (const [k, v] of Object.entries(o)) {
      if (isArray(v)) {
        n[k] = toString(v);
      } else {
        n[k] = v;
      }
    }

    return n;
  } else {
    return o;
  }
};

module.exports = {
  toString,
  toArrayOfString,
  toArrayOfNumber,
  arrayOfObjectToString,
};
