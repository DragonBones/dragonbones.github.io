namespace examples.sniper {

    export class Test {
        async start() {
            // Test GUI.
            const modelComponent = paper.GameObject.globalGameObject.getOrAddComponent(paper.editor.ModelComponent);
            const guiComponent = paper.GameObject.globalGameObject.getOrAddComponent(paper.editor.GUIComponent);
            const options = {
                addLight: () => {
                    const gameObject = paper.GameObject.create("DirectionalLight");
                    gameObject.transform.setLocalPosition(0.0, 10.0, 0.0);
                    const light = gameObject.addComponent(egret3d.DirectionalLight);

                    modelComponent.select(gameObject, true);
                },
            };
            const gui = guiComponent.hierarchy.addFolder("Test GUI");
            gui.open();
            gui.add(options, "addLight");

            // Load resource config.
            await RES.loadConfig("default.res.json", "resource/sniper/");
            // Create camera.
            egret3d.Camera.main;
        }
    }
}