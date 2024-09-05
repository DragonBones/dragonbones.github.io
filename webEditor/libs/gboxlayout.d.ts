declare namespace gboxLayout {
    class GNode {
        static nodeNum: number;
        id: number;
    }
}
declare namespace gboxLayout {
    class GBox extends GNode {
        name: string;
        width: number;
        height: number;
        isVertical: boolean;
        parent: GBox;
        brother: GBox;
        children: GBox[];
        render: HTMLElement;
        isMain: boolean;
        split: GSplit;
        owner: GBoxLayout;
        private _panels;
        private _panelIndex;
        private _explicitWidth;
        private _explicitHeight;
        private _x;
        private _y;
        private _sizeDirty;
        private _posDirty;
        private _panelList;
        private _curPanel;
        private _labelContainer;
        private _conentContainer;
        private _toolbarContainer;
        private _labelList;
        private _dragPanel;
        private _dropBox;
        private _startDrag;
        private _downPos;
        private _focused;
        getData(): GBoxData;
        get minWidth(): number;
        set minWidth(v: number);
        get minHeight(): number;
        set minHeight(v: number);
        get maxWidth(): number;
        set maxWidth(v: number);
        get maxHeight(): number;
        set maxHeight(v: number);
        get explicitWidth(): number;
        set explicitWidth(v: number);
        get explicitHeight(): number;
        set explicitHeight(v: number);
        get x(): number;
        set x(v: number);
        get y(): number;
        set y(v: number);
        get focused(): boolean;
        set focused(v: boolean);
        get curPanel(): GPanelData;
        get panels(): GPanelData[];
        set panels(v: GPanelData[]);
        get panelIndex(): number;
        set panelIndex(v: number);
        get isLeaf(): boolean;
        get hasLabel(): boolean;
        get labelHeight(): number;
        get labelWidth(): number;
        get oneLabelWidth(): number;
        private getPanelIndex;
        removePanel(panel: GPanel): void;
        addPanel(panel: GPanel, box: GBox, pos: GDragPosition): void;
        resize(): void;
        reRenderSize(): void;
        renderElement(): void;
        onFocusBox: (e: MouseEvent) => void;
        onLabelClick: (e: MouseEvent) => void;
        onLabelMouseDown: (e: MouseEvent) => void;
        onLabelMouseMove: (e: MouseEvent) => void;
        onLabelMouseUp: (e: MouseEvent) => void;
        private disposePanels;
        parsePanels(): void;
        private renderPanel;
        private initPanelElement;
        private renderPanelLabel;
        private createLabel;
        private disposeLabels;
        removeElementChildren(element: HTMLElement): void;
        removeElement(element: HTMLElement): void;
        dispose(): void;
    }
}
declare namespace gboxLayout {
    class GBoxLayout extends GBox {
        static MIN_SIZE: number;
        static MAX_SIZE: number;
        static GAP: number;
        static GAP_SPLIT: number;
        clientWidth: number;
        clientHeight: number;
        dragControl: GDragControl;
        private _data;
        private _mainBox;
        private _boxList;
        private _container;
        private _dragContainer;
        private _panelDic;
        private _panelParamsDic;
        private _boxPool;
        private _focusBox;
        changeCallback: () => void;
        constructor();
        get boxList(): GBox[];
        get layoutX(): number;
        get layoutY(): number;
        get focusBox(): GBox;
        set focusBox(v: GBox);
        setData(data: GBoxData): void;
        getData(): GBoxData;
        setContainer(container: HTMLElement): void;
        resizeHandler(): void;
        moveSplit(split: GSplit, splitPos: IPoint, boxABound: IRect, boxBBound: IRect, offX: number, offY: number): void;
        registPanel(id: string, panel: GPanel | {
            new (): GPanel;
        }, params?: any): void;
        getPanel(panelData: GPanelData): GPanel;
        reRenderSize(): void;
        renderElement(): void;
        removePanel(panel: GPanel): void;
        removeBox(box: GBox): void;
        addPanel(panel: GPanel, box: GBox, pos: GDragPosition): void;
        addBox(panel: GPanel, box: GBox, pos: GDragPosition): void;
        private refreshLayout;
        private clearLayout;
        private parseData;
        private parseBox;
        private calculatePosition;
        private calculateBoxPositionSize;
        private caculateBoxSize;
        private caculateSize;
        private getMinHeight;
        private getMinWidth;
        private getMaxHeight;
        private getMaxWidth;
        private getBox;
        private createBoxFromPool;
        private disposeBoxToPool;
    }
}
declare namespace gboxLayout {
    class GDragControl {
        gboxLayout: GBoxLayout;
        dragContainer: HTMLElement;
        private dragElement;
        constructor(gboxLayout: GBoxLayout);
        static getInsertBoxPos(box: GBox, pos: GDragPosition): IRect;
        checkOverBox(clientX: number, clientY: number): {
            box: GBox;
            pos: GDragPosition;
        };
        clearDrag(): void;
        private checkBoxPosition;
        private renderDrag;
    }
}
declare namespace gboxLayout {
    enum GPanelType {
        BLOCK = 0,
        TAB = 1
    }
    enum GDragPosition {
        TOP = 0,
        BOTTOM = 1,
        LEFT = 2,
        RIGHT = 3,
        LABEL = 4
    }
    type GPanelData = {
        name: string;
        minWidth?: number;
        minHeight?: number;
        maxWidth?: number;
        maxHeight?: number;
    };
    type GBoxData = {
        name: string;
        isVertical: boolean;
        mainIndex: number;
        width: number;
        height: number;
        children?: GBoxData[];
        panels?: GPanelData[];
        panelIndex?: number;
    };
    interface IPoint {
        x: number;
        y: number;
    }
    interface IRect extends IPoint {
        width: number;
        height: number;
    }
}
declare namespace gboxLayout {
    class GPanel extends GNode {
        parent: GBox;
        labelElement: HTMLElement;
        contentElement: HTMLElement;
        toolBarElement: HTMLElement;
        data: GPanelData;
        type: GPanelType;
        constructor(data?: GPanelData);
        get name(): string;
        renderLabel(): void;
        renderElement(): void;
        dispose(): void;
        resize(newWidth: number, newHeight: number): void;
    }
}
declare namespace gboxLayout {
    class GSplit extends GNode {
        x: number;
        y: number;
        isVertical: boolean;
        width: number;
        height: number;
        explicitWidth: number;
        explicitHeight: number;
        parent: GBox;
        boxs: GBox[];
        render: HTMLElement;
        owner: GBoxLayout;
        private _change;
        private _downPos;
        private _downBoxA;
        private _downBoxB;
        private _downSplitPos;
        constructor();
        private initEvent;
        onMouseDown: (e: MouseEvent) => void;
        onMouseUp: (e: MouseEvent) => void;
        onMouseMove: (e: MouseEvent) => void;
        reRenderSize(): void;
        renderElement(): void;
        dispose(): void;
    }
}
