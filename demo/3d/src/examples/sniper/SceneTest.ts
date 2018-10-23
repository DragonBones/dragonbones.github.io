namespace examples.sniper {

    export class SceneTest {

        async start() {
            // Load resource config.
            await RES.loadConfig("default.res.json", "resource/sniper/");

            // Load scene resource.
            await RES.getResAsync("Assets/Scenes/venture02.scene.json");

            // Create scene.
            paper.Scene.create("Assets/Scenes/venture02.scene.json");

            //
            egret3d.Camera.main.gameObject.addComponent(behaviors.RotateComponent);

            const forward = egret3d.Camera.main.gameObject.transform.getForward();
            egret3d.Camera.main.gameObject.transform.position.add(forward.multiplyScalar(-150.0));
        }
    }
}