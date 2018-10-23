// namespace BowMan {
//     // export async function start() {
//     //     // Load resource.
//     //     await RES.loadConfig("resource/default.res.json", "resource/");
//     //     await RES.getResAsync("Assets/pp1.prefab.json");
//     //     await RES.getResAsync("Assets/pp10.prefab.json");
//     //     await RES.getResAsync("Assets/gong.prefab.json");
//     //     await RES.getResAsync("Assets/arrow01.prefab.json");

//     //     // Create camera.
//     //     egret3d.Camera.main;

//     //     const player = paper.Prefab.create("Assets/pp1.prefab.json")!;
//     //     player.addComponent(PlayerController);

//     //     paper.Prefab.create("Assets/pp10.prefab.json")!.transform.setLocalPosition(2.0, 0.0, 0.0);
//     //     paper.Prefab.create("Assets/arrow01.prefab.json")!.transform.setLocalPosition(4.0, 0.0, 0.0);
//     // }

//     // class PlayerController extends paper.Behaviour {

//     //     public onStart() {
//     //         const animation = this.gameObject.getComponentInChildren(egret3d.Animation)!;
//     //         // stand1, run1, attack, hit, dead
//     //         animation.play("run1");

//     //         const handWeaponContainer = animation.gameObject.transform.find("Root/LArm/LHand/hh_weapon");
//     //         const weapon = paper.Prefab.create("Assets/gong.prefab.json");
//     //         weapon.transform.setLocalScale(0.6);
//     //         weapon.transform.parent = handWeaponContainer;
//     //     }

//     //     public onUpdate() {
//     //         // const mouse = egret3d.InputManager.mouse;
//     //         // const keyboard = egret3d.InputManager.keyboard;

//     //         // const camera = egret3d.Camera.main;
//     //         // const mouseInWorld = camera.createRayByScreen(mouse.position.x, mouse.position.y)
//     //         //     .intersectPlane(egret3d.Vector3.ZERO as egret3d.Vector3, egret3d.Vector3.UP as egret3d.Vector3);
//     //         // this.gameObject.transform.lookAt(mouseInWorld).rotateAngle(0.0, -90, 0.0);

//     //         // if (mouse.wasReleased(0)) {

//     //         // } 

//     //         // if (keyboard.isPressed("w")) {

//     //         // }

//     //         // if (keyboard.wasPressed("w")) {

//     //         // }
//     //     }
//     // }
// }