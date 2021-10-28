import { Mesh, MeshPhongMaterial, PositionalAudio, SphereGeometry } from "three"

export class SoundObject {
    constructor({ stem, position, color, scene, listener }) {
        this.stem = stem

        console.log(color)

        const geometry = new SphereGeometry(1, 32, 16)
        const material = new MeshPhongMaterial({ color })

        this.mesh = new Mesh(geometry, material)
        this.mesh.position.copy(position)

        this.sound = new PositionalAudio(listener)
        this.sound.loop = true
        this.sound.setRefDistance(2)
        this.mesh.add(this.sound)

        scene.add(this.mesh)
    }

    async load(loader) {
        // mp3 won't loop seamlessly
        const buffer = await loader.loadAsync(`/audio/${this.stem}.wav`)

        this.sound.setBuffer(buffer)
    }

    play() {
        console.log("playing sound", this.stem)
        this.sound.play()
    }
}
