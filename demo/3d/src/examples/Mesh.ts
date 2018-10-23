// namespace Mesh {
//     export async function start() {
//         // Create camera.
//         egret3d.Camera.main;

//         { // 三角形
//             const gameObject = paper.GameObject.create();
//             const meshFilter = gameObject.addComponent(egret3d.MeshFilter);
//             const meshRenderer = gameObject.addComponent(egret3d.MeshRenderer);

//             const mesh = egret3d.Mesh.create(3, 0, [gltf.MeshAttributeType.POSITION]);
//             // 逆时针绘制三角形
//             mesh.setAttributes(gltf.MeshAttributeType.POSITION, [
//                 0.0, 0.0, 0.0, 1.0, -1.0, 0.0, 1.0, 0.0, 0.0
//             ]);

//             meshFilter.mesh = mesh;
//         }

//         { // 四边形
//             const gameObject = paper.GameObject.create();
//             const meshFilter = gameObject.addComponent(egret3d.MeshFilter);
//             const meshRenderer = gameObject.addComponent(egret3d.MeshRenderer);

//             const mesh = egret3d.Mesh.create(6, 0, [gltf.MeshAttributeType.POSITION]);
//             mesh.setAttributes(gltf.MeshAttributeType.POSITION, [
//                 0.0, 0.0, 0.0, 1.0, -1.0, 0.0, 1.0, 0.0, 0.0,
//                 1.0, -1.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0, 0.0,
//             ]);

//             meshFilter.mesh = mesh;

//             gameObject.transform.setLocalPosition(2.0, 0.0, 0.0);
//         }

//         { // 使用顶点索引的四边形
//             const gameObject = paper.GameObject.create();
//             const meshFilter = gameObject.addComponent(egret3d.MeshFilter);
//             const meshRenderer = gameObject.addComponent(egret3d.MeshRenderer);

//             const mesh = egret3d.Mesh.create(4, 6, [gltf.MeshAttributeType.POSITION]);
//             mesh.setAttributes(gltf.MeshAttributeType.POSITION, [
//                 0.0, 0.0, 0.0, 1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,
//             ]);
//             // 逆时针索引三角形顶点
//             mesh.setIndices([
//                 0, 1, 2,
//                 0, 3, 1,
//             ]);

//             meshFilter.mesh = mesh;

//             gameObject.transform.setLocalPosition(4.0, 0.0, 0.0);
//         }

//         { // 使用顶点索引的四边形，并用 UV 贴图
//             const gameObject = paper.GameObject.create();
//             const meshFilter = gameObject.addComponent(egret3d.MeshFilter);
//             const meshRenderer = gameObject.addComponent(egret3d.MeshRenderer);

//             const mesh = egret3d.Mesh.create(4, 6, [gltf.MeshAttributeType.POSITION, gltf.MeshAttributeType.TEXCOORD_0]);
//             mesh.setAttributes(gltf.MeshAttributeType.POSITION, [
//                 0.0, 0.0, 0.0, 1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,
//             ]);
//             mesh.setAttributes(gltf.MeshAttributeType.TEXCOORD_0, [
//                 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0,
//             ]);
//             // 逆时针索引三角形顶点
//             mesh.setIndices([
//                 0, 1, 2,
//                 0, 3, 1,
//             ]);

//             meshFilter.mesh = mesh;

//             // 替换材质，设置贴图。
//             await RES.loadConfig("resource/default.res.json", "resource/");
//             meshRenderer.material = egret3d.Material.create();
//             meshRenderer.material.setTexture("map", await RES.getResAsync("logo.png"));

//             gameObject.transform.setLocalPosition(6.0, 0.0, 0.0);
//         }

//         { // 使用顶点索引的四边形
//             const gameObject = paper.GameObject.create();
//             const meshFilter = gameObject.addComponent(egret3d.MeshFilter);
//             const meshRenderer = gameObject.addComponent(egret3d.MeshRenderer);

//             const mesh = egret3d.Mesh.create(4, 10, [gltf.MeshAttributeType.POSITION, gltf.MeshAttributeType.COLOR_0]);
//             mesh.setAttributes(gltf.MeshAttributeType.POSITION, [
//                 0.0, 0.0, 0.0, 1.0, -1.0, 0.0, 1.0, 0.0, 0.0, 0.0, -1.0, 0.0,
//             ]);
//             // 逆时针索引三角形顶点
//             mesh.setIndices([
//                 0, 1,
//                 1, 2,
//                 2, 0,
//                 0, 3,
//                 3, 1,
//             ]);

//             mesh.glTFMesh.primitives[0].mode = gltf.MeshPrimitiveMode.Lines;
//             meshFilter.mesh = mesh;

//             gameObject.transform.setLocalPosition(8.0, 0.0, 0.0);
//         }
//     }
// }