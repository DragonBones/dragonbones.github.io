var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var demosEgret;
(function (demosEgret) {
    var coreElement;
    (function (coreElement) {
        var Game = (function (_super) {
            __extends(Game, _super);
            function Game() {
                var _this = _super.call(this) || this;
                _this._left = false;
                _this._right = false;
                _this._bullets = [];
                Game.instance = _this;
                _this._resourceConfigURL = "resource/core_element.res.json";
                return _this;
            }
            Game.prototype._onStart = function () {
                Game.STAGE_WIDTH = this.stage.stageWidth;
                Game.STAGE_HEIGHT = this.stage.stageHeight;
                Game.GROUND = Game.STAGE_HEIGHT - 100;
                // Listener.
                this.stage.addEventListener(egret.Event.ENTER_FRAME, this._enterFrameHandler, this);
                this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._touchHandler, this);
                this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this._touchHandler, this);
                document.addEventListener("keydown", this._keyHandler);
                document.addEventListener("keyup", this._keyHandler);
                // Mouse move.
                var onTouchMove = egret.sys.TouchHandler.prototype.onTouchMove;
                egret.sys.TouchHandler.prototype.onTouchMove = function (x, y, touchPointID) {
                    onTouchMove.call(this, x, y, touchPointID);
                    Game.instance._player.aim(x, y);
                };
                // Info.
                var text = new egret.TextField();
                text.size = 20;
                text.textAlign = egret.HorizontalAlign.CENTER;
                text.text = "Press W/A/S/D to move. Press Q/E to switch weapons. Press SPACE to switch skin.\nMouse Move to aim. Click to fire.";
                text.width = Game.STAGE_WIDTH;
                text.x = 0;
                text.y = Game.STAGE_HEIGHT - 60;
                this.addChild(text);
                // Add dragonBones data.
                dragonBones.EgretFactory.factory.parseDragonBonesData(RES.getRes("mecha_1502b"));
                dragonBones.EgretFactory.factory.parseTextureAtlasData(RES.getRes("mecha_1502b_texture_config"), RES.getRes("mecha_1502b_texture"));
                dragonBones.EgretFactory.factory.parseDragonBonesData(RES.getRes("skin_1000"));
                dragonBones.EgretFactory.factory.parseTextureAtlasData(RES.getRes("skin_1000_texture_config"), RES.getRes("skin_1000_texture"));
                dragonBones.EgretFactory.factory.parseDragonBonesData(RES.getRes("weapon_1000"));
                dragonBones.EgretFactory.factory.parseTextureAtlasData(RES.getRes("weapon_1000_texture_config"), RES.getRes("weapon_1000_texture"));
                // dragonBones.EgretFactory.factory.parseDragonBonesData(RES.getRes("mecha_1502b_bin"));
                // dragonBones.EgretFactory.factory.parseDragonBonesData(RES.getRes("weapon_1000_bin"));
                // dragonBones.EgretFactory.factory.parseTextureAtlasData(RES.getRes("mecha_1502b_texture_config"), RES.getRes("mecha_1502b_texture"));
                // dragonBones.EgretFactory.factory.parseTextureAtlasData(RES.getRes("weapon_1000_texture_config"), RES.getRes("weapon_1000_texture"));
                this._player = new Mecha();
            };
            Game.prototype.addBullet = function (bullet) {
                this._bullets.push(bullet);
            };
            Game.prototype._touchHandler = function (event) {
                this._player.aim(event.stageX, event.stageY);
                if (event.type === egret.TouchEvent.TOUCH_BEGIN) {
                    this._player.attack(true);
                }
                else {
                    this._player.attack(false);
                }
            };
            Game.prototype._keyHandler = function (event) {
                var isDown = event.type === "keydown";
                switch (event.keyCode) {
                    case 37:
                    case 65:
                        Game.instance._left = isDown;
                        Game.instance._updateMove(-1);
                        break;
                    case 39:
                    case 68:
                        Game.instance._right = isDown;
                        Game.instance._updateMove(1);
                        break;
                    case 38:
                    case 87:
                        if (isDown) {
                            Game.instance._player.jump();
                        }
                        break;
                    case 83:
                    case 40:
                        Game.instance._player.squat(isDown);
                        break;
                    case 81:
                        if (isDown) {
                            Game.instance._player.switchWeaponR();
                        }
                        break;
                    case 69:
                        if (isDown) {
                            Game.instance._player.switchWeaponL();
                        }
                        break;
                    case 32:
                        if (isDown) {
                            Game.instance._player.switchSkin();
                        }
                        break;
                }
            };
            Game.prototype._enterFrameHandler = function (event) {
                this._player.update();
                var i = this._bullets.length;
                while (i--) {
                    var bullet = this._bullets[i];
                    if (bullet.update()) {
                        this._bullets.splice(i, 1);
                    }
                }
                dragonBones.WorldClock.clock.advanceTime(-1.0);
            };
            Game.prototype._updateMove = function (dir) {
                if (this._left && this._right) {
                    this._player.move(dir);
                }
                else if (this._left) {
                    this._player.move(-1);
                }
                else if (this._right) {
                    this._player.move(1);
                }
                else {
                    this._player.move(0);
                }
            };
            return Game;
        }(BaseTest));
        Game.G = 0.6;
        coreElement.Game = Game;
        __reflect(Game.prototype, "demosEgret.coreElement.Game");
        var Mecha = (function () {
            function Mecha() {
                this._isJumpingA = false;
                this._isJumpingB = false;
                this._isSquating = false;
                this._isAttackingA = false;
                this._isAttackingB = false;
                this._skinIndex = 0;
                this._weaponRIndex = 0;
                this._weaponLIndex = 0;
                this._faceDir = 1;
                this._aimDir = 0;
                this._moveDir = 0;
                this._aimRadian = 0.0;
                this._speedX = 0.0;
                this._speedY = 0.0;
                this._aimState = null;
                this._walkState = null;
                this._attackState = null;
                this._target = new egret.Point();
                this._helpPoint = new egret.Point();
                this._armature = dragonBones.EgretFactory.factory.buildArmature("mecha_1502b");
                this._armature.cacheFrameRate = 24;
                this._armatureDisplay = this._armature.display;
                this._armatureDisplay.x = Game.STAGE_WIDTH * 0.5;
                this._armatureDisplay.y = Game.GROUND;
                this._armatureDisplay.scaleX = this._armatureDisplay.scaleY = 1.0;
                this._armatureDisplay.addEventListener(dragonBones.EventObject.FADE_IN_COMPLETE, this._animationEventHandler, this);
                this._armatureDisplay.addEventListener(dragonBones.EventObject.FADE_OUT_COMPLETE, this._animationEventHandler, this);
                this._armatureDisplay.addEventListener(dragonBones.EventObject.COMPLETE, this._animationEventHandler, this);
                // Get weapon childArmature.
                this._weaponL = this._armature.getSlot("weapon_l").childArmature;
                this._weaponR = this._armature.getSlot("weapon_r").childArmature;
                this._weaponL.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
                this._weaponR.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
                // Add to stage and clock.
                Game.instance.addChild(this._armatureDisplay);
                dragonBones.WorldClock.clock.add(this._armature);
                this._updateAnimation();
            }
            Mecha.prototype.move = function (dir) {
                if (this._moveDir === dir) {
                    return;
                }
                this._moveDir = dir;
                this._updateAnimation();
            };
            Mecha.prototype.jump = function () {
                if (this._isJumpingA) {
                    return;
                }
                this._isJumpingA = true;
                this._armature.animation.fadeIn("jump_1", -1.0, -1, 0, Mecha.NORMAL_ANIMATION_GROUP).resetToPose = false;
                this._walkState = null;
            };
            Mecha.prototype.squat = function (isSquating) {
                if (this._isSquating === isSquating) {
                    return;
                }
                this._isSquating = isSquating;
                this._updateAnimation();
            };
            Mecha.prototype.attack = function (isAttacking) {
                if (this._isAttackingA === isAttacking) {
                    return;
                }
                this._isAttackingA = isAttacking;
            };
            Mecha.prototype.switchWeaponL = function () {
                this._weaponLIndex++;
                this._weaponLIndex %= Mecha.WEAPON_L_LIST.length;
                var weaponName = Mecha.WEAPON_L_LIST[this._weaponLIndex];
                this._weaponL.removeEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
                this._weaponL = dragonBones.EgretFactory.factory.buildArmature(weaponName);
                this._armature.getSlot("weapon_l").childArmature = this._weaponL;
                this._weaponL.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
            };
            Mecha.prototype.switchWeaponR = function () {
                this._weaponRIndex++;
                this._weaponRIndex %= Mecha.WEAPON_R_LIST.length;
                var weaponName = Mecha.WEAPON_R_LIST[this._weaponRIndex];
                this._weaponR.removeEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
                this._weaponR = dragonBones.EgretFactory.factory.buildArmature(weaponName);
                this._armature.getSlot("weapon_r").childArmature = this._weaponR;
                this._weaponR.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
            };
            Mecha.prototype.switchSkin = function () {
                this._skinIndex++;
                this._skinIndex %= 4;
                for (var k in Mecha.SKIN) {
                    var slot = this._armature.getSlot(k);
                    if (slot !== null) {
                        var skin = Mecha.SKIN[k][this._skinIndex];
                        if (this._skinIndex === 0) {
                            dragonBones.EgretFactory.factory.replaceSlotDisplay("mecha_1502b", "mecha_1502b", k, skin, slot);
                        }
                        else {
                            dragonBones.EgretFactory.factory.replaceSlotDisplay("skin_1000", "skin", k, skin, slot);
                        }
                    }
                }
            };
            Mecha.prototype.aim = function (x, y) {
                this._target.x = x;
                this._target.y = y;
            };
            Mecha.prototype.update = function () {
                this._updatePosition();
                this._updateAim();
                this._updateAttack();
            };
            Mecha.prototype._animationEventHandler = function (event) {
                switch (event.type) {
                    case dragonBones.EventObject.FADE_IN_COMPLETE:
                        if (event.eventObject.animationState.name === "jump_1") {
                            this._isJumpingB = true;
                            this._speedY = -Mecha.JUMP_SPEED;
                            if (this._moveDir !== 0) {
                                if (this._moveDir * this._faceDir > 0) {
                                    this._speedX = Mecha.MAX_MOVE_SPEED_FRONT * this._faceDir;
                                }
                                else {
                                    this._speedX = -Mecha.MAX_MOVE_SPEED_BACK * this._faceDir;
                                }
                            }
                            this._armature.animation.fadeIn("jump_2", -1.0, -1, 0, Mecha.NORMAL_ANIMATION_GROUP).resetToPose = false;
                        }
                        break;
                    case dragonBones.EventObject.FADE_OUT_COMPLETE:
                        if (event.eventObject.animationState.name === "attack_01") {
                            this._isAttackingB = false;
                            this._attackState = null;
                        }
                        break;
                    case dragonBones.EventObject.COMPLETE:
                        if (event.eventObject.animationState.name === "jump_4") {
                            this._isJumpingA = false;
                            this._isJumpingB = false;
                            this._updateAnimation();
                        }
                        break;
                }
            };
            Mecha.prototype._frameEventHandler = function (event) {
                if (event.eventObject.name === "fire") {
                    event.eventObject.armature.display.localToGlobal(event.eventObject.bone.global.x, event.eventObject.bone.global.y, this._helpPoint);
                    this._fire(this._helpPoint);
                }
            };
            Mecha.prototype._fire = function (firePoint) {
                firePoint.x += Math.random() * 2 - 1;
                firePoint.y += Math.random() * 2 - 1;
                var radian = this._faceDir < 0 ? Math.PI - this._aimRadian : this._aimRadian;
                var bullet = new Bullet("bullet_01", "fire_effect_01", radian + Math.random() * 0.02 - 0.01, 40, firePoint);
                Game.instance.addBullet(bullet);
            };
            Mecha.prototype._updateAnimation = function () {
                if (this._isJumpingA) {
                    return;
                }
                if (this._isSquating) {
                    this._speedX = 0;
                    this._armature.animation.fadeIn("squat", -1.0, -1, 0, Mecha.NORMAL_ANIMATION_GROUP).resetToPose = false;
                    this._walkState = null;
                    return;
                }
                if (this._moveDir === 0) {
                    this._speedX = 0;
                    this._armature.animation.fadeIn("idle", -1.0, -1, 0, Mecha.NORMAL_ANIMATION_GROUP).resetToPose = false;
                    this._walkState = null;
                }
                else {
                    if (this._walkState === null) {
                        this._walkState = this._armature.animation.fadeIn("walk", -1.0, -1, 0, Mecha.NORMAL_ANIMATION_GROUP);
                        this._walkState.resetToPose = false;
                    }
                    if (this._moveDir * this._faceDir > 0) {
                        this._walkState.timeScale = Mecha.MAX_MOVE_SPEED_FRONT / Mecha.NORMALIZE_MOVE_SPEED;
                    }
                    else {
                        this._walkState.timeScale = -Mecha.MAX_MOVE_SPEED_BACK / Mecha.NORMALIZE_MOVE_SPEED;
                    }
                    if (this._moveDir * this._faceDir > 0) {
                        this._speedX = Mecha.MAX_MOVE_SPEED_FRONT * this._faceDir;
                    }
                    else {
                        this._speedX = -Mecha.MAX_MOVE_SPEED_BACK * this._faceDir;
                    }
                }
            };
            Mecha.prototype._updatePosition = function () {
                if (this._speedX !== 0.0) {
                    this._armatureDisplay.x += this._speedX;
                    if (this._armatureDisplay.x < 0) {
                        this._armatureDisplay.x = 0;
                    }
                    else if (this._armatureDisplay.x > Game.STAGE_WIDTH) {
                        this._armatureDisplay.x = Game.STAGE_WIDTH;
                    }
                }
                if (this._speedY !== 0.0) {
                    if (this._speedY < 5.0 && this._speedY + Game.G >= 5.0) {
                        this._armature.animation.fadeIn("jump_3", -1.0, -1, 0, Mecha.NORMAL_ANIMATION_GROUP).resetToPose = false;
                    }
                    this._speedY += Game.G;
                    this._armatureDisplay.y += this._speedY;
                    if (this._armatureDisplay.y > Game.GROUND) {
                        this._armatureDisplay.y = Game.GROUND;
                        this._speedY = 0.0;
                        this._armature.animation.fadeIn("jump_4", -1.0, -1, 0, Mecha.NORMAL_ANIMATION_GROUP).resetToPose = false;
                    }
                }
            };
            Mecha.prototype._updateAim = function () {
                this._faceDir = this._target.x > this._armatureDisplay.x ? 1 : -1;
                if (this._armatureDisplay.scaleX * this._faceDir < 0) {
                    this._armatureDisplay.scaleX *= -1.0;
                    if (this._moveDir !== 0) {
                        this._updateAnimation();
                    }
                }
                var aimOffsetY = this._armature.getBone("chest").global.y * this._armatureDisplay.scaleY;
                if (this._faceDir > 0) {
                    this._aimRadian = Math.atan2(this._target.y - this._armatureDisplay.y - aimOffsetY, this._target.x - this._armatureDisplay.x);
                }
                else {
                    this._aimRadian = Math.PI - Math.atan2(this._target.y - this._armatureDisplay.y - aimOffsetY, this._target.x - this._armatureDisplay.x);
                    if (this._aimRadian > Math.PI) {
                        this._aimRadian -= Math.PI * 2.0;
                    }
                }
                var aimDir = 0;
                if (this._aimRadian > 0) {
                    aimDir = -1;
                }
                else {
                    aimDir = 1;
                }
                if (this._aimState === null || this._aimDir !== aimDir) {
                    this._aimDir = aimDir;
                    // Animation mixing.
                    if (this._aimDir >= 0) {
                        this._aimState = this._armature.animation.fadeIn("aim_up", -1.0, -1, 0, Mecha.AIM_ANIMATION_GROUP);
                        this._aimState.resetToPose = false;
                    }
                    else {
                        this._aimState = this._armature.animation.fadeIn("aim_down", -1.0, -1, 0, Mecha.AIM_ANIMATION_GROUP);
                        this._aimState.resetToPose = false;
                    }
                }
                this._aimState.weight = Math.abs(this._aimRadian / Math.PI * 2);
                this._armature.invalidUpdate();
            };
            Mecha.prototype._updateAttack = function () {
                if (!this._isAttackingA || this._isAttackingB) {
                    return;
                }
                this._isAttackingB = true;
                this._attackState = this._armature.animation.fadeIn("attack_01", -1.0, -1, 0, Mecha.ATTACK_ANIMATION_GROUP);
                this._attackState.resetToPose = false;
                this._attackState.autoFadeOutTime = this._attackState.fadeTotalTime;
            };
            return Mecha;
        }());
        Mecha.NORMAL_ANIMATION_GROUP = "normal";
        Mecha.AIM_ANIMATION_GROUP = "aim";
        Mecha.ATTACK_ANIMATION_GROUP = "attack";
        Mecha.JUMP_SPEED = 20;
        Mecha.NORMALIZE_MOVE_SPEED = 3.6;
        Mecha.MAX_MOVE_SPEED_FRONT = Mecha.NORMALIZE_MOVE_SPEED * 1.4;
        Mecha.MAX_MOVE_SPEED_BACK = Mecha.NORMALIZE_MOVE_SPEED * 1.0;
        Mecha.WEAPON_L_LIST = ["weapon_1502b_l", "weapon_1005", "weapon_1005b", "weapon_1005c", "weapon_1005d", "weapon_1005e"];
        Mecha.WEAPON_R_LIST = ["weapon_1502b_r", "weapon_1005", "weapon_1005b", "weapon_1005c", "weapon_1005d"];
        Mecha.SKIN = {
            "chest": ["mecha_1502b_folder/chest", "mecha_1004_folder/chest_1", "mecha_1004b_folder/chest_1", "mecha_1004d_folder/chest_1"],
            "shouder_l": ["mecha_1502b_folder/shouder_l_0", "mecha_1002_folder/upperarm_l_2", "mecha_1004b_folder/shouder_l_2", "mecha_1004d_folder/shouder_l_2"],
            "shouder_r": ["mecha_1502b_folder/shouder_r_1", "mecha_1002_folder/upperarm_r_2", "mecha_1004b_folder/shouder_r_2", "mecha_1004d_folder/shouder_r_2"],
            "thigh_l": ["mecha_1502b_folder/thigh_l", "mecha_1003d_folder/thigh_l_0", "mecha_1008d_folder/thigh_l_0", "mecha_1007d_folder/thigh_l_0"],
            "thigh_r": ["mecha_1502b_folder/thigh_r", "mecha_1003d_folder/thigh_r_0", "mecha_1008d_folder/thigh_r_0", "mecha_1007d_folder/thigh_r_0"],
            "calf_l": ["mecha_1502b_folder/calf_l", "mecha_1003_folder/calf_l_0", "mecha_1003_folder/calf_l_0", "mecha_1003d_folder/calf_l_0"],
            "calf_r": ["mecha_1502b_folder/calf_r", "mecha_1003_folder/calf_r_0", "mecha_1003_folder/calf_r_0", "mecha_1003d_folder/calf_r_0"],
            "foot_l": ["mecha_1502b_folder/foot_l_0", "mecha_1004d_folder/foot_l_0", "mecha_1003_folder/foot_l_0", "mecha_1007d_folder/foot_l_1"],
            "foot_r": ["mecha_1502b_folder/foot_r", "mecha_1004d_folder/foot_r_1", "mecha_1003_folder/foot_r_0", "mecha_1007d_folder/foot_r_0"],
        };
        __reflect(Mecha.prototype, "Mecha");
        var Bullet = (function () {
            function Bullet(armatureName, effectArmatureName, radian, speed, position) {
                this._speedX = 0.0;
                this._speedY = 0.0;
                this._effect = null;
                this._speedX = Math.cos(radian) * speed;
                this._speedY = Math.sin(radian) * speed;
                this._armature = dragonBones.EgretFactory.factory.buildArmature(armatureName);
                this._armatureDisplay = this._armature.display;
                this._armatureDisplay.x = position.x;
                this._armatureDisplay.y = position.y;
                this._armatureDisplay.rotation = radian * 180.0 / Math.PI;
                if (effectArmatureName !== null) {
                    this._effect = dragonBones.EgretFactory.factory.buildArmature(effectArmatureName);
                    var effectDisplay = this._effect.display;
                    effectDisplay.rotation = radian * 180.0 / Math.PI;
                    effectDisplay.x = position.x;
                    effectDisplay.y = position.y;
                    effectDisplay.scaleX = 1.0 + Math.random() * 1.0;
                    effectDisplay.scaleY = 1.0 + Math.random() * 0.5;
                    if (Math.random() < 0.5) {
                        effectDisplay.scaleY *= -1.0;
                    }
                    dragonBones.WorldClock.clock.add(this._effect);
                    Game.instance.addChild(effectDisplay);
                    this._effect.animation.play("idle");
                }
                dragonBones.WorldClock.clock.add(this._armature);
                Game.instance.addChild(this._armatureDisplay);
                this._armature.animation.play("idle");
            }
            Bullet.prototype.update = function () {
                this._armatureDisplay.x += this._speedX;
                this._armatureDisplay.y += this._speedY;
                if (this._armatureDisplay.x < -100.0 || this._armatureDisplay.x >= Game.STAGE_WIDTH + 100.0 ||
                    this._armatureDisplay.y < -100.0 || this._armatureDisplay.y >= Game.STAGE_HEIGHT + 100.0) {
                    dragonBones.WorldClock.clock.remove(this._armature);
                    Game.instance.removeChild(this._armatureDisplay);
                    this._armature.dispose();
                    if (this._effect !== null) {
                        dragonBones.WorldClock.clock.remove(this._effect);
                        Game.instance.removeChild(this._effect.display);
                        this._effect.dispose();
                    }
                    return true;
                }
                return false;
            };
            return Bullet;
        }());
        __reflect(Bullet.prototype, "Bullet");
    })(coreElement = demosEgret.coreElement || (demosEgret.coreElement = {}));
})(demosEgret || (demosEgret = {}));
//# sourceMappingURL=CoreElement.js.map