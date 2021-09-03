import { Object3D, OrthographicCamera, AudioListener, DirectionalLight, Vector3 } from "three";

export class PlayerObject {
    constructor() {
        this.center = new Object3D()

        this.initializeCamera()

        this.listener = new AudioListener()
        this.center.add(this.listener)

        this.light = new DirectionalLight(0xffffff, 1)
        this.light.position.set(-5, -5, 5)
        this.light.target = this.center
        this.center.add(this.light)

        this.initializeControls()

        this.acceleration = 0
        this.speed = 0
        this.yawRate = 0

        this.MAX_ACCELERATION = 0.1
        this.MAX_SPEED = 0.1
        this.MAX_YAW_RATE = 0.05

        this.keyState = {}

        this.MAX_FRICTION = 0.01
    }

    getCameraDimensions() {
        const MAX_DIMENSION = 10
      
        if (window.innerWidth > window.innerHeight) {
          const aspect = window.innerHeight / window.innerWidth
      
          return [MAX_DIMENSION, MAX_DIMENSION * aspect]
        } else {
          const aspect = window.innerWidth / window.innerHeight
      
          return [MAX_DIMENSION * aspect, MAX_DIMENSION]
        }
    }

    initializeCamera() {
        const [width, height] = this.getCameraDimensions()
        this.camera = new OrthographicCamera(-width, width, height, -height, 0, 1000)

        this.camera.position.set(5, -5, 5)

        this.camera.rotation.order = "ZXY" // yaw, pitch, roll
        this.camera.rotation.z = Math.PI / 4
        this.camera.rotation.x = Math.PI / 4

        this.center.add(this.camera)
    }

    update() {
        this.applyFriction()

        if (this.keyState["ArrowUp"] && !this.keyState["ArrowDown"]) {
            this.acceleration = this.MAX_ACCELERATION
        } else if (this.keyState["ArrowDown"] && !this.keyState["ArrowUp"]) {
            this.acceleration = -this.MAX_ACCELERATION
        } else {
            this.acceleration = 0
        }

        if (this.keyState["ArrowLeft"] && !this.keyState["ArrowRight"]) {
            this.yawRate = this.MAX_YAW_RATE
        } else if (this.keyState["ArrowRight"] && !this.keyState["ArrowLeft"]) {
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
