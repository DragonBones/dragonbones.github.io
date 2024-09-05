/***
 * AMF JavaScript library by Emil Malinov https://github.com/emilkm/amfjs
 */
amf = {

    clients: {},
    classes: {},
  
    const: {
      CLASS_ALIAS               : "_explicitType",
      EXTERNALIZED_FIELD        : "_externalizedData",
  
      RESULT_METHOD             : "/onResult",
      STATUS_METHOD             : "/onStatus",
  
      EMPTY_STRING              : "",
      NULL_STRING               : "null",
  
      AMF0_OBJECT_ENCODING      : 0,
  
      AMF0_NUMBER               : 0,
      AMF0_BOOLEAN              : 1,
      AMF0_STRING               : 2,
      AMF0_OBJECT               : 3,
      AMF0_MOVIECLIP            : 4,
      AMF0_NULL                 : 5,
      AMF0_UNDEFINED            : 6,
      AMF0_REFERENCE            : 7,
      AMF0_MIXEDARRAY           : 8, //ECMAArray
      AMF0_OBJECTEND            : 9,
      AMF0_ARRAY                : 10, //StrictArray
      AMF0_DATE                 : 11,
      AMF0_LONGSTRING           : 12,
      AMF0_UNSUPPORTED          : 13,
      AMF0_RECORDSET            : 14,
      AMF0_XMLDOCUMENT          : 15,
      AMF0_TYPEDOBJECT          : 16,
      AMF0_AMF3                 : 17,
  
      AMF3_OBJECT_ENCODING      : 3,
  
      AMF3_UNDEFINED            : 0,
      AMF3_NULL                 : 1,
      AMF3_BOOLEAN_FALSE        : 2,
      AMF3_BOOLEAN_TRUE         : 3,
      AMF3_INTEGER              : 4,
      AMF3_DOUBLE               : 5,
      AMF3_STRING               : 6,
      AMF3_XMLDOCUMENT          : 7,
      AMF3_DATE                 : 8,
      AMF3_ARRAY                : 9,
      AMF3_OBJECT               : 10,
      AMF3_XML                  : 11,
      AMF3_BYTEARRAY            : 12,
      AMF3_VECTOR_INT           : 13,
      AMF3_VECTOR_UINT          : 14,
      AMF3_VECTOR_DOUBLE        : 15,
      AMF3_VECTOR_OBJECT        : 16,
      AMF3_DICTIONARY           : 17,
  
      UNKNOWN_CONTENT_LENGTH    : 1,
  
      UINT29_MASK               : 536870911,
      INT28_MAX_VALUE           : 268435455,
      INT28_MIN_VALUE           : -268435456,
      UINT_MAX_VALUE            : 4294967295,
      UINT_MIN_VALUE            : 0,
  
      MAX_STORED_OBJECTS        : 1024,
  
      POW_2_20                  : Math.pow(2, 20),
      POW_2_52                  : Math.pow(2, 52),
      POW_2_52N                 : Math.pow(2, -52)
    },
  
    bind: function(functor, object) {
      return function() {
        return functor.apply(object, arguments);
      };
    },
  
    registerClass: function(name, clazz) {
      this.classes[name] = clazz;
    },
  
    ActionMessage: function() {
      return {
        _explicitType: "flex.messaging.io.amf.ActionMessage",
        version: 3,
        headers: [],
        bodies: []
      };
    },
  
    MessageBody: function() {
      return {
        //this._explicitType = "flex.messaging.io.amf.MessageBody";
        targetURI: "null",
        responseURI: "/1",
        data: []
      };
    },
  
    MessageHeader: function() {
      return {
        //this._explicitType = "flex.messaging.io.amf.MessageHeader";
        name: "",
        mustUnderstand: false,
        data: null
      };
    },
  
    CommandMessage: function() {
      return {
        _explicitType: "flex.messaging.messages.CommandMessage",
        destination: "",
        operation: 5,
        body: [],
        headers: {DSId: "nil"},
        clientId: null
      };
    },
  
    RemotingMessage: function() {
      return {
        _explicitType: "flex.messaging.messages.RemotingMessage",
        destination: "",
        source: "",
        operation: "",
        body: [],
        headers: {DSId: "nil"},
        clientId: null
      };
    },
  
    AcknowledgeMessage: function() {
      return {
        _explicitType: "flex.messaging.messages.AcknowledgeMessage",
        body: null,
        headers: [],
        messageId: null,
        clientId: null
      }
    },
  
    Request: function(source, operation, params) {
      return {
        source: source,
        operation: operation,
        params: params
      }
    },
  
    getClient: function(destination) {
      return this.clients[destination];
    }
  
  };
  
  amf.Response = function(code, message, detail, data, scope) {
    this.code = code;
    this.message = message;
    this.detail = detail;
    this.data = data;
    this.$scope = scope;
  };
  
  amf.Client = function(destination, endpoint, timeout) {
    this.xhrPoolSize = 6;
    this.xhrPool = [];
    this.dnf = new Function;
  
    this.clientId = null;
    this.sessionId = null;
    this.sequence = 0;
    this.headers = null;
    this.requestQueue = [];
    this.queueBlocked = false;
    this.pingFailed = false;
  
    this.destination = destination;
    this.endpoint = endpoint;
    this.requestTimeout = timeout ? timeout : 30000; //30 seconds
    this.sidPropagation = "header";
  
    amf.clients[destination] = this;
  };
  
  amf.Client.prototype.addHeader = function(name, value) {
    var header = {};
    header[name] = value;
    if (this.headers === null) {
      this.headers = [];
    }
    this.headers.push(header);
  };
  
  amf.Client.prototype.pingFailure = function(err) {
    this.pingFailed = true;
    for (var i in this.requestQueue) {
      this.requestQueue[i].reject(new amf.Response(-1000, "Could not connect to the server.", "Could not reach AMF endpoint."));
    }
  };
  
  amf.Client.prototype.setSessionId = function(value) {
    this.sessionId = value;
    if (this.sidPropagation == "header") {
      this.addHeader("sID", this.sessionId);
    } else {
      this.endpoint += "?sID=" + this.sessionId;
    }
  };
  
  amf.Client.prototype.releaseQueue = function() {
    this.queueBlocked = false;
    this._processQueue();
  };
  
  amf.Client.prototype.invoke = function(source, operation, params, block, nobatch) {
    var promise = this._deffer(new amf.Request(source, operation, params));
    if (this.pingFailed) {
      promise.reject(new amf.Response(-1000, "Could not connect to the server.", "Could not reach AMF endpoint."));
      return promise;
    }
    if (block) {
      promise.$blocking = true;
    } else if (nobatch) {
      promise.$nobatch = true;
    }
    if (this.clientId == null && this.sequence == 0 && this.requestQueue.length == 0) {
      var ping = this._deffer(new amf.Request("command", "ping", null));
      ping.fail(amf.bind(this.pingFailure, this));
      this.requestQueue.push(ping);
      this.requestQueue.push(promise);
      this._startQueue();
      return promise;
    }
    this.requestQueue.push(promise);
    if (this.clientId == null) {
      return promise;
    }
    this._startQueue();
    return promise;
  };
  
  amf.Client.prototype._deffer = function(request) {
    var pr = amf.promise.defer();
    pr.request = request;
    pr.$context = this;
    return pr;
  };
  
  amf.Client.prototype._createPacket = function() {
    var actionMessage = new amf.ActionMessage();
    var messageBody, message, promise, promises = [];
    if (this.sequence == 0) {
      this.sequence++;
      promise = this.requestQueue.shift();
      promise.$sequence = this.sequence;
      promises.push(promise);
      messageBody = new amf.MessageBody();
      messageBody.responseURI = "/" + this.sequence;
      message = new amf.CommandMessage();
      message.destination = this.destination;
      messageBody.data.push(message);
      actionMessage.bodies.push(messageBody);
    } else {
      while (this.requestQueue.length > 0) {
        if (!this.requestQueue[0].$blocking && this.requestQueue[0].$nobatch && actionMessage.bodies.length > 0) {
          break;
        }
  
        this.sequence++;
        promise = this.requestQueue.shift();
        promise.$sequence = this.sequence;
        promises.push(promise);
        messageBody = new amf.MessageBody();
        messageBody.responseURI = "/" + this.sequence;
        message = new amf.RemotingMessage();
        message.destination = this.destination;
        message.source = promise.request.source;
        message.operation = promise.request.operation;
        message.body = promise.request.params;
        message.messageId = amf.uuid(0, 0);
        message.headers["DSId"] = this.clientId;
        message.clientId = this.clientId;
  
        if (Object.prototype.toString.call(this.headers) === "[object Array]") {
          for (var i = 0; i < this.headers.length; i++) {
            var header = this.headers[i];
            for (var headerName in header) {
              message.headers[headerName] = header[headerName];
            }
          }
        }
        messageBody.data.push(message);
        actionMessage.bodies.push(messageBody);
  
        if (promise.$blocking) {
          this.queueBlocked = true;
          break;
        } else if (promise.$nobatch) {
          break;
        }
      }
    }
    return {"message": actionMessage, "promises": promises};
  };
  
  amf.Client.prototype._startQueue = function() {
    setTimeout(amf.bind(this._processQueue, this), 1);
  };
  
  amf.Client.prototype._processQueue = function() {
    var i, xhr;
    if ((this.sequence == 1 && this.clientId == null) || this.queueBlocked) {
      return;
    }
    for (i = 0; i < this.xhrPoolSize && this.requestQueue.length > 0; i++) {
      if (this.xhrPool.length == i) {
        xhr = {
          obj: new XMLHttpRequest(),
          busy: false,
          parent: this,
          message: null,
          promises: null
        };
        if (this.xhrPoolSize > 1) {
          this.xhrPool.push(xhr);
        }
      } else {
        xhr = this.xhrPool[i];
      }
      if (!xhr.busy) {
        var packet = this._createPacket();
        this._send(xhr, packet);
        if (this.sequence == 1 || this.queueBlocked) {
          return;
        }
      }
    }
  };
  
  amf.Client.prototype._send = function(xhr, packet) {
    var i, serializer = new amf.Serializer();
    try {
      xhr.message = serializer.writeMessage(packet.message);
      xhr.promises = packet.promises;
    } catch (e) {
      for (i in this.promises) {
        this.promises[i].reject(new amf.Response(-1001, "Failed encoding the request.", null));
      }
      xhr.busy = false;
      xhr.message = null;
      xhr.promises = null;
      this._processQueue();
      return;
    }
    
    xhr.obj.open("POST", this.endpoint, true);
  
    if (!xhr.busy) {
        xhr.busy = true;
        xhr.obj.setRequestHeader("Content-Type", "application/x-amf; charset=UTF-8");
        xhr.obj.responseType = "arraybuffer";
        xhr.obj.send(new Uint8Array(xhr.message));
    };
  
    xhr.obj.onload = e => {
      xhr.obj.onload = null;
      try {
        if (xhr.obj.status >= 200 && xhr.obj.status <= 300
            && xhr.obj.responseType == "arraybuffer"
            && xhr.obj.getResponseHeader("Content-type").indexOf("application/x-amf") > -1
        ) {
          var message, body, deserializer = new amf.Deserializer(new Uint8Array(xhr.obj.response));
          try {
            message = deserializer.readMessage();
          } catch (e) {
            for (i in xhr.promises) {
              xhr.promises[i].reject(new amf.Response(-1001, "Failed decoding the response.", null));
            }
            xhr.busy = false;
            xhr.message = null;
            xhr.promises = null;
            this._processQueue();
            return;
          }
          for (i in message.bodies) {
            body = message.bodies[i];
            if (body.targetURI && body.targetURI.indexOf("/onResult") > -1) {
              if (body.targetURI == "/1/onResult") {
                this.clientId = body.data.clientId;
                xhr.promises[i].resolve(new amf.Response(0, "", null, null));
              } else {
                if (body.data._explicitType == "flex.messaging.messages.AcknowledgeMessage" && body.data.body._explicitType == "AMFResult") {
                  xhr.promises[i].resolve(new amf.Response(body.data.body.code, body.data.body.message, body.data.body.detail, body.data.body.data));
                } else if (body.data.body.hasOwnProperty("code") && body.data.body.hasOwnProperty("data")) {
                  xhr.promises[i].resolve(new amf.Response(body.data.body.code, "", null, body.data.body));
                } else if (body.data.body.hasOwnProperty("data")) {
                  xhr.promises[i].resolve(new amf.Response(0, "", null, body.data.body.data));
                } else {
                  xhr.promises[i].reject(new amf.Response(-1002, "Unknown result message.", body.data));
                }
              }
            } else {
              if (body.data._explicitType == "flex.messaging.messages.ErrorMessage") {
                xhr.promises[i].reject(new amf.Response(body.data.faultCode, body.data.faultString, body.data.faultDetail));
              } else {
                xhr.promises[i].reject(new amf.Response(-1003, "Unknown error message.", body.data));
              }
            }
          }
        } else if (xhr.obj.status == 0 || xhr.obj.responseType == "text") {
          for (i in xhr.promises) {
            xhr.promises[i].reject(new amf.Response(-1004, "Invalid response type.", "Invalid XMLHttpRequest response status or type."));
          }
        } else {
          for (i in xhr.promises) {
            xhr.promises[i].reject(new amf.Response(-1005, "Invalid response.", ""));
          }
        }
      } catch (e) {
        for (i in xhr.promises) {
          xhr.promises[i].reject(new amf.Response(-1006, "Unknown error.", e.message));
        }
      }
      xhr.busy = false;
      xhr.message = null;
      xhr.promises = null;
      this._processQueue();
    };
  
    xhr.obj.onerror = e => {
      xhr.obj.onerror = null;
      for (i in xhr.promises) {
        this.promises[i].reject(new amf.Response(-1006, e.message, e.message));
      }
      xhr.busy = false;
      xhr.message = null;
      xhr.promises = null;
      this._processQueue();
    };
  };
  
  
  
  amf.Writer = function() {
    this.data = [];
    this.objects = [];
    this.traits = {};
    this.strings = {};
    this.stringCount = 0;
    this.traitCount = 0;
    this.objectCount = 0;
  };
  
  amf.Writer.prototype.write = function(v) {
    this.data.push(v);
  };
  
  amf.Writer.prototype.writeShort = function(v) {
    this.write((v >>> 8) & 255);
    this.write((v >>> 0) & 255);
  };
  
  amf.Writer.prototype.writeUTF = function(v, asAmf) {
    var bytearr = [];
    var strlen = v.length;
    var utflen = 0;
  
    for (var i = 0; i < strlen; i++) {
      var c1 = v.charCodeAt(i);
      //var enc = null;
  
      if (c1 < 128) {
        utflen++;
        bytearr.push(c1);
        //end++;
      } else if (c1 > 127 && c1 < 2048) {
        utflen += 2;
        bytearr.push(192 | (c1 >> 6));
        if (asAmf) {
          bytearr.push(128 | ((c1 >> 0) & 63));
        } else {
          bytearr.push(128 | (c1 & 63));
        }
      } else if ((c1 & 0xF800) !== 0xD800) {
        utflen += 3;
        bytearr.push(224 | (c1 >> 12));
        bytearr.push(128 | ((c1 >> 6) & 63));
        if (asAmf) {
          bytearr.push(128 | ((c1 >> 0) & 63));
        } else {
          bytearr.push(128 | (c1 & 63));
        }
      } else {
        utflen += 4;
        if ((c1 & 0xFC00) !== 0xD800) {
          throw new RangeError('Unmatched trail surrogate at ' + i);
        }
        var c2 = v.charCodeAt(++i);
        if ((c2 & 0xFC00) !== 0xDC00) {
          throw new RangeError('Unmatched lead surrogate at ' + (i - 1));
        }
        c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
        bytearr.push(240 | (c1 >> 18));
        bytearr.push(128 | ((c1 >> 12) & 63));
        bytearr.push((c1 >> 6) & 63);
        if (asAmf) {
          bytearr.push(128 | ((c1 >> 0) & 63));
        } else {
          bytearr.push(128 | (c1 & 63));
        }
      }
    }
  
    if (asAmf) {
      this.writeUInt29((utflen << 1) | 1);
    } else {
      bytearr.unshift(utflen & 255);
      bytearr.unshift((utflen >>> 8) & 255);
    }
  
    this.writeAll(bytearr);
    return asAmf ? utflen : utflen + 2;
  };
  
  amf.Writer.prototype.writeUInt29 = function(v) {
    if (v < 128) {
      this.write(v);
    } else if (v < 16384) {
      this.write(((v >> 7) & 127) | 128);
      this.write(v & 127);
    } else if (v < 2097152) {
      this.write(((v >> 14) & 127) | 128);
      this.write(((v >> 7) & 127) | 128);
      this.write(v & 127);
    } else if (v < 0x40000000) {
      this.write(((v >> 22) & 127) | 128);
      this.write(((v >> 15) & 127) | 128);
      this.write(((v >> 8) & 127) | 128);
      this.write(v & 255);
    } else {
      throw "Integer out of range: " + v;
    }
  };
  
  amf.Writer.prototype.writeAll = function(bytes) {
    for (var i = 0; i < bytes.length; i++) {
      this.write(bytes[i]);
    }
  };
  
  amf.Writer.prototype.writeBoolean = function(v) {
    this.write(v ? 1 : 0);
  };
  
  amf.Writer.prototype.writeInt = function(v) {
    this.write((v >>> 24) & 255);
    this.write((v >>> 16) & 255);
    this.write((v >>> 8) & 255);
    this.write((v >>> 0) & 255);
  };
  
  amf.Writer.prototype.writeUInt32 = function(v) {
    v < 0 && (v = -(v ^ amf.const.UINT_MAX_VALUE) - 1);
    v &= amf.const.UINT_MAX_VALUE;
    this.write((v >>> 24) & 255);
    this.write((v >>> 16) & 255);
    this.write((v >>> 8) & 255);
    this.write((v & 255));
  };
  
  amf.Writer.prototype._getDouble = function(v) {
    var r = [0,0];
    if (v != v) {
      return r[0] = -524288, r;
    }
    var d = v < 0 || v === 0 && 1 / v < 0 ? -2147483648 : 0, v = Math.abs(v);
    if (v === Number.POSITIVE_INFINITY) {
      return r[0] = d | 2146435072, r;
    }
    for (var e = 0; v >= 2 && e <= 1023;) {
      e++, v /= 2;
    }
    for (; v < 1 && e >= -1022;) {
      e--, v *= 2;
    }
    e += 1023;
    if (e == 2047) {
      return r[0] = d | 2146435072, r;
    }
    var i;
    e == 0
      ? (i = v * Math.pow(2, 23) / 2, v = Math.round(v * amf.const.POW_2_52 / 2))
      : (i = v * amf.const.POW_2_20 - amf.const.POW_2_20, v = Math.round(v * amf.const.POW_2_52 - amf.const.POW_2_52));
    r[0] = d | e << 20 & 2147418112 | i & 1048575;
    r[1] = v;
    return r;
  };
  
  amf.Writer.prototype.writeDouble = function(v) {
    v = this._getDouble(v);
    this.writeUInt32(v[0]);
    this.writeUInt32(v[1]);
  };
  
  amf.Writer.prototype.getResult = function() {
    return this.data.join("");
  };
  
  amf.Writer.prototype.reset = function() {
    this.objects = [];
    this.objectCount = 0;
    this.traits = {};
    this.traitCount = 0;
    this.strings = {};
    this.stringCount = 0;
  };
  
  amf.Writer.prototype.writeStringWithoutType = function(v) {
    if (v.length == 0) {
      this.writeUInt29(1);
    } else {
      if (!this.stringByReference(v)) {
        this.writeUTF(v, true);
      }
    }
  };
  
  amf.Writer.prototype.stringByReference = function(v) {
    var ref = this.strings[v];
    if (ref) {
      this.writeUInt29(ref << 1);
    } else {
      this.strings[v] = this.stringCount++;
    }
    return ref;
  };
  
  amf.Writer.prototype.objectByReference = function(v) {
    var ref = 0;
    var found = false;
    for (; ref < this.objects.length; ref++) {
      if (this.objects[ref] === v) {
        found = true;
        break;
      }
    }
    if (found) {
      this.writeUInt29(ref << 1);
    } else {
      this.objects.push(v);
      this.objectCount++;
    }
  
    return found ? ref : null;
  };
  
  amf.Writer.prototype.traitsByReference = function(v, alias) {
    var s = alias + "|";
    for ( var i = 0; i < v.length; i++) {
      s += v[i] + "|";
    }
    var ref = this.traits[s];
    if (ref) {
      this.writeUInt29((ref << 2) | 1);
    } else {
      this.traits[s] = this.traitCount++;
    }
    return ref;
  };
  
  amf.Writer.prototype.writeAmfInt = function(v) {
    if (v >= amf.const.INT28_MIN_VALUE && v <= amf.const.INT28_MAX_VALUE) {
      v = v & amf.const.UINT29_MASK;
      this.write(amf.const.AMF3_INTEGER);
      this.writeUInt29(v);
    } else {
      this.write(amf.const.AMF3_DOUBLE);
      this.writeDouble(v);
    }
  };
  
  amf.Writer.prototype.writeDate = function(v) {
    this.write(amf.const.AMF3_DATE);
    if (!this.objectByReference(v)) {
      this.writeUInt29(1);
      this.writeDouble(v.getTime());
    }
  };
  
  amf.Writer.prototype.writeObject = function(v) {
    if (v == null) {
      this.write(amf.const.AMF3_NULL);
      return;
    }
    if (v.constructor === String) {
      this.write(amf.const.AMF3_STRING);
      this.writeStringWithoutType(v);
    } else if (v.constructor === Number) {
      if (v === +v && v === (v | 0)) {
        this.writeAmfInt(v);
      } else {
        this.write(amf.const.AMF3_DOUBLE);
        this.writeDouble(v);
      }
    } else if (v.constructor === Boolean) {
      this.write((v
        ? amf.const.AMF3_BOOLEAN_TRUE
        : amf.const.AMF3_BOOLEAN_FALSE));
    } else if (v.constructor === Date) {
      this.writeDate(v);
    } else {
      if (v.constructor === Array) {
        if (v.toString().indexOf("[Vector") == 0) {
          this.writeVector(v);
        } else {
          this.writeArray(v);
        }
      } else if (amf.const.CLASS_ALIAS in v) {
        this.writeCustomObject(v);
      } else {
        this.writeMap(v);
      }
    }
  };
  
  amf.Writer.prototype.writeCustomObject = function(v) {
    this.write(amf.const.AMF3_OBJECT);
    if (!this.objectByReference(v)) {
      var traits = this.writeTraits(v);
      for (var i = 0; i < traits.length; i++) {
        var prop = traits[i];
        this.writeObject(v[prop]);
      }
    }
  };
  
  amf.Writer.prototype.writeTraits = function(v) {
    var traits = [];
    var count = 0;
    var externalizable = false;
    var dynamic = false;
  
    for (var t in v) {
      if (t != amf.const.CLASS_ALIAS) {
        traits.push(t);
        count++;
      }
    }
    if (!this.traitsByReference(traits, v[amf.const.CLASS_ALIAS])) {
      this.writeUInt29(3 | (externalizable ? 4 : 0) | (dynamic ? 8 : 0) | (count << 4));
      this.writeStringWithoutType(v[amf.const.CLASS_ALIAS]);
      if (count > 0) {
        for (var prop in traits) {
          this.writeStringWithoutType(traits[prop]);
        }
      }
    }
    return traits;
  };
  
  /* Write map as array
  amf.Writer.prototype.writeMap = function(v) {
    this.write(amf.const.AMF3_ARRAY);
    if (!this.objectByReference(map)) {
      this.writeUInt29((0 << 1) | 1);
      for (var key in v) {
        if (key) {
          this.writeStringWithoutType(key);
        } else {
          this.writeStringWithoutType(amf.const.EMPTY_STRING);
        }
        this.writeObject(v[key]);
      }
      this.writeStringWithoutType(amf.const.EMPTY_STRING);
    }
  };*/
  
  amf.Writer.prototype.writeMap = function(v) {
    this.write(amf.const.AMF3_OBJECT);
    if (!this.objectByReference(v)) {
      this.writeUInt29(11);
      this.traitCount++; //bogus traits entry here
      this.writeStringWithoutType(amf.const.EMPTY_STRING); //class name
      for (var key in v) {
        if (key) {
          this.writeStringWithoutType(key);
        } else {
          this.writeStringWithoutType(amf.const.EMPTY_STRING);
        }
        this.writeObject(v[key]);
      }
      this.writeStringWithoutType(amf.const.EMPTY_STRING); //empty string end of dynamic members
    }
  };
  
  amf.Writer.prototype.writeArray = function(v) {
    this.write(amf.const.AMF3_ARRAY);
    var len = v.length;
    if (!this.objectByReference(v)) {
      this.writeUInt29((len << 1) | 1);
      this.writeUInt29(1); //empty string implying no named keys
      if (len > 0) {
        for (var i = 0; i < len; i++) {
          this.writeObject(v[i]);
        }
      }
    }
  };
  
  amf.Writer.prototype.writeVector = function(v) {
    this.write(v.type);
    var i, len = v.length;
    if (!this.objectByReference(v)) {
      this.writeUInt29((len << 1) | 1);
      this.writeBoolean(v.fixed);
    }
    if (v.type == amf.const.AMF3_VECTOR_OBJECT) {
      var className = "";
      if (len > 0) {
        // TODO: how much of the PHP logic can we do here
        className = v[0].constructor.name;
      }
      this.writeStringWithoutType(className);
      for (i = 0; i < len; i++) {
        this.writeObject(v[i]);
      }
    } else if (v.type == amf.const.AMF3_VECTOR_INT) {
      for (i = 0; i < len; i++) {
        this.writeInt(v[i]);
      }
    } else if (v.type == amf.const.AMF3_VECTOR_UINT) {
      for (i = 0; i < len; i++) {
        this.writeUInt32(v[i]);
      }
    } else if (v.type == amf.const.AMF3_VECTOR_DOUBLE) {
      for (i = 0; i < len; i++) {
        this.writeDouble(v[i]);
      }
    }
  };
  
  amf.Reader = function(data) {
    this.objects = [];
    this.traits = [];
    this.strings = [];
    this.data = data;
    this.pos = 0;
  };
  
  amf.Reader.prototype.read = function() {
    //if (this.pos + 1 > this.datalen) { //this.data.length store in this.datalen
    //  throw "Cannot read past the end of the data.";
    //}
    return this.data[this.pos++];
  };
  
  amf.Reader.prototype.readUIntN = function(n) {
    var value = this.read();
    for (var i = 1; i < n; i++) {
      value = (value << 8) | this.read();
    }
    return value;
  };
  
  amf.Reader.prototype.readUnsignedShort = function() {
    var c1 = this.read(), c2 = this.read();
    return ((c1 << 8) + (c2 << 0));
  };
  
  amf.Reader.prototype.readInt = function() {
    var c1 = this.read(), c2 = this.read(), c3 = this.read(), c4 = this.read();
    return ((c1 << 24) + (c2 << 16) + (c3 << 8) + (c4 << 0));
  };
  
  amf.Reader.prototype.readUInt32 = function() {
    var c1 = this.read(), c2 = this.read(), c3 = this.read(), c4 = this.read();
    return (c1 * 0x1000000) + ((c2 << 16) | (c3 << 8) | c4);
  };
  
  amf.Reader.prototype.readUInt29 = function() {
    var b = this.read() & 255;
    if (b < 128) {
      return b;
    }
    var value = (b & 127) << 7;
    b = this.read() & 255;
    if (b < 128) {
      return (value | b);
    }
    value = (value | (b & 127)) << 7;
    b = this.read() & 255;
    if (b < 128) {
      return (value | b);
    }
    value = (value | (b & 127)) << 8;
    b = this.read() & 255;
    return (value | b);
  };
  
  amf.Reader.prototype.readFully = function(buff, start, length) {
    for (var i = start; i < length; i++) {
      buff[i] = this.read();
    }
  };
  
  amf.Reader.prototype.readUTF = function(length) {
    var utflen = length ? length : this.readUnsignedShort();
    var len = this.pos + utflen;
    var chararr = [];
    var c1 = 0;
    var seqlen = 0;
  
    while (this.pos < len) {
      c1 = this.read() & 0xFF;
      seqlen = 0;
  
      if (c1 <= 0xBF) {
        c1 = c1 & 0x7F;
        seqlen = 1;
      } else if (c1 <= 0xDF) {
        c1 = c1 & 0x1F;
        seqlen = 2;
      } else if (c1 <= 0xEF) {
        c1 = c1 & 0x0F;
        seqlen = 3;
      } else {
        c1 = c1 & 0x07;
        seqlen = 4;
      }
  
      for (var i = 1; i < seqlen; ++i) {
        c1 = c1 << 0x06 | this.read() & 0x3F;
      }
  
      if (seqlen === 4) {
        c1 -= 0x10000;
        chararr.push(String.fromCharCode(0xD800 | c1 >> 10 & 0x3FF));
        chararr.push(String.fromCharCode(0xDC00 | c1 & 0x3FF));
      } else {
        chararr.push(String.fromCharCode(c1));
      }
    }
  
    return chararr.join("");
  };
  
  amf.Reader.prototype.reset = function() {
    this.objects = [];
    this.traits = [];
    this.strings = [];
  };
  
  amf.Reader.prototype.readObject = function() {
    var type = this.read();
    return this.readObjectValue(type);
  };
  
  amf.Reader.prototype.readString = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
      return this.getString(ref >> 1);
    } else {
      var len = (ref >> 1);
      if (len == 0) {
        return amf.const.EMPTY_STRING;
      }
      var str = this.readUTF(len);
      this.rememberString(str);
      return str;
    }
  };
  
  amf.Reader.prototype.rememberString = function(v) {
    this.strings.push(v);
  };
  
  amf.Reader.prototype.getString = function(v) {
    return this.strings[v];
  };
  
  amf.Reader.prototype.getObject = function(v) {
    return this.objects[v];
  };
  
  amf.Reader.prototype.getTraits = function(v) {
    return this.traits[v];
  };
  
  amf.Reader.prototype.rememberTraits = function(v) {
    this.traits.push(v);
  };
  
  amf.Reader.prototype.rememberObject = function(v) {
    this.objects.push(v);
  };
  
  amf.Reader.prototype.readTraits = function(ref) {
    if ((ref & 3) == 1) {
      return this.getTraits(ref >> 2);
    } else {
      var ti = {
        externalizable: ((ref & 4) == 4),
        dynamic: ((ref & 8) == 8),
        count: (ref >> 4)
      };
      var className = this.readString();
      if (className != null && className != "") {
        ti[amf.const.CLASS_ALIAS] = className;
      }
      ti.props = [];
      for (var i = 0; i < ti.count; i++) {
        ti.props.push(this.readString());
      }
      this.rememberTraits(ti);
      return ti;
    }
  };
  
  amf.Reader.prototype.readScriptObject = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
      return this.getObject(ref >> 1);
    } else {
      var traits = this.readTraits(ref);
      var obj;
      if (amf.const.CLASS_ALIAS in traits) {
        if (amf.classes[traits[amf.const.CLASS_ALIAS]]) {
          obj = new amf.classes[traits[amf.const.CLASS_ALIAS]];
        } else {
          obj = {};
          obj[amf.const.CLASS_ALIAS] = traits[amf.const.CLASS_ALIAS];
        }
      } else {
        obj = {};
      }
      this.rememberObject(obj);
      if (traits.externalizable) {
        if (obj[amf.const.CLASS_ALIAS] == "flex.messaging.io.ArrayCollection"
          || obj[amf.const.CLASS_ALIAS] == "flex.messaging.io.ObjectProxy"
        ) {
          return this.readObject();
        } else {
          obj[amf.const.EXTERNALIZED_FIELD] = this.readObject();
        }
      } else {
        for (var i in traits.props) {
          obj[traits.props[i]] = this.readObject();
        }
        if (traits.dynamic) {
          for (; ;) {
            var name = this.readString();
            if (name == null || name.length == 0) {
              break;
            }
            obj[name] = this.readObject();
          }
        }
      }
      return obj;
    }
  };
  
  amf.Reader.prototype.readArray = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
      return this.getObject(ref >> 1);
    }
    var len = (ref >> 1);
    var map = null, i = 0;
    while (true) {
      var name = this.readString();
      if (!name) {
        break;
      }
      if (!map) {
        map = {};
        this.rememberObject(map);
      }
      map[name] = this.readObject();
    }
    if (!map) {
      var array = new Array(len);
      this.rememberObject(array);
      for (i = 0; i < len; i++) {
        array[i] = this.readObject();
      }
      return array;
    } else {
      for (i = 0; i < len; i++) {
        map[i] = this.readObject();
      }
      return map;
    }
  };
  
  amf.Reader.prototype.readDouble = function() {
    var c1 = this.read() & 255, c2 = this.read() & 255;
    if (c1 === 255) {
      if (c2 === 248) {
        return Number.NaN;
      }
      if (c2 === 240) {
        return Number.NEGATIVE_INFINITY;
      }
    } else if (c1 === 127 && c2 === 240) {
      return Number.POSITIVE_INFINITY;
    }
    var c3 = this.read() & 255, c4 = this.read() & 255, c5 = this.read() & 255,
      c6 = this.read() & 255, c7 = this.read() & 255, c8 = this.read() & 255;
    if (!c1 && !c2 && !c3 && !c4) {
      return 0;
    }
    var d = (c1 << 4 & 2047 | c2 >> 4) - 1023;
    var e = ((c2 & 15) << 16 | c3 << 8 | c4).toString(2);
    for (var i = e.length; i < 20; i++) {
      e = "0" + e;
    }
    var f = ((c5 & 127) << 24 | c6 << 16 | c7 << 8 | c8).toString(2);
    for (var j = f.length; j < 31; j++) {
      f = "0" + f;
    }
    var g = parseInt(e + (c5 >> 7 ? "1" : "0") + f, 2);
    if (g == 0 && d == -1023) {
      return 0;
    }
    return (1 - (c1 >> 7 << 1)) * (1 + amf.const.POW_2_52N * g) * Math.pow(2, d);
  };
  
  amf.Reader.prototype.readDate = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
      return this.getObject(ref >> 1);
    }
    var time = this.readDouble();
    var date = new Date(time);
    this.rememberObject(date);
    return date;
  };
  
  amf.Reader.prototype.readMap = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
      return this.getObject(ref >> 1);
    }
    var length = (ref >> 1);
    var map = null;
    if (length > 0) {
      map = {};
      this.rememberObject(map);
      var name = this.readObject();
      while (name != null) {
        map[name] = this.readObject();
        name = this.readObject();
      }
    }
    return map;
  };
  
  amf.Reader.prototype.readByteArray = function() {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
      return this.getObject(ref >> 1);
    } else {
      var len = (ref >> 1);
      var ba = [];
      this.readFully(ba, 0, len);
      this.rememberObject(ba);
      return ba;
    }
  };
  
  amf.Reader.prototype.readAmf3Vector = function(type) {
    var ref = this.readUInt29();
    if ((ref & 1) == 0) {
      return this.getObject(ref >> 1);
    }
    var len = (ref >> 1);
    var vector = amf.toVector(type, [], this.readBoolean());
    var i;
    if (type === amf.const.AMF3_VECTOR_OBJECT) {
      this.readString(); //className
      for (i = 0; i < len; i++) {
        vector.push(this.readObject());
      }
    } else if (type === amf.const.AMF3_VECTOR_INT) {
      for (i = 0; i < len; i++) {
        vector.push(this.readInt());
      }
    } else if (type === amf.const.AMF3_VECTOR_UINT) {
      for (i = 0; i < len; i++) {
        vector.push(this.readUInt32());
      }
    } else if (type === amf.const.AMF3_VECTOR_DOUBLE) {
      for (i = 0; i < len; i++) {
        vector.push(this.readDouble());
      }
    }
    this.rememberObject(vector);
    return vector;
  };
  
  amf.Reader.prototype.readObjectValue = function(type) {
    var value = null;
  
    switch (type) {
      case amf.const.AMF3_STRING:
        value = this.readString();
        break;
      case amf.const.AMF3_OBJECT:
        try {
          value = this.readScriptObject();
        } catch (e) {
          throw "Failed to deserialize: " + e;
        }
        break;
      case amf.const.AMF3_ARRAY:
        value = this.readArray();
        //value = this.readMap();
        break;
      case amf.const.AMF3_BOOLEAN_FALSE:
        value = false;
        break;
      case amf.const.AMF3_BOOLEAN_TRUE:
        value = true;
        break;
      case amf.const.AMF3_INTEGER:
        value = this.readUInt29();
        // Symmetric with writing an integer to fix sign bits for
        // negative values...
        value = (value << 3) >> 3;
        break;
      case amf.const.AMF3_DOUBLE:
        value = this.readDouble();
        break;
      case amf.const.AMF3_UNDEFINED:
      case amf.const.AMF3_NULL:
        break;
      case amf.const.AMF3_DATE:
        value = this.readDate();
        break;
      case amf.const.AMF3_BYTEARRAY:
        value = this.readByteArray();
        break;
      case amf.const.AMF3_VECTOR_INT:
      case amf.const.AMF3_VECTOR_UINT:
      case amf.const.AMF3_VECTOR_DOUBLE:
      case amf.const.AMF3_VECTOR_OBJECT:
        value = this.readAmf3Vector(type);
        break;
      case amf.const.AMF0_AMF3:
        value = this.readObject();
        break;
      default:
        throw "Unsupported AMF type: " + type;
    }
    return value;
  };
  
  amf.Reader.prototype.readBoolean = function() {
    return this.read() === 1;
  };
  
  amf.Serializer = function() {
    this.writer = new amf.Writer();
  };
  
  amf.Serializer.prototype.writeMessage = function(message) {
    try {
      this.writer.writeShort(message.version);
      this.writer.writeShort(message.headers.length);
      for (var header in message.headers) {
        this.writeHeader(message.headers[header]);
      }
      this.writer.writeShort(message.bodies.length);
      for (var body in message.bodies) {
        this.writeBody(message.bodies[body]);
      }
    } catch (error) {
      console.log(error);
    }
    //return this.writer.getResult();
    return this.writer.data;
  };
  
  amf.Serializer.prototype.writeObject = function(object) {
    this.writer.writeObject(object);
  };
  
  amf.Serializer.prototype.writeHeader = function(header) {
    this.writer.writeUTF(header.name);
    this.writer.writeBoolean(header.mustUnderstand);
    this.writer.writeInt(amf.const.UNKNOWN_CONTENT_LENGTH);
    this.writer.reset();
    //this.writer.writeObject(header.data);
    this.writer.write(amf.const.AMF0_BOOLEAN);
    this.writer.writeBoolean(true);
  };
  
  amf.Serializer.prototype.writeBody = function(body) {
    if (body.targetURI == null) {
      this.writer.writeUTF(amf.const.NULL_STRING);
    } else {
      this.writer.writeUTF(body.targetURI);
    }
    if (body.responseURI == null) {
      this.writer.writeUTF(amf.const.NULL_STRING);
    } else {
      this.writer.writeUTF(body.responseURI);
    }
    this.writer.writeInt(amf.const.UNKNOWN_CONTENT_LENGTH);
    this.writer.reset();
    this.writer.write(amf.const.AMF0_AMF3);
    this.writeObject(body.data);
  };
  
  amf.Deserializer = function(data) {
    this.reader = new amf.Reader(data);
  };
  
  amf.Deserializer.prototype.readMessage = function() {
    var message = new amf.ActionMessage();
    message.version = this.reader.readUnsignedShort();
    var headerCount = this.reader.readUnsignedShort();
    for (var i = 0; i < headerCount; i++) {
      message.headers.push(this.readHeader());
    }
    var bodyCount = this.reader.readUnsignedShort();
    for (i = 0; i < bodyCount; i++) {
      message.bodies.push(this.readBody());
    }
    return message;
  };
  
  amf.Deserializer.prototype.readHeader = function() {
    var header = new amf.MessageHeader();
    header.name = this.reader.readUTF();
    header.mustUnderstand = this.reader.readBoolean();
    this.reader.pos += 4; //length
    this.reader.reset();
    var type = this.reader.read();
    if (type != 2) { //amf0 string
      throw "Only string header data supported.";
    }
    header.data = this.reader.readUTF();
    return header;
  };
  
  amf.Deserializer.prototype.readBody = function() {
    var body = new amf.MessageBody();
    body.targetURI = this.reader.readUTF();
    body.responseURI = this.reader.readUTF();
    this.reader.pos += 4; //length
    this.reader.reset();
    body.data = this.readObject();
    return body;
  };
  
  amf.Deserializer.prototype.readObject = function() {
    return this.reader.readObject();
  };
  
  //https://gist.github.com/jed/982883
  amf.uuid = function c(a,b){
    return a?(b|Math.random()*16>>b/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/1|0|(8)/g,c);
  };
  
  
  amf.toVector = function(type, array, fixed) {
    array = array||[];
    array.type = type||amf.const.AMF3_VECTOR_OBJECT;
    array.fixed = fixed||false;
  
    array.toString = function() {
      var typestr = "object";
      switch (this.type) {
        case amf.const.AMF3_VECTOR_INT:
          typestr = "int";
          break;
        case amf.const.AMF3_VECTOR_UINT:
          typestr = "uint";
          break;
        case amf.const.AMF3_VECTOR_DOUBLE:
          typestr = "double";
          break;
        case amf.const.AMF3_VECTOR_OBJECT:
          typestr = "object";
          break;
      }
      return "[Vector (" + typestr + ")" + (this.fixed ? " fixed" : "") + "]";
    };
  
    return array;
  };
  
  
  /**
  
   Bazed on Promiz - A fast Promises/A+ library
   https://github.com/Zolmeister/promiz
  
   The MIT License (MIT)
  
   Copyright (c) 2014 Zolmeister
  
   Permission is hereby granted, free of charge, to any person obtaining a copy of
   this software and associated documentation files (the "Software"), to deal in
   the Software without restriction, including without limitation the rights to
   use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
   the Software, and to permit persons to whom the Software is furnished to do so,
   subject to the following conditions:
  
   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.
  
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
   FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
   COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
   IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  
   */
  
  (function (self) {
    var now = typeof setImmediate !== 'undefined' ? setImmediate : function(cb) {
      setTimeout(cb, 0)
    }
  
    /**
     * @constructor
     */
    function promise(fn, er) {
      var self = this
  
      self.promise = self
      self.state = 'pending'
      self.val = null
      self.fn = fn || null
      self.er = er || null
      self.next = [];
    }
  
    promise.prototype.resolve = function (v) {
      var self = this
      if (self.state === 'pending') {
        self.val = v
        self.state = 'resolving'
  
        now(function () {
          self.fire()
        })
      }
    }
  
    promise.prototype.reject = function (v) {
      var self = this
      if (self.state === 'pending') {
        self.val = v
        self.state = 'rejecting'
  
        now(function () {
          self.fire()
        })
      }
    }
  
    promise.prototype.then = function (fn, er) {
      var self = this
      var p = new promise(fn, er)
      self.next.push(p)
      if (self.state === 'resolved') {
        p.resolve(self.val)
      }
      if (self.state === 'rejected') {
        p.reject(self.val)
      }
      return p
    }
  
    promise.prototype.fail = function (er) {
      return this.then(null, er)
    }
  
    promise.prototype.finish = function (type) {
      var self = this
      self.state = type
  
      if (self.state === 'resolved') {
        for (var i = 0; i < self.next.length; i++)
          self.next[i].resolve(self.val);
      }
  
      if (self.state === 'rejected') {
        for (var i = 0; i < self.next.length; i++)
          self.next[i].reject(self.val);
      }
    }
  
    // ref : reference to 'then' function
    // cb, ec, cn : successCallback, failureCallback, notThennableCallback
    promise.prototype.thennable = function (ref, cb, ec, cn, val) {
      var self = this
      val = val || self.val
      if (typeof val === 'object' && typeof ref === 'function') {
        try {
          // cnt protects against abuse calls from spec checker
          var cnt = 0
          ref.call(val, function(v) {
            if (cnt++ !== 0) return
            cb(v)
          }, function (v) {
            if (cnt++ !== 0) return
            ec(v)
          })
        } catch (e) {
          ec(e)
        }
      } else {
        cn(val)
      }
    }
  
    promise.prototype.fire = function () {
      var self = this
      // check if it's a thenable
      var ref;
      try {
        ref = self.val && self.val.then
      } catch (e) {
        self.val = e
        self.state = 'rejecting'
        return self.fire()
      }
  
      self.thennable(ref, function (v) {
        self.val = v
        self.state = 'resolving'
        self.fire()
      }, function (v) {
        self.val = v
        self.state = 'rejecting'
        self.fire()
      }, function (v) {
        self.val = v
  
        if (self.state === 'resolving' && typeof self.fn === 'function') {
          try {
            self.val = self.fn.call(undefined, self.val)
          } catch (e) {
            self.val = e
            return self.finish('rejected')
          }
        }
  
        if (self.state === 'rejecting' && typeof self.er === 'function') {
          try {
            self.val = self.er.call(undefined, self.val)
            self.state = 'resolving'
          } catch (e) {
            self.val = e
            return self.finish('rejected')
          }
        }
  
        if (self.val === self) {
          self.val = TypeError()
          return self.finish('rejected')
        }
  
        self.thennable(ref, function (v) {
          self.val = v
          self.finish('resolved')
        }, function (v) {
          self.val = v
          self.finish('rejected')
        }, function (v) {
          self.val = v
          self.state === 'resolving' ? self.finish('resolved') : self.finish('rejected')
        })
  
      })
    }
  
    promise.prototype.done = function () {
      if (this.state = 'rejected' && !this.next) {
        throw this.val
      }
      return null
    }
  
    promise.prototype.nodeify = function (cb) {
      if (typeof cb === 'function') return this.then(function (val) {
        try {
          cb(null, val)
        } catch (e) {
          setImmediate(function () {
            throw e
          })
        }
  
        return val
      }, function (val) {
        try {
          cb(val)
        } catch (e) {
          setImmediate(function () {
            throw e
          })
        }
  
        return val
      })
  
      return this
    }
  
    promise.prototype.spread = function (fn, er) {
      return this.all().then(function (list) {
        return typeof fn === 'function' && fn.apply(null, list)
      }, er)
    }
  
    promise.prototype.all = function() {
      var self = this
      return this.then(function(list){
        var p = new promise()
        if(!(list instanceof Array)) {
          p.reject(TypeError)
          return p
        }
  
        var cnt = 0
        var target = list.length
  
        function done() {
          if (++cnt === target) p.resolve(list)
        }
  
        for(var i=0, l=list.length; i<l; i++) {
          var value = list[i]
          var ref;
  
          try {
            ref = value && value.then
          } catch (e) {
            p.reject(e)
            break
          }
  
          (function(i){
            self.thennable(ref, function(val){
              list[i] = val
              done()
            }, function(val){
              list[i] = val
              done()
            }, function(){
              done()
            }, value)
          })(i)
        }
  
        return p
      })
    }
  
    // self object gets globalalized/exported
    var promiz = {
  
      all:function(list){
        var p = new promise(null, null);
        p.resolve(list);
        return p.all();
      },
      // promise factory
      defer: function () {
        return new promise(null, null)
      },
  
      // calls a function and resolved as a promise
      fcall: function() {
        var def = new promise()
        var args = Array.apply([], arguments)
        var fn = args.shift()
        try {
          var val = fn.apply(null, args)
          def.resolve(val)
        } catch(e) {
          def.reject(e)
        }
  
        return def
      },
  
      // calls a node-style function (eg. expects callback as function(err, callback))
      nfcall: function() {
        var def = new promise()
        var args = Array.apply([], arguments)
        var fn = args.shift()
        try {
  
          // Add our custom promise callback to the end of the arguments
          args.push(function(err, val){
            if(err) {
              return def.reject(err)
            }
            return def.resolve(val)
          })
          fn.apply(null, args)
        } catch (e) {
          def.reject(e)
        }
  
        return def
      }
    }
  
    self.promise = promiz
  })(amf);