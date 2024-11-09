/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.prometheus = (function() {
    
        /**
         * Namespace prometheus.
         * @exports prometheus
         * @namespace
         */
        var prometheus = {};
    
        prometheus.MetricMetadata = (function() {
    
            /**
             * Properties of a MetricMetadata.
             * @memberof prometheus
             * @interface IMetricMetadata
             * @property {prometheus.MetricMetadata.MetricType|null} [type] MetricMetadata type
             * @property {string|null} [metricFamilyName] MetricMetadata metricFamilyName
             * @property {string|null} [help] MetricMetadata help
             * @property {string|null} [unit] MetricMetadata unit
             */
    
            /**
             * Constructs a new MetricMetadata.
             * @memberof prometheus
             * @classdesc Represents a MetricMetadata.
             * @implements IMetricMetadata
             * @constructor
             * @param {prometheus.IMetricMetadata=} [properties] Properties to set
             */
            function MetricMetadata(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * MetricMetadata type.
             * @member {prometheus.MetricMetadata.MetricType} type
             * @memberof prometheus.MetricMetadata
             * @instance
             */
            MetricMetadata.prototype.type = 0;
    
            /**
             * MetricMetadata metricFamilyName.
             * @member {string} metricFamilyName
             * @memberof prometheus.MetricMetadata
             * @instance
             */
            MetricMetadata.prototype.metricFamilyName = "";
    
            /**
             * MetricMetadata help.
             * @member {string} help
             * @memberof prometheus.MetricMetadata
             * @instance
             */
            MetricMetadata.prototype.help = "";
    
            /**
             * MetricMetadata unit.
             * @member {string} unit
             * @memberof prometheus.MetricMetadata
             * @instance
             */
            MetricMetadata.prototype.unit = "";
    
            /**
             * Creates a new MetricMetadata instance using the specified properties.
             * @function create
             * @memberof prometheus.MetricMetadata
             * @static
             * @param {prometheus.IMetricMetadata=} [properties] Properties to set
             * @returns {prometheus.MetricMetadata} MetricMetadata instance
             */
            MetricMetadata.create = function create(properties) {
                return new MetricMetadata(properties);
            };
    
            /**
             * Encodes the specified MetricMetadata message. Does not implicitly {@link prometheus.MetricMetadata.verify|verify} messages.
             * @function encode
             * @memberof prometheus.MetricMetadata
             * @static
             * @param {prometheus.IMetricMetadata} message MetricMetadata message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MetricMetadata.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.type);
                if (message.metricFamilyName != null && Object.hasOwnProperty.call(message, "metricFamilyName"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.metricFamilyName);
                if (message.help != null && Object.hasOwnProperty.call(message, "help"))
                    writer.uint32(/* id 4, wireType 2 =*/34).string(message.help);
                if (message.unit != null && Object.hasOwnProperty.call(message, "unit"))
                    writer.uint32(/* id 5, wireType 2 =*/42).string(message.unit);
                return writer;
            };
    
            /**
             * Encodes the specified MetricMetadata message, length delimited. Does not implicitly {@link prometheus.MetricMetadata.verify|verify} messages.
             * @function encodeDelimited
             * @memberof prometheus.MetricMetadata
             * @static
             * @param {prometheus.IMetricMetadata} message MetricMetadata message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            MetricMetadata.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a MetricMetadata message from the specified reader or buffer.
             * @function decode
             * @memberof prometheus.MetricMetadata
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {prometheus.MetricMetadata} MetricMetadata
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MetricMetadata.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.prometheus.MetricMetadata();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.type = reader.int32();
                        break;
                    case 2:
                        message.metricFamilyName = reader.string();
                        break;
                    case 4:
                        message.help = reader.string();
                        break;
                    case 5:
                        message.unit = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a MetricMetadata message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof prometheus.MetricMetadata
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {prometheus.MetricMetadata} MetricMetadata
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            MetricMetadata.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a MetricMetadata message.
             * @function verify
             * @memberof prometheus.MetricMetadata
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            MetricMetadata.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type != null && message.hasOwnProperty("type"))
                    switch (message.type) {
                    default:
                        return "type: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        break;
                    }
                if (message.metricFamilyName != null && message.hasOwnProperty("metricFamilyName"))
                    if (!$util.isString(message.metricFamilyName))
                        return "metricFamilyName: string expected";
                if (message.help != null && message.hasOwnProperty("help"))
                    if (!$util.isString(message.help))
                        return "help: string expected";
                if (message.unit != null && message.hasOwnProperty("unit"))
                    if (!$util.isString(message.unit))
                        return "unit: string expected";
                return null;
            };
    
            /**
             * Creates a MetricMetadata message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof prometheus.MetricMetadata
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {prometheus.MetricMetadata} MetricMetadata
             */
            MetricMetadata.fromObject = function fromObject(object) {
                if (object instanceof $root.prometheus.MetricMetadata)
                    return object;
                var message = new $root.prometheus.MetricMetadata();
                switch (object.type) {
                case "UNKNOWN":
                case 0:
                    message.type = 0;
                    break;
                case "COUNTER":
                case 1:
                    message.type = 1;
                    break;
                case "GAUGE":
                case 2:
                    message.type = 2;
                    break;
                case "HISTOGRAM":
                case 3:
                    message.type = 3;
                    break;
                case "GAUGEHISTOGRAM":
                case 4:
                    message.type = 4;
                    break;
                case "SUMMARY":
                case 5:
                    message.type = 5;
                    break;
                case "INFO":
                case 6:
                    message.type = 6;
                    break;
                case "STATESET":
                case 7:
                    message.type = 7;
                    break;
                }
                if (object.metricFamilyName != null)
                    message.metricFamilyName = String(object.metricFamilyName);
                if (object.help != null)
                    message.help = String(object.help);
                if (object.unit != null)
                    message.unit = String(object.unit);
                return message;
            };
    
            /**
             * Creates a plain object from a MetricMetadata message. Also converts values to other types if specified.
             * @function toObject
             * @memberof prometheus.MetricMetadata
             * @static
             * @param {prometheus.MetricMetadata} message MetricMetadata
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            MetricMetadata.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.type = options.enums === String ? "UNKNOWN" : 0;
                    object.metricFamilyName = "";
                    object.help = "";
                    object.unit = "";
                }
                if (message.type != null && message.hasOwnProperty("type"))
                    object.type = options.enums === String ? $root.prometheus.MetricMetadata.MetricType[message.type] : message.type;
                if (message.metricFamilyName != null && message.hasOwnProperty("metricFamilyName"))
                    object.metricFamilyName = message.metricFamilyName;
                if (message.help != null && message.hasOwnProperty("help"))
                    object.help = message.help;
                if (message.unit != null && message.hasOwnProperty("unit"))
                    object.unit = message.unit;
                return object;
            };
    
            /**
             * Converts this MetricMetadata to JSON.
             * @function toJSON
             * @memberof prometheus.MetricMetadata
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            MetricMetadata.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            /**
             * MetricType enum.
             * @name prometheus.MetricMetadata.MetricType
             * @enum {number}
             * @property {number} UNKNOWN=0 UNKNOWN value
             * @property {number} COUNTER=1 COUNTER value
             * @property {number} GAUGE=2 GAUGE value
             * @property {number} HISTOGRAM=3 HISTOGRAM value
             * @property {number} GAUGEHISTOGRAM=4 GAUGEHISTOGRAM value
             * @property {number} SUMMARY=5 SUMMARY value
             * @property {number} INFO=6 INFO value
             * @property {number} STATESET=7 STATESET value
             */
            MetricMetadata.MetricType = (function() {
                var valuesById = {}, values = Object.create(valuesById);
                values[valuesById[0] = "UNKNOWN"] = 0;
                values[valuesById[1] = "COUNTER"] = 1;
                values[valuesById[2] = "GAUGE"] = 2;
                values[valuesById[3] = "HISTOGRAM"] = 3;
                values[valuesById[4] = "GAUGEHISTOGRAM"] = 4;
                values[valuesById[5] = "SUMMARY"] = 5;
                values[valuesById[6] = "INFO"] = 6;
                values[valuesById[7] = "STATESET"] = 7;
                return values;
            })();
    
            return MetricMetadata;
        })();
    
        prometheus.Sample = (function() {
    
            /**
             * Properties of a Sample.
             * @memberof prometheus
             * @interface ISample
             * @property {number|null} [value] Sample value
             * @property {number|Long|null} [timestamp] Sample timestamp
             */
    
            /**
             * Constructs a new Sample.
             * @memberof prometheus
             * @classdesc Represents a Sample.
             * @implements ISample
             * @constructor
             * @param {prometheus.ISample=} [properties] Properties to set
             */
            function Sample(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Sample value.
             * @member {number} value
             * @memberof prometheus.Sample
             * @instance
             */
            Sample.prototype.value = 0;
    
            /**
             * Sample timestamp.
             * @member {number|Long} timestamp
             * @memberof prometheus.Sample
             * @instance
             */
            Sample.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
            /**
             * Creates a new Sample instance using the specified properties.
             * @function create
             * @memberof prometheus.Sample
             * @static
             * @param {prometheus.ISample=} [properties] Properties to set
             * @returns {prometheus.Sample} Sample instance
             */
            Sample.create = function create(properties) {
                return new Sample(properties);
            };
    
            /**
             * Encodes the specified Sample message. Does not implicitly {@link prometheus.Sample.verify|verify} messages.
             * @function encode
             * @memberof prometheus.Sample
             * @static
             * @param {prometheus.ISample} message Sample message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Sample.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 1, wireType 1 =*/9).double(message.value);
                if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int64(message.timestamp);
                return writer;
            };
    
            /**
             * Encodes the specified Sample message, length delimited. Does not implicitly {@link prometheus.Sample.verify|verify} messages.
             * @function encodeDelimited
             * @memberof prometheus.Sample
             * @static
             * @param {prometheus.ISample} message Sample message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Sample.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Sample message from the specified reader or buffer.
             * @function decode
             * @memberof prometheus.Sample
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {prometheus.Sample} Sample
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Sample.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.prometheus.Sample();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.value = reader.double();
                        break;
                    case 2:
                        message.timestamp = reader.int64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Sample message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof prometheus.Sample
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {prometheus.Sample} Sample
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Sample.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Sample message.
             * @function verify
             * @memberof prometheus.Sample
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Sample.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (typeof message.value !== "number")
                        return "value: number expected";
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                        return "timestamp: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a Sample message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof prometheus.Sample
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {prometheus.Sample} Sample
             */
            Sample.fromObject = function fromObject(object) {
                if (object instanceof $root.prometheus.Sample)
                    return object;
                var message = new $root.prometheus.Sample();
                if (object.value != null)
                    message.value = Number(object.value);
                if (object.timestamp != null)
                    if ($util.Long)
                        (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = false;
                    else if (typeof object.timestamp === "string")
                        message.timestamp = parseInt(object.timestamp, 10);
                    else if (typeof object.timestamp === "number")
                        message.timestamp = object.timestamp;
                    else if (typeof object.timestamp === "object")
                        message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
                return message;
            };
    
            /**
             * Creates a plain object from a Sample message. Also converts values to other types if specified.
             * @function toObject
             * @memberof prometheus.Sample
             * @static
             * @param {prometheus.Sample} message Sample
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Sample.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.value = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestamp = options.longs === String ? "0" : 0;
                }
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (typeof message.timestamp === "number")
                        object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                    else
                        object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
                return object;
            };
    
            /**
             * Converts this Sample to JSON.
             * @function toJSON
             * @memberof prometheus.Sample
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Sample.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Sample;
        })();
    
        prometheus.Exemplar = (function() {
    
            /**
             * Properties of an Exemplar.
             * @memberof prometheus
             * @interface IExemplar
             * @property {Array.<prometheus.ILabel>|null} [labels] Exemplar labels
             * @property {number|null} [value] Exemplar value
             * @property {number|Long|null} [timestamp] Exemplar timestamp
             */
    
            /**
             * Constructs a new Exemplar.
             * @memberof prometheus
             * @classdesc Represents an Exemplar.
             * @implements IExemplar
             * @constructor
             * @param {prometheus.IExemplar=} [properties] Properties to set
             */
            function Exemplar(properties) {
                this.labels = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Exemplar labels.
             * @member {Array.<prometheus.ILabel>} labels
             * @memberof prometheus.Exemplar
             * @instance
             */
            Exemplar.prototype.labels = $util.emptyArray;
    
            /**
             * Exemplar value.
             * @member {number} value
             * @memberof prometheus.Exemplar
             * @instance
             */
            Exemplar.prototype.value = 0;
    
            /**
             * Exemplar timestamp.
             * @member {number|Long} timestamp
             * @memberof prometheus.Exemplar
             * @instance
             */
            Exemplar.prototype.timestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
            /**
             * Creates a new Exemplar instance using the specified properties.
             * @function create
             * @memberof prometheus.Exemplar
             * @static
             * @param {prometheus.IExemplar=} [properties] Properties to set
             * @returns {prometheus.Exemplar} Exemplar instance
             */
            Exemplar.create = function create(properties) {
                return new Exemplar(properties);
            };
    
            /**
             * Encodes the specified Exemplar message. Does not implicitly {@link prometheus.Exemplar.verify|verify} messages.
             * @function encode
             * @memberof prometheus.Exemplar
             * @static
             * @param {prometheus.IExemplar} message Exemplar message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Exemplar.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.labels != null && message.labels.length)
                    for (var i = 0; i < message.labels.length; ++i)
                        $root.prometheus.Label.encode(message.labels[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 2, wireType 1 =*/17).double(message.value);
                if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int64(message.timestamp);
                return writer;
            };
    
            /**
             * Encodes the specified Exemplar message, length delimited. Does not implicitly {@link prometheus.Exemplar.verify|verify} messages.
             * @function encodeDelimited
             * @memberof prometheus.Exemplar
             * @static
             * @param {prometheus.IExemplar} message Exemplar message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Exemplar.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes an Exemplar message from the specified reader or buffer.
             * @function decode
             * @memberof prometheus.Exemplar
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {prometheus.Exemplar} Exemplar
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Exemplar.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.prometheus.Exemplar();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.labels && message.labels.length))
                            message.labels = [];
                        message.labels.push($root.prometheus.Label.decode(reader, reader.uint32()));
                        break;
                    case 2:
                        message.value = reader.double();
                        break;
                    case 3:
                        message.timestamp = reader.int64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes an Exemplar message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof prometheus.Exemplar
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {prometheus.Exemplar} Exemplar
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Exemplar.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies an Exemplar message.
             * @function verify
             * @memberof prometheus.Exemplar
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Exemplar.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.labels != null && message.hasOwnProperty("labels")) {
                    if (!Array.isArray(message.labels))
                        return "labels: array expected";
                    for (var i = 0; i < message.labels.length; ++i) {
                        var error = $root.prometheus.Label.verify(message.labels[i]);
                        if (error)
                            return "labels." + error;
                    }
                }
                if (message.value != null && message.hasOwnProperty("value"))
                    if (typeof message.value !== "number")
                        return "value: number expected";
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (!$util.isInteger(message.timestamp) && !(message.timestamp && $util.isInteger(message.timestamp.low) && $util.isInteger(message.timestamp.high)))
                        return "timestamp: integer|Long expected";
                return null;
            };
    
            /**
             * Creates an Exemplar message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof prometheus.Exemplar
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {prometheus.Exemplar} Exemplar
             */
            Exemplar.fromObject = function fromObject(object) {
                if (object instanceof $root.prometheus.Exemplar)
                    return object;
                var message = new $root.prometheus.Exemplar();
                if (object.labels) {
                    if (!Array.isArray(object.labels))
                        throw TypeError(".prometheus.Exemplar.labels: array expected");
                    message.labels = [];
                    for (var i = 0; i < object.labels.length; ++i) {
                        if (typeof object.labels[i] !== "object")
                            throw TypeError(".prometheus.Exemplar.labels: object expected");
                        message.labels[i] = $root.prometheus.Label.fromObject(object.labels[i]);
                    }
                }
                if (object.value != null)
                    message.value = Number(object.value);
                if (object.timestamp != null)
                    if ($util.Long)
                        (message.timestamp = $util.Long.fromValue(object.timestamp)).unsigned = false;
                    else if (typeof object.timestamp === "string")
                        message.timestamp = parseInt(object.timestamp, 10);
                    else if (typeof object.timestamp === "number")
                        message.timestamp = object.timestamp;
                    else if (typeof object.timestamp === "object")
                        message.timestamp = new $util.LongBits(object.timestamp.low >>> 0, object.timestamp.high >>> 0).toNumber();
                return message;
            };
    
            /**
             * Creates a plain object from an Exemplar message. Also converts values to other types if specified.
             * @function toObject
             * @memberof prometheus.Exemplar
             * @static
             * @param {prometheus.Exemplar} message Exemplar
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Exemplar.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.labels = [];
                if (options.defaults) {
                    object.value = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, false);
                        object.timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.timestamp = options.longs === String ? "0" : 0;
                }
                if (message.labels && message.labels.length) {
                    object.labels = [];
                    for (var j = 0; j < message.labels.length; ++j)
                        object.labels[j] = $root.prometheus.Label.toObject(message.labels[j], options);
                }
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
                if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                    if (typeof message.timestamp === "number")
                        object.timestamp = options.longs === String ? String(message.timestamp) : message.timestamp;
                    else
                        object.timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.timestamp) : options.longs === Number ? new $util.LongBits(message.timestamp.low >>> 0, message.timestamp.high >>> 0).toNumber() : message.timestamp;
                return object;
            };
    
            /**
             * Converts this Exemplar to JSON.
             * @function toJSON
             * @memberof prometheus.Exemplar
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Exemplar.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Exemplar;
        })();
    
        prometheus.TimeSeries = (function() {
    
            /**
             * Properties of a TimeSeries.
             * @memberof prometheus
             * @interface ITimeSeries
             * @property {Array.<prometheus.ILabel>|null} [labels] TimeSeries labels
             * @property {Array.<prometheus.ISample>|null} [samples] TimeSeries samples
             * @property {Array.<prometheus.IExemplar>|null} [exemplars] TimeSeries exemplars
             */
    
            /**
             * Constructs a new TimeSeries.
             * @memberof prometheus
             * @classdesc Represents a TimeSeries.
             * @implements ITimeSeries
             * @constructor
             * @param {prometheus.ITimeSeries=} [properties] Properties to set
             */
            function TimeSeries(properties) {
                this.labels = [];
                this.samples = [];
                this.exemplars = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TimeSeries labels.
             * @member {Array.<prometheus.ILabel>} labels
             * @memberof prometheus.TimeSeries
             * @instance
             */
            TimeSeries.prototype.labels = $util.emptyArray;
    
            /**
             * TimeSeries samples.
             * @member {Array.<prometheus.ISample>} samples
             * @memberof prometheus.TimeSeries
             * @instance
             */
            TimeSeries.prototype.samples = $util.emptyArray;
    
            /**
             * TimeSeries exemplars.
             * @member {Array.<prometheus.IExemplar>} exemplars
             * @memberof prometheus.TimeSeries
             * @instance
             */
            TimeSeries.prototype.exemplars = $util.emptyArray;
    
            /**
             * Creates a new TimeSeries instance using the specified properties.
             * @function create
             * @memberof prometheus.TimeSeries
             * @static
             * @param {prometheus.ITimeSeries=} [properties] Properties to set
             * @returns {prometheus.TimeSeries} TimeSeries instance
             */
            TimeSeries.create = function create(properties) {
                return new TimeSeries(properties);
            };
    
            /**
             * Encodes the specified TimeSeries message. Does not implicitly {@link prometheus.TimeSeries.verify|verify} messages.
             * @function encode
             * @memberof prometheus.TimeSeries
             * @static
             * @param {prometheus.ITimeSeries} message TimeSeries message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TimeSeries.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.labels != null && message.labels.length)
                    for (var i = 0; i < message.labels.length; ++i)
                        $root.prometheus.Label.encode(message.labels[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.samples != null && message.samples.length)
                    for (var i = 0; i < message.samples.length; ++i)
                        $root.prometheus.Sample.encode(message.samples[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.exemplars != null && message.exemplars.length)
                    for (var i = 0; i < message.exemplars.length; ++i)
                        $root.prometheus.Exemplar.encode(message.exemplars[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified TimeSeries message, length delimited. Does not implicitly {@link prometheus.TimeSeries.verify|verify} messages.
             * @function encodeDelimited
             * @memberof prometheus.TimeSeries
             * @static
             * @param {prometheus.ITimeSeries} message TimeSeries message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TimeSeries.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TimeSeries message from the specified reader or buffer.
             * @function decode
             * @memberof prometheus.TimeSeries
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {prometheus.TimeSeries} TimeSeries
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TimeSeries.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.prometheus.TimeSeries();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.labels && message.labels.length))
                            message.labels = [];
                        message.labels.push($root.prometheus.Label.decode(reader, reader.uint32()));
                        break;
                    case 2:
                        if (!(message.samples && message.samples.length))
                            message.samples = [];
                        message.samples.push($root.prometheus.Sample.decode(reader, reader.uint32()));
                        break;
                    case 3:
                        if (!(message.exemplars && message.exemplars.length))
                            message.exemplars = [];
                        message.exemplars.push($root.prometheus.Exemplar.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TimeSeries message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof prometheus.TimeSeries
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {prometheus.TimeSeries} TimeSeries
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TimeSeries.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TimeSeries message.
             * @function verify
             * @memberof prometheus.TimeSeries
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TimeSeries.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.labels != null && message.hasOwnProperty("labels")) {
                    if (!Array.isArray(message.labels))
                        return "labels: array expected";
                    for (var i = 0; i < message.labels.length; ++i) {
                        var error = $root.prometheus.Label.verify(message.labels[i]);
                        if (error)
                            return "labels." + error;
                    }
                }
                if (message.samples != null && message.hasOwnProperty("samples")) {
                    if (!Array.isArray(message.samples))
                        return "samples: array expected";
                    for (var i = 0; i < message.samples.length; ++i) {
                        var error = $root.prometheus.Sample.verify(message.samples[i]);
                        if (error)
                            return "samples." + error;
                    }
                }
                if (message.exemplars != null && message.hasOwnProperty("exemplars")) {
                    if (!Array.isArray(message.exemplars))
                        return "exemplars: array expected";
                    for (var i = 0; i < message.exemplars.length; ++i) {
                        var error = $root.prometheus.Exemplar.verify(message.exemplars[i]);
                        if (error)
                            return "exemplars." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a TimeSeries message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof prometheus.TimeSeries
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {prometheus.TimeSeries} TimeSeries
             */
            TimeSeries.fromObject = function fromObject(object) {
                if (object instanceof $root.prometheus.TimeSeries)
                    return object;
                var message = new $root.prometheus.TimeSeries();
                if (object.labels) {
                    if (!Array.isArray(object.labels))
                        throw TypeError(".prometheus.TimeSeries.labels: array expected");
                    message.labels = [];
                    for (var i = 0; i < object.labels.length; ++i) {
                        if (typeof object.labels[i] !== "object")
                            throw TypeError(".prometheus.TimeSeries.labels: object expected");
                        message.labels[i] = $root.prometheus.Label.fromObject(object.labels[i]);
                    }
                }
                if (object.samples) {
                    if (!Array.isArray(object.samples))
                        throw TypeError(".prometheus.TimeSeries.samples: array expected");
                    message.samples = [];
                    for (var i = 0; i < object.samples.length; ++i) {
                        if (typeof object.samples[i] !== "object")
                            throw TypeError(".prometheus.TimeSeries.samples: object expected");
                        message.samples[i] = $root.prometheus.Sample.fromObject(object.samples[i]);
                    }
                }
                if (object.exemplars) {
                    if (!Array.isArray(object.exemplars))
                        throw TypeError(".prometheus.TimeSeries.exemplars: array expected");
                    message.exemplars = [];
                    for (var i = 0; i < object.exemplars.length; ++i) {
                        if (typeof object.exemplars[i] !== "object")
                            throw TypeError(".prometheus.TimeSeries.exemplars: object expected");
                        message.exemplars[i] = $root.prometheus.Exemplar.fromObject(object.exemplars[i]);
                    }
                }
                return message;
            };
    
            /**
             * Creates a plain object from a TimeSeries message. Also converts values to other types if specified.
             * @function toObject
             * @memberof prometheus.TimeSeries
             * @static
             * @param {prometheus.TimeSeries} message TimeSeries
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TimeSeries.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.labels = [];
                    object.samples = [];
                    object.exemplars = [];
                }
                if (message.labels && message.labels.length) {
                    object.labels = [];
                    for (var j = 0; j < message.labels.length; ++j)
                        object.labels[j] = $root.prometheus.Label.toObject(message.labels[j], options);
                }
                if (message.samples && message.samples.length) {
                    object.samples = [];
                    for (var j = 0; j < message.samples.length; ++j)
                        object.samples[j] = $root.prometheus.Sample.toObject(message.samples[j], options);
                }
                if (message.exemplars && message.exemplars.length) {
                    object.exemplars = [];
                    for (var j = 0; j < message.exemplars.length; ++j)
                        object.exemplars[j] = $root.prometheus.Exemplar.toObject(message.exemplars[j], options);
                }
                return object;
            };
    
            /**
             * Converts this TimeSeries to JSON.
             * @function toJSON
             * @memberof prometheus.TimeSeries
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TimeSeries.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TimeSeries;
        })();
    
        prometheus.Label = (function() {
    
            /**
             * Properties of a Label.
             * @memberof prometheus
             * @interface ILabel
             * @property {string|null} [name] Label name
             * @property {string|null} [value] Label value
             */
    
            /**
             * Constructs a new Label.
             * @memberof prometheus
             * @classdesc Represents a Label.
             * @implements ILabel
             * @constructor
             * @param {prometheus.ILabel=} [properties] Properties to set
             */
            function Label(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Label name.
             * @member {string} name
             * @memberof prometheus.Label
             * @instance
             */
            Label.prototype.name = "";
    
            /**
             * Label value.
             * @member {string} value
             * @memberof prometheus.Label
             * @instance
             */
            Label.prototype.value = "";
    
            /**
             * Creates a new Label instance using the specified properties.
             * @function create
             * @memberof prometheus.Label
             * @static
             * @param {prometheus.ILabel=} [properties] Properties to set
             * @returns {prometheus.Label} Label instance
             */
            Label.create = function create(properties) {
                return new Label(properties);
            };
    
            /**
             * Encodes the specified Label message. Does not implicitly {@link prometheus.Label.verify|verify} messages.
             * @function encode
             * @memberof prometheus.Label
             * @static
             * @param {prometheus.ILabel} message Label message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Label.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.value);
                return writer;
            };
    
            /**
             * Encodes the specified Label message, length delimited. Does not implicitly {@link prometheus.Label.verify|verify} messages.
             * @function encodeDelimited
             * @memberof prometheus.Label
             * @static
             * @param {prometheus.ILabel} message Label message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Label.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Label message from the specified reader or buffer.
             * @function decode
             * @memberof prometheus.Label
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {prometheus.Label} Label
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Label.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.prometheus.Label();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.name = reader.string();
                        break;
                    case 2:
                        message.value = reader.string();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Label message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof prometheus.Label
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {prometheus.Label} Label
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Label.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Label message.
             * @function verify
             * @memberof prometheus.Label
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Label.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!$util.isString(message.value))
                        return "value: string expected";
                return null;
            };
    
            /**
             * Creates a Label message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof prometheus.Label
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {prometheus.Label} Label
             */
            Label.fromObject = function fromObject(object) {
                if (object instanceof $root.prometheus.Label)
                    return object;
                var message = new $root.prometheus.Label();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.value != null)
                    message.value = String(object.value);
                return message;
            };
    
            /**
             * Creates a plain object from a Label message. Also converts values to other types if specified.
             * @function toObject
             * @memberof prometheus.Label
             * @static
             * @param {prometheus.Label} message Label
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Label.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.name = "";
                    object.value = "";
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = message.value;
                return object;
            };
    
            /**
             * Converts this Label to JSON.
             * @function toJSON
             * @memberof prometheus.Label
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Label.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Label;
        })();
    
        prometheus.WriteRequest = (function() {
    
            /**
             * Properties of a WriteRequest.
             * @memberof prometheus
             * @interface IWriteRequest
             * @property {Array.<prometheus.ITimeSeries>|null} [timeseries] WriteRequest timeseries
             * @property {Array.<prometheus.IMetricMetadata>|null} [metadata] WriteRequest metadata
             */
    
            /**
             * Constructs a new WriteRequest.
             * @memberof prometheus
             * @classdesc Represents a WriteRequest.
             * @implements IWriteRequest
             * @constructor
             * @param {prometheus.IWriteRequest=} [properties] Properties to set
             */
            function WriteRequest(properties) {
                this.timeseries = [];
                this.metadata = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * WriteRequest timeseries.
             * @member {Array.<prometheus.ITimeSeries>} timeseries
             * @memberof prometheus.WriteRequest
             * @instance
             */
            WriteRequest.prototype.timeseries = $util.emptyArray;
    
            /**
             * WriteRequest metadata.
             * @member {Array.<prometheus.IMetricMetadata>} metadata
             * @memberof prometheus.WriteRequest
             * @instance
             */
            WriteRequest.prototype.metadata = $util.emptyArray;
    
            /**
             * Creates a new WriteRequest instance using the specified properties.
             * @function create
             * @memberof prometheus.WriteRequest
             * @static
             * @param {prometheus.IWriteRequest=} [properties] Properties to set
             * @returns {prometheus.WriteRequest} WriteRequest instance
             */
            WriteRequest.create = function create(properties) {
                return new WriteRequest(properties);
            };
    
            /**
             * Encodes the specified WriteRequest message. Does not implicitly {@link prometheus.WriteRequest.verify|verify} messages.
             * @function encode
             * @memberof prometheus.WriteRequest
             * @static
             * @param {prometheus.IWriteRequest} message WriteRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WriteRequest.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.timeseries != null && message.timeseries.length)
                    for (var i = 0; i < message.timeseries.length; ++i)
                        $root.prometheus.TimeSeries.encode(message.timeseries[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.metadata != null && message.metadata.length)
                    for (var i = 0; i < message.metadata.length; ++i)
                        $root.prometheus.MetricMetadata.encode(message.metadata[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified WriteRequest message, length delimited. Does not implicitly {@link prometheus.WriteRequest.verify|verify} messages.
             * @function encodeDelimited
             * @memberof prometheus.WriteRequest
             * @static
             * @param {prometheus.IWriteRequest} message WriteRequest message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            WriteRequest.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a WriteRequest message from the specified reader or buffer.
             * @function decode
             * @memberof prometheus.WriteRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {prometheus.WriteRequest} WriteRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WriteRequest.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.prometheus.WriteRequest();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.timeseries && message.timeseries.length))
                            message.timeseries = [];
                        message.timeseries.push($root.prometheus.TimeSeries.decode(reader, reader.uint32()));
                        break;
                    case 3:
                        if (!(message.metadata && message.metadata.length))
                            message.metadata = [];
                        message.metadata.push($root.prometheus.MetricMetadata.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a WriteRequest message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof prometheus.WriteRequest
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {prometheus.WriteRequest} WriteRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            WriteRequest.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a WriteRequest message.
             * @function verify
             * @memberof prometheus.WriteRequest
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            WriteRequest.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.timeseries != null && message.hasOwnProperty("timeseries")) {
                    if (!Array.isArray(message.timeseries))
                        return "timeseries: array expected";
                    for (var i = 0; i < message.timeseries.length; ++i) {
                        var error = $root.prometheus.TimeSeries.verify(message.timeseries[i]);
                        if (error)
                            return "timeseries." + error;
                    }
                }
                if (message.metadata != null && message.hasOwnProperty("metadata")) {
                    if (!Array.isArray(message.metadata))
                        return "metadata: array expected";
                    for (var i = 0; i < message.metadata.length; ++i) {
                        var error = $root.prometheus.MetricMetadata.verify(message.metadata[i]);
                        if (error)
                            return "metadata." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a WriteRequest message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof prometheus.WriteRequest
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {prometheus.WriteRequest} WriteRequest
             */
            WriteRequest.fromObject = function fromObject(object) {
                if (object instanceof $root.prometheus.WriteRequest)
                    return object;
                var message = new $root.prometheus.WriteRequest();
                if (object.timeseries) {
                    if (!Array.isArray(object.timeseries))
                        throw TypeError(".prometheus.WriteRequest.timeseries: array expected");
                    message.timeseries = [];
                    for (var i = 0; i < object.timeseries.length; ++i) {
                        if (typeof object.timeseries[i] !== "object")
                            throw TypeError(".prometheus.WriteRequest.timeseries: object expected");
                        message.timeseries[i] = $root.prometheus.TimeSeries.fromObject(object.timeseries[i]);
                    }
                }
                if (object.metadata) {
                    if (!Array.isArray(object.metadata))
                        throw TypeError(".prometheus.WriteRequest.metadata: array expected");
                    message.metadata = [];
                    for (var i = 0; i < object.metadata.length; ++i) {
                        if (typeof object.metadata[i] !== "object")
                            throw TypeError(".prometheus.WriteRequest.metadata: object expected");
                        message.metadata[i] = $root.prometheus.MetricMetadata.fromObject(object.metadata[i]);
                    }
                }
                return message;
            };
    
            /**
             * Creates a plain object from a WriteRequest message. Also converts values to other types if specified.
             * @function toObject
             * @memberof prometheus.WriteRequest
             * @static
             * @param {prometheus.WriteRequest} message WriteRequest
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            WriteRequest.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults) {
                    object.timeseries = [];
                    object.metadata = [];
                }
                if (message.timeseries && message.timeseries.length) {
                    object.timeseries = [];
                    for (var j = 0; j < message.timeseries.length; ++j)
                        object.timeseries[j] = $root.prometheus.TimeSeries.toObject(message.timeseries[j], options);
                }
                if (message.metadata && message.metadata.length) {
                    object.metadata = [];
                    for (var j = 0; j < message.metadata.length; ++j)
                        object.metadata[j] = $root.prometheus.MetricMetadata.toObject(message.metadata[j], options);
                }
                return object;
            };
    
            /**
             * Converts this WriteRequest to JSON.
             * @function toJSON
             * @memberof prometheus.WriteRequest
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            WriteRequest.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return WriteRequest;
        })();
    
        return prometheus;
    })();

    return $root;
});