namespace examples.dragonbones {

    export class Test {
        async  start() {
            // Load resource config.
            await RES.loadConfig("resource/default.res.json", "resource/");
            // Create camera.
            egret3d.Camera.main;

            const dbd = await RES.getResAsync("dragonbones/WinAni_ske.json");
            const dbt = await RES.getResAsync("dragonbones/WinAni_tex.json");
            const dbt2 = await RES.getResAsync("dragonbones/WinAni_tex.png");


            dragonBones.EgretFactory.factory.parseDragonBonesData(dbd);
            dragonBones.EgretFactory.factory.parseTextureAtlasData(dbt, dbt2);

            const gameObject = paper.GameObject.create("2d");
            const renderer = gameObject.addComponent(egret3d.Egret2DRenderer);

            const armature = dragonBones.EgretFactory.factory.buildArmatureDisplay("WinAni")!;
            armature.x = 300;
            armature.y = 200;
            renderer.stage.addChild(armature);

            armature.animation.play();
        }
    }

}