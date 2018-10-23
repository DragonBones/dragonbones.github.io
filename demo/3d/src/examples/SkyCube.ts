// namespace SkyCube {

//     export async function start() {
//         await RES.loadConfig("resource/default.res.json", "resource/");
//         const texture = await RES.getResAsync("logo.png");

//         // Create camera.
//         egret3d.Camera.main;

//         const cubeMesh = egret3d.DefaultMeshes.createCube(800.0, 800.0, 800.0, 0.0, 0.0, 0.0, 1, 1, 1, true);
//         const gameObject = egret3d.DefaultMeshes.createObject(cubeMesh);
//         const renderer = (gameObject.renderer as egret3d.SkinnedMeshRenderer);
//         renderer.materials = [
//             egret3d.Material.create(egret3d.DefaultShaders.MESH_BASIC_DOUBLESIDE).setTexture(texture),
//             egret3d.Material.create(egret3d.DefaultShaders.MESH_BASIC_DOUBLESIDE).setTexture(texture),
//             egret3d.Material.create(egret3d.DefaultShaders.MESH_BASIC_DOUBLESIDE).setTexture(texture),
//             egret3d.Material.create(egret3d.DefaultShaders.MESH_BASIC_DOUBLESIDE).setTexture(texture),
//             egret3d.Material.create(egret3d.DefaultShaders.MESH_BASIC_DOUBLESIDE).setTexture(texture),
//             egret3d.Material.create(egret3d.DefaultShaders.MESH_BASIC_DOUBLESIDE).setTexture(texture),
//         ];
//     }
// }