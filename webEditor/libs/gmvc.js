var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var gmvc;
var DEBUG = false;
(function (gmvc) {
    class BaseObject {
        constructor() {
            this.hashCode = BaseObject._hashCode++;
        }
        static toString() {
            throw new Error();
        }
        static getInstance(clazz) {
            const classType = String(clazz);
            let instance = BaseObject.instances[classType];
            if (!instance) {
                instance = BaseObject.instances[classType] = BaseObject.create(clazz);
            }
            return instance;
        }
        static create(clazz) {
            const pool = BaseObject.poolsMap[String(clazz)];
            if (pool && pool.length > 0) {
                const object = pool.pop();
                return object;
            }
            const object = new clazz();
            object._onClear();
            return object;
        }
        static setMaxCount(clazz, maxCount) {
            if (maxCount < 0 || maxCount !== maxCount) {
                maxCount = 0;
            }
            if (clazz) {
                const classType = String(clazz);
                BaseObject.maxCountMap[classType] = maxCount;
                const pool = BaseObject.poolsMap[classType];
                if (pool && pool.length > maxCount) {
                    pool.length = maxCount;
                }
            }
            else {
                BaseObject.defaultMaxCount = maxCount;
                for (let classType in BaseObject.poolsMap) {
                    if (!BaseObject.maxCountMap[classType]) {
                        continue;
                    }
                    BaseObject.maxCountMap[classType] = maxCount;
                    const pool = BaseObject.poolsMap[classType];
                    if (pool.length > maxCount) {
                        pool.length = maxCount;
                    }
                }
            }
        }
        static clearPool(clazz) {
            if (clazz) {
                const pool = BaseObject.poolsMap[String(clazz)];
                if (pool && pool.length) {
                    pool.length = 0;
                }
            }
            else {
                for (let k in BaseObject.poolsMap) {
                    const pool = BaseObject.poolsMap[k];
                    pool.length = 0;
                }
            }
        }
        static _returnToPool(object) {
            const classType = String(object.constructor);
            const maxCount = classType in BaseObject.maxCountMap ? BaseObject.defaultMaxCount : BaseObject.maxCountMap[classType];
            const pool = BaseObject.poolsMap[classType] = BaseObject.poolsMap[classType] || [];
            if (pool.length < maxCount) {
                console.assert(pool.indexOf(object) < 0);
                pool.push(object);
            }
        }
        setHashCode(hashcode) {
            this.hashCode = hashcode;
            if (hashcode >= BaseObject._hashCode) {
                BaseObject._hashCode = hashcode + 1;
            }
        }
        returnToPool() {
            this._onClear();
            BaseObject._returnToPool(this);
        }
        dispose() {
            this._onClear();
        }
    }
    BaseObject.defaultMaxCount = 5000;
    BaseObject.instances = {};
    BaseObject.maxCountMap = {};
    BaseObject.poolsMap = {};
    BaseObject._hashCode = 0;
    gmvc.BaseObject = BaseObject;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class Event extends gmvc.BaseObject {
        constructor() {
            super(...arguments);
            this.type = "";
            this.data = null;
        }
        static toString() {
            return "[class Event]";
        }
        _onClear() {
            this.type = "";
            this.data = null;
        }
        toString() {
            return "[object Event Type " + this.type + " Data " + this.data + "]";
        }
        copyFrom(value) {
            this.type = value.type;
            this.data = value.data;
            this.target = value.target;
            return this;
        }
    }
    gmvc.Event = Event;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class EventDispatcher extends gmvc.BaseObject {
        static toString() {
            return "[class EventDispatcher]";
        }
        constructor() {
            super();
            this._dipatchLevel = 0;
            this._listenerBins = {};
        }
        _onClear() {
            for (let i in this._listenerBins) {
                delete this._listenerBins[i];
            }
            this._dipatchLevel = 0;
        }
        _isSameListener(a, b) {
            return a === b;
        }
        hasEventListener(type, callback) {
            const bin = this._listenerBins[type];
            if (!callback) {
                return bin && bin.length > 0;
            }
            else if (bin && bin.length) {
                for (let i = 0, len = bin.length; i < len; i++) {
                    const oneBin = bin[i];
                    if (oneBin.listener === callback) {
                        return true;
                    }
                }
            }
            return false;
        }
        addEventListener(type, listener, thisTarget, data = null, priority = 0, once = false) {
            this.removeEventListener(type, listener);
            let listenerBins = this._listenerBins[type];
            if (listenerBins) {
                if (this._dipatchLevel !== 0) {
                    this._listenerBins[type] = listenerBins = listenerBins.concat();
                }
            }
            else {
                this._listenerBins[type] = listenerBins = [];
            }
            let newBin = { listener: listener, thisTarget: thisTarget, data: data, priority: priority, once: once };
            for (let i = 0, len = listenerBins.length; i < len; i++) {
                let bin = listenerBins[i];
                if (bin.priority > priority) {
                    listenerBins.splice(i, 0, newBin);
                    return;
                }
            }
            listenerBins.push(newBin);
        }
        removeEventListener(type, listener, data = null) {
            let listenerBins = this._listenerBins[type];
            if (listenerBins) {
                if (this._dipatchLevel !== 0) {
                    this._listenerBins[type] = listenerBins = listenerBins.concat();
                }
                for (let i = 0, l = listenerBins.length; i < l; ++i) {
                    const listenerBin = listenerBins[i];
                    if (listenerBin.listener === listener && this._isSameListener(listenerBin.data, data)) {
                        listenerBins.splice(i, 1);
                        l--;
                    }
                }
            }
        }
        removeAllEventListener(type) {
            if (type) {
                delete this._listenerBins[type];
            }
            else {
                for (let i in this._listenerBins) {
                    delete this._listenerBins[i];
                }
            }
        }
        dispatchEvent(event) {
            const type = event.type;
            const listenerBins = this._listenerBins[type];
            if (listenerBins) {
                event.target = this;
                if (!event.currentTarget) {
                    event.currentTarget = event.target;
                }
                this._dipatchLevel++;
                for (let listenerBin of listenerBins) {
                    listenerBin.listener.call(listenerBin.thisTarget, event, listenerBin.data);
                }
                for (let listenerBin of listenerBins) {
                    if (listenerBin.once) {
                        this.removeEventListener(type, listenerBin.listener, listenerBin.data);
                    }
                }
                this._dipatchLevel--;
            }
        }
        dispatchEventWidth(type, data) {
            const event = gmvc.Event.create(gmvc.Event);
            event.type = type;
            event.data = data;
            this.dispatchEvent(event);
            event.returnToPool();
        }
        on(type, listener, thisTarget, data = null, priority = 0) {
            this.addEventListener(type, listener, thisTarget, data, priority, false);
        }
        once(type, listener, thisTarget, data = null, priority = 0) {
            this.addEventListener(type, listener, thisTarget, data, priority, true);
        }
        off(type, listener, data = null) {
            this.removeEventListener(type, listener, data);
        }
        offAll(type) {
            this.removeAllEventListener(type);
        }
    }
    gmvc.EventDispatcher = EventDispatcher;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class Model extends gmvc.BaseObject {
        /**
         * 发送通知。
         */
        _sendNotification(type, data = null) {
            gmvc.context.sendNotification(type, data, this);
        }
        _onClear() {
        }
    }
    gmvc.Model = Model;
})(gmvc || (gmvc = {}));
/// <reference path="../mvc/Model.ts" />
var gmvc;
(function (gmvc) {
    /**
     * 历史状态基类。
     */
    class BaseState extends gmvc.Model {
        constructor() {
            super(...arguments);
            /**
             * 执行此状态时是否需要触发事件，并做为事件自定义参数。
             */
            this.data = null;
            /**
             * 防止重复执行。
             */
            this._isDone = false;
        }
        _onClear() {
        }
        /**
         * 撤销。
         */
        revert() {
            if (this._isDone) {
                this._isDone = false;
                return true;
            }
            return false;
        }
        /**
         * 执行。
         */
        execute() {
            if (this._isDone) {
                return false;
            }
            this._isDone = true;
            return true;
        }
        merge(nextState) {
            return false;
        }
    }
    gmvc.BaseState = BaseState;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    /**
     * 历史记录。
     */
    class History extends gmvc.BaseState {
        static toString() {
            return "[class History]";
        }
        constructor(shorcutRedo = null, shortcutUndo = null) {
            super();
            /**
             * 事件生成器，当历史状态激活时，触发事件。
             */
            this.dispatcher = null;
            /**
             * 当历史记录正在变更时，防止因外部逻辑错误破坏历史记录。
             * 未锁，锁定，锁定，锁定
             */
            this._locked = 0;
            /**
             * 历史记录当前的位置。
             */
            this._index = -1;
            /**
             * 状态列表。
             */
            this._states = [];
            /**
             * 批次列表。
             */
            this._batchs = [];
            this.name = 'root';
            this.shortcutRedo = shorcutRedo;
            this.shortcutUndo = shortcutUndo;
        }
        /**
         * 当历史记录在中间执行出现分支时，废弃前一个分支。
         */
        _free() {
            if (this._states.length > this._index + 1) {
                this._states.length = this._index + 1;
                if (this.dispatcher !== null) {
                    this.dispatcher.dispatchEventWidth(gmvc.HistoryEventType[gmvc.HistoryEventType.HistoryFree], null);
                }
            }
        }
        /**
         * 执行或撤销状态。
         */
        _doState(state, isUndo) {
            if (isUndo) {
                state.revert();
            }
            else {
                state.execute();
            }
            if (this.dispatcher !== null && state.data) {
                const data = { isUndo: isUndo, data: state.data };
                this.dispatcher.dispatchEventWidth(gmvc.HistoryEventType[gmvc.HistoryEventType.HistoryState], data);
            }
        }
        /**
         *
         */
        _getStateByObject(history, object, key, link = null) {
            let i = history._states.length;
            while (i--) {
                const state = history._states[i];
                if (state instanceof gmvc.ModifyObjectState) {
                    if ((link === null || state !== link) && state.object === object && state.key === key) {
                        return state;
                    }
                }
                else if (state instanceof History) {
                    const subState = this._getStateByObject(state, object, key, link);
                    if (subState !== null) {
                        return subState;
                    }
                }
            }
            return null;
        }
        /**
         * 撤销到历史头。
         */
        revert() {
            if (this._batchs.length > 0) {
                return false;
            }
            return this.go(-1);
        }
        /**
         * 执行到历史尾。
         */
        execute() {
            if (this._batchs.length > 0) {
                return false;
            }
            return this.go(this._states.length - 1);
        }
        /**
         * 回退一个状态。
         */
        back() {
            //如果有分支，只能回退分支里的内容。
            let batchLen = this._batchs.length;
            if (batchLen > 0) {
                let curHistory = this._batchs[batchLen - 1];
                if (curHistory) {
                    return curHistory.back();
                }
            }
            if (this._index < 0) {
                return false;
            }
            if (this._batchs.length > 0) {
                return false;
            }
            this._locked |= 1;
            this._doState(this._states[this._index--], true);
            this._locked &= 2;
            return true;
        }
        /**
         * 前进一个状态。
         */
        forward() {
            //如果有分支，只能重做分支里的内容。
            let batchLen = this._batchs.length;
            if (batchLen > 0) {
                let curHistory = this._batchs[batchLen - 1];
                if (curHistory) {
                    return curHistory.forward();
                }
            }
            if (this._index >= this._states.length - 1) {
                return false;
            }
            if (this._batchs.length > 0) {
                return false;
            }
            this._locked |= 1;
            this._doState(this._states[++this._index], false);
            this._locked &= 2;
            return true;
        }
        /**
         * 跳转到指定状态。
         */
        go(index) {
            if (this._batchs.length > 0) {
                return false;
            }
            let result = false;
            if (this._index < index) {
                while (this._index !== index && this.forward()) {
                    result = true;
                }
            }
            else {
                while (this._index !== index && this.back()) {
                    result = true;
                }
            }
            return result;
        }
        /**
         * 添加并执行状态。
         */
        add(state) {
            if (this._locked !== 0) {
                return;
            }
            if (this._batchs.length > 0) { // 批次添加中。
                const batch = this._batchs[this._batchs.length - 1];
                batch.add(state);
            }
            else {
                this._states[this._index + 1] = state;
                if (this.dispatcher !== null) {
                    this.dispatcher.dispatchEventWidth(gmvc.HistoryEventType[gmvc.HistoryEventType.HistoryAdd], state);
                }
                this.forward();
                this._free();
            }
        }
        /**
         * 添加并批次。
         */
        addBatch(...args) {
            if (this._locked !== 0) {
                return null;
            }
            const batch = History.create(History);
            batch.dispatcher = this.dispatcher;
            for (const state of args) {
                batch.add(state);
            }
            this.add(batch);
            return batch;
        }
        /**
         * 开始批次。
         */
        beginBatch(name = '') {
            const batch = History.create(History);
            batch.dispatcher = this.dispatcher;
            batch.name = name;
            this._batchs.push(batch);
            return batch;
        }
        abandonBatch() {
            if (this._batchs.length > 0) {
                this._batchs.pop();
                return true;
            }
            return false;
        }
        /**
         * 结束批次。
         */
        endBatch(data = null) {
            if (this._batchs.length < 1) { // 已经没有进行的批次。
                return;
            }
            const batch = this._batchs.pop();
            if (batch.count < 1) { // 空批次。
                return;
            }
            batch._mergeAll();
            batch.dispatcher = this.dispatcher;
            batch.data = data;
            batch._locked |= 2;
            if (this._batchs.length > 0) {
                this._batchs[this._batchs.length - 1].add(batch);
            }
            else {
                this.add(batch);
            }
        }
        /**
         * 合并会把在一个batch内的所有同类型按顺序合并，例如
         * [命令类型1，命令类型2，命令类型2，命令类型1]
         * 合并结果为
         * [命令类型1，命令类型2]
         */
        _mergeAll() {
            let i = 0;
            let j = 0;
            let len = this._states.length;
            let curState;
            let nextState;
            if (len > 0) {
                for (j = 0; j < len - 1; j++) {
                    curState = this._states[j];
                    for (i = j + 1; i < len; i++) {
                        nextState = this._states[i];
                        if (curState.merge(nextState)) {
                            this._states.splice(i, 1);
                            i--;
                            len--;
                        }
                    }
                }
                this._index = len - 1;
            }
        }
        /**
         *
         */
        linkObjectState(object, key) {
            const currentState = this._getStateByObject(this, object, key);
            if (currentState !== null) {
                const prevState = this._getStateByObject(this, object, key, currentState);
                if (prevState !== null) {
                    currentState.fromValue = prevState.toValue;
                }
            }
        }
        /**
         * 获取指定状态。
         */
        getState(index) {
            return this._states[index];
        }
        /**
         * 当前指定标识。
         */
        get locked() {
            return this._locked !== 0;
        }
        set locked(value) {
            if (value) {
                this._locked |= 1;
            }
            else {
                this._locked &= 2;
            }
        }
        /**
         * 当前指定标识。
         */
        get index() {
            return this._index;
        }
        /**
         * 总状态数。
         */
        get count() {
            return this._states.length;
        }
        get curBatch() {
            if (this._batchs.length > 0) { // 批次添加中。
                const batch = this._batchs[this._batchs.length - 1];
                return batch;
            }
            return this;
        }
    }
    gmvc.History = History;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    /**
     * 单纯控制器。
     */
    class Controller extends gmvc.EventDispatcher {
        /**
         * 转发通知。
         */
        _notificationHandler(event, listener) {
            listener.call(this, event.data);
        }
        /**
         * 初始化。
         */
        _initialize() {
        }
        /**
         * 侦听通知。
         */
        _addNotification(type, listener, priority = 0) {
            gmvc.context.addEventListener(String(type), this._notificationHandler, this, listener, priority);
        }
        /**
         * 取消侦听通知。
         */
        _removeNotification(type, listener) {
            gmvc.context.removeEventListener(String(type), this._notificationHandler, listener);
        }
        /**
         * 发送通知。
         */
        _sendNotification(type, data = null) {
            gmvc.context.sendNotification(type, data, this);
        }
        _hasEventListener(type, listener) {
            return gmvc.context.hasEventListener(String(type), listener);
        }
        /**
         * 初始化。
         */
        init(model) {
            this.model = model;
            this._initialize();
        }
    }
    gmvc.Controller = Controller;
})(gmvc || (gmvc = {}));
/// <reference path="../mvc/Controller.ts" />
var gmvc;
(function (gmvc) {
    class HistoryController extends gmvc.Controller {
        static toString() {
            return "[class render.controller.HistoryController]";
        }
        static get instance() {
            return HistoryController._instance;
        }
        static get silence() {
            return HistoryController._silenceLevel > 0;
        }
        static set silence(v) {
            if (v) {
                HistoryController._silenceLevel++;
            }
            else {
                HistoryController._silenceLevel--;
            }
        }
        constructor() {
            super();
            HistoryController._instance = this;
        }
        _initialize() {
            this.setHistory(this.model);
        }
        setHistory(history) {
            if (this._history) {
                this._history.dispatcher = null;
            }
            else {
                gmvc.context.addEventListener(gmvc.HistoryEventType[gmvc.HistoryEventType.HistoryState], (event) => {
                    const historyEventData = event.data;
                    const historyData = historyEventData.data;
                    gmvc.context.sendNotification(historyData.type, historyData.data, historyData.target);
                }, null);
            }
            this._history = history;
            this._history.dispatcher = gmvc.context;
            if (this._history) {
                this.addListener();
            }
            else {
                this.removeListener();
            }
        }
        redo() {
            this.onRedo();
        }
        undo() {
            this.onUndo();
        }
        addListener() {
            const shortcut = gmvc.ShortcutController.instance;
            if (this._history.shortcutRedo) {
                this.shortcutRedo = this._history.shortcutRedo;
                shortcut.addRegister(this.shortcutRedo, this.onRedo.bind(this));
            }
            if (this._history.shortcutUndo) {
                this.shortcutUndo = this._history.shortcutUndo;
                shortcut.addRegister(this.shortcutUndo, this.onUndo.bind(this));
            }
        }
        removeListener() {
            const shortcut = gmvc.ShortcutController.instance;
            if (this.shortcutRedo) {
                shortcut.removeRegister(this.shortcutRedo, this.onRedo.bind(this));
            }
            if (this.shortcutUndo) {
                shortcut.removeRegister(this.shortcutUndo, this.onUndo.bind(this));
            }
        }
        get curBatch() {
            if (this._history) {
                return this._history.curBatch;
            }
        }
        beginBatch(name = '') {
            if (this._history) {
                this._history.beginBatch(name);
            }
        }
        /**
         * 结束批次。
         */
        endBatch(data = null) {
            if (this._history) {
                this._history.endBatch(data);
            }
        }
        abandonBatch(data = null) {
            if (this._history) {
                this._history.abandonBatch();
            }
        }
        onRedo() {
            let redo = this._history.forward();
        }
        onUndo() {
            let undo = this._history.back();
        }
        add(state) {
            if (this._history) {
                this._history.add(state);
            }
        }
    }
    HistoryController._silenceLevel = 0;
    gmvc.HistoryController = HistoryController;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    /**
     * 事件枚举。
     */
    let HistoryEventType;
    (function (HistoryEventType) {
        HistoryEventType[HistoryEventType["HistoryState"] = 0] = "HistoryState";
        HistoryEventType[HistoryEventType["HistoryAdd"] = 1] = "HistoryAdd";
        HistoryEventType[HistoryEventType["HistoryFree"] = 2] = "HistoryFree";
    })(HistoryEventType = gmvc.HistoryEventType || (gmvc.HistoryEventType = {}));
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class ModifyArrayState extends gmvc.BaseState {
        constructor() {
            super(...arguments);
            this.index = -1;
            this.fromValue = null;
            this.toValue = null;
        }
        static createState(array, index, value, data = null) {
            if (index < 0) {
                if (array.length > 0) {
                    index = array.length - 1;
                }
                else {
                    index = 0;
                }
            }
            const state = new ModifyArrayState();
            state.array = array;
            state.index = index;
            state.data = data;
            if (value) {
                state.toValue = value;
            }
            else {
                state.fromValue = state.array[state.index];
            }
            return state;
        }
        revert() {
            if (super.revert()) {
                if (this.fromValue) {
                    this.array.splice(this.index, 0, this.fromValue);
                }
                else {
                    this.array.splice(this.index, 1);
                }
                return true;
            }
            return false;
        }
        execute() {
            if (super.execute()) {
                if (this.toValue) {
                    this.array.splice(this.index, 0, this.toValue);
                }
                else {
                    this.array.splice(this.index, 1);
                }
                return true;
            }
            return false;
        }
    }
    gmvc.ModifyArrayState = ModifyArrayState;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class ModifyObjectState extends gmvc.BaseState {
        constructor() {
            super(...arguments);
            this.fromValue = null;
            this.toValue = null;
        }
        static createState(object, key, value, data = null) {
            const state = new ModifyObjectState();
            state.object = object;
            state.key = key;
            state.data = data;
            state.fromValue = (state.key in state.object) ? state.object[state.key] : undefined;
            state.toValue = value;
            if (state.fromValue === state.toValue) {
                return null;
            }
            return state;
        }
        merge(nextState) {
            if (nextState instanceof ModifyObjectState) {
                if (this.object == nextState.object &&
                    this.key == nextState.key) {
                    this.toValue = nextState.toValue;
                    return true;
                }
            }
            return false;
        }
        revert() {
            if (super.revert()) {
                if (this.fromValue !== undefined) {
                    this.object[this.key] = this.fromValue;
                }
                else {
                    delete this.object[this.key];
                }
                return true;
            }
            return false;
        }
        execute() {
            if (super.execute()) {
                if (this.toValue !== undefined) {
                    this.object[this.key] = this.toValue;
                }
                else {
                    delete this.object[this.key];
                }
                return true;
            }
            return false;
        }
    }
    gmvc.ModifyObjectState = ModifyObjectState;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class ModifyPointState extends gmvc.BaseState {
        static createState(point, newX, newY) {
            const state = new ModifyPointState();
            state.point = point;
            state.oldX = point.x;
            state.oldY = point.y;
            state.newX = newX;
            state.newY = newY;
            return state;
        }
        revert() {
            if (super.revert()) {
                this.point.x = this.oldX;
                this.point.y = this.oldY;
                return true;
            }
            return false;
        }
        execute() {
            if (super.execute()) {
                this.point.x = this.newX;
                this.point.y = this.newY;
                return true;
            }
            return false;
        }
    }
    gmvc.ModifyPointState = ModifyPointState;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    /**
     * 命令。
     */
    class Command extends gmvc.BaseObject {
        constructor() {
            super(...arguments);
            /**
             * 命令的数据输出。
             */
            this.result = null;
            /**
             * 是否被持有。（异步命令防止被垃圾回收）
             */
            this._isRetained = false;
            /**
             * 命令的所属队列。（异步命令需要异步通知队列继续，在释放调用中通知队列）
             */
            this._queue = null;
        }
        static toString() {
            return "[class Command]";
        }
        _onClear() {
        }
        /**
         * 发送通知。
         */
        _sendNotification(type, data) {
            gmvc.context.sendNotification(type, data, null);
        }
        /**
         * 持有。
         */
        _retain() {
            this._isRetained = true;
            gmvc.controller.retain(this);
        }
        /**
         * 释放。
         */
        _release(isSuccessed) {
            if (this._queue) {
                if (isSuccessed) {
                    this._queue._next(this.notification.data);
                }
            }
            this._isRetained = false;
            gmvc.controller.release(this);
        }
        /**
         * 执行命令。
         */
        execute() {
        }
        /**
         * 是否被持有。（异步命令防止被垃圾回收）
         */
        get isRetained() {
            return this._isRetained;
        }
        /**
         * 命令的数据输入。
         */
        get data() {
            return this.notification.data;
        }
    }
    gmvc.Command = Command;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    /**
     * 命令控制器。
     */
    class CommandManager extends gmvc.BaseObject {
        constructor() {
            super(...arguments);
            /**
             * 被持有的命令。（防止垃圾回收）
             */
            this._commands = [];
        }
        static toString() {
            return "[class CommandManager]";
        }
        /**
         * 收到通知并执行命令。
         */
        _notificationHandler(event, commandBin) {
            const command = this.create(commandBin);
            this.execute(command, event.data, commandBin);
        }
        _onClear() {
        }
        /**
         * 注册命令。
         */
        register(type, commandClass, guard = null, hook = null) {
            const commandBin = { commandClass: commandClass, guard: guard, hook: hook };
            gmvc.context.addEventListener(String(type), this._notificationHandler, this, commandBin);
        }
        /**
         * 取消注册的命令。
         */
        unregister(type, command) {
            gmvc.context.removeEventListener(String(type), this._notificationHandler, command);
        }
        /**
         * 生成一个命令。
         */
        create(commandBin) {
            const command = gmvc.Command.create(commandBin.commandClass);
            return command;
        }
        /**
         * 执行命令。
         */
        execute(command, notifycation, commandBin) {
            command.notification = notifycation;
            if (commandBin.guard !== null) {
                commandBin.guard(command);
            }
            command.execute();
            if (commandBin.hook !== null) {
                commandBin.hook(command);
            }
        }
        /**
         * 持有命令。（防止被垃圾回收）
         */
        retain(command) {
            if (this._commands.indexOf(command) < 0) {
                this._commands.push(command);
            }
        }
        /**
         * 释放命令。
         */
        release(command) {
            const index = this._commands.indexOf(command);
            if (index >= 0) {
                this._commands.splice(index, 1);
            }
        }
    }
    gmvc.CommandManager = CommandManager;
    /**
     * 控制器实例。
     */
    gmvc.controller = CommandManager.getInstance(CommandManager);
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class Context extends gmvc.EventDispatcher {
        static toString() {
            return "[class Context]";
        }
        /**
         * 判断是否注册命令（侦听器）的依据。
         */
        _isSameListener(a, b) {
            if (a && a.commandClass && b) {
                return a.commandClass === b;
            }
            return super._isSameListener(a, b);
        }
        /**
         * 发送通知。
         */
        sendNotification(type, data, target = null) {
            // console.log("sendNotification", type, data, target);
            //console.log("sendNotification", type);
            this.dispatchEventWidth(String(type), { type: type, data: data, target: target });
        }
    }
    gmvc.Context = Context;
    gmvc.context = Context.getInstance(Context);
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class ModelController extends gmvc.Model {
        _addNotification(type, listener) {
            gmvc.context.addEventListener(String(type), this._notificationHandler, this, listener);
        }
        /**
         * 取消侦听通知。
         */
        _removeNotification(type, listener) {
            gmvc.context.removeEventListener(String(type), this._notificationHandler, listener);
        }
        _hasEventListener(type, listener) {
            return gmvc.context.hasEventListener(String(type), listener);
        }
        _notificationHandler(event, listener) {
            listener.call(this, event.data);
        }
    }
    gmvc.ModelController = ModelController;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    /**
     * 命令队列。
     */
    class QueueCommand extends gmvc.Command {
        constructor() {
            super(...arguments);
            /**
             * 存储每个命令的初始化数据。
             */
            this._commandBins = [];
        }
        static toString() {
            return "[class QueueCommand]";
        }
        /**
         * 添加命令。
         */
        _addCommand(commandClass, guard = null, hook = null) {
            const commandBin = { commandClass: commandClass, guard: guard, hook: hook };
            this._commandBins.push(commandBin);
        }
        /**
         * 执行命令队列。
         */
        execute() {
            this._initialize();
            this._next(this.notification.data);
        }
        /**
         * 下一个命令。
         */
        _next(data) {
            if (this._commandBins.length > 0) {
                const commandBin = this._commandBins.shift();
                if (commandBin) {
                    this._currentCommand = gmvc.controller.create(commandBin);
                    this._currentCommand._queue = this;
                    gmvc.controller.execute(this._currentCommand, { type: 0, data: data, target: null }, commandBin); //
                    if (!this._currentCommand.isRetained) {
                        this._next(this._currentCommand.result);
                    }
                }
            }
        }
    }
    gmvc.QueueCommand = QueueCommand;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    /**
     * 视图控制器。
     */
    class ViewController extends gmvc.Controller {
        initialize(model, view) {
            this.model = model;
            this.view = view;
            this._initialize();
            this.update();
        }
        /**
         * 更新视图。
         */
        update() {
        }
    }
    gmvc.ViewController = ViewController;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    let GModuleNotification;
    (function (GModuleNotification) {
        GModuleNotification["SUBSCRIBE"] = "SUBSCRIBE";
        GModuleNotification["REFRESH_MODULE"] = "REFRESH_MODULE";
        GModuleNotification["REFRESH_ROOT"] = "REFRESH_ROOT";
    })(GModuleNotification = gmvc.GModuleNotification || (gmvc.GModuleNotification = {}));
    ;
    ;
    gmvc.AsyncFunction = (() => __awaiter(this, void 0, void 0, function* () { })).constructor;
})(gmvc || (gmvc = {}));
/// <reference path="./GmvvmType.ts" />
var gmvc;
(function (gmvc) {
    const helpNotification = { type: gmvc.GModuleNotification.SUBSCRIBE, data: null, target: null };
    function Commit(target, funName, funDescriptor) {
        const method = funDescriptor.value;
        funDescriptor.value = function (...args) {
            const result = method.apply(this, args);
            const type = funName;
            const data = args[args.length - 1];
            gmvc.context.sendNotification(type, data, target);
            helpNotification.type = type;
            helpNotification.data = data;
            helpNotification.target = target;
            gmvc.context.sendNotification(gmvc.GModuleNotification.SUBSCRIBE, { mutation: helpNotification });
            return result;
        };
        return funDescriptor;
    }
    gmvc.Commit = Commit;
    class GModule extends gmvc.Model {
        static toString() {
            return `[class GModule ${this.name}]`;
        }
        constructor(name) {
            super();
            this.modules = [];
            this.name = name;
        }
        set state(v) {
            this.setState(v);
        }
        setState(v) {
            this._state = v;
            for (let i = 0, len = this.modules.length; i < len; i++) {
                const key = this.modules[i].name;
                if (this.modules[i].state && v[key] && this.modules[i] != v[key]) {
                    console.warn('override module:', key, v[key]);
                    this.modules[i].state = v[key];
                }
                else if (!this.modules[i].state) {
                    this.modules[i].state = v[key];
                }
            }
            gmvc.context.sendNotification(gmvc.GModuleNotification.REFRESH_MODULE, v);
        }
        get state() {
            return this._state;
        }
        set rootState(v) {
            this.setRootState(v);
        }
        setRootState(v) {
            this._rootState = v;
            for (let i = 0, len = this.modules.length; i < len; i++) {
                this.modules[i].rootState = v;
            }
        }
        get rootState() {
            return this._rootState;
        }
        _onClear() {
            let m = this.mutations;
            for (const key in m) {
                gmvc.context.removeAllEventListener(key + '_commit');
            }
        }
        init() {
            for (let i = 0, len = this.modules.length; i < len; i++) {
                this.modules[i].init();
            }
            let m = this.mutations;
            for (const key in m) {
                gmvc.context.addEventListener(key + '_commit', (e) => {
                    let mutation = m[key];
                    const result = mutation.apply(this, [this.state, e.data.data]);
                    GModule.helpNotification.type = key;
                    GModule.helpNotification.data = e.data.data;
                    GModule.helpNotification.target = e.data.target;
                }, this);
            }
            let actions = this.actions;
            for (const key in actions) {
                gmvc.context.addEventListener(key + '_dispatch', (e) => {
                    let action = actions[key];
                    const result = action.apply(this, [this, e.data.data]);
                    GModule.helpNotification.type = key;
                    GModule.helpNotification.data = e.data.data;
                    GModule.helpNotification.target = e.data.target;
                }, this);
            }
            if (this.state === undefined || this.state === null) {
                this.state = {};
            }
            for (let i = 0, len = this.modules.length; i < len; i++) {
                const key = this.modules[i].name;
                const value = this.modules[i].state;
                if (value && !this.state[key]) {
                    this.state[key] = value;
                }
            }
        }
        commit(type, data, target) {
            const commitType = type + '_commit';
            if (gmvc.context.hasEventListener(commitType)) {
                // 交给module处理
                gmvc.context.sendNotification(commitType, data, target);
                // 给历史记录抛出，处理历史
                gmvc.context.sendNotification(gmvc.GModuleNotification.SUBSCRIBE, { mutation: GModule.helpNotification, rootState: this.rootState, state: this.state });
                //  向外抛出由其他监听
                gmvc.context.sendNotification(type, GModule.helpNotification.data, GModule.helpNotification.target);
            }
            else {
                console.log('can not find muation:', type);
            }
        }
        dispatch(type, data, target) {
            const commitType = type + '_dispatch';
            if (gmvc.context.hasEventListener(commitType)) {
                // 交给module处理
                gmvc.context.sendNotification(commitType, data, target);
                //  向外抛出由其他监听
                gmvc.context.sendNotification(type, GModule.helpNotification.data, GModule.helpNotification.target);
            }
            else {
                this.commit(type, data, target);
            }
        }
        dispatchAsync(type, data, target) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve, reject) => {
                    const actionCallback = this.actions[type];
                    if (actionCallback) {
                        if (actionCallback instanceof gmvc.AsyncFunction) {
                            actionCallback(this, data).then((data) => {
                                helpNotification.type = type;
                                helpNotification.data = data;
                                helpNotification.target = target;
                                gmvc.context.sendNotification(type, GModule.helpNotification.data, GModule.helpNotification.target);
                                resolve(data);
                            }).catch((e) => {
                                reject(e);
                            });
                        }
                        else {
                            actionCallback(this, data);
                            helpNotification.type = type;
                            helpNotification.data = data;
                            helpNotification.target = target;
                            gmvc.context.sendNotification(type, GModule.helpNotification.data, GModule.helpNotification.target);
                            resolve(true);
                        }
                    }
                    else {
                        const error = ('can not find muation:' + type);
                        reject(error);
                    }
                });
            });
        }
        addModule(module) {
            this.modules.push(module);
        }
        get actions() {
            return {};
        }
    }
    GModule.helpNotification = { type: gmvc.GModuleNotification.SUBSCRIBE, data: null, target: null };
    gmvc.GModule = GModule;
})(gmvc || (gmvc = {}));
/// <reference path="./GModule.ts" />
var gmvc;
(function (gmvc) {
    let GHistoryMutation;
    (function (GHistoryMutation) {
        GHistoryMutation["UNDO"] = "UNDO";
        GHistoryMutation["REDO"] = "REDO";
        GHistoryMutation["MERGE_START"] = "MERGE_START";
        GHistoryMutation["MERGE_END"] = "MERGE_END";
        GHistoryMutation["ENABLE"] = "ENABLE";
        GHistoryMutation["DISABLE"] = "DISABLE";
        GHistoryMutation["BRANCH_OPEN"] = "BRANCH_OPEN";
        GHistoryMutation["BRANCH_CLOSE"] = "BRANCH_CLOSE";
    })(GHistoryMutation = gmvc.GHistoryMutation || (gmvc.GHistoryMutation = {}));
    class GHistory extends gmvc.GModule {
        constructor(store, historyModuleName) {
            super('history');
            this.undoMutation = [];
            this.mustSendMutation = [];
            this.merging = false;
            this.mergingMutations = [];
            this.cacheMutations = [];
            this.hasSubscribe = false;
            this.mergeArray = [];
            this.mergeNumber = 0;
            this.store = store;
            this.state = {
                enable: false,
                branches: [{
                        name: 'root',
                        history: [],
                        future: []
                    }],
                curBranch: 'root',
            };
            this.curBranch = this.state.branches[0];
            this.historyModuleName = historyModuleName;
        }
        init() {
            super.init();
            gmvc.context.on(gmvc.GModuleNotification.SUBSCRIBE, this.onSubscribe, this);
        }
        includeMutation(mutations, mutation) {
            for (let i = 0, len = mutations.length; i < len; i++) {
                if (mutations[i].type === mutation.type) {
                    return true;
                }
            }
            return false;
        }
        onSubscribe(e) {
            const data = e.data.data;
            if (this.state.enable) {
                if (this.undoMutation.includes(data.mutation.type)) {
                    const mutation = {
                        type: data.mutation.type,
                        data: data.mutation.data,
                        target: data.mutation.target,
                    };
                    this.addState(this.rootState, [mutation]);
                }
                else {
                    if (this.mustSendMutation.includes(data.mutation.type)) {
                        const mutation = {
                            type: data.mutation.type,
                            data: data.mutation.data,
                            target: data.mutation.target,
                        };
                        this.cacheMutations.push(mutation);
                    }
                    this.curState = this.rootState;
                }
            }
            else {
                this.curState = this.rootState;
            }
        }
        addState(state, mutations) {

            DEBUG && console.log('skk addState:', state, mutations, this.merging)
            this.curState = state;
            if (this.merging) {
                this.hasSubscribe = true;
                if (this.cacheMutations.length) {
                    for (let i = 0, len = this.cacheMutations.length; i < len; i++) {
                        const m = this.cacheMutations[i];
                        if (!this.includeMutation(this.mergingMutations, m)) {
                            this.mergingMutations.push(m);
                        }
                    }
                    this.cacheMutations.length = 0;
                }
                for (let i = 0, len = mutations.length; i < len; i++) {
                    const m = mutations[i];
                    if (!this.includeMutation(this.mergingMutations, m)) {
                        this.mergingMutations.push(m);
                    }
                }
                return;
            }
            const diff = this.diffState(this.curState, this.lastState);
            DEBUG && console.log('skk diff:', diff)
            if (diff.length > 0) { // 数据有改动
                const path = diff;
                const stateStep = {
                    undo: {},
                    redo: {},
                    mutation: mutations
                };
                for (let i = 0, len = path.length; i < len; i++) {
                    const onePath = path[i];
                    stateStep.undo[onePath] = this.createState(this.lastState, onePath);
                    stateStep.redo[onePath] = this.createState(state, onePath);
                }
                this.addToHistory(stateStep);
                this.lastState = this.cloneStore(state);
            }
        }
        createState(state, path) {
            const subPath = path.split('.');
            let subState = state;
            for (let i = 0, len = subPath.length; i < len; i++) {
                const p = subPath[i];
                if (subState) {
                    subState = subState[p];
                }
                else {
                    subState = undefined;
                    break;
                }
            }
            if (subState !== undefined) {
                subState = gmvc.ObjectUtil.clone(subState);
            }
            return subState;
        }
        applyState(state, subState) {
            for (const key in subState) {
                const keyArr = key.split('.');
                let targetState = state;
                let error = false;
                const targetKey = keyArr.pop();
                for (let i = 0, len = keyArr.length; i < len; i++) {
                    const k = keyArr[i];
                    if (targetState && targetState[k]) {
                        targetState = targetState[k];
                    }
                    else {
                        error = true;
                        break;
                    }
                }
                if (!error) {
                    targetState[targetKey] = gmvc.ObjectUtil.clone(subState[key]);
                }
                else {
                    console.warn('undoredo error: state node error:', key);
                }
            }
        }
        addToHistory(stateStep) {
            const curHistory = this.curBranch.history;
            const curFuture = this.curBranch.future;
            curHistory.push(stateStep);
            curFuture.length = 0;
        }
        get curMergeName() {
            if (this.mergeArray.length > 0) {
                return this.mergeArray[this.mergeArray.length - 1];
            }
            return '';
        }
        startMerge(name) {
            this.merging = true;
            this.hasSubscribe = false;
            this.mergeNumber++;
            this.mergeArray.push(name);
        }
        stopMerge(name) {
            this.mergeNumber--;
            const lastName = this.mergeArray.pop();
            if (name && lastName && name !== lastName) {
                console.warn('merge name not match:', name, lastName);
            }
            if (this.mergeNumber === 0) {
                if (this.merging) {
                    this.merging = false;
                    if (this.hasSubscribe) {
                        this.addState(this.curState, this.mergingMutations);
                        this.mergingMutations = [];
                    }
                }
            }
        }
        undo() {
            if (this.merging) {
                return;
            }
            if (this.curBranch.history.length) {
                const undoState = this.curBranch.history.pop();
                this.curBranch.future.push(undoState);
                const curStore = this.curState;
                this.applyState(curStore, undoState.undo);
                this.store.rootState = (curStore);
                this.lastState = this.cloneStore(curStore);
                if (undoState.mutation && undoState.mutation.length) {
                    for (let i = 0, len = undoState.mutation.length; i < len; i++) {
                        const m = undoState.mutation[i];
                        if (!m.data) {
                            m.data = {};
                        }
                        m.data.from = 'undo';
                        this._sendNotification(m.type, m.data);
                    }
                }
            }
        }
        redo() {
            if (this.merging) {
                return;
            }
            if (this.curBranch.future.length) {
                const redoState = this.curBranch.future.pop();
                this.curBranch.history.push(redoState);
                const curStore = this.curState;
                this.applyState(curStore, redoState.redo);
                this.store.rootState = (curStore);
                this.lastState = this.cloneStore(curStore);
                if (redoState.mutation && redoState.mutation.length) {
                    for (let i = 0, len = redoState.mutation.length; i < len; i++) {
                        const m = redoState.mutation[i];
                        if (!m.data) {
                            m.data = {};
                        }
                        m.data.from = 'redo';
                        this._sendNotification(m.type, m.data);
                    }
                }
            }
        }
        openBranch(name) {
            const newBranch = {
                name: name,
                history: [],
                future: [],
            };
            this.state.branches.push(newBranch);
            this.state.curBranch = name;
            this.curBranch = newBranch;
        }
        closeBranch(noti) {
            const lastBranch = this.state.branches.pop();
            this.curBranch = this.state.branches[this.state.branches.length - 1];
            this.state.curBranch = this.curBranch.name;
            const state = this.mergeBranch(lastBranch);
            if (noti) {
                state.mutation = [noti];
            }
            this.curBranch.history.push(state);
        }
        mergeBranch(branch) {
            const undo = {
                undo: {},
                redo: {},
                mutation: []
            };
            for (let i = 0, len = branch.history.length; i < len; i++) {
                const b = branch.history[i];
                this.mergeState(undo, b);
            }
            return undo;
        }
        mergeState(target, added) {
            target.undo = Object.assign(Object.assign({}, target.undo), added.undo);
            target.redo = Object.assign(Object.assign({}, target.redo), added.redo);
            target.mutation = target.mutation.concat(added.mutation);
        }
        diffState(curState, lastState) {
            let diffCurState = curState;
            let diffLastState = lastState;
            let curStateHistory;
            let lastStateHistory;
            if (this.historyModuleName) {
                diffCurState = curState[this.historyModuleName];
                diffLastState = lastState[this.historyModuleName];
            }
            else {
                curStateHistory = diffCurState.history;
                lastStateHistory = diffLastState.history;
                diffCurState.history = undefined;
                diffLastState.history = undefined;
            }
            const diff = gmvc.ObjectUtil.diffObject(diffCurState, diffLastState);
            if (this.historyModuleName) {
                if (diff.length > 0) {
                    if (diff[0] === gmvc.ObjectUtil.DIFF_ROOT) {
                        diff[0] = this.historyModuleName;
                    }
                    else {
                        for (let i = 0, len = diff.length; i < len; i++) {
                            diff[i] = this.historyModuleName + '.' + diff[i];
                        }
                    }
                }
            }
            else {
                diffCurState.history = curStateHistory;
                diffLastState.history = lastStateHistory;
            }
            return diff;
        }
        cloneStore(obj) {
            let targetObj = obj;
            if (this.historyModuleName) {
                targetObj = obj[this.historyModuleName];
                return {
                    [this.historyModuleName]: gmvc.ObjectUtil.clone(targetObj)
                };
            }
            return gmvc.ObjectUtil.clone(targetObj);
        }
        get mutations() {
            const that = this;
            return {
                [GHistoryMutation.UNDO](state, payload) {
                    that.undo();
                },
                [GHistoryMutation.REDO](state, payload) {
                    that.redo();
                },
                [GHistoryMutation.MERGE_START](state, payload) {
                    that.startMerge(payload?.name || '');
                },
                [GHistoryMutation.MERGE_END](state, payload) {
                    that.stopMerge(payload?.name || '');
                },
                [GHistoryMutation.ENABLE](state, payload) {
                    that.state.enable = true;
                    this.lastState = this.cloneStore(that.rootState);
                },
                [GHistoryMutation.DISABLE](state, payload) {
                    that.state.enable = false;
                },
                [GHistoryMutation.BRANCH_OPEN](state, payload) {
                    that.openBranch(payload);
                },
                [GHistoryMutation.BRANCH_CLOSE](state, payload) {
                    that.closeBranch(payload);
                },
            };
        }
        get actions() {
            return {};
        }
    }
    gmvc.GHistory = GHistory;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class GStore extends gmvc.GModule {
        constructor() {
            super('root');
        }
        setState(v) {
            super.setState(v);
            this.setRootState(v);
        }
        setRootState(v) {
            super.setRootState(v);
            gmvc.context.sendNotification(gmvc.GModuleNotification.REFRESH_ROOT, v);
        }
    }
    gmvc.GStore = GStore;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    /**
     * 视图控制器。
     */
    class VMController extends gmvc.Controller {
        initialize(model, view) {
            this.model = model;
            this.view = view;
            this._initialize();
            this.update();
        }
        /**
         * 更新视图。
         */
        update() {
        }
    }
    gmvc.VMController = VMController;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    // export enum ShortcutType{
    //     CANCEL = 'canel',
    //     DELETE = 'delete',
    //     UNDO = 'undo',
    //     REDO = 'redo'
    // }
    class Shortcut extends gmvc.Model {
        constructor(shortcutConfig) {
            super();
            this._defs = [];
            if (shortcutConfig) {
                for (let i = 0, len = shortcutConfig.length; i < len; i++) {
                    this.addShortcut(shortcutConfig[i].keycodes, shortcutConfig[i].type);
                }
            }
            // this.addShortcut([27], ShortcutType.CANCEL);
            // this.addShortcut([46], ShortcutType.DELETE);
            // this.addShortcut([this.CTRL, this.Z], ShortcutType.UNDO);
            // this.addShortcut([this.CTRL, this.Y], ShortcutType.REDO);
        }
        matchShortcut(keycodes) {
            var type = this.getShortcut(keycodes);
            if (type) {
                this._sendNotification(type, null);
            }
        }
        addShortcut(keycodes, type) {
            if (!this.hasShortcut(keycodes, type)) {
                keycodes.sort();
                this._defs.push({ keycodes: keycodes, type: type });
            }
        }
        hasShortcut(keycodes, type) {
            let i = 0;
            let len = 0;
            for (i = 0, len = this._defs.length; i < len; i++) {
                if (this._defs[i].type === type &&
                    this.keycodeEqual(this._defs[i].keycodes, keycodes)) {
                    return true;
                }
            }
            return false;
        }
        keycodeEqual(keycodes1, keycodes2) {
            if (keycodes1.length == keycodes2.length) {
                let i = 0;
                let len = keycodes1.length;
                for (i = 0; i < len; i++) {
                    if (keycodes1[i] != keycodes2[i]) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        getShortcut(keycodes) {
            let i = 0;
            let len = 0;
            for (i = 0, len = this._defs.length; i < len; i++) {
                if (this.keycodeEqual(this._defs[i].keycodes, keycodes)) {
                    return this._defs[i].type;
                }
            }
            return null;
        }
    }
    Shortcut.ESC = 27;
    Shortcut.DEL = 46;
    Shortcut.CTRL = 17;
    Shortcut.Z = 90;
    Shortcut.Y = 89;
    gmvc.Shortcut = Shortcut;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    class ShortcutController extends gmvc.Controller {
        static toString() {
            return "[class shortcut.ShortcutController]";
        }
        static get instance() {
            return ShortcutController._instance;
        }
        constructor() {
            super();
            this._entries = [];
            this._keyPress = [];
            this._shortcutMap = new Map();
            ShortcutController._instance = this;
        }
        _initialize() {
            this.registWindow(window);
        }
        registWindow(window) {
            window.addEventListener("keydown", this.onKeyDown.bind(this));
            window.addEventListener("keyup", this.onKeyUp.bind(this));
        }
        onKeyDown(e) {
            // 当前焦点在输入框中时，不响应快捷键
            if(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if ((e.keyCode == 90 || e.keyCode == 89) && e.ctrlKey) {
                //屏蔽系统的ctrl+z， ctrl+y；
                e.stopImmediatePropagation();
                e.preventDefault();
            }
            let code = e.keyCode;
            if (this._keyPress.indexOf(code) == -1) {
                this._keyPress.push(code);
                this._keyPress.sort();
            }
            this.model.matchShortcut(this._keyPress);
        }
        onKeyUp(e) {
            let code = e.keyCode;
            let i = this._keyPress.indexOf(code);
            if (i >= 0) {
                this._keyPress.splice(i, 1);
            }
        }
        clear() {
            this._keyPress.length = 0;
        }
        addRegister(type, callback, focus = null) {
            if (!this.hasRegister(type, callback, focus)) {
                var entry = { type: type, callback: callback, focus: focus };
                this._entries.push(entry);
                var entries = this._shortcutMap.get(type);
                if (entries == undefined) {
                    entries = [];
                    this._shortcutMap.set(type, entries);
                }
                entries.push(entry);
                if (!this._hasEventListener(type)) {
                    this._addNotification(type, this.onShorcut);
                }
            }
        }
        removeRegister(type, callback, focus = null) {
            let i = 0;
            let len = 0;
            for (i = 0, len = this._entries.length; i < len; i++) {
                if (this._entries[i].type === type &&
                    this._entries[i].callback === callback &&
                    this._entries[i].focus === focus) {
                    this._entries.splice(i, 1);
                    let entries = this._shortcutMap.get(type);
                    if (entries != undefined) {
                        let index = entries.indexOf(this._entries[i]);
                        if (index >= 0) {
                            entries.splice(index, 1);
                        }
                        if (entries.length == 0) {
                            this._removeNotification(type, this.onShorcut);
                        }
                    }
                    return;
                }
            }
        }
        hasRegister(type, callback, focus = null) {
            let i = 0;
            let len = 0;
            for (i = 0, len = this._entries.length; i < len; i++) {
                if (this._entries[i].type === type &&
                    this._entries[i].callback === callback &&
                    this._entries[i].focus === focus) {
                    return true;
                }
            }
            return false;
        }
        onShorcut(type) {
            let sc = (type.type);
            let entries = this._shortcutMap.get(sc);
            if (entries) {
                let i = 0;
                let len = 0;
                for (i = 0, len = entries.length; i < len; i++) {
                    let entry = entries[i];
                    if (this.checkoutFocus && entry.focus != null) {
                        let checkFocus = this.checkoutFocus(entry);
                        if (checkFocus) {
                            entry.callback();
                        }
                    }
                    else {
                        entries[i].callback();
                    }
                }
            }
        }
    }
    gmvc.ShortcutController = ShortcutController;
})(gmvc || (gmvc = {}));
var gmvc;
(function (gmvc) {
    let TypeEnum;
    (function (TypeEnum) {
        TypeEnum["STRING"] = "string";
        TypeEnum["NUMBER"] = "number";
        TypeEnum["BOOLEAN"] = "boolean";
        TypeEnum["UNDEFINED"] = "undefined";
        TypeEnum["OBJECT"] = "object";
        TypeEnum["ARRAY"] = "array";
        TypeEnum["UNRECOGNIZED"] = "unrecognized";
    })(TypeEnum = gmvc.TypeEnum || (gmvc.TypeEnum = {}));
    class ObjectUtil {
        static clone(obj) {
            let type = ObjectUtil.getObjectType(obj);
            let newObj;
            switch (type) {
                case TypeEnum.NUMBER:
                case TypeEnum.STRING:
                case TypeEnum.BOOLEAN:
                case TypeEnum.UNDEFINED:
                    newObj = obj;
                    break;
                case TypeEnum.OBJECT:
                    newObj = {};
                    for (const key in obj) {
                        const o = ObjectUtil.clone(obj[key]);
                        newObj[key] = o;
                    }
                    break;
                case TypeEnum.ARRAY:
                    newObj = [];
                    for (let i = 0, len = obj.length; i < len; i++) {
                        const o = ObjectUtil.clone(obj[i]);
                        newObj.push(o);
                    }
                    break;
                default:
                    break;
            }
            return newObj;
        }
        static concatArray(arrA, arrB) {
            const c = arrA.concat();
            for (let i = 0, len = arrB.length; i < len; i++) {
                const b = arrB[i];
                if (c.indexOf(b) < 0) {
                    c.push(b);
                }
            }
            return c;
        }
        static getObjectType(obj) {
            const typeA = typeof obj;
            let type = TypeEnum.UNRECOGNIZED;
            switch (typeA) {
                case 'string':
                case 'number':
                case 'boolean':
                case 'undefined':
                    type = typeA;
                    break;
                case 'object':
                    if (Array.isArray(obj)) {
                        type = TypeEnum.ARRAY;
                    }
                    else {
                        type = TypeEnum.OBJECT;
                    }
                    break;
                default:
                    break;
            }
            return type;
        }
        static diffObj(objA, objB) {
            const diffKey = [];
            const akey = [];
            const bkey = [];
            for (const key in objA) {
                const typeKey = ObjectUtil.getObjectType(objA[key]);
                switch (typeKey) {
                    case TypeEnum.NUMBER:
                    case TypeEnum.STRING:
                    case TypeEnum.BOOLEAN:
                    case TypeEnum.UNDEFINED:
                    case TypeEnum.OBJECT:
                    case TypeEnum.ARRAY:
                        akey.push(key);
                        break;
                    default:
                        break;
                }
            }
            for (const key in objB) {
                const typeKey = ObjectUtil.getObjectType(objB[key]);
                switch (typeKey) {
                    case TypeEnum.NUMBER:
                    case TypeEnum.STRING:
                    case TypeEnum.BOOLEAN:
                    case TypeEnum.UNDEFINED:
                    case TypeEnum.OBJECT:
                    case TypeEnum.ARRAY:
                        bkey.push(key);
                        break;
                    default:
                        break;
                }
            }
            const allKey = ObjectUtil.concatArray(akey, bkey);
            for (let i = 0, len = allKey.length; i < len; i++) {
                const k = allKey[i];
                const diffK = ObjectUtil.diffObject(objA[k], objB[k]);
                if (diffK.length > 0) {
                    if (diffK.length === 1 && diffK[0] === ObjectUtil.DIFF_ROOT) {
                        diffKey.push(k);
                    }
                    else {
                        for (let j = 0, jlen = diffK.length; j < jlen; j++) {
                            diffKey.push(k + '.' + diffK[j]);
                        }
                    }
                }
            }
            return diffKey;
        }
        /**
         *
         * @param arrA
         * @param arrB
         * @param rough  只要数组中有一点不同，就认为整个数组都不同，默认开启
         */
        static diffArray(arrA, arrB, rough = true) {
            const diffKey = [];
            const lenA = arrA.length;
            const lenB = arrB.length;
            if (lenA === lenB) {
                for (let i = 0; i < lenA; i++) {
                    const diffIKen = ObjectUtil.diffObject(arrA[i], arrB[i]);
                    if (diffIKen.length > 0) {
                        if (rough) {
                            diffKey.push(ObjectUtil.DIFF_ROOT);
                            break;
                        }
                        else {
                            if (diffIKen.length === 1 && diffIKen[0] == ObjectUtil.DIFF_ROOT) {
                                diffKey.push(i.toString());
                            }
                            else {
                                if (lenA === diffKey.length) {
                                    //如果数组的每个元素都不相同，数组的整个都不同
                                    diffKey.push(ObjectUtil.DIFF_ROOT);
                                }
                                else {
                                    for (let j = 0, jlen = diffIKen.length; j < jlen; j++) {
                                        diffKey.push(i + '.' + diffIKen[j]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                diffKey.push(ObjectUtil.DIFF_ROOT);
            }
            return diffKey;
        }
        static diffObject(objA, objB) {
            let diffKey = [];
            const typeA = ObjectUtil.getObjectType(objA);
            const typeB = ObjectUtil.getObjectType(objB);
            if (typeA === typeB) {
                switch (typeA) {
                    case TypeEnum.STRING:
                    case TypeEnum.BOOLEAN:
                        if (objA !== objB) {
                            diffKey.push(ObjectUtil.DIFF_ROOT);
                        }
                        break;
                    case TypeEnum.NUMBER:
                        if (objA !== objB) {
                            // NaN !== NaN
                            if (!(isNaN(objA) && isNaN(objB))) {
                                diffKey.push(ObjectUtil.DIFF_ROOT);
                            }
                        }
                        break;
                    case TypeEnum.UNDEFINED:
                    case TypeEnum.UNRECOGNIZED:
                        break;
                    case TypeEnum.ARRAY:
                        {
                            const diffArrKey = ObjectUtil.diffArray(objA, objB);
                            if (diffArrKey.length > 0) {
                                if (diffArrKey[0] === ObjectUtil.DIFF_ROOT) {
                                    diffKey.push(ObjectUtil.DIFF_ROOT);
                                }
                            }
                        }
                        break;
                    case TypeEnum.OBJECT:
                        {
                            const diffObjKey = ObjectUtil.diffObj(objA, objB);
                            if (diffObjKey.length > 0) {
                                diffKey = diffObjKey;
                            }
                        }
                        break;
                }
            }
            else {
                diffKey.push(ObjectUtil.DIFF_ROOT);
            }
            return diffKey;
        }
        static objectEqual(objA, objB) {
            const typeA = ObjectUtil.getObjectType(objA);
            const typeB = ObjectUtil.getObjectType(objB);
            if (typeA === typeB) {
                switch (typeA) {
                    case TypeEnum.STRING:
                    case TypeEnum.NUMBER:
                    case TypeEnum.BOOLEAN:
                        return objA === objB;
                    case TypeEnum.UNDEFINED:
                    case TypeEnum.UNRECOGNIZED:
                        return true;
                    case TypeEnum.ARRAY:
                        return ObjectUtil.arrayEqual(objA, objB);
                    case TypeEnum.OBJECT:
                        return ObjectUtil.objEqual(objA, objB);
                }
            }
            else {
                return false;
            }
        }
        static arrayEqual(objA, objB) {
            const lenA = objA.length;
            const lenB = objB.length;
            if (lenA == lenB) {
                for (let i = 0; i < lenA; i++) {
                    const a = objA[i];
                    const b = objB[i];
                    const kEqual = ObjectUtil.objectEqual(a, b);
                    if (!kEqual) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        static arrayEqualNoOrder(objA, objB) {
            const lenA = objA.length;
            const lenB = objB.length;
            if (lenA == lenB) {
                for (let i = 0; i < lenA; i++) {
                    const a = objA[i];
                    if (objB.indexOf(a) < 0) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        static objEqual(objA, objB) {
            const akey = [];
            const bkey = [];
            for (const key in objA) {
                const typeKey = ObjectUtil.getObjectType(objA[key]);
                switch (typeKey) {
                    case TypeEnum.NUMBER:
                    case TypeEnum.STRING:
                    case TypeEnum.BOOLEAN:
                    case TypeEnum.UNDEFINED:
                    case TypeEnum.OBJECT:
                    case TypeEnum.ARRAY:
                        akey.push(key);
                        break;
                    default:
                        break;
                }
            }
            for (const key in objB) {
                const typeKey = ObjectUtil.getObjectType(objB[key]);
                switch (typeKey) {
                    case TypeEnum.NUMBER:
                    case TypeEnum.STRING:
                    case TypeEnum.BOOLEAN:
                    case TypeEnum.UNDEFINED:
                    case TypeEnum.OBJECT:
                    case TypeEnum.ARRAY:
                        bkey.push(key);
                        break;
                    default:
                        break;
                }
            }
            if (ObjectUtil.arrayEqual(akey, bkey)) {
                for (let i = 0, len = akey.length; i < len; i++) {
                    const k = akey[i];
                    const kEqual = ObjectUtil.objectEqual(objA[k], objB[k]);
                    if (!kEqual) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
    }
    ObjectUtil.DIFF_ROOT = '^';
    gmvc.ObjectUtil = ObjectUtil;
})(gmvc || (gmvc = {}));
//# sourceMappingURL=gmvc.js.map