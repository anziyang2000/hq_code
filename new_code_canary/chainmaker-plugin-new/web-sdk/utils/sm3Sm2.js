/* eslint-disable */
const navigator = {}
const rs = require('jsrsasign');
const { CryptoJS, KJUR } = rs;

// sm3
(function () {
  const C = CryptoJS;
  const C_lib = C.lib;
  const { WordArray } = C_lib;
  const { Hasher } = C_lib;
  const C_algo = C.algo;
  const W = [];
  const SM3 = (C_algo.SM3 = Hasher.extend({
    _doReset() {
      this._hash = new WordArray.init([
        0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e,
      ]);
    },
    _doProcessBlock(M, offset) {
      const H = this._hash.words;
      let a = H[0];
      let b = H[1];
      let c = H[2];
      let d = H[3];
      let e = H[4];
      for (let i = 0; i < 80; i++) {
        if (i < 16) {
          W[i] = M[offset + i] | 0;
        } else {
          const n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
          W[i] = (n << 1) | (n >>> 31);
        }
        let t = ((a << 5) | (a >>> 27)) + e + W[i];
        if (i < 20) {
          t += ((b & c) | (~b & d)) + 0x5a827999;
        } else if (i < 40) {
          t += (b ^ c ^ d) + 0x6ed9eba1;
        } else if (i < 60) {
          t += ((b & c) | (b & d) | (c & d)) - 0x70e44324;
        } else {
          t += (b ^ c ^ d) - 0x359d3e2a;
        }
        e = d;
        d = c;
        c = (b << 30) | (b >>> 2);
        b = a;
        a = t;
      }
      H[0] = (H[0] + a) | 0;
      H[1] = (H[1] + b) | 0;
      H[2] = (H[2] + c) | 0;
      H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0;
    },
    _doFinalize() {
      const data = this._data;
      const dataWords = data.words;
      const nBitsTotal = this._nDataBytes * 8;
      const nBitsLeft = data.sigBytes * 8;
      dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - (nBitsLeft % 32));
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
      dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
      data.sigBytes = dataWords.length * 4;
      this._process();
      return this._hash;
    },
    clone() {
      const clone = Hasher.clone.call(this);
      clone._hash = this._hash.clone();
      return clone;
    },
  }));
  C.SM3 = Hasher._createHelper(SM3);
  C.HmacSM3 = Hasher._createHmacHelper(SM3);
})();





function SM3Digest() {
  this.BYTE_LENGTH = 64;
  this.xBuf = [];
  this.xBufOff = 0;
  this.byteCount = 0;
  this.DIGEST_LENGTH = 32;
  // this.v0 = [0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600, 0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e];
  // this.v0 = [0x7380166f, 0x4914b2b9, 0x172442d7, -628488704, -1452330820, 0x163138aa, -477237683, -1325724082];
  this.v0 = [1937774191, 1226093241, 388252375, -628488704, -1452330820, 372324522, -477237683, -1325724082];
  this.v = new Array(8);
  this.v_ = new Array(8);
  this.X0 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  this.X = new Array(68);
  this.xOff = 0;
  this.T_00_15 = 0x79cc4519;
  this.T_16_63 = 0x7a879d8a;
  if (arguments.length > 0) {
    this.InitDigest(arguments[0]);
  } else {
    this.Init();
  }
}
SM3Digest.prototype = {
  Init() {
    this.xBuf = new Array(4);
    this.Reset();
  },
  InitDigest(t) {
    this.xBuf = new Array(t.xBuf.length);
    Array.Copy(t.xBuf, 0, this.xBuf, 0, t.xBuf.length);
    this.xBufOff = t.xBufOff;
    this.byteCount = t.byteCount;
    Array.Copy(t.X, 0, this.X, 0, t.X.length);
    this.xOff = t.xOff;
    Array.Copy(t.v, 0, this.v, 0, t.v.length);
  },
  GetDigestSize() {
    return this.DIGEST_LENGTH;
  },
  Reset() {
    this.byteCount = 0;
    this.xBufOff = 0;
    Array.Clear(this.xBuf, 0, this.xBuf.length);
    Array.Copy(this.v0, 0, this.v, 0, this.v0.length);
    this.xOff = 0;
    Array.Copy(this.X0, 0, this.X, 0, this.X0.length);
  },
  GetByteLength() {
    return this.BYTE_LENGTH;
  },

  ProcessBlock() {
    let i;
    const ww = this.X;
    const ww_ = new Array(64);
    for (i = 16; i < 68; i++) {
      ww[i] = this.P1(ww[i - 16] ^ ww[i - 9] ^ roateLeft(ww[i - 3], 15)) ^ roateLeft(ww[i - 13], 7) ^ ww[i - 6];
    }
    for (i = 0; i < 64; i++) {
      ww_[i] = ww[i] ^ ww[i + 4];
    }
    const vv = this.v;
    const vv_ = this.v_;
    Array.Copy(vv, 0, vv_, 0, this.v0.length);
    let SS1;
    let SS2;
    let TT1;
    let TT2;
    let aaa;
    // roateLeft
    for (i = 0; i < 16; i++) {
      aaa = roateLeft(vv_[0], 12);

      SS1 = aaa + vv_[4] + roateLeft(this.T_00_15, i);
      SS1 = roateLeft(SS1, 7);
      SS2 = SS1 ^ aaa;
      TT1 = this.FF_00_15(vv_[0], vv_[1], vv_[2]) + vv_[3] + SS2 + ww_[i];
      TT2 = this.GG_00_15(vv_[4], vv_[5], vv_[6]) + vv_[7] + SS1 + ww[i];
      vv_[3] = vv_[2];
      vv_[2] = roateLeft(vv_[1], 9);
      vv_[1] = vv_[0];
      vv_[0] = TT1;
      vv_[7] = vv_[6];
      vv_[6] = roateLeft(vv_[5], 19);
      vv_[5] = vv_[4];
      vv_[4] = this.P0(TT2);
    }

    for (i = 16; i < 64; i++) {
      aaa = roateLeft(vv_[0], 12);
      SS1 = aaa + vv_[4] + roateLeft(this.T_16_63, i);
      SS1 = roateLeft(SS1, 7);
      SS2 = SS1 ^ aaa;
      TT1 = this.FF_16_63(vv_[0], vv_[1], vv_[2]) + vv_[3] + SS2 + ww_[i];
      TT2 = this.GG_16_63(vv_[4], vv_[5], vv_[6]) + vv_[7] + SS1 + ww[i];
      vv_[3] = vv_[2];
      vv_[2] = roateLeft(vv_[1], 9);
      vv_[1] = vv_[0];
      vv_[0] = TT1;
      vv_[7] = vv_[6];
      vv_[6] = roateLeft(vv_[5], 19);
      vv_[5] = vv_[4];
      vv_[4] = this.P0(TT2);
    }

    for (i = 0; i < 8; i++) {
      vv[i] ^= vv_[i];
    }
    this.xOff = 0;
    Array.Copy(this.X0, 0, this.X, 0, this.X0.length);
  },
  ProcessWord(in_Renamed, inOff) {
    let n = in_Renamed[inOff] << 24;
    n |= (in_Renamed[++inOff] & 0xff) << 16;
    n |= (in_Renamed[++inOff] & 0xff) << 8;
    n |= in_Renamed[++inOff] & 0xff;
    this.X[this.xOff] = n;
    if (++this.xOff == 16) {
      this.ProcessBlock();
    }
  },
  ProcessLength(bitLength) {
    if (this.xOff > 14) {
      this.ProcessBlock();
    }
    this.X[14] = this.URShiftLong(bitLength, 32);
    this.X[15] = bitLength & 0xffffffff;
  },
  IntToBigEndian(n, bs, off) {
    bs[off] = (n >>> 24) & 0xff;
    bs[++off] = (n >>> 16) & 0xff;
    bs[++off] = (n >>> 8) & 0xff;
    bs[++off] = n & 0xff;
  },
  DoFinal(out_Renamed, outOff) {
    this.Finish();
    for (let i = 0; i < 8; i++) {
      this.IntToBigEndian(this.v[i], out_Renamed, outOff + i * 4);
    }
    this.Reset();
    return this.DIGEST_LENGTH;
  },
  Update(input) {
    this.xBuf[this.xBufOff++] = input;
    if (this.xBufOff == this.xBuf.length) {
      this.ProcessWord(this.xBuf, 0);
      this.xBufOff = 0;
    }
    this.byteCount++;
  },
  BlockUpdate(input, inOff, length) {
    while (this.xBufOff != 0 && length > 0) {
      this.Update(input[inOff]);
      inOff++;
      length--;
    }
    while (length > this.xBuf.length) {
      this.ProcessWord(input, inOff);
      inOff += this.xBuf.length;
      length -= this.xBuf.length;
      this.byteCount += this.xBuf.length;
    }
    while (length > 0) {
      this.Update(input[inOff]);
      inOff++;
      length--;
    }
  },
  Finish() {
    const bitLength = this.byteCount << 3;
    this.Update(128);
    while (this.xBufOff != 0) this.Update(0);
    this.ProcessLength(bitLength);
    this.ProcessBlock();
  },
  ROTATE(x, n) {
    return (x << n) | this.URShift(x, 32 - n);
  },
  P0(X) {
    return X ^ roateLeft(X, 9) ^ roateLeft(X, 17);
  },
  P1(X) {
    return X ^ roateLeft(X, 15) ^ roateLeft(X, 23);
  },
  FF_00_15(X, Y, Z) {
    return X ^ Y ^ Z;
  },
  FF_16_63(X, Y, Z) {
    return (X & Y) | (X & Z) | (Y & Z);
  },
  GG_00_15(X, Y, Z) {
    return X ^ Y ^ Z;
  },
  GG_16_63(X, Y, Z) {
    return (X & Y) | (~X & Z);
  },
  URShift(number, bits) {
    console.error(number);
    if (number > Int32.maxValue || number < Int32.minValue) {
      // number = Int32.parse(number)
      console.error(number);
      number = IntegerParse(number);
    }
    if (number >= 0) {
      return number >> bits;
    }
    return (number >> bits) + (2 << ~bits);
  },
  URShiftLong(number, bits) {
    let returnV;
    const big = new rs.BigInteger();
    big.fromInt(number);
    if (big.signum() >= 0) {
      returnV = big.shiftRight(bits).intValue();
    } else {
      const bigAdd = new rs.BigInteger();
      bigAdd.fromInt(2);
      const shiftLeftBits = ~bits;
      let shiftLeftNumber = '';
      if (shiftLeftBits < 0) {
        const shiftRightBits = 64 + shiftLeftBits;
        for (let i = 0; i < shiftRightBits; i++) {
          shiftLeftNumber += '0';
        }
        const shiftLeftNumberBigAdd = new rs.BigInteger();
        shiftLeftNumberBigAdd.fromInt(number >> bits);
        const shiftLeftNumberBig = new rs.BigInteger(`10${shiftLeftNumber}`, 2);
        shiftLeftNumber = shiftLeftNumberBig.toRadix(10);
        const r = shiftLeftNumberBig.add(shiftLeftNumberBigAdd);
        returnV = r.toRadix(10);
      } else {
        shiftLeftNumber = bigAdd.shiftLeft(~bits).intValue();
        returnV = (number >> bits) + shiftLeftNumber;
      }
    }
    return returnV;
  },
  GetZ(g, pubKeyHex) {
    const userId = CryptoJS.enc.Utf8.parse('1234567812345678');
    const len = userId.words.length * 4 * 8;
    this.Update((len >> 8) & 0x00ff);
    this.Update(len & 0x00ff);
    const userIdWords = this.GetWords(userId.toString());
    this.BlockUpdate(userIdWords, 0, userIdWords.length);
    const aWords = this.GetWords(g.curve.a.toBigInteger().toRadix(16));
    const bWords = this.GetWords(g.curve.b.toBigInteger().toRadix(16));
    const gxWords = this.GetWords(g.getX().toBigInteger().toRadix(16));
    const gyWords = this.GetWords(g.getY().toBigInteger().toRadix(16));
    const pxWords = this.GetWords(pubKeyHex.substr(0, 64));
    const pyWords = this.GetWords(pubKeyHex.substr(64, 64));
    this.BlockUpdate(aWords, 0, aWords.length);
    this.BlockUpdate(bWords, 0, bWords.length);
    this.BlockUpdate(gxWords, 0, gxWords.length);
    this.BlockUpdate(gyWords, 0, gyWords.length);
    this.BlockUpdate(pxWords, 0, pxWords.length);
    this.BlockUpdate(pyWords, 0, pyWords.length);
    const md = new Array(this.GetDigestSize());
    this.DoFinal(md, 0);
    return md;
  },
  GetWords(hexStr) {
    const words = [];
    const hexStrLength = hexStr.length;
    for (let i = 0; i < hexStrLength; i += 2) {
      words[words.length] = parseInt(hexStr.substr(i, 2), 16);
    }
    return words;
  },
  GetHex(arr) {
    const words = [];
    let j = 0;
    for (let i = 0; i < arr.length * 2; i += 2) {
      words[i >>> 3] |= parseInt(arr[j]) << (24 - (i % 8) * 4);
      j++;
    }
    const wordArray = new CryptoJS.lib.WordArray.init(words, arr.length);
    return wordArray;
  },
};
Array.Clear = function (destinationArray, destinationIndex, length) {
  for (elm in destinationArray) {
    destinationArray[elm] = null;
  }
};
Array.Copy = function (sourceArray, sourceIndex, destinationArray, destinationIndex, length) {
  const cloneArray = sourceArray.slice(sourceIndex, sourceIndex + length);
  for (let i = 0; i < cloneArray.length; i++) {
    destinationArray[destinationIndex] = cloneArray[i];
    destinationIndex++;
  }
};
function roateLeft(n, distance) {
  // return ((n << distance) | (n >>> (32 - distance)));
  return (n << distance) | (n >>> -distance);
}
const Int32 = {
  // minValue: -parseInt('11111111111111111111111111111111', 2),
  minValue: -parseInt('10000000000000000000000000000000', 2),
  maxValue: parseInt('1111111111111111111111111111111', 2),
  parse(n) {
    if (n < this.minValue) {
      var bigInteger = new Number(-n);
      var bigIntegerRadix = bigInteger.toString(2);
      var subBigIntegerRadix = bigIntegerRadix.substr(bigIntegerRadix.length - 31, 31);
      var reBigIntegerRadix = '';
      for (var i = 0; i < subBigIntegerRadix.length; i++) {
        var subBigIntegerRadixItem = subBigIntegerRadix.substr(i, 1);
        reBigIntegerRadix += subBigIntegerRadixItem == '0' ? '1' : '0';
      }
      var result = parseInt(reBigIntegerRadix, 2);
      return result + 1;
    }
    if (n > this.maxValue) {
      var bigInteger = Number(n);
      var bigIntegerRadix = bigInteger.toString(2);
      var subBigIntegerRadix = bigIntegerRadix.substr(bigIntegerRadix.length - 31, 31);
      var reBigIntegerRadix = '';
      for (var i = 0; i < subBigIntegerRadix.length; i++) {
        var subBigIntegerRadixItem = subBigIntegerRadix.substr(i, 1);
        reBigIntegerRadix += subBigIntegerRadixItem == '0' ? '1' : '0';
      }
      var result = parseInt(reBigIntegerRadix, 2);
      return -(result + 1);
    }
    return n;
  },
  parseByte(n) {
    if (n > 255) {
      var result = 0xff & n;
      return result;
    }
    if (n < -256) {
      var result = 0xff & n;
      result = 0xff ^ result;
      return result + 1;
    }
    return n;
  },
};

function IntegerParse(n) {
  if (n > 2147483647 || n < -2147483648) {
    let result = 0xffffffff & n;
    if (result > 2147483647) {
      result = 0x7fffffff & n;
      result = 0x7fffffff ^ result;
      return -(result + 1);
    }
    return result;
  }
  return n;
}

// 获取摘要
const getSM3Digest = exports.getSM3Digest = function (msg, pubKeyHex) {
  const smDigest = new SM3Digest();
  const ecparams = KJUR.crypto.ECParameterDB.getByName(SM2_CURVE_NAME);
  const z = new SM3Digest().GetZ(ecparams.G, pubKeyHex);
  const zValue = smDigest.GetWords(smDigest.GetHex(z).toString());

  const rawData = smDigest.GetWords(msg);

  const smHash = new Array(smDigest.GetDigestSize());
  smDigest.BlockUpdate(zValue, 0, zValue.length);
  smDigest.BlockUpdate(rawData, 0, rawData.length);
  smDigest.DoFinal(smHash, 0);

  return smDigest.GetHex(smHash).toString();
};

// 添加sm2 KEYUTIL 扩展 start
const SM3_SIZE = 32
const SM3_SIZE_BIT_SIZE = 5

const SM2_BIT_SIZE = 256
const SM2_BYTE_SIZE = 32
const UNCOMPRESSED = 0x04
const SM2_SIGN_ALG = 'SM3withSM2'
const DEFAULT_UID = '1234567812345678'
const MAX_RETRY = 100

const SM2_CURVE_NAME = 'sm2p256v1';
exports.SM2_CURVE_NAME = SM2_CURVE_NAME
const SM2_CURVE_PARAM_P = 'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFF';
const SM2_CURVE_PARAM_A = 'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000FFFFFFFFFFFFFFFC';
const SM2_CURVE_PARAM_B = '28E9FA9E9D9F5E344D5A9E4BCF6509A7F39789F515AB8F92DDBCBD414D940E93';
const SM2_CURVE_PARAM_N = 'FFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFF7203DF6B21C6052B53BBF40939D54123';
const SM2_CURVE_PARAM_GX = '32C4AE2C1F1981195F9904466A39C9948FE30BBFF2660BE1715A4589334C74C7';
const SM2_CURVE_PARAM_GY = 'BC3736A2F4F6779C59BDCEE36B692153D0A9877CC62A474002DF32E52139F0A0';



const CIPHERTEXT_ENCODING_PLAIN = 0
const CIPHERTEXT_ENCODING_ASN1 = 1

rs.crypto.ECParameterDB.regist(
  SM2_CURVE_NAME, // name / p = 2**256 - 2**224 - 2**96 + 2**64 - 1
  SM2_BIT_SIZE,
  SM2_CURVE_PARAM_P, // p
  SM2_CURVE_PARAM_A, // a
  SM2_CURVE_PARAM_B, // b
  SM2_CURVE_PARAM_N, // n
  '1', // h
  SM2_CURVE_PARAM_GX, // gx
  SM2_CURVE_PARAM_GY, // gy
  [],
); // alias

const getNameFunc = rs.ECDSA.getName;

rs.ECDSA.getName = function (s) {
  // {1, 2, 156, 10197, 1, 301}
  if (s === '2a811ccf5501822d') {
    return SM2_CURVE_NAME;
  }
  return getNameFunc(s);
};
// 注册OID参数
rs.asn1.x509.OID.name2oidList[SM2_SIGN_ALG] = '1.2.156.10197.1.501'
rs.asn1.x509.OID.name2oidList[SM2_CURVE_NAME] = '1.2.156.10197.1.301'

// 添加sm2 KEYUTIL 扩展 END

// demo
// const rasKeypair = KEYUTIL.generateKeypair('EC', SM2_CURVE_NAME);
// const publicPEM = KEYUTIL.getPEM(rasKeypair.pubKeyObj, 'PKCS8PUB');
// const privatePEM = KEYUTIL.getPEM(rasKeypair.prvKeyObj, 'PKCS8PRV');
// console.log('privatePEM, publicPEM', rasKeypair, privatePEM, publicPEM);


// 添加sm2 ec 签名加密扩展 
const defaultEncryptFunc = rs.Cipher.encrypt
rs.Cipher.encrypt = function (s, keyObj, algName) {
  if (keyObj instanceof rs.ECDSA && keyObj.isPublic && keyObj.curveName === SM2_CURVE_NAME) {
    return encrypt(keyObj, s, algName)
  }
  return defaultEncryptFunc(s, keyObj, algName)
}

const defaultDecryptFunc = rs.Cipher.decrypt
rs.Cipher.decrypt = function (hex, keyObj, algName) {
  if (keyObj instanceof rs.ECDSA && keyObj.isPrivate && keyObj.curveName === SM2_CURVE_NAME) {
    return decryptHex(keyObj, hex)
  }
  return defaultDecryptFunc(hex, keyObj, algName)
}

if (!rs.BigInteger.prototype.toByteArrayUnsigned) {
  /**
 * Returns a byte array representation of the big integer.
 *
 * This returns the absolute of the contained value in big endian
 * form. A value of zero results in an empty array.
 */
  rs.BigInteger.prototype.toByteArrayUnsigned = function () {
    const byteArray = this.toByteArray()
    return byteArray[0] === 0 ? byteArray.slice(1) : byteArray
  }
}

class EncrypterOptions {
  constructor (encodingFormat) {
    if (encodingFormat !== CIPHERTEXT_ENCODING_PLAIN && encodingFormat !== CIPHERTEXT_ENCODING_ASN1) {
      throw new Error('SM2: unsupport ciphertext encoding format')
    }
    this.encodingFormat = encodingFormat
  }

  getEncodingFormat () {
    return this.encodingFormat
  }
}

const DEFAULT_SM2_ENCRYPT_OPTIONS = new EncrypterOptions(CIPHERTEXT_ENCODING_PLAIN)

const sm2 = Symbol('sm2')
function adaptSM2 (ecdsa) {
  // SM2 encryption
  // @param {data} to be encrypted, can be string/Uint8array/buffer
  // @return {string} encrypted hex content
  if (!ecdsa[sm2]) {
    ecdsa[sm2] = true
    
    // 加密解密暂时未使用，未进行扩展，sm3暂时未实现
    ecdsa.encrypt = function (data, opts = DEFAULT_SM2_ENCRYPT_OPTIONS) {
      const Q = rs.ECPointFp.decodeFromHex(this.ecparams.curve, this.pubKeyHex)
      return this.encryptRaw(data, Q, opts)
    }

    ecdsa.encryptHex = function (dataHex, opts = DEFAULT_SM2_ENCRYPT_OPTIONS) {
      return this.encrypt(sm3.fromHex(dataHex), opts)
    }

    ecdsa.encryptRaw = function (data, Q, opts = DEFAULT_SM2_ENCRYPT_OPTIONS) {
      if (!opts || !(opts instanceof EncrypterOptions)) {
        opts = DEFAULT_SM2_ENCRYPT_OPTIONS
      }
      data = sm3.normalizeInput(data)
      const n = this.ecparams.n
      const G = this.ecparams.G
      const dataLen = data.length
      let md = new MessageDigest()
      let count = 0
      if (Q.isInfinity()) {
        throw new Error('SM2: invalid public key')
      }
      do {
        const k = this.getBigRandom(n)
        const point1 = G.multiply(k)
        const point2 = Q.multiply(k)
        const t = kdf(new Uint8Array(util.integerToBytes(point2.getX().toBigInteger(), SM2_BYTE_SIZE).concat(util.integerToBytes(point2.getY().toBigInteger(), SM2_BYTE_SIZE))), dataLen)
        if (!t) {
          if (count++ > MAX_RETRY) {
            throw new Error('SM2: A5, failed to calculate valid t')
          }
          md = new MessageDigest()
          continue
        }
        for (let i = 0; i < dataLen; i++) {
          t[i] ^= data[i]
        }
        md.update(new Uint8Array(util.integerToBytes(point2.getX().toBigInteger(), SM2_BYTE_SIZE)))
        md.update(data)
        md.update(new Uint8Array(util.integerToBytes(point2.getY().toBigInteger(), SM2_BYTE_SIZE)))
        const hash = md.digestRaw()
        if (opts.getEncodingFormat() === CIPHERTEXT_ENCODING_PLAIN) {
          return sm3.toHex(new Uint8Array(point1.getEncoded(false))) + sm3.toHex(hash) + sm3.toHex(t)
        }
        const derX = new rs.asn1.DERInteger({ bigint: point1.getX().toBigInteger() })
        const derY = new rs.asn1.DERInteger({ bigint: point1.getY().toBigInteger() })
        const derC3 = new rs.asn1.DEROctetString({ hex: sm3.toHex(hash) })
        const derC2 = new rs.asn1.DEROctetString({ hex: sm3.toHex(t) })
        const derSeq = new rs.asn1.DERSequence({ array: [derX, derY, derC3, derC2] })
        return derSeq.getEncodedHex()
      } while (true)
    }

    // SM2 decryption
    // @param {data} to be decrypted, can be string/Uint8array/buffer
    // @return {string} decrypted hex content
    ecdsa.decrypt = function (data) {
      const d = new rs.BigInteger(this.prvKeyHex, 16)
      return this.decryptRaw(data, d)
    }

    ecdsa.decryptHex = function (dataHex) {
      return this.decrypt(sm3.fromHex(dataHex))
    }

    ecdsa.decryptRaw = function (data, d) {
      data = sm3.normalizeInput(data)
      const dataLen = data.length

      if (data[0] !== UNCOMPRESSED) {
        throw new Error('SM2: unsupport point marshal mode')
      }
      if (dataLen < 97) {
        throw new Error('SM2: invalid cipher content length')
      }
      const point1 = rs.ECPointFp.decodeFrom(this.ecparams.curve, Array.from(data.subarray(0, 65)))
      const point2 = point1.multiply(d)
      const c2 = data.subarray(97)
      const c3 = data.subarray(65, 97)
      const t = sm3.kdf(new Uint8Array(util.integerToBytes(point2.getX().toBigInteger(), SM2_BYTE_SIZE).concat(util.integerToBytes(point2.getY().toBigInteger(), SM2_BYTE_SIZE))), dataLen - 97)
      if (!t) {
        throw new Error('SM2: invalid cipher content')
      }
      for (let i = 0; i < c3.length; i++) {
        c2[i] ^= t[i]
      }
      return sm3.toHex(c2)
    }

    ecdsa.signHex = function (hashHex, privHex) {
      const d = new rs.BigInteger(privHex, 16)
      const n = this.ecparams.n
      const G = this.ecparams.G
      // message hash is truncated with curve key length (FIPS 186-4 6.4)
      const e = new rs.BigInteger(hashHex.substring(0, this.ecparams.keylen / 4), 16)
      let r, s, k
      do {
        do {
          k = this.getBigRandom(n)
          const Q = G.multiply(k)
          r = Q.getX().toBigInteger().add(e).mod(n)
        } while (r.signum() === 0 || r.add(k).compareTo(n) === 0)
        s = k.subtract(d.multiply(r))
        const dp1Inv = d.add(rs.BigInteger.ONE).modInverse(n)
        s = s.multiply(dp1Inv).mod(n)
      } while (s.signum() === 0)
      return rs.ECDSA.biRSSigToASN1Sig(r, s)
    }

    ecdsa.verifyRaw = function (e, r, s, Q) {
      const n = this.ecparams.n
      const G = this.ecparams.G

      if (r.compareTo(rs.BigInteger.ONE) < 0 ||
            r.compareTo(n) >= 0) { return false }

      if (s.compareTo(rs.BigInteger.ONE) < 0 ||
            s.compareTo(n) >= 0) { return false }

      const t = r.add(s).mod(n)
      if (t.signum() === 0) {
        return false
      }
      const point = G.multiply(s).add(Q.multiply(t))

      const v = point.getX().toBigInteger().add(e).mod(n)

      return v.equals(r)
    }

    // calculateZA ZA = H256(ENTLA || IDA || a || b || xG || yG || xA || yA)
    ecdsa.calculateZA = function (uid) {
      if (!uid) {
        uid = DEFAULT_UID
      }
      uid = sm3.normalizeInput(uid)
      const uidLen = uid.length
      if (uidLen >= 0x2000) {
        throw new Error('SM2: the uid is too long')
      }
      const entla = uidLen << 3
      const md = new MessageDigest()
      md.update(new Uint8Array([0xff & (entla >>> 8), 0xff & entla]))
      md.update(uid)
      md.update(sm3.fromHex(SM2_CURVE_PARAM_A)) // a
      md.update(sm3.fromHex(SM2_CURVE_PARAM_B)) // b
      md.update(sm3.fromHex(SM2_CURVE_PARAM_GX)) // gx
      md.update(sm3.fromHex(SM2_CURVE_PARAM_GY)) // gy
      let Q
      if (this.pubKeyHex) {
        Q = rs.ECPointFp.decodeFromHex(this.ecparams.curve, this.pubKeyHex)
      } else {
        const d = new rs.BigInteger(this.prvKeyHex, 16)
        const G = this.ecparams.G
        Q = G.multiply(d)
      }
      md.update(new Uint8Array(util.integerToBytes(Q.getX().toBigInteger(), SM2_BYTE_SIZE))) // x
      md.update(new Uint8Array(util.integerToBytes(Q.getY().toBigInteger(), SM2_BYTE_SIZE))) // y
      return md.digestRaw()
    }
  }
}

// export const sm2SignWithPriKey = (hexData, prviey) => {
//   const keyObj = rs.KEYUTIL.getKey(prviey);
//   const pubHex = keyObj.pubKeyHex;
//   const hash = pubHex.slice(2, 130);
//   const dgst = getSM3Digest(hexData, hash);
//   return rs.ECDSA.signHex(dgst, keyObj.prvKeyHex);
// };
// export const verifyWithPubKey = (pubKey, hexData, sig) => {
//   const { pubKeyHex } = rs.KEYUTIL.getKey(pubKey);
//   const hash = pubKeyHex.slice(2, 130);
//   const dgst = getSM3Digest(hexData, hash);
//   return rs.ECDSA.verifyHex(dgst, sig, pubKeyHex);
// };
exports.sm2SignWithPriKey = (hexData, prviey) => {
  const keyObj = rs.KEYUTIL.getKey(prviey);
  adaptSM2(keyObj)
  const pubHex = keyObj.pubKeyHex;
  const hash = pubHex.slice(2, 130);
  const dgst = getSM3Digest(hexData, hash);
 
  //aa7f6fb98b02efeee0316c1b0d4e4827b0aa35b27421aa63d89f2d461b81faaa
  //sm3 => aa7f6fb98b02efeee0316c1b0d4e4827b0aa35b27421aa63d89f2d461b81faaa
 return keyObj.signHex(dgst, keyObj.prvKeyHex);
};
exports.verifyWithPubKey = (prviey, hexData, sig) => {
  const keyObj = rs.KEYUTIL.getKey(prviey);
  adaptSM2(keyObj)
  const { pubKeyHex } = keyObj
  const hash = pubKeyHex.slice(2, 130);
  const dgst = getSM3Digest(hexData, hash);
  return keyObj.verifyHex(dgst, sig, pubKeyHex);
};
