namespace examples.sniper {

    export class AnimationTest {
        async start() {
            // Load resource config.
            await RES.loadConfig("default.res.json", "resource/sniper/");
            // Create camera.
            egret3d.Camera.main;

            { // Create light.
                const gameObject = paper.GameObject.create("Light");
                gameObject.transform.setLocalPosition(1.0, 10.0, -1.0);
                gameObject.transform.lookAt(egret3d.Vector3.ZERO);

                const light = gameObject.addComponent(egret3d.DirectionalLight);
                light.intensity = 0.5;
            }

            // Load prefab resource.
            await RES.getResAsync("Prefab/Actor/male.prefab.json");
            // Create prefab.
            const gameObject = paper.Prefab.create("Prefab/Actor/male.prefab.json")!;
            gameObject.getComponentInChildren(egret3d.Animation)!.play("run");
            gameObject.getComponentInChildren(egret3d.SkinnedMeshRenderer)!.material = egret3d.DefaultMaterials.MESH_LAMBERT;
        }
    }
}