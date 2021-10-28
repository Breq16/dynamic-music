import {
    Object3D,
    PerspectiveCamera,
    AudioListener,
    DirectionalLight,
    Vector3,
    ConeGeometry,
    MeshPhongMaterial,
    Mesh,
} from "three"

export class PlayerObject {
    constructor() {
        this.center = new Object3D()

        this.initializeCamera()

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

        this.MAX_ACCELERATION = 0.01
        this.MAX_SPEED = 0.5
        this.MAX_YAW_RATE = 0.025

        this.keyState = {}

        this.MAX_FRICTION = 0.01

        this.holding = null
    }

    initializeCamera() {
        this.camera = new PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        )

        this.camera.position.set(-5, 0, 5)

        this.camera.rotation.order = "ZXY" // yaw, pitch, roll
        this.camera.rotation.z = -Math.PI / 2
        this.camera.rotation.x = Math.PI / 3

        this.center.add(this.camera)

        this.listener = new AudioListener()

        this.camera.add(this.listener)
    }

    get upPressed() {
        return (
            (this.keyState["ArrowUp"] || this.keyState["w"]) &&
            !(this.keyState["ArrowDown"] || this.keyState["s"])
        )
    }

    get downPressed() {
        return (
            (this.keyState["ArrowDown"] || this.keyState["s"]) &&
            !(this.keyState["ArrowUp"] || this.keyState["w"])
        )
    }

    get leftPressed() {
        return (
            (this.keyState["ArrowLeft"] || this.keyState["a"]) &&
            !(this.keyState["ArrowRight"] || this.keyState["d"])
        )
    }

    get rightPressed() {
        return (
            (this.keyState["ArrowRight"] || this.keyState["d"]) &&
            !(this.keyState["ArrowLeft"] || this.keyState["a"])
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

        this.speed = Math.max(
            -this.MAX_SPEED,
            Math.min(this.MAX_SPEED, this.speed)
        )

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
        document.addEventListener("keydown", (event) => {
            if (event.repeat) {
                return
            }
            this.keyState[event.key] = true
        })

        document.addEventListener("keyup", (event) => {
            this.keyState[event.key] = false
        })

        document.addEventListener("keydown", (event) => {
            if (event.key === " ") {
                this.attemptGrab()
            }
        })
    }

    applyFriction() {
        this.speed *= 0.95
        this.yawRate *= 0.95
    }

    attemptGrab() {
        if (this.holding) {
            // Release the object
            this.center.parent.attach(this.holding.mesh)
            this.holding.mesh.scale.set(1, 1, 1)
            this.player.material.color.set(0xffffff)

            this.holding = null
        } else {
            // If the closest object is close enough, grab it
            let closest = null
            let closestDistance = Infinity
            for (let object of this.objects) {
                const distance = this.center.position.distanceTo(
                    object.mesh.position
                )
                if (distance < closestDistance) {
                    closest = object
                    closestDistance = distance
                }
            }

            if (closestDistance > 2) {
                return
            }

            this.holding = closest
            this.holding.mesh.position.set(-1, 0, 0)
            this.holding.mesh.scale.set(0.5, 0.5, 0.5)
            this.center.add(this.holding.mesh)
            this.player.material.color.set(this.holding.mesh.material.color)
        }
    }
}
