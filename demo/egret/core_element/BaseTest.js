var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 *
 */
var dragTarget = null;
/**
 *
 */
function enableDrag(displayObject) {
    if (displayObject) {
        displayObject.touchEnabled = true;
        displayObject.addEventListener(egret.TouchEvent.TOUCH_BEGIN, _dragHandler, displayObject);
        displayObject.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, _dragHandler, displayObject);
        displayObject.addEventListener(egret.TouchEvent.TOUCH_END, _dragHandler, displayObject);
    }
}
/**
 *
 */
function disableDrag(displayObject) {
    if (displayObject) {
        displayObject.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, _dragHandler, displayObject);
        displayObject.removeEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, _dragHandler, displayObject);
        displayObject.removeEventListener(egret.TouchEvent.TOUCH_END, _dragHandler, displayObject);
    }
}
var _helpPoint = new egret.Point();
var _dragOffset = new egret.Point();
function _dragHandler(event) {
    switch (event.type) {
        case egret.TouchEvent.TOUCH_BEGIN:
            if (dragTarget) {
                return;
            }
            dragTarget = event.target;
            dragTarget.parent.globalToLocal(event.stageX, event.stageY, _helpPoint);
            _dragOffset.x = dragTarget.x - _helpPoint.x;
            _dragOffset.y = dragTarget.y - _helpPoint.y;
            dragTarget.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, _dragHandler, dragTarget);
            break;
        case egret.TouchEvent.TOUCH_RELEASE_OUTSIDE:
        case egret.TouchEvent.TOUCH_END:
            if (dragTarget) {
                dragTarget.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, _dragHandler, dragTarget);
                dragTarget = null;
            }
            break;
        case egret.TouchEvent.TOUCH_MOVE:
            if (dragTarget) {
                dragTarget.parent.globalToLocal(event.stageX, event.stageY, _helpPoint);
                dragTarget.x = _helpPoint.x + _dragOffset.x;
                dragTarget.y = _helpPoint.y + _dragOffset.y;
            }
            break;
    }
}
/**
 *
 */
var BoundingBoxTester = (function (_super) {
    __extends(BoundingBoxTester, _super);
    function BoundingBoxTester() {
        var _this = _super.call(this) || this;
        _this.armatureDisplay = null;
        _this._helpPointA = new egret.Point();
        _this._helpPointB = new egret.Point();
        _this._helpPointC = new egret.Point();
        _this._background = new egret.Shape();
        _this._pointA = new egret.Shape();
        _this._pointB = new egret.Shape();
        _this._pointA.x = 0;
        _this._pointA.y = 0;
        _this._pointB.x = 200;
        _this._pointB.y = 200;
        _this.addChild(_this._background);
        _this.addChild(_this._pointA);
        _this.addChild(_this._pointB);
        enableDrag(_this._pointA);
        enableDrag(_this._pointB);
        enableDrag(_this);
        _this.addEventListener(egret.Event.ENTER_FRAME, _this._enterFrameHandler, _this);
        return _this;
    }
    BoundingBoxTester.prototype._enterFrameHandler = function (event) {
        if (!this.armatureDisplay) {
            return;
        }
        this.localToGlobal(this._pointA.x, this._pointA.y, this._helpPointA);
        this.localToGlobal(this._pointB.x, this._pointB.y, this._helpPointB);
        this.armatureDisplay.globalToLocal(this._helpPointA.x, this._helpPointA.y, this._helpPointA);
        this.armatureDisplay.globalToLocal(this._helpPointB.x, this._helpPointB.y, this._helpPointB);
        var containsSlotA = this.armatureDisplay.armature.containsPoint(this._helpPointA.x, this._helpPointA.y);
        var containsSlotB = this.armatureDisplay.armature.containsPoint(this._helpPointB.x, this._helpPointB.y);
        var intersectsSlots = this.armatureDisplay.armature.intersectsSegment(this._helpPointA.x, this._helpPointA.y, this._helpPointB.x, this._helpPointB.y, this._helpPointA, this._helpPointB, this._helpPointC);
        //
        var containsPointAColor = containsSlotA ? 0x00FF00 : 0xFF0000;
        this._pointA.graphics.clear();
        this._pointA.graphics.beginFill(containsPointAColor, 0.2);
        this._pointA.graphics.drawCircle(0, 0, 60);
        this._pointA.graphics.endFill();
        this._pointA.graphics.beginFill(containsPointAColor, 0.8);
        this._pointA.graphics.drawCircle(0, 0, 6);
        this._pointA.graphics.endFill();
        var containsPointBColor = containsSlotB ? 0x00FF00 : 0xFF0000;
        this._pointB.graphics.clear();
        this._pointB.graphics.beginFill(containsPointBColor, 0.2);
        this._pointB.graphics.drawCircle(0, 0, 40);
        this._pointB.graphics.endFill();
        this._pointB.graphics.beginFill(containsPointBColor, 0.8);
        this._pointB.graphics.drawCircle(0, 0, 4);
        this._pointB.graphics.endFill();
        //
        var intersectsSegmentColor = intersectsSlots ? 0x00FF00 : 0xFF0000;
        this._background.graphics.clear();
        this._background.graphics.lineStyle(20, intersectsSegmentColor, 0);
        this._background.graphics.moveTo(this._pointA.x, this._pointA.y);
        this._background.graphics.lineTo(this._pointB.x, this._pointB.y);
        this._background.graphics.lineStyle(2, intersectsSegmentColor, 0.8);
        this._background.graphics.moveTo(this._pointA.x, this._pointA.y);
        this._background.graphics.lineTo(this._pointB.x, this._pointB.y);
        //
        if (intersectsSlots) {
            this.armatureDisplay.localToGlobal(this._helpPointA.x, this._helpPointA.y, this._helpPointA);
            this.armatureDisplay.localToGlobal(this._helpPointB.x, this._helpPointB.y, this._helpPointB);
            this.globalToLocal(this._helpPointA.x, this._helpPointA.y, this._helpPointA);
            this.globalToLocal(this._helpPointB.x, this._helpPointB.y, this._helpPointB);
            this._background.graphics.moveTo(this._helpPointA.x, this._helpPointA.y);
            this._background.graphics.lineTo(this._helpPointA.x + Math.cos(this._helpPointC.x) * 60, this._helpPointA.y + Math.sin(this._helpPointC.x) * 60);
            this._background.graphics.moveTo(this._helpPointB.x, this._helpPointB.y);
            this._background.graphics.lineTo(this._helpPointB.x + Math.cos(this._helpPointC.y) * 40, this._helpPointB.y + Math.sin(this._helpPointC.y) * 40);
            this._background.graphics.beginFill(0x00FF00, 0.8);
            this._background.graphics.drawCircle(this._helpPointA.x, this._helpPointA.y, 6);
            this._background.graphics.endFill();
            this._background.graphics.beginFill(0x00FF00, 0.8);
            this._background.graphics.drawCircle(this._helpPointB.x, this._helpPointB.y, 4);
            this._background.graphics.endFill();
        }
    };
    return BoundingBoxTester;
}(egret.DisplayObjectContainer));
__reflect(BoundingBoxTester.prototype, "BoundingBoxTester");
/**
 *
 */
var BaseTest = (function (_super) {
    __extends(BaseTest, _super);
    function BaseTest() {
        var _this = _super.call(this) || this;
        _this._resourceGroup = null;
        _this._resourceConfigURL = null;
        _this._background = new egret.Shape();
        /**
         * 加载进度界面
         * Process interface loading
         */
        _this.loadingView = null;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.onAddToStage, _this);
        return _this;
    }
    BaseTest.prototype.onAddToStage = function () {
        if (this._resourceConfigURL) {
            this._background.graphics.beginFill(0x666666, 1.0);
            this._background.graphics.drawRect(0.0, 0.0, this.stage.stageWidth, this.stage.stageHeight);
            this.addChild(this._background);
            //设置加载进度界面
            //Config to load process interface
            this.loadingView = new LoadingView();
            this.stage.addChild(this.loadingView);
            //初始化Resource资源加载库
            //initiate Resource loading library
            RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
            RES.loadConfig(this._resourceConfigURL, "resource/");
        }
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    BaseTest.prototype.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        this._resourceGroup = this._resourceGroup || "preload";
        RES.loadGroup(this._resourceGroup);
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    BaseTest.prototype.onResourceLoadComplete = function (event) {
        if (event.groupName == this._resourceGroup) {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this._onStart();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    BaseTest.prototype.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    BaseTest.prototype.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    BaseTest.prototype.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    return BaseTest;
}(egret.DisplayObjectContainer));
__reflect(BaseTest.prototype, "BaseTest");
/**
 *
 */
var LoadingView = (function (_super) {
    __extends(LoadingView, _super);
    function LoadingView() {
        var _this = _super.call(this) || this;
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.addToStageHandler, _this);
        return _this;
    }
    LoadingView.prototype.addToStageHandler = function (event) {
        this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.addToStageHandler, this);
        this.textField = new egret.TextField();
        this.textField.y = this.stage.stageHeight * 0.5;
        this.textField.width = this.stage.stageWidth;
        this.textField.height = 60;
        this.textField.textAlign = "center";
        this.addChild(this.textField);
    };
    LoadingView.prototype.setProgress = function (current, total) {
        this.textField.text = "Loading..." + current + "/" + total;
    };
    return LoadingView;
}(egret.Sprite));
__reflect(LoadingView.prototype, "LoadingView");
//# sourceMappingURL=BaseTest.js.map