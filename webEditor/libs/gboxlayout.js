var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var gboxLayout;
(function (gboxLayout) {
    var GNode = /** @class */ (function () {
        function GNode() {
            this.id = ++GNode.nodeNum;
        }
        GNode.nodeNum = 0;
        return GNode;
    }());
    gboxLayout.GNode = GNode;
})(gboxLayout || (gboxLayout = {}));
/// <reference path="./GNode.ts" />
var gboxLayout;
(function (gboxLayout) {
    var GBox = /** @class */ (function (_super) {
        __extends(GBox, _super);
        function GBox() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.children = [];
            _this._panels = [];
            _this._panelIndex = 0;
            _this._sizeDirty = false;
            _this._posDirty = false;
            _this._panelList = [];
            _this._labelList = [];
            _this._startDrag = false;
            _this.onFocusBox = function (e) {
                if (_this.owner) {
                    _this.owner.focusBox = _this;
                }
            };
            _this.onLabelClick = function (e) {
                var selectId = parseInt(e.currentTarget['id']);
                if (isNaN(selectId)) {
                    return;
                }
                if (_this.panelIndex != selectId) {
                    _this.panelIndex = selectId;
                    _this.renderPanel();
                }
            };
            _this.onLabelMouseDown = function (e) {
                var selectId = parseInt(e.currentTarget['id']);
                if (isNaN(selectId)) {
                    return;
                }
                _this._dragPanel = _this._panelList[selectId];
                if (document) {
                    document.addEventListener('mousemove', _this.onLabelMouseMove);
                    document.addEventListener('mouseup', _this.onLabelMouseUp);
                }
                _this._downPos = { x: e.clientX, y: e.clientY };
            };
            _this.onLabelMouseMove = function (e) {
                if (!_this._startDrag && _this._downPos) {
                    var len = (_this._downPos.x - e.clientX) * (_this._downPos.x - e.clientX) + (_this._downPos.y - e.clientY) * (_this._downPos.y - e.clientY);
                    if (len > 100) {
                        _this._startDrag = true;
                    }
                }
                if (_this.owner && _this._startDrag) {
                    var box = _this.owner.dragControl.checkOverBox(e.clientX - _this.owner.layoutX, e.clientY - _this.owner.layoutY);
                    _this._dropBox = box;
                }
            };
            _this.onLabelMouseUp = function (e) {
                if (document) {
                    document.removeEventListener('mousemove', _this.onLabelMouseMove);
                    document.removeEventListener('mouseup', _this.onLabelMouseUp);
                }
                _this.owner.dragControl.clearDrag();
                if (_this._dragPanel && _this._dropBox) {
                    if (_this._dropBox.box == _this &&
                        _this.panels.length == 1) {
                    }
                    else {
                        var owner = _this.owner;
                        var dragPanel = _this._dragPanel;
                        var dropBox = _this._dropBox;
                        owner.removePanel(dragPanel);
                        owner.addPanel(dragPanel, dropBox.box, dropBox.pos);
                        if (owner.changeCallback) {
                            owner.changeCallback();
                        }
                    }
                }
                _this._dragPanel = null;
                _this._dropBox = null;
                _this._startDrag = false;
            };
            return _this;
        }
        GBox.prototype.getData = function () {
            var mainindex = 0;
            var children = [];
            for (var i = 0, len = this.children.length; i < len; i++) {
                if (this.children[i].isMain) {
                    mainindex = i;
                }
                children.push(this.children[i].getData());
            }
            var data = {
                name: this.name,
                isVertical: this.isVertical,
                mainIndex: mainindex, // -1,0,1
                width: this._explicitWidth,
                height: this._explicitHeight,
                children: children,
                panels: this._panels,
                panelIndex: this._panelIndex
            };
            if (children.length == 0) {
                delete data.children;
            }
            if (this._panels.length == 0) {
                delete data.panels;
            }
            return data;
        };
        Object.defineProperty(GBox.prototype, "minWidth", {
            get: function () {
                if (this.children && this.children.length > 0) {
                    if (this.children.length == 1 || this.isVertical) {
                        return this.children[0].minWidth;
                    }
                    else {
                        return this.children[0].minWidth + this.children[1].minWidth + gboxLayout.GBoxLayout.GAP;
                    }
                }
                return this.curPanel.minWidth || gboxLayout.GBoxLayout.MIN_SIZE;
            },
            set: function (v) {
                if (isNaN(v) || v < 0) {
                    v = gboxLayout.GBoxLayout.MIN_SIZE;
                }
                this.curPanel.minWidth = v;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "minHeight", {
            get: function () {
                if (this.children && this.children.length > 0) {
                    if (this.children.length == 1 || !this.isVertical) {
                        return this.children[0].minHeight;
                    }
                    else {
                        return this.children[0].minHeight + this.children[1].minHeight + gboxLayout.GBoxLayout.GAP;
                    }
                }
                return this.curPanel.minHeight || gboxLayout.GBoxLayout.MIN_SIZE;
            },
            set: function (v) {
                if (isNaN(v) || v < 0) {
                    v = gboxLayout.GBoxLayout.MIN_SIZE;
                }
                this.curPanel.minHeight = v;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "maxWidth", {
            get: function () {
                if (this.children && this.children.length > 0) {
                    if (this.children.length == 1 || this.isVertical) {
                        return this.children[0].maxWidth;
                    }
                    else {
                        return this.children[0].maxWidth + this.children[1].maxWidth + gboxLayout.GBoxLayout.GAP;
                    }
                }
                return this.curPanel.maxWidth || gboxLayout.GBoxLayout.MAX_SIZE;
            },
            set: function (v) {
                if (isNaN(v) || v < 0 || v > gboxLayout.GBoxLayout.MAX_SIZE) {
                    v = gboxLayout.GBoxLayout.MAX_SIZE;
                }
                this.curPanel.maxWidth = v;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "maxHeight", {
            get: function () {
                if (this.children && this.children.length > 0) {
                    if (this.children.length == 1 || !this.isVertical) {
                        return this.children[0].maxHeight;
                    }
                    else {
                        return this.children[0].maxHeight + this.children[1].maxHeight + gboxLayout.GBoxLayout.GAP;
                    }
                }
                return this.curPanel.maxHeight || gboxLayout.GBoxLayout.MAX_SIZE;
            },
            set: function (v) {
                if (isNaN(v) || v < 0 || v > gboxLayout.GBoxLayout.MAX_SIZE) {
                    v = gboxLayout.GBoxLayout.MAX_SIZE;
                }
                this.curPanel.maxHeight = v;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "explicitWidth", {
            get: function () {
                return this._explicitWidth;
            },
            set: function (v) {
                if (v != this._explicitWidth) {
                    this._explicitWidth = v;
                    this.width = v;
                    this._sizeDirty = true;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "explicitHeight", {
            get: function () {
                return this._explicitHeight;
            },
            set: function (v) {
                if (v != this._explicitHeight) {
                    this._explicitHeight = v;
                    this.height = v;
                    this._sizeDirty = true;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (v) {
                if (v != this._x) {
                    this._x = v;
                    this._posDirty = true;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (v) {
                if (v != this._y) {
                    this._y = v;
                    this._posDirty = true;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "focused", {
            get: function () {
                return this._focused;
            },
            set: function (v) {
                if (v != this._focused) {
                    this._focused = v;
                    if (this.render) {
                        if (this._focused) {
                            this.render.className = 'gbox gfocus';
                        }
                        else {
                            this.render.className = 'gbox';
                        }
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "curPanel", {
            get: function () {
                return this._panels[this._panelIndex];
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "panels", {
            get: function () {
                return this._panels;
            },
            set: function (v) {
                if (v != this._panels) {
                    this._panels = v;
                    this.parsePanels();
                    this.panelIndex = 0;
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "panelIndex", {
            get: function () {
                return this._panelIndex;
            },
            set: function (v) {
                this._panelIndex = v;
                if (this._panelIndex < this._panelList.length) {
                    this._curPanel = this._panelList[this._panelIndex];
                }
                else {
                    if (this._panelList.length > 0) {
                        this._curPanel = this._panelList[this._panelList.length - 1];
                    }
                }
                if(this.owner.changeCallback) {
                    this.owner.changeCallback();
                }
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "isLeaf", {
            get: function () {
                return this.children == null || this.children.length == 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "hasLabel", {
            get: function () {
                return this._curPanel && this._curPanel.type == gboxLayout.GPanelType.TAB;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "labelHeight", {
            get: function () {
                if (this._labelContainer && this.hasLabel) {
                    return this._labelContainer.offsetHeight + 5;
                }
                return 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "labelWidth", {
            get: function () {
                if (this._labelContainer) {
                    return this._labelContainer.offsetWidth + 5;
                }
                return 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBox.prototype, "oneLabelWidth", {
            get: function () {
                var len = this._panelList.length;
                if (len <= 0) {
                    len = 1;
                }
                return this.labelWidth / len;
            },
            enumerable: false,
            configurable: true
        });
        GBox.prototype.getPanelIndex = function (panel) {
            for (var i = 0, len = this.panels.length; i < len; i++) {
                if (this.panels[i].name === panel.name) {
                    return i;
                }
            }
        };
        GBox.prototype.removePanel = function (panel) {
            var panelIndex = this.getPanelIndex(panel);
            if (panelIndex >= 0) {
                this.panels.splice(panelIndex, 1);
                this._panelList.splice(panelIndex, 1);
                panel.parent = null;
            }
            if (panel == this._curPanel) {
                this.panelIndex = 0;
                this._curPanel = this._panelList[0];
            }
            this.renderPanel();
        };
        GBox.prototype.addPanel = function (panel, box, pos) {
            var index = pos - gboxLayout.GDragPosition.LABEL;
            var panelData = panel.data;
            this._panels.splice(index, 0, panelData);
            this._panelList.splice(index, 0, panel);
            panel.parent = this;
            this.panelIndex = this._panelIndex;
            panel.resize(this.explicitWidth, this.explicitHeight);
            this.renderPanel();
        };
        GBox.prototype.resize = function () {
            if (this._panelList) {
                for (var i = 0, len = this._panelList.length; i < len; i++) {
                    this._panelList[i].resize(this.explicitWidth, this.explicitHeight);
                }
            }
        };
        GBox.prototype.reRenderSize = function () {
            if (this.children.length == 2) {
                if (this.split) {
                    if (this.isVertical) {
                        this.split.x = this.x;
                        this.split.y = this.y + this.children[0].explicitHeight - gboxLayout.GBoxLayout.GAP_SPLIT;
                        this.split.explicitWidth = this.explicitWidth;
                        this.split.explicitHeight = gboxLayout.GBoxLayout.GAP + gboxLayout.GBoxLayout.GAP_SPLIT * 2;
                        this.split.width = this.explicitWidth;
                        this.split.height = gboxLayout.GBoxLayout.GAP;
                    }
                    else {
                        this.split.y = this.y;
                        this.split.x = this.x + this.children[0].explicitWidth - gboxLayout.GBoxLayout.GAP_SPLIT;
                        this.split.explicitWidth = gboxLayout.GBoxLayout.GAP + gboxLayout.GBoxLayout.GAP_SPLIT * 2;
                        this.split.explicitHeight = this.explicitHeight;
                        this.split.width = gboxLayout.GBoxLayout.GAP;
                        this.split.height = this.explicitHeight;
                    }
                    this.split.reRenderSize();
                }
            }
            if (this.children.length > 0) {
                return;
            }
            if (this.render) {
                this.render.style.width = this.explicitWidth + 'px';
                this.render.style.height = this.explicitHeight + 'px';
                this.render.style.left = this.x + 'px';
                this.render.style.top = this.y + 'px';
            }
            if (this._sizeDirty) {
                this._sizeDirty = false;
                this.resize();
            }
            this._posDirty = false;
        };
        GBox.prototype.renderElement = function () {
            // if(!this._sizeDirty && !this._posDirty) {
            //     return;
            // }
            if (this.children.length == 2) {
                if (this.split == null) {
                    this.split = new gboxLayout.GSplit();
                }
                this.split.boxs = this.children;
                this.split.isVertical = this.isVertical;
                this.split.parent = this;
                this.split.owner = this.owner;
                if (this.isVertical) {
                    this.split.x = this.x;
                    this.split.y = this.y + this.children[0].explicitHeight - gboxLayout.GBoxLayout.GAP_SPLIT;
                    this.split.explicitWidth = this.explicitWidth;
                    this.split.explicitHeight = gboxLayout.GBoxLayout.GAP + gboxLayout.GBoxLayout.GAP_SPLIT * 2;
                    this.split.width = this.explicitWidth;
                    this.split.height = gboxLayout.GBoxLayout.GAP;
                }
                else {
                    this.split.y = this.y;
                    this.split.x = this.x + this.children[0].explicitWidth - gboxLayout.GBoxLayout.GAP_SPLIT;
                    this.split.explicitWidth = gboxLayout.GBoxLayout.GAP + gboxLayout.GBoxLayout.GAP_SPLIT * 2;
                    this.split.explicitHeight = this.explicitHeight;
                    this.split.width = gboxLayout.GBoxLayout.GAP;
                    this.split.height = this.explicitHeight;
                }
                this.split.renderElement();
            }
            else {
                if (this.split) {
                    this.split.dispose();
                }
                this.split = null;
            }
            if (this.children.length > 0) {
                return;
            }
            if (this.render == null) {
                this.render = document.createElement('div');
                this.render.className = 'gbox';
                this.render.addEventListener('mousedown', this.onFocusBox);
            }
            this.render.style.width = this.explicitWidth + 'px';
            this.render.style.height = this.explicitHeight + 'px';
            this.render.style.left = this.x + 'px';
            this.render.style.top = this.y + 'px';
            this.render.id = this.name;
            this.renderPanel();
            if (this._sizeDirty) {
                this._sizeDirty = false;
                this.resize();
            }
            this._posDirty = false;
        };
        GBox.prototype.disposePanels = function () {
            if (this._panelList) {
                for (var i = 0, len = this._panelList.length; i < len; i++) {
                    this._panelList[i].dispose();
                }
                this._panelList.length = 0;
            }
        };
        GBox.prototype.parsePanels = function () {
            this.disposePanels();
            if (this._panels && this.owner) {
                for (var i = 0, len = this._panels.length; i < len; i++) {
                    var panelData = this._panels[i];
                    var panel = this.owner.getPanel(panelData);
                    panel.parent = this;
                    this._panelList.push(panel);
                }
            }
            this.panelIndex = 0;
        };
        GBox.prototype.renderPanel = function () {
            if (this._conentContainer == null) {
                this.initPanelElement();
            }
            this.renderPanelLabel();
            if (this._panelList) {
                for (var i = 0, len = this._panelList.length; i < len; i++) {
                    this._panelList[i].renderElement();
                }
            }
            if (this._curPanel) {
                this.removeElementChildren(this._conentContainer);
                this.removeElementChildren(this._toolbarContainer);
                if (this._curPanel.contentElement) {
                    this._conentContainer.appendChild(this._curPanel.contentElement);
                }
                if (this._curPanel.toolBarElement) {
                    this._toolbarContainer.appendChild(this._curPanel.toolBarElement);
                }
            }
        };
        GBox.prototype.initPanelElement = function () {
            this._conentContainer = document.createElement('div');
            this._conentContainer.className = 'gPanelConent';
            this._labelContainer = document.createElement('span');
            this._labelContainer.className = 'gPanelLabels';
            this._toolbarContainer = document.createElement('span');
            this._toolbarContainer.className = 'gPanelToolbar';
            this.render.appendChild(this._labelContainer);
            this.render.appendChild(this._toolbarContainer);
            this.render.appendChild(this._conentContainer);
        };
        GBox.prototype.renderPanelLabel = function () {
            this.removeElementChildren(this._labelContainer);
            this.disposeLabels();
            if (this._panelList.length == 1 && this._panelList[0].type == gboxLayout.GPanelType.BLOCK) {
                this._labelContainer.className = 'gPanelLabels none';
            }
            else {
                this._labelContainer.className = 'gPanelLabels';
                for (var i = 0, len = this._panelList.length; i < len; i++) {
                    var label = this.createLabel(this._panelList[i], this.panelIndex == i, i);
                    this._labelList.push(label);
                    this._labelContainer.appendChild(label);
                }
            }
        };
        GBox.prototype.createLabel = function (panel, selected, index) {
            panel.renderLabel();
            var label = document.createElement('span');
            label.className = selected ? 'gLabel gLabelSelect' : 'gLabel';
            if (panel.labelElement) {
                label.appendChild(panel.labelElement);
            }
            else {
                label.innerHTML = panel.name;
            }
            label.id = index.toString();
            label.addEventListener('click', this.onLabelClick);
            label.addEventListener('mousedown', this.onLabelMouseDown);
            return label;
        };
        GBox.prototype.disposeLabels = function () {
            for (var i = 0, len = this._labelList.length; i < len; i++) {
                var label = this._labelList[i];
                label.removeEventListener('click', this.onLabelClick);
            }
        };
        GBox.prototype.removeElementChildren = function (element) {
            if (element == null) {
                return;
            }
            if (element.childNodes) {
                while (element.childNodes.length > 0) {
                    element.removeChild(element.childNodes[0]);
                }
            }
        };
        GBox.prototype.removeElement = function (element) {
            if (element == null) {
                return;
            }
            if (element.parentElement) {
                element.parentElement.removeChild(element);
            }
        };
        GBox.prototype.dispose = function () {
            this.name = null;
            this.width = 0;
            this.height = 0;
            if (this.render) {
                this.render.removeEventListener('mousedown', this.onFocusBox);
            }
            this.isVertical = false;
            this.parent = null;
            this.brother = null;
            this.children = [];
            this.render = null;
            this.isMain = false;
            this.split = null;
            this.owner = null;
            this._panels = [];
            this._panelIndex = 0;
            this._minWidth = 0;
            this._minHeight = 0;
            this._maxWidth = 0;
            this._maxHeight = 0;
            this._explicitWidth = 0;
            this._explicitHeight = 0;
            this._x = 0;
            this._y = 0;
            this._sizeDirty = false;
            this._posDirty = false;
            this._panelList = [];
            this._curPanel = null;
            this._labelContainer = null;
            this._conentContainer = null;
            this._toolbarContainer = null;
            this._labelList = [];
            this._dragPanel = null;
            this._dropBox = null;
        };
        return GBox;
    }(gboxLayout.GNode));
    gboxLayout.GBox = GBox;
})(gboxLayout || (gboxLayout = {}));
/// <reference path="./GBox.ts" />
var gboxLayout;
(function (gboxLayout) {
    var GBoxLayout = /** @class */ (function (_super) {
        __extends(GBoxLayout, _super);
        function GBoxLayout() {
            var _this = _super.call(this) || this;
            _this.clientWidth = 100;
            _this.clientHeight = 100;
            _this._boxList = [];
            _this._panelDic = {};
            _this._panelParamsDic = {};
            _this._boxPool = [];
            window.addEventListener('resize', function () {
                _this.resizeHandler();
            });
            _this._dragContainer = document.createElement('div');
            _this._dragContainer.className = 'dragContainer';
            _this._dragContainer.id = 'dragContainer';
            _this.dragControl = new gboxLayout.GDragControl(_this);
            _this.dragControl.dragContainer = _this._dragContainer;
            return _this;
        }
        Object.defineProperty(GBoxLayout.prototype, "boxList", {
            get: function () {
                return this._boxList;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBoxLayout.prototype, "layoutX", {
            get: function () {
                if (this._container) {
                    return this._container.offsetLeft;
                }
                return 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBoxLayout.prototype, "layoutY", {
            get: function () {
                if (this._container) {
                    return this._container.offsetTop;
                }
                return 0;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(GBoxLayout.prototype, "focusBox", {
            get: function () {
                return this._focusBox;
            },
            set: function (v) {
                if (v != this._focusBox) {
                    if (this._focusBox) {
                        this._focusBox.focused = false;
                    }
                    this._focusBox = v;
                    if (this._focusBox) {
                        this._focusBox.focused = true;
                    }
                }
            },
            enumerable: false,
            configurable: true
        });
        GBoxLayout.prototype.setData = function (data) {
            this._data = data;
            this.clearLayout();
            this.parseData();
            this.calculatePosition();
            this.refreshLayout();
        };
        GBoxLayout.prototype.getData = function () {
            if (this._mainBox) {
                return this._mainBox.getData();
            }
            return null;
        };
        GBoxLayout.prototype.setContainer = function (container) {
            if (container) {
                this._container = container;
                this.clientWidth = this._container.offsetWidth;
                this.clientHeight = this._container.offsetHeight;
                if (this._dragContainer) {
                    this._container.appendChild(this._dragContainer);
                }
            }
        };
        GBoxLayout.prototype.resizeHandler = function () {
            this.clientWidth = this._container.offsetWidth;
            this.clientHeight = this._container.offsetHeight;
            this.calculatePosition();
            this.refreshLayout();
        };
        GBoxLayout.prototype.moveSplit = function (split, splitPos, boxABound, boxBBound, offX, offY) {
            // TODO 优化
            if (split && split.boxs.length == 2) {
                var boxA = split.boxs[0];
                var boxB = split.boxs[1];
                if (split.isVertical) {
                    var explicitOffY = offY;
                    var boxAHeight = boxABound.height + explicitOffY;
                    var boxBHeight = boxBBound.height - explicitOffY;
                    // 如果调整后比最小高度小，不能调整
                    if (boxAHeight < boxABound.height && boxAHeight < boxA.minHeight) {
                        return;
                    }
                    if (boxBHeight < boxBBound.height && boxBHeight < boxB.minHeight) {
                        return;
                    }
                    var totalHeight = boxAHeight + boxBHeight;
                    if (totalHeight > (boxA.minHeight + boxB.minHeight)) {
                        if (explicitOffY < 0) {
                            if (boxAHeight < boxA.minHeight) {
                                explicitOffY = boxA.minHeight - boxABound.height;
                            }
                            else if (boxBHeight > boxB.maxHeight && boxB.maxHeight > boxB.explicitHeight) {
                                explicitOffY = boxB.maxHeight - boxABound.height;
                            }
                        }
                        else {
                            if (boxBHeight < boxB.minHeight) {
                                explicitOffY = boxBBound.height - boxB.minHeight;
                            }
                            else if (boxAHeight > boxA.maxHeight) {
                                explicitOffY = boxA.maxHeight - boxABound.height;
                            }
                        }
                        if (explicitOffY != offY) {
                            return;
                        }
                    }
                    this.calculateBoxPositionSize(boxA, boxA.x, boxA.y, boxA.explicitWidth, boxABound.height + explicitOffY);
                    split.y = splitPos.y + explicitOffY;
                    this.calculateBoxPositionSize(boxB, boxB.x, boxBBound.y + explicitOffY, boxB.explicitWidth, boxBBound.height - explicitOffY);
                }
                else {
                    var explicitOffX = offX;
                    var boxAWidth = boxABound.width + explicitOffX;
                    var boxBWidth = boxBBound.width - explicitOffX;
                    // 如果调整后比最小高度小，不能调整
                    if (boxAWidth < boxABound.width && boxAWidth < boxA.minWidth) {
                        return;
                    }
                    if (boxBWidth < boxBBound.width && boxBWidth < boxB.minWidth) {
                        return;
                    }
                    var totalWidth = boxAWidth + boxBWidth;
                    if (totalWidth > (boxA.minWidth + boxB.minWidth)) {
                        if (explicitOffX < 0) {
                            if (boxBWidth > boxB.maxWidth) {
                                explicitOffX = boxBBound.width - boxB.maxWidth;
                            }
                            else if (boxAWidth < boxA.minWidth) {
                                explicitOffX = boxA.minWidth - boxABound.width;
                            }
                        }
                        else {
                            if (boxAWidth > boxA.maxWidth) {
                                explicitOffX = boxA.maxWidth - boxABound.width;
                            }
                            else if (boxBWidth < boxB.minWidth) {
                                explicitOffX = boxBBound.width - boxB.minWidth;
                            }
                        }
                        if (explicitOffX != offX) {
                            return;
                        }
                    }
                    this.calculateBoxPositionSize(boxA, boxA.x, boxA.y, boxABound.width + explicitOffX, boxA.explicitHeight);
                    split.x = splitPos.x + explicitOffX;
                    this.calculateBoxPositionSize(boxB, boxBBound.x + explicitOffX, boxB.y, boxBBound.width - explicitOffX, boxB.explicitHeight);
                }
                // this.renderElement();
                //只改大小效率更高
                this.reRenderSize();
                if (this.changeCallback) {
                    this.changeCallback();
                }
            }
        };
        GBoxLayout.prototype.registPanel = function (id, panel, params) {
            if (params === void 0) { params = null; }
            this._panelDic[id] = panel;
            this._panelParamsDic[id] = params;
        };
        GBoxLayout.prototype.getPanel = function (panelData) {
            var panelInstance = this._panelDic[panelData.name];
            if (panelInstance) {
                if (typeof (panelInstance) === 'object') {
                    panelInstance.data = panelData;
                    return panelInstance;
                }
                else {
                    var panelClz = panelInstance;
                    var newPanel = new panelClz();
                    newPanel.data = panelData;
                    return newPanel;
                }
            }
            else {
                return new gboxLayout.GPanel(panelData);
            }
        };
        GBoxLayout.prototype.reRenderSize = function () {
            if (this._boxList) {
                for (var i = 0, len = this._boxList.length; i < len; i++) {
                    var box = this._boxList[i];
                    if (box) {
                        box.reRenderSize();
                    }
                }
            }
        };
        GBoxLayout.prototype.renderElement = function () {
            if (this.render == null) {
                this.render = document.createElement('div');
                this.render.className = 'gapp';
            }
            this.removeElementChildren(this.render);
            if (this._boxList) {
                for (var i = 0, len = this._boxList.length; i < len; i++) {
                    var box = this._boxList[i];
                    if (box) {
                        box.renderElement();
                        if (box.render) {
                            this.render.appendChild(box.render);
                        }
                        else if (box.split) {
                            this.render.appendChild(box.split.render);
                        }
                    }
                }
            }
            if (this._container) {
                this._container.appendChild(this.render);
            }
        };
        GBoxLayout.prototype.removePanel = function (panel) {
            var box = panel.parent;
            if (box) {
                if (box.panels.length <= 1) {
                    this.removeBox(box);
                }
                else {
                    box.removePanel(panel);
                }
            }
        };
        GBoxLayout.prototype.removeBox = function (box) {
            var targetBox = box;
            if (targetBox && targetBox.parent) {
                var parentBox = targetBox.parent;
                var brotherBox = targetBox.brother;
                this.calculateBoxPositionSize(brotherBox, parentBox.x, parentBox.y, parentBox.explicitWidth, parentBox.explicitHeight);
                //调整层级关系
                if (parentBox.parent != null) {
                    for (var i = 0, len = parentBox.parent.children.length; i < len; i++) {
                        if (parentBox.parent.children[i] == parentBox) {
                            parentBox.parent.children[i] = brotherBox;
                            break;
                        }
                    }
                    parentBox.children.length = 0;
                }
                else {
                    //删除主box，当前box为主box；
                    this._mainBox = brotherBox;
                    this._mainBox.brother = null;
                    this._mainBox.parent = null;
                }
                brotherBox.parent = parentBox.parent;
                brotherBox.brother = parentBox.brother;
                if (brotherBox.brother) {
                    brotherBox.brother.brother = brotherBox;
                }
                parentBox.parent = null;
                parentBox.brother = null;
                targetBox.parent = null;
                targetBox.brother = null;
                if (parentBox.split) {
                    if (parentBox.split.render && parentBox.split.render.parentElement) {
                        parentBox.split.render.parentElement.removeChild(parentBox.split.render);
                    }
                }
                for (var i = 0, len = this._boxList.length; i < len; i++) {
                    if (this._boxList[i] == parentBox || this._boxList[i] == targetBox) {
                        this._boxList.splice(i, 1);
                        i--;
                        len--;
                    }
                }
                this.disposeBoxToPool(parentBox);
                this.disposeBoxToPool(targetBox);
                this.renderElement();
            }
        };
        GBoxLayout.prototype.addPanel = function (panel, box, pos) {
            if (pos >= gboxLayout.GDragPosition.LABEL) {
                box.addPanel(panel, box, pos);
            }
            else {
                this.addBox(panel, box, pos);
            }
            if (this.changeCallback) {
                this.changeCallback();
            }
        };
        GBoxLayout.prototype.addBox = function (panel, box, pos) {
            var boxParent = box.parent;
            var newParentBox = this.createBoxFromPool();
            //新的parent
            var isVertical = pos == gboxLayout.GDragPosition.TOP || pos == gboxLayout.GDragPosition.BOTTOM;
            newParentBox.name = box.name;
            newParentBox.x = box.x;
            newParentBox.y = box.y;
            newParentBox.width = box.width;
            newParentBox.height = box.height;
            newParentBox.explicitHeight = box.explicitHeight;
            newParentBox.explicitWidth = box.explicitWidth;
            newParentBox.isVertical = isVertical;
            newParentBox.owner = this;
            newParentBox.panels = [];
            newParentBox.panelIndex = 0;
            newParentBox.parent = boxParent;
            newParentBox.brother = box.brother;
            if (newParentBox.brother) {
                newParentBox.brother.brother = newParentBox;
            }
            if (boxParent) {
                var boxIndex = boxParent.children.indexOf(box);
                if (boxIndex >= 0) {
                    boxParent.children[boxIndex] = newParentBox;
                }
            }
            this._boxList.push(newParentBox);
            var rect = gboxLayout.GDragControl.getInsertBoxPos(box, pos);
            //处理新的box
            var panelBox = this.createBoxFromPool();
            panelBox.name = panel.name;
            panelBox.width = rect.width;
            panelBox.height = rect.height;
            panelBox.isVertical = false;
            panelBox.owner = this;
            panelBox.panels = [panel.data];
            panelBox.parsePanels();
            panelBox.panelIndex = 0;
            box.brother = panelBox;
            panelBox.brother = box;
            panelBox.parent = newParentBox;
            switch (pos) {
                case gboxLayout.GDragPosition.TOP:
                case gboxLayout.GDragPosition.LEFT:
                    newParentBox.children.push(panelBox);
                    newParentBox.children.push(box);
                    break;
                case gboxLayout.GDragPosition.BOTTOM:
                case gboxLayout.GDragPosition.RIGHT:
                    newParentBox.children.push(box);
                    newParentBox.children.push(panelBox);
                    break;
            }
            this._boxList.push(panelBox);
            //处理 老的box
            switch (pos) {
                case gboxLayout.GDragPosition.TOP:
                case gboxLayout.GDragPosition.BOTTOM:
                    box.height = box.height / 2;
                case gboxLayout.GDragPosition.LEFT:
                case gboxLayout.GDragPosition.RIGHT:
                    box.width = box.width / 2;
                    break;
            }
            box.parent = newParentBox;
            this.calculateBoxPositionSize(newParentBox, newParentBox.x, newParentBox.y, newParentBox.width, newParentBox.height);
            this.renderElement();
        };
        GBoxLayout.prototype.refreshLayout = function () {
            this.renderElement();
        };
        GBoxLayout.prototype.clearLayout = function () {
            for (var i = 0, len = this._boxList.length; i < len; i++) {
                this.disposeBoxToPool(this._boxList[i]);
            }
            this._boxList.length = 0;
        };
        GBoxLayout.prototype.parseData = function () {
            if (this._data == null) {
                return;
            }
            this._mainBox = this.parseBox(this._data);
        };
        GBoxLayout.prototype.parseBox = function (boxData) {
            var box = this.getBox(boxData);
            if (boxData.children) {
                var childBox1 = void 0;
                var childBox2 = void 0;
                if (boxData.children.length >= 1) {
                    childBox1 = this.parseBox(boxData.children[0]);
                }
                if (boxData.children.length >= 2) {
                    childBox2 = this.parseBox(boxData.children[1]);
                }
                if (childBox1 && childBox2) {
                    childBox1.brother = childBox2;
                    childBox2.brother = childBox1;
                }
                if (boxData.mainIndex == 0 && childBox1) {
                    childBox1.isMain = true;
                    if (childBox2) {
                        childBox2.isMain = false;
                    }
                }
                if (boxData.mainIndex == 1 && childBox2) {
                    childBox2.isMain = true;
                    if (childBox1) {
                        childBox1.isMain = false;
                    }
                }
                if (childBox1) {
                    box.children.push(childBox1);
                    childBox1.parent = box;
                }
                if (childBox2) {
                    box.children.push(childBox2);
                    childBox2.parent = box;
                }
            }
            this._boxList.push(box);
            return box;
        };
        GBoxLayout.prototype.calculatePosition = function () {
            if (this._mainBox) {
                this.calculateBoxPositionSize(this._mainBox, 0, 0, this.clientWidth, this.clientHeight);
            }
        };
        GBoxLayout.prototype.calculateBoxPositionSize = function (box, x, y, width, height) {
            box.x = x;
            box.y = y;
            box.explicitWidth = width;
            box.explicitHeight = height;
            ;
            if (box.children && box.children.length > 0) {
                if (box.children.length == 1) {
                    this.calculateBoxPositionSize(box.children[0], x, y, width, height);
                }
                else {
                    var box1 = box.children[0];
                    var box2 = box.children[1];
                    var mainIndex = 0;
                    if (box1.isMain) {
                        mainIndex = 0;
                    }
                    else if (box2.isMain) {
                        mainIndex = 1;
                    }
                    var childBoxSize = this.caculateBoxSize(box, x, y, width, height);
                    this.calculateBoxPositionSize(box1, childBoxSize.box1.x, childBoxSize.box1.y, childBoxSize.box1.width, childBoxSize.box1.height);
                    this.calculateBoxPositionSize(box2, childBoxSize.box2.x, childBoxSize.box2.y, childBoxSize.box2.width, childBoxSize.box2.height);
                }
            }
        };
        GBoxLayout.prototype.caculateBoxSize = function (box, x, y, width, height) {
            var box1 = box.children[0];
            var box2 = box.children[1];
            var mainIndex = 0;
            if (box1.isMain) {
                mainIndex = 0;
            }
            else if (box2.isMain) {
                mainIndex = 1;
            }
            var result = { box1: { x: x, y: y, width: 10, height: 10 }, box2: { x: x, y: y, width: 10, height: 10 } };
            var isVertical = box.isVertical;
            if (isVertical) {
                var box1Height = this.caculateSize(height, box1.height, this.getMinHeight(box1), this.getMaxHeight(box1), box2.height, this.getMinHeight(box2), this.getMaxHeight(box2), mainIndex);
                var box2Height = height - box1Height - GBoxLayout.GAP;
                result.box1.x = x;
                result.box1.y = y;
                result.box1.width = width;
                result.box1.height = box1Height;
                result.box2.x = x;
                result.box2.y = y + box1Height + GBoxLayout.GAP;
                result.box2.width = width;
                result.box2.height = box2Height;
            }
            else {
                var box1Width = this.caculateSize(width, box1.width, this.getMinWidth(box1), this.getMaxWidth(box1), box2.width, this.getMinWidth(box2), this.getMaxWidth(box2), mainIndex);
                var box2Width = width - box1Width - GBoxLayout.GAP;
                result.box1.x = x;
                result.box1.y = y;
                result.box1.width = box1Width;
                result.box1.height = height;
                result.box2.x = x + box1Width + GBoxLayout.GAP;
                result.box2.y = y;
                result.box2.width = box2Width;
                result.box2.height = height;
            }
            return result;
        };
        GBoxLayout.prototype.caculateSize = function (lastSize, size1, minSize1, maxSize1, size2, minSize2, maxSize2, mainIndex) {
            // 主的最小 》 主的最大 》 副的最小 》 副的最大 》 主的实际 》 副的实际
            var size = lastSize - GBoxLayout.GAP;
            var curSize = size;
            if (size <= 0) {
                return 0;
            }
            else {
                //可以满足最小
                if (size > minSize1 + minSize2) {
                    // 可以满足当前
                    if (size > size1 + size2) {
                        //比最大还大
                        if (size > maxSize1 + maxSize2) {
                            if (mainIndex == 0) {
                                curSize = maxSize1;
                            }
                            else {
                                curSize = size - maxSize2;
                            }
                        }
                        else {
                            //比最大小，比当前大
                            //满足主当前时，比副的最大大，先满足副的最大
                            if (mainIndex == 0) {
                                if (size - size1 > maxSize2) {
                                    curSize = size - maxSize2;
                                }
                                else {
                                    curSize = size1;
                                }
                            }
                            else {
                                if (size - size2 > maxSize1) {
                                    curSize = maxSize1;
                                }
                                else {
                                    curSize = size - size2;
                                }
                            }
                        }
                    }
                    else {
                        // 不能满足两个当前，优先主当前
                        if (mainIndex == 0) {
                            if (size > size1 + minSize2) {
                                curSize = size1;
                            }
                            else {
                                curSize = size - minSize2;
                            }
                        }
                        else {
                            if (size > size2 + minSize1) {
                                curSize = size - size2;
                            }
                            else {
                                curSize = size - minSize1;
                            }
                        }
                    }
                }
                else {
                    //不能满足最小，平均分配
                    if (size < minSize1 && size < minSize2) {
                        curSize = size / 2;
                    }
                    else if (size < minSize1 && size >= minSize2) {
                        curSize = size - minSize2;
                    }
                    else if (size >= minSize1 && size < minSize2) {
                        curSize = minSize1;
                    }
                    else {
                        // 按照比例分配
                        var scale = minSize1 / (minSize1 + minSize2);
                        curSize = size * scale;
                    }
                }
            }
            return curSize;
        };
        GBoxLayout.prototype.getMinHeight = function (box) {
            if (!isNaN(box.minHeight)) {
                return box.minHeight;
            }
            return GBoxLayout.MIN_SIZE;
        };
        GBoxLayout.prototype.getMinWidth = function (box) {
            if (!isNaN(box.minWidth)) {
                return box.minWidth;
            }
            return GBoxLayout.MIN_SIZE;
        };
        GBoxLayout.prototype.getMaxHeight = function (box) {
            if (!isNaN(box.maxHeight)) {
                return box.maxHeight;
            }
            return Number.MAX_VALUE;
        };
        GBoxLayout.prototype.getMaxWidth = function (box) {
            if (!isNaN(box.maxWidth)) {
                return box.maxWidth;
            }
            return Number.MAX_VALUE;
        };
        GBoxLayout.prototype.getBox = function (boxData) {
            var box = this.createBoxFromPool();
            box.name = boxData.name;
            box.width = boxData.width;
            box.height = boxData.height;
            box.isVertical = boxData.isVertical;
            box.owner = this;
            box.panels = boxData.panels ? boxData.panels : [];
            box.panelIndex = boxData.panelIndex;
            return box;
        };
        GBoxLayout.prototype.createBoxFromPool = function () {
            if (this._boxPool.length) {
                var box = this._boxPool.shift();
                return box;
            }
            else {
                return new gboxLayout.GBox();
            }
        };
        GBoxLayout.prototype.disposeBoxToPool = function (box) {
            if (box) {
                box.dispose();
                this._boxPool.push(box);
            }
        };
        GBoxLayout.MIN_SIZE = 10;
        GBoxLayout.MAX_SIZE = Number.MAX_SAFE_INTEGER * 0.01;
        GBoxLayout.GAP = 2;
        GBoxLayout.GAP_SPLIT = 4;
        return GBoxLayout;
    }(gboxLayout.GBox));
    gboxLayout.GBoxLayout = GBoxLayout;
})(gboxLayout || (gboxLayout = {}));
var gboxLayout;
(function (gboxLayout_1) {
    var GDragControl = /** @class */ (function () {
        function GDragControl(gboxLayout) {
            this.gboxLayout = gboxLayout;
            this.dragElement = document.createElement('div');
            this.dragElement.className = 'dragElement';
            this.dragElement.id = 'dragElement';
        }
        GDragControl.getInsertBoxPos = function (box, pos) {
            var x = 0;
            var y = 0;
            var width = 0;
            var height = 0;
            if (box) {
                var boxW = box.explicitWidth;
                var boxH = box.explicitHeight;
                var halfBoxW = boxW / 2;
                var halfBoxH = boxH / 2;
                var labelH = box.labelHeight;
                var labelW = box.labelWidth;
                var oneLabelW = box.oneLabelWidth;
                switch (pos) {
                    case gboxLayout_1.GDragPosition.TOP:
                        x = box.x;
                        y = box.y;
                        width = boxW;
                        height = halfBoxH;
                        break;
                    case gboxLayout_1.GDragPosition.BOTTOM:
                        x = box.x;
                        y = box.y + halfBoxH;
                        width = boxW;
                        height = halfBoxH;
                        break;
                    case gboxLayout_1.GDragPosition.LEFT:
                        x = box.x;
                        y = box.y;
                        width = halfBoxW;
                        height = boxH;
                        break;
                    case gboxLayout_1.GDragPosition.RIGHT:
                        x = box.x + halfBoxW;
                        y = box.y;
                        width = halfBoxW;
                        height = boxH;
                        break;
                    case gboxLayout_1.GDragPosition.LABEL:
                    default:
                        var index = pos - gboxLayout_1.GDragPosition.LABEL;
                        x = box.x + oneLabelW * index;
                        y = box.y;
                        width = oneLabelW;
                        height = labelH;
                        break;
                }
            }
            return { x: x, y: y, width: width, height: height };
        };
        GDragControl.prototype.checkOverBox = function (clientX, clientY) {
            if (this.gboxLayout && this.gboxLayout.boxList) {
                var boxList = this.gboxLayout.boxList;
                for (var i = 0, len = boxList.length; i < len; i++) {
                    var box = boxList[i];
                    if (box.isLeaf) {
                        if (clientX > box.x && clientX < box.x + box.explicitWidth &&
                            clientY > box.y && clientY < box.y + box.explicitHeight) {
                            var pos = this.checkBoxPosition(box, clientX, clientY);
                            this.renderDrag(box, pos);
                            return {
                                box: box,
                                pos: pos
                            };
                        }
                    }
                }
            }
            return null;
        };
        GDragControl.prototype.clearDrag = function () {
            if (this.dragElement && this.dragElement.parentElement) {
                this.dragElement.parentElement.removeChild(this.dragElement);
            }
        };
        GDragControl.prototype.checkBoxPosition = function (box, clientX, clientY) {
            var mouseX = clientX - box.x;
            var mouseY = clientY - box.y;
            var halfW = box.explicitWidth / 2;
            var halfH = box.explicitHeight / 2;
            var labelHeight = box.labelHeight;
            var labelWidth = box.labelWidth;
            var oneLabelWidth = box.oneLabelWidth;
            var minX = Math.abs(Math.min(mouseX, box.explicitWidth - mouseX) / box.explicitWidth);
            var minY = Math.abs(Math.min(mouseY, box.explicitHeight - mouseY) / box.explicitHeight);
            if (mouseY < labelHeight && box.hasLabel) {
                var index = Math.floor(mouseX / oneLabelWidth);
                if (index >= box.panels.length) {
                    index = box.panels.length - 1;
                }
                return gboxLayout_1.GDragPosition.LABEL + index;
            }
            else if (minX - minY > 0) {
                if (mouseY > halfH) {
                    return gboxLayout_1.GDragPosition.BOTTOM;
                }
                else {
                    return gboxLayout_1.GDragPosition.TOP;
                }
            }
            else {
                if (mouseX > halfW) {
                    return gboxLayout_1.GDragPosition.RIGHT;
                }
                else {
                    return gboxLayout_1.GDragPosition.LEFT;
                }
            }
        };
        GDragControl.prototype.renderDrag = function (box, pos) {
            var x = 0;
            var y = 0;
            var width = 0;
            var height = 0;
            var rect = GDragControl.getInsertBoxPos(box, pos);
            x = rect.x;
            y = rect.y;
            width = rect.width;
            height = rect.height;
            if (width > 0 && height > 0) {
                this.dragElement;
                this.dragElement.style.width = width + 'px';
                this.dragElement.style.height = height + 'px';
                this.dragElement.style.left = x + 'px';
                this.dragElement.style.top = y + 'px';
                if (this.dragContainer) {
                    this.dragContainer.appendChild(this.dragElement);
                }
            }
        };
        return GDragControl;
    }());
    gboxLayout_1.GDragControl = GDragControl;
})(gboxLayout || (gboxLayout = {}));
var gboxLayout;
(function (gboxLayout) {
    var GPanelType;
    (function (GPanelType) {
        GPanelType[GPanelType["BLOCK"] = 0] = "BLOCK";
        GPanelType[GPanelType["TAB"] = 1] = "TAB";
    })(GPanelType = gboxLayout.GPanelType || (gboxLayout.GPanelType = {}));
    var GDragPosition;
    (function (GDragPosition) {
        GDragPosition[GDragPosition["TOP"] = 0] = "TOP";
        GDragPosition[GDragPosition["BOTTOM"] = 1] = "BOTTOM";
        GDragPosition[GDragPosition["LEFT"] = 2] = "LEFT";
        GDragPosition[GDragPosition["RIGHT"] = 3] = "RIGHT";
        GDragPosition[GDragPosition["LABEL"] = 4] = "LABEL";
    })(GDragPosition = gboxLayout.GDragPosition || (gboxLayout.GDragPosition = {}));
})(gboxLayout || (gboxLayout = {}));
/// <reference path="./GNode.ts" />
var gboxLayout;
(function (gboxLayout) {
    var GPanel = /** @class */ (function (_super) {
        __extends(GPanel, _super);
        function GPanel(data) {
            if (data === void 0) { data = null; }
            var _this = _super.call(this) || this;
            _this.data = data;
            _this.type = gboxLayout.GPanelType.TAB;
            return _this;
        }
        Object.defineProperty(GPanel.prototype, "name", {
            get: function () {
                return this.data.name;
            },
            enumerable: false,
            configurable: true
        });
        GPanel.prototype.renderLabel = function () {
            if (this.labelElement == null) {
                this.labelElement = document.createElement('span');
                this.labelElement.innerHTML = this.name;
            }
        };
        GPanel.prototype.renderElement = function () {
            // this.renderLabel();
            // if(this.contentElement == null) {
            //     this.contentElement = document.createElement('div');
            //     let btn = document.createElement('button');
            //     btn.innerHTML = "导出数据";
            //     btn.addEventListener('click', () => {
            //         if(this.parent && this.parent.owner) {
            //             let  data = this.parent.owner.getData();
            //             console.log(JSON.stringify(data));
            //             let layout4Str = '{"name":"main","isVertical":false,"mainIndex":0,"width":1806,"height":842,"children":[{"name":"child1","isVertical":true,"mainIndex":0,"width":400,"height":842,"panels":["test1"],"panelIndex":0},{"name":"child2","isVertical":true,"mainIndex":0,"width":1404,"height":842,"maxWidth":2000,"children":[{"name":"test3","isVertical":false,"mainIndex":0,"width":1404,"height":421,"panels":["test3"],"panelIndex":0},{"name":"child2","isVertical":false,"mainIndex":0,"width":1404,"height":419,"maxWidth":2000,"children":[{"name":"test2","isVertical":false,"mainIndex":0,"width":702,"height":419,"panels":["test2"],"panelIndex":0},{"name":"child2","isVertical":true,"mainIndex":0,"width":700,"height":419,"maxWidth":2000,"panelIndex":0}],"panelIndex":0}],"panelIndex":0}],"panelIndex":0}'
            //             let layout4 = JSON.parse(layout4Str);
            //             this.parent.owner.setData(layout4);
            //         }
            //     })
            //     this.contentElement.appendChild(btn);
            // }
            // if(this.toolBarElement == null) {
            //     this.toolBarElement = document.createElement('div');
            // }
        };
        GPanel.prototype.dispose = function () {
        };
        GPanel.prototype.resize = function (newWidth, newHeight) {
        };
        return GPanel;
    }(gboxLayout.GNode));
    gboxLayout.GPanel = GPanel;
})(gboxLayout || (gboxLayout = {}));
/// <reference path="./GNode.ts" />
var gboxLayout;
(function (gboxLayout) {
    var GSplit = /** @class */ (function (_super) {
        __extends(GSplit, _super);
        function GSplit() {
            var _this = _super.call(this) || this;
            _this._change = false;
            _this._downPos = { x: 0, y: 0 };
            _this._downBoxA = { x: 0, y: 0, width: 1, height: 1 };
            _this._downBoxB = { x: 0, y: 0, width: 1, height: 1 };
            _this._downSplitPos = { x: 0, y: 0 };
            _this.onMouseDown = function (e) {
                window.addEventListener('mousemove', _this.onMouseMove);
                window.addEventListener('mouseup', _this.onMouseUp);
                _this._downPos.x = e.clientX;
                _this._downPos.y = e.clientY;
                var boxA = _this.boxs[0];
                var boxB = _this.boxs[1];
                _this._downBoxA.x = boxA.x;
                _this._downBoxA.y = boxA.y;
                _this._downBoxA.width = boxA.explicitWidth;
                _this._downBoxA.height = boxA.explicitHeight;
                _this._downBoxB.x = boxB.x;
                _this._downBoxB.y = boxB.y;
                _this._downBoxB.width = boxB.explicitWidth;
                _this._downBoxB.height = boxB.explicitHeight;
                _this._downSplitPos.x = _this.x;
                _this._downSplitPos.y = _this.y;
            };
            _this.onMouseUp = function (e) {
                window.removeEventListener('mousemove', _this.onMouseMove);
                window.removeEventListener('mouseup', _this.onMouseUp);
                if (_this._change) {
                    _this._change = false;
                    if (_this.owner && _this.owner.changeCallback) {
                        _this.owner.changeCallback();
                    }
                }
            };
            _this.onMouseMove = function (e) {
                var offX = 0;
                var offY = 0;
                if (_this.isVertical) {
                    offY = e.clientY - _this._downPos.y;
                }
                else {
                    offX = e.clientX - _this._downPos.x;
                }
                if (_this.owner) {
                    _this.owner.moveSplit(_this, _this._downSplitPos, _this._downBoxA, _this._downBoxB, offX, offY);
                    _this._change = true;
                }
            };
            return _this;
        }
        GSplit.prototype.initEvent = function () {
            if (this.render) {
                this.render.addEventListener('mousedown', this.onMouseDown);
            }
        };
        GSplit.prototype.reRenderSize = function () {
            if (this.boxs.length < 2) {
                return;
            }
            if (this.render) {
                this.render.style.width = this.explicitWidth + 'px';
                this.render.style.height = this.explicitHeight + 'px';
                this.render.style.left = this.x + 'px';
                this.render.style.top = this.y + 'px';
            }
        };
        GSplit.prototype.renderElement = function () {
            if (this.boxs.length < 2) {
                return;
            }
            if (this.render == null) {
                this.render = document.createElement('div');
                this.render.className = 'gsplit';
                if (this.isVertical) {
                    this.render.className += ' gsplit_v';
                }
                else {
                    this.render.className += ' gsplit_h';
                }
                this.initEvent();
            }
            this.render.style.width = this.explicitWidth + 'px';
            this.render.style.height = this.explicitHeight + 'px';
            this.render.style.left = this.x + 'px';
            this.render.style.top = this.y + 'px';
            this.render.id = this.id.toString();
        };
        GSplit.prototype.dispose = function () {
            if (this.render) {
                this.render.removeEventListener('mousedown', this.onMouseDown);
            }
            if (window) {
                window.removeEventListener('mousemove', this.onMouseMove);
                window.removeEventListener('mouseup', this.onMouseUp);
            }
        };
        return GSplit;
    }(gboxLayout.GNode));
    gboxLayout.GSplit = GSplit;
})(gboxLayout || (gboxLayout = {}));
//# sourceMappingURL=gboxlayout.js.map