const w : number = window.innerWidth, h = window.innerHeight, nodes = 5
class RectIncreasingStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    linkedIncreasingRect : LinkedIncreasingRect = new LinkedIncreasingRect()

    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.linkedIncreasingRect.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.linkedIncreasingRect.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.linkedIncreasingRect.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : RectIncreasingStage = new RectIncreasingStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class RISNode {
    prev : RISNode
    next : RISNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new RISNode(this.i + 1)
            this.next.prev = this
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir: number, cb : Function) : RISNode {
        var curr : RISNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }

    draw(context : CanvasRenderingContext2D) {
        const wGap : number =  (w / nodes) * (1 + this.i)
        const hGap : number = (h / nodes) * (1 + this.i)
        const alpha : number = (5 - this.i) / nodes
        context.fillStyle = '#c3ae4d'
        if (this.next) {
            this.next.draw(context)
        }
        context.save()
        context.globalAlpha = alpha
        context.translate(w/2, h/2)
        context.fillRect(-wGap/2, -hGap/2 + hGap * this.state.scale, wGap, hGap * (1 - this.state.scale))
        context.restore()
    }
}

class LinkedIncreasingRect {

    curr : RISNode = new RISNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
