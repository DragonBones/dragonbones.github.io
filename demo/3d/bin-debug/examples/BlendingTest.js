"use strict";
var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var examples;
(function (examples) {
    var BlendingTest = (function () {
        function BlendingTest() {
        }
        BlendingTest.prototype.start = function () {
            return __awaiter(this, void 0, void 0, function () {
                var textures, _a, blends, blendNames, i, j, texture, gameObject, renderer, gameObject, renderer;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: 
                        // Load resource config.
                        return [4 /*yield*/, RES.loadConfig("resource/default.res.json", "resource/")];
                        case 1:
                            // Load resource config.
                            _b.sent();
                            return [4 /*yield*/, RES.getResAsync("UV_Grid_Sm.jpg")];
                        case 2:
                            _a = [
                                _b.sent()
                            ];
                            return [4 /*yield*/, RES.getResAsync("sprite0.jpg")];
                        case 3:
                            _a = _a.concat([
                                _b.sent()
                            ]);
                            return [4 /*yield*/, RES.getResAsync("sprite0.png")];
                        case 4:
                            _a = _a.concat([
                                _b.sent()
                            ]);
                            return [4 /*yield*/, RES.getResAsync("lensflare0.png")];
                        case 5:
                            _a = _a.concat([
                                _b.sent()
                            ]);
                            return [4 /*yield*/, RES.getResAsync("lensflare0_alpha.png")];
                        case 6:
                            textures = _a.concat([
                                _b.sent()
                            ]);
                            // Create camera.
                            egret3d.Camera.main;
                            egret3d.Camera.main.gameObject.transform.setLocalPosition(0.0, 0.0, -10);
                            egret3d.Camera.main.gameObject.transform.lookAt(egret3d.Vector3.ZERO);
                            blends = [0 /* None */, 1 /* Blend */, 3 /* Add */, 5 /* Subtractive */, 7 /* Multiply */];
                            blendNames = ["None", "Blend", "Add", "Subtractive", "Multiply"];
                            for (i = 0; i < textures.length; i++) {
                                for (j = 0; j < blends.length; j++) {
                                    texture = textures[i];
                                    gameObject = egret3d.DefaultMeshes.createObject(egret3d.DefaultMeshes.QUAD, texture.name + "_" + blendNames[j]);
                                    renderer = gameObject.getComponent(egret3d.MeshRenderer);
                                    renderer.material = renderer.material.clone();
                                    renderer.material.setTexture(texture);
                                    renderer.material.setBlend(blends[j]).setDepth(true, false).setRenderQueue(3000 /* Transparent */);
                                    gameObject.transform.setLocalPosition((j - blends.length * 0.5 + 0.5) * 1.1, -(i - textures.length * 0.5 + 0.5) * 1.1, 0.0);
                                }
                            }
                            {
                                gameObject = egret3d.DefaultMeshes.createObject(egret3d.DefaultMeshes.PLANE, "Background");
                                renderer = gameObject.getComponent(egret3d.MeshRenderer);
                                renderer.material = renderer.material.clone();
                            }
                            return [2 /*return*/];
                    }
                });
            });
        };
        return BlendingTest;
    }());
    examples.BlendingTest = BlendingTest;
    __reflect(BlendingTest.prototype, "examples.BlendingTest");
})(examples || (examples = {}));
