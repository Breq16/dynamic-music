import { Object3D, PerspectiveCamera, AudioListener, DirectionalLight, Vector3, ConeGeometry, MeshPhongMaterial, Mesh } from "three";

export class PlayerObject {
    constructor() {
        this.center = new Object3D()

        this.initializeCamera()

        this.listener = new AudioListener()
        this.camera.add(this.listener)

        this.light = new DirectionalLight(0xffffff, 1)
        this.light.position.set(-5, -5, 5)
        this.light.target = this.center
        this.center.add(this.light)

        const playerGeometry = new ConeGeometry(0.5, 1, 32)
        const playerMaterial = new MeshPhongMaterial({ color: 0xffffff })
        this.player = new Mesh(playerGeometry, playerMaterial)
        this.player.rotation.order = "ZXY"
        this.player.rotation.z = -Math.PI / 2
        this.center.add(this.player)


        this.initializeControls()

        this.acceleration = 0
        this.speed = 0
        this.yawRate = 0

        this.MAX_ACCELERATION = 0.1
        this.MAX_SPEED = 0.1
        this.MAX_YAW_RATE = 0.025

        this.keyState = {}

        this.MAX_FRICTION = 0.01
    }

    initializeCamera() {
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)

        this.camera.position.set(-5, 0, 5)

        this.camera.rotation.order = "ZXY" // yaw, pitch, roll
        this.camera.rotation.z = -Math.PI / 2
        this.camera.rotation.x = Math.PI / 3

        this.center.add(this.camera)
    }

    get upPressed() {
        return (
            (this.keyState["ArrowUp"] || this.keyState["w"])
            && !(this.keyState["ArrowDown"] || this.keyState["s"])
        )
    }

    get downPressed() {
        return (
            (this.keyState["ArrowDown"] || this.keyState["s"])
            && !(this.keyState["ArrowUp"] || this.keyState["w"])
        )
    }

    get leftPressed() {
        return (
            (this.keyState["ArrowLeft"] || this.keyState["a"])
            && !(this.keyState["ArrowRight"] || this.keyState["d"])
        )
    }

    get rightPressed() {
        return (
            (this.keyState["ArrowRight"] || this.keyState["d"])
            && !(this.keyState["ArrowLeft"] || this.keyState["a"])
        )
    }

    update() {
        this.applyFriction()

        if (this.upPressed) {
            this.acceleration = this.MAX_ACCELERATION
        } else if (this.downPressed) {
            this.acceleration = -this.MAX_ACCELERATION
        } else {
            this.acceleration = 0
        }

        if (this.leftPressed) {
            this.yawRate = this.MAX_YAW_RATE
        } else if (this.rightPressed) {
            this.yawRate = -this.MAX_YAW_RATE
        }

        this.speed += this.acceleration

        this.speed = Math.max(-this.MAX_SPEED, Math.min(this.MAX_SPEED, this.speed))

        this.center.position.add(
            new Vector3(
                this.speed * Math.cos(this.center.rotation.z),
                this.speed * Math.sin(this.center.rotation.z),
                0
            )
        )

        this.center.rotation.z += this.yawRate
    }

    initializeControls() {
        document.addEventListener("keydown", event => {
            if (event.repeat) {
                return
            }
            this.keyState[event.key] = true
        })

        document.addEventListener("keyup", event => {
            this.keyState[event.key] = false
        })
    }

    applyFriction() {
        this.speed *= 0.9
        this.yawRate *= 0.9
    }
}
