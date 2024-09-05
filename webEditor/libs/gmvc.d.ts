declare namespace gmvc {
    abstract class BaseObject {
        static defaultMaxCount: number;
        static instances: IMap<any>;
        static maxCountMap: IMap<number>;
        static poolsMap: IMap<BaseObject[]>;
        private static _hashCode;
        static toString(): string;
        static getInstance<T extends BaseObject>(clazz: {
            new (): T;
        }): T;
        static create<T extends BaseObject>(clazz: {
            new (): T;
        }): T;
        static setMaxCount(clazz: {
            new (): BaseObject;
        }, maxCount: number): void;
        static clearPool(clazz: {
            new (): BaseObject;
        } | null): void;
        private static _returnToPool;
        hashCode: number;
        setHashCode(hashcode: number): void;
        protected abstract _onClear(): void;
        returnToPool(): void;
        dispose(): void;
    }
}
declare namespace gmvc {
    interface IMap<T> {
        [x: string]: T;
    }
}
declare namespace gmvc {
    class Event extends BaseObject {
        static toString(): string;
        type: string;
        data: any;
        target: EventDispatcher;
        currentTarget: EventDispatcher;
        _onClear(): void;
        toString(): string;
        copyFrom(value: this): this;
    }
}
declare namespace gmvc {
    class EventDispatcher extends BaseObject implements IEventDispatcher {
        static toString(): string;
        protected _dipatchLevel: number;
        protected readonly _listenerBins: IMap<ListenerBin[]>;
        constructor();
        protected _onClear(): void;
        protected _isSameListener(a: any, b: any): boolean;
        hasEventListener(type: string, callback?: any): boolean;
        addEventListener(type: string, listener: Listener, thisTarget: any, data?: any, priority?: number, once?: boolean): void;
        removeEventListener(type: string, listener: Listener, data?: any): void;
        removeAllEventListener(type?: string): void;
        dispatchEvent(event: Event): void;
        dispatchEventWidth(type: string, data: any): void;
        on(type: string, listener: Listener, thisTarget: any, data?: any, priority?: number): void;
        once(type: string, listener: Listener, thisTarget: any, data?: any, priority?: number): void;
        off(type: string, listener: Listener, data?: any): void;
        offAll(type: string): void;
    }
}
declare namespace gmvc {
    type Listener = (event: Event, data: any) => void;
    type ListenerBin = {
        listener: Listener;
        thisTarget: any;
        data: any;
        priority: number;
        once: boolean;
    };
    interface IEventDispatcher {
        hasEventListener(type: string): boolean;
        addEventListener(type: string, listener: Listener, thisTarget: any, data?: any, priority?: number, once?: boolean): void;
        removeEventListener(type: string, listener: Listener): void;
        dispatchEvent(event: Event): void;
        on(type: string, listener: Listener, thisTarget: any, data?: any, priority?: number): void;
        once(type: string, listener: Listener, thisTarget: any, data?: any, priority?: number): void;
        off(type: string, listener: Listener, data?: any): void;
        offAll(type: string): void;
    }
}
declare namespace gmvc {
    abstract class Model extends BaseObject {
        /**
         * 发送通知。
         */
        protected _sendNotification(type: NotificationType, data?: any): void;
        protected _onClear(): void;
    }
}
declare namespace gmvc {
    /**
     * 历史状态基类。
     */
    abstract class BaseState extends Model implements IState {
        /**
         * 执行此状态时是否需要触发事件，并做为事件自定义参数。
         */
        data: any;
        /**
         * 防止重复执行。
         */
        private _isDone;
        protected _onClear(): void;
        /**
         * 撤销。
         */
        revert(): boolean;
        /**
         * 执行。
         */
        execute(): boolean;
        merge(nextState: IState): boolean;
    }
}
declare namespace gmvc {
    /**
     * 历史记录。
     */
    class History extends BaseState {
        static toString(): string;
        /**
         * 事件生成器，当历史状态激活时，触发事件。
         */
        dispatcher: EventDispatcher | null;
        /**
         * 当历史记录正在变更时，防止因外部逻辑错误破坏历史记录。
         * 未锁，锁定，锁定，锁定
         */
        private _locked;
        /**
         * 历史记录当前的位置。
         */
        private _index;
        /**
         * 状态列表。
         */
        private _states;
        /**
         * 批次列表。
         */
        private _batchs;
        shortcutRedo: ShortcutType;
        shortcutUndo: ShortcutType;
        name: string;
        constructor(shorcutRedo?: ShortcutType, shortcutUndo?: ShortcutType);
        /**
         * 当历史记录在中间执行出现分支时，废弃前一个分支。
         */
        private _free;
        /**
         * 执行或撤销状态。
         */
        private _doState;
        /**
         *
         */
        private _getStateByObject;
        /**
         * 撤销到历史头。
         */
        revert(): boolean;
        /**
         * 执行到历史尾。
         */
        execute(): boolean;
        /**
         * 回退一个状态。
         */
        back(): boolean;
        /**
         * 前进一个状态。
         */
        forward(): boolean;
        /**
         * 跳转到指定状态。
         */
        go(index: number): boolean;
        /**
         * 添加并执行状态。
         */
        add(state: IState): void;
        /**
         * 添加并批次。
         */
        addBatch(...args: IState[]): History | null;
        /**
         * 开始批次。
         */
        beginBatch(name?: string): History;
        abandonBatch(): boolean;
        /**
         * 结束批次。
         */
        endBatch(data?: any): void;
        /**
         * 合并会把在一个batch内的所有同类型按顺序合并，例如
         * [命令类型1，命令类型2，命令类型2，命令类型1]
         * 合并结果为
         * [命令类型1，命令类型2]
         */
        private _mergeAll;
        /**
         *
         */
        linkObjectState(object: any, key: string): void;
        /**
         * 获取指定状态。
         */
        getState(index: number): IState | null;
        /**
         * 当前指定标识。
         */
        get locked(): boolean;
        set locked(value: boolean);
        /**
         * 当前指定标识。
         */
        get index(): number;
        /**
         * 总状态数。
         */
        get count(): number;
        get curBatch(): History;
    }
}
declare namespace gmvc {
    /**
     * 单纯控制器。
     */
    abstract class Controller<M extends Model> extends EventDispatcher {
        /**
         * 数据。
         */
        model: M;
        /**
         * 转发通知。
         */
        private _notificationHandler;
        /**
         * 初始化。
         */
        protected _initialize(): void;
        /**
         * 侦听通知。
         */
        protected _addNotification(type: NotificationType, listener: ViewListener, priority?: number): void;
        /**
         * 取消侦听通知。
         */
        protected _removeNotification(type: NotificationType, listener: ViewListener): void;
        /**
         * 发送通知。
         */
        protected _sendNotification(type: NotificationType, data?: any): void;
        protected _hasEventListener(type: NotificationType, listener?: any): boolean;
        /**
         * 初始化。
         */
        init(model: M): void;
    }
}
declare namespace gmvc {
    class HistoryController extends Controller<History> {
        static toString(): string;
        private static _instance;
        static get instance(): HistoryController;
        private static _silenceLevel;
        static get silence(): boolean;
        static set silence(v: boolean);
        private _history;
        shortcutRedo: ShortcutType;
        shortcutUndo: ShortcutType;
        constructor();
        protected _initialize(): void;
        setHistory(history: History): void;
        redo(): void;
        undo(): void;
        private addListener;
        private removeListener;
        get curBatch(): History | undefined;
        beginBatch(name?: string): void;
        /**
         * 结束批次。
         */
        endBatch(data?: any): void;
        abandonBatch(data?: any): void;
        private onRedo;
        private onUndo;
        add(state: BaseState): void;
    }
}
declare namespace gmvc {
    /**
     * 事件枚举。
     */
    enum HistoryEventType {
        HistoryState = 0,
        HistoryAdd = 1,
        HistoryFree = 2
    }
    /**
     * isUndo 是否撤销
     * data 状态自定义参数
     */
    type HistoryEventData<D> = {
        isUndo: boolean;
        data: D;
    };
    /**
     * 用于扩展的历史状态接口。
     */
    interface IState {
        /**
         * 执行此状态时是否需要触发事件，并做为事件自定义参数。
         */
        data: any;
        /**
         * 撤销。
         */
        revert(): boolean;
        /**
         * 执行。
         */
        execute(): boolean;
        merge(nextState: IState): boolean;
    }
}
declare namespace gmvc {
    class ModifyArrayState extends BaseState {
        static createState(array: any[], index: number, value: any, data?: any): ModifyArrayState;
        array: any[];
        index: number;
        fromValue: any;
        toValue: any;
        revert(): boolean;
        execute(): boolean;
    }
}
declare namespace gmvc {
    class ModifyObjectState extends BaseState {
        static createState(object: any, key: number | string, value: any, data?: any): ModifyObjectState | null;
        object: any;
        key: number | string;
        fromValue: any;
        toValue: any;
        merge(nextState: IState): boolean;
        revert(): boolean;
        execute(): boolean;
    }
}
declare namespace gmvc {
    interface IPoint {
        x: number;
        y: number;
    }
    class ModifyPointState extends BaseState {
        static createState(point: IPoint, newX: number, newY: number): ModifyPointState;
        point: IPoint;
        oldX: number;
        oldY: number;
        newX: number;
        newY: number;
        revert(): boolean;
        execute(): boolean;
    }
}
declare namespace gmvc {
    /**
     * 命令。
     */
    class Command<D, R> extends BaseObject {
        static toString(): string;
        /**
         * 发起命令的通知。
         */
        notification: Notification;
        /**
         * 命令的数据输出。
         */
        result: R | null;
        /**
         * 是否被持有。（异步命令防止被垃圾回收）
         */
        private _isRetained;
        /**
         * 命令的所属队列。（异步命令需要异步通知队列继续，在释放调用中通知队列）
         */
        _queue: QueueCommand<any, any> | null;
        protected _onClear(): void;
        /**
         * 发送通知。
         */
        protected _sendNotification(type: NotificationType, data: any): void;
        /**
         * 持有。
         */
        protected _retain(): void;
        /**
         * 释放。
         */
        protected _release(isSuccessed: boolean): void;
        /**
         * 执行命令。
         */
        execute(): void;
        /**
         * 是否被持有。（异步命令防止被垃圾回收）
         */
        get isRetained(): boolean;
        /**
         * 命令的数据输入。
         */
        get data(): D | null;
    }
}
declare namespace gmvc {
    /**
     * 命令控制器。
     */
    class CommandManager extends BaseObject {
        static toString(): string;
        /**
         * 被持有的命令。（防止垃圾回收）
         */
        private readonly _commands;
        /**
         * 收到通知并执行命令。
         */
        private _notificationHandler;
        protected _onClear(): void;
        /**
         * 注册命令。
         */
        register<T extends Command<any, any>>(type: NotificationType, commandClass: {
            new (): T;
        }, guard?: CommandCallback<T> | null, hook?: CommandCallback<T> | null): void;
        /**
         * 取消注册的命令。
         */
        unregister<T extends Command<any, any>>(type: NotificationType, command: {
            new (): T;
        }): void;
        /**
         * 生成一个命令。
         */
        create<T extends Command<any, any>>(commandBin: CommandBin<T>): T;
        /**
         * 执行命令。
         */
        execute<T extends Command<any, any>>(command: T, notifycation: Notification, commandBin: CommandBin<T>): void;
        /**
         * 持有命令。（防止被垃圾回收）
         */
        retain(command: Command<any, any>): void;
        /**
         * 释放命令。
         */
        release(command: Command<any, any>): void;
    }
    /**
     * 控制器实例。
     */
    const controller: CommandManager;
}
declare namespace gmvc {
    class Context extends EventDispatcher {
        static toString(): string;
        /**
         * 判断是否注册命令（侦听器）的依据。
         */
        protected _isSameListener(a: any, b: any): boolean;
        /**
         * 发送通知。
         */
        sendNotification(type: NotificationType, data: any, target?: any): void;
    }
    const context: Context;
}
declare namespace gmvc {
    type NotificationType = number | string;
    type Notification = {
        type: NotificationType;
        data: any;
        target: Model | ViewController<any, any> | null;
    };
    type ViewListener = (notification: Notification) => void;
    type CommandCallback<T extends Command<any, any>> = (command: T) => void;
    type CommandBin<T extends Command<any, any>> = {
        commandClass: {
            new (): T;
        };
        guard: CommandCallback<T> | null;
        hook: CommandCallback<T> | null;
    };
}
declare namespace gmvc {
    abstract class ModelController extends Model {
        protected _addNotification(type: NotificationType, listener: ViewListener): void;
        /**
         * 取消侦听通知。
         */
        protected _removeNotification(type: NotificationType, listener: ViewListener): void;
        protected _hasEventListener(type: number, listener?: any): boolean;
        private _notificationHandler;
    }
}
declare namespace gmvc {
    /**
     * 命令队列。
     */
    abstract class QueueCommand<D, R> extends Command<D, R> {
        static toString(): string;
        /**
         * 存储每个命令的初始化数据。
         */
        private readonly _commandBins;
        /**
         * 当前命令。
         */
        private _currentCommand;
        /**
         * 初始化命令队列。
         */
        protected abstract _initialize(): void;
        /**
         * 添加命令。
         */
        protected _addCommand<T extends Command<any, any>>(commandClass: {
            new (): T;
        }, guard?: CommandCallback<T> | null, hook?: CommandCallback<T> | null): void;
        /**
         * 执行命令队列。
         */
        execute(): void;
        /**
         * 下一个命令。
         */
        _next(data: any): void;
    }
}
declare namespace gmvc {
    /**
     * 视图控制器。
     */
    abstract class ViewController<M extends Model, V> extends Controller<M> {
        /**
         * 组件。
         */
        view: V;
        initialize(model: M, view: V): void;
        /**
         * 更新视图。
         */
        update(): void;
    }
}
declare namespace gmvc {
    enum GModuleNotification {
        SUBSCRIBE = "SUBSCRIBE",
        REFRESH_MODULE = "REFRESH_MODULE",
        REFRESH_ROOT = "REFRESH_ROOT"
    }
    interface MutationType<T> {
        (state: T, payload: any): void;
    }
    interface IModule<D> {
        readonly rootState: D;
        commit(type: string | number, data?: any, target?: Model): any;
        dispatch(type: string | number, data?: any, target?: Model): any;
        dispatchAsync(type: string | number, data?: any, target?: Model): Promise<any>;
    }
    interface ActionType<T, D> {
        (module: IModule<D>, payload: T): void | Promise<any>;
    }
    interface AsyncActionType<T, D> {
        (module: IModule<D>, payload: T): Promise<any>;
    }
    interface MutationsType<T> {
        [id: string]: MutationType<T>;
    }
    interface ActionsType<T, D> {
        [id: string]: ActionType<T, D>;
    }
    const AsyncFunction: Function;
}
declare namespace gmvc {
    function Commit(target: Object, funName: string, funDescriptor: PropertyDescriptor): PropertyDescriptor;
    abstract class GModule<D, T> extends Model {
        name: string;
        private _state;
        private _rootState;
        private static helpNotification;
        private modules;
        static toString(): string;
        constructor(name: string);
        set state(v: T);
        protected setState(v: T): void;
        get state(): T;
        set rootState(v: D);
        protected setRootState(v: D): void;
        get rootState(): D;
        protected _onClear(): void;
        protected init(): void;
        commit(type: string | number, data?: any, target?: Model): void;
        dispatch(type: string | number, data?: any, target?: Model): void;
        dispatchAsync(type: string | number, data?: any, target?: Model): Promise<any>;
        addModule(module: GModule<D, any>): void;
        protected abstract get mutations(): MutationsType<T>;
        protected get actions(): ActionsType<T, D>;
    }
}
declare namespace gmvc {
    type SubState = {
        [key: string]: any;
    };
    type UndoState = {
        undo: SubState;
        redo: SubState;
        mutation?: Notification[];
    };
    type HistoryBranch = {
        name: string;
        history: UndoState[];
        future: UndoState[];
    };
    export type GHistoryData = {
        enable: boolean;
        branches: HistoryBranch[];
        curBranch: string;
    };
    export enum GHistoryMutation {
        UNDO = "UNDO",
        REDO = "REDO",
        MERGE_START = "MERGE_START",
        MERGE_END = "MERGE_END",
        ENABLE = "ENABLE",
        DISABLE = "DISABLE",
        BRANCH_OPEN = "BRANCH_OPEN",
        BRANCH_CLOSE = "BRANCH_CLOSE"
    }
    export class GHistory<D> extends GModule<D, GHistoryData> {
        undoMutation: string[];
        mustSendMutation: string[];
        store: GStore<D>;
        lastState: D;
        curState: D;
        private merging;
        private mergingMutations;
        private cacheMutations;
        private hasSubscribe;
        private curBranch;
        private historyModuleName;
        private mergeArray;
        private mergeNumber;
        constructor(store: GStore<D>, historyModuleName?: string);
        protected init(): void;
        private includeMutation;
        private onSubscribe;
        addState(state: D, mutations: Notification[]): void;
        private createState;
        private applyState;
        addToHistory(stateStep: UndoState): void;
        get curMergeName(): string;
        startMerge(name: string): void;
        stopMerge(name: string): void;
        undo(): void;
        redo(): void;
        private openBranch;
        private closeBranch;
        private mergeBranch;
        private mergeState;
        private diffState;
        private cloneStore;
        protected get mutations(): MutationsType<GHistoryData>;
        protected get actions(): ActionsType<any, D>;
    }
    export {};
}
declare namespace gmvc {
    abstract class GStore<D> extends GModule<D, D> {
        constructor();
        protected setState(v: D): void;
        protected setRootState(v: D): void;
    }
}
declare namespace gmvc {
    /**
     * 视图控制器。
     */
    abstract class VMController<M extends GModule<any, any>, V> extends Controller<M> {
        /**
         * 组件。
         */
        view: V;
        initialize(model: M, view: V): void;
        /**
         * 更新视图。
         */
        update(): void;
    }
}
declare namespace gmvc {
    type ShortcutDef = {
        keycodes: number[];
        type: ShortcutType;
    };
    type ShortcutType = string | number;
    class Shortcut extends Model {
        static ESC: number;
        static DEL: number;
        static CTRL: number;
        static Z: number;
        static Y: number;
        private _defs;
        constructor(shortcutConfig: ShortcutDef[]);
        matchShortcut(keycodes: number[]): void;
        private addShortcut;
        hasShortcut(keycodes: number[], type: ShortcutType): boolean;
        private keycodeEqual;
        getShortcut(keycodes: number[]): ShortcutType | null;
    }
}
declare namespace gmvc {
    type ShortcutEntry = {
        type: ShortcutType;
        callback: Function;
        focus: any;
    };
    class ShortcutController extends Controller<Shortcut> {
        static toString(): string;
        private static _instance;
        static get instance(): ShortcutController;
        checkoutFocus: (type: ShortcutEntry) => boolean;
        private _entries;
        private _keyPress;
        private _shortcutMap;
        constructor();
        protected _initialize(): void;
        registWindow(window: any): void;
        private onKeyDown;
        private onKeyUp;
        clear(): void;
        addRegister(type: ShortcutType, callback: Function, focus?: any): void;
        removeRegister(type: ShortcutType, callback: Function, focus?: any): void;
        hasRegister(type: ShortcutType, callback: Function, focus?: any): boolean;
        private onShorcut;
    }
}
declare namespace gmvc {
    enum TypeEnum {
        STRING = "string",
        NUMBER = "number",
        BOOLEAN = "boolean",
        UNDEFINED = "undefined",
        OBJECT = "object",
        ARRAY = "array",
        UNRECOGNIZED = "unrecognized"
    }
    class ObjectUtil {
        static DIFF_ROOT: string;
        static clone(obj: any): any;
        static concatArray(arrA: any[], arrB: any[]): any[];
        static getObjectType(obj: any): TypeEnum;
        private static diffObj;
        /**
         *
         * @param arrA
         * @param arrB
         * @param rough  只要数组中有一点不同，就认为整个数组都不同，默认开启
         */
        private static diffArray;
        static diffObject(objA: any, objB: any): string[];
        static objectEqual(objA: any, objB: any): boolean;
        static arrayEqual(objA: any[], objB: any[]): boolean;
        static arrayEqualNoOrder(objA: any[], objB: any[]): boolean;
        private static objEqual;
    }
}
