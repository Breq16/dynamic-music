import './style.css'

import { SoundObject } from './SoundObject'

import { Scene, WebGLRenderer, AudioLoader, Vector3, Color, GridHelper } from "three"
import { PlayerObject } from './PlayerObject'

const scene = new Scene()

const player = new PlayerObject()
scene.add(player.center)

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

const grid = new GridHelper(100, 100)
grid.rotation.x = Math.PI / 2
scene.add(grid)


const audioLoader = new AudioLoader()

const stems = ["bass-guitar", "heavy-drums", "lead-guitar", "lead-synth", "light-drums"]

const getPosition = angle => new Vector3(20 * Math.cos(angle * 2 * Math.PI + Math.PI / 2), 20 * Math.sin(angle * 2 * Math.PI + Math.PI / 2), 0)

const getColor = angle => new Color(`hsl(${angle * 360}, 100%, 50%)`)

const objects = stems.map((stem, i) => new SoundObject({
    stem,
    position: getPosition(i / stems.length),
    color: getColor(i / stems.length),
    scene,
    listener: player.listener,
}))


function animate() {
    requestAnimationFrame(animate)

    player.update()

    renderer.render(scene, player.camera)
}
animate()


function getConfirm() {
    const wrapper = document.createElement("div")
    const button = document.createElement("button")
    wrapper.appendChild(button)

    wrapper.id = "ConfirmButton"
    button.textContent = "begin"

    document.body.appendChild(wrapper)

    return new Promise(resolve => {
        button.addEventListener("click", (e) => {
            document.body.removeChild(wrapper)
            resolve()
        }, { once: true })
    })
}


Promise.all(
    objects.map(object => object.load(audioLoader))
).then(
    () => getConfirm()
).then(
    () => objects.forEach(object => object.sound.play())
)
