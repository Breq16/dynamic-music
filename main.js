import "./style.css"

import { SoundObject } from "./SoundObject"

import {
    Scene,
    WebGLRenderer,
    AudioLoader,
    Vector3,
    Color,
    GridHelper,
} from "three"
import { PlayerObject } from "./PlayerObject"

const scene = new Scene()

const player = new PlayerObject(scene)
scene.add(player.center)

const renderer = new WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

const grid = new GridHelper(100, 100)
scene.add(grid)

const audioLoader = new AudioLoader()

const stems = [
    "bass-guitar",
    "heavy-drums",
    "lead-guitar",
    "lead-synth",
    "light-drums",
    "chiptune",
    "mallets",
    "misc-perc",
    "piano",
]

const getPosition = (angle) =>
    new Vector3(
        20 * Math.cos(angle * 2 * Math.PI + Math.PI / 2),
        0,
        20 * Math.sin(angle * 2 * Math.PI + Math.PI / 2)
    )

const getColor = (angle) => new Color(`hsl(${angle * 360}, 100%, 50%)`)

const objects = stems.map(
    (stem, i) =>
        new SoundObject({
            stem,
            position: getPosition(i / stems.length),
            color: getColor(i / stems.length),
            scene,
            listener: player.listener,
        })
)

player.objects = objects

let tips = []

function animate() {
    requestAnimationFrame(animate)

    player.update()

    renderer.render(scene, player.camera)

    let newTips = ["use the arrow keys to move around"]

    if (player.holding) {
        newTips.push("press <kbd>space</kbd> to release")
    } else if (player.getCloseSoundObject()) {
        newTips.push("press <kbd>space</kbd> to pick up the sound")
    } else {
        newTips.push("approach a sound to pick it up")
    }

    if (tips != newTips) {
        tips = newTips
        document.getElementById("Tips").innerHTML = tips.join("<br>")
    }
}
animate()

function getConfirm() {
    const wrapper = document.createElement("div")
    const button = document.createElement("button")
    wrapper.appendChild(button)

    wrapper.id = "ConfirmButton"
    button.textContent = "click to start"

    document.body.appendChild(wrapper)

    return new Promise((resolve) => {
        button.addEventListener(
            "click",
            (e) => {
                document.body.removeChild(wrapper)
                resolve()
            },
            { once: true }
        )
    })
}

Promise.all(objects.map((object) => object.load(audioLoader)))
    .then(() => getConfirm())
    .then(() => objects.forEach((object) => object.sound.play()))
