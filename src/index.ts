interface Size {
    width:number,
    height:number
}

interface Position {
    x:number,
    y:number
}

interface PlayerProps {
    position:Position,
    size:Size,
    force:number,
    gravity:number
}

interface RenderProps {
    size:Size
}

interface ControlProps {
    keys:{ code:string, cb:() => any }[]
}

interface GameProps {
    element:HTMLElement
    renderProps:RenderProps
    playerProps:PlayerProps
    obstacleOption:{
        spawn: {
            frame:number,
            max:number
        },
        speed:{
            value:number,
            max:number,
            add:number,
            frame:number
        },
        size:Size
    }
    control:{ 
        jump:string
    }
}

interface ObstacleProps {
    size:Size
    position:Position
}

interface ObstacleOption {
    speed:{
        default:number
        value:number
        max:number
        add:number
        frame:number
    }
    spawn:{
        frame:number,
        max:number,
        value:number
    },
    size:Size
}

class Control {

    private _keys:{
        code:string,
        pressed:boolean,
        cb:() => any
    }[] = []

    constructor(props:ControlProps) {
        this.SetKeys = props.keys
        this.AddEvent()
    }

    set SetKeys(keys:{ code:string, cb:() => any }[]) {
        keys.forEach((key) => { this._keys.push({ pressed:false, code:key.code, cb:key.cb }) })
    }

    private AddEvent(): void {

        document.addEventListener("keydown", (Event) => {
            this._keys.forEach((key) => {
                if (key.code == Event.code) {
                    key.pressed = true
                }
            })
        })

        document.addEventListener("keyup", (Event) => {
            this._keys.forEach((key) => {
                if (key.code == Event.code) {
                    key.pressed = false
                }
            })
        })
    }

    public Refresh(): void {

        this._keys.forEach((key) => {
            if (key.pressed) {
                key.cb()
            }
        })

    }
}

class Player {

    private _position:Position
    private readonly _origin:Position
    private _speed:Position = { x:0, y:0 }
    private _size:Size
    private _gravity:number
    private _force:number

    constructor(props:PlayerProps) {
        this._position = props.position
        this._origin = { x:props.position.x, y:props.position.y }
        this._size = props.size
        this._force = props.force
        this._gravity = props.gravity
    }

    get X(): number { return this._position.x }
    get Y(): number { return this._position.y }
    get Position(): Position { return this._position }
    get Size(): Size { return this._size }
    get Width(): number { return this._size.width }
    get Height(): number { return this._size.height }

    public Refresh(canvasSize:Size): void {

        //"gravidade"
        this._speed.y += this._gravity
        this._position.y += this._speed.y

        if (this._position.y + this._size.height > canvasSize.height) {
            this._speed.y = 0
            this._position.y = canvasSize.height - this._size.height
        }

    }

    public Reset(): void {
        this._speed = { x:0, y:0 }
        this._position = { x:this._origin.x, y:this._origin.y}

    }

    public Jump(canvasSize:Size): void {

        if (this._position.y + this._size.height < canvasSize.height) return
        this._speed.y = 0
        this._speed.y -= this._force

    }

    public Collision(obstacle:Obstacle): boolean {

        let CollisionX = obstacle.X + obstacle.Width > this.X && obstacle.X < this.X + this.Width
        let CollisionY = this.Y + this.Height > obstacle.Y

        if ( CollisionX && CollisionY ) {
            return true
        }

        return false
    }
}

class Render {

    private _size:Size
    private _canvasElement:HTMLCanvasElement = document.createElement("canvas")
    private _context:CanvasRenderingContext2D = this._canvasElement.getContext("2d") as CanvasRenderingContext2D

    constructor(props:RenderProps) {
        this._size = props.size
        this.SetCanvasSize = props.size
    }

    set SetCanvasSize(size:Size) {

        let innerWidth = window.innerWidth
        let innerHeight = window.innerHeight

        if (innerWidth / innerHeight > this.Width * this.Height) {
            innerWidth = innerHeight * this.Width * this.Height
        } else {
            innerHeight = innerWidth / this.Width * this.Height
        }

        this._context.scale( innerWidth / size.width, innerHeight / size.height )

        this._canvasElement.width = window.innerWidth > size.width?size.width:size.width * (innerWidth / size.width)
        this._canvasElement.height = window.innerHeight > size.height?size.height:size.height * (innerHeight / size.height)

        this._size = {
            width:window.innerWidth > size.width?size.width:size.width * (innerWidth / size.width),
            height:window.innerHeight > size.height?size.height:size.height * (innerHeight / size.height)
        }
    }

    get Size(): Size { return this._size }
    get Width(): number { return this._size.width }
    get Height(): number { return this._size.height }
    get Element(): HTMLCanvasElement { return this._canvasElement }

    public Background(color:string): void {
        this._context.fillStyle = color
        this._context.fillRect(0,0,this.Width,this.Height)
    }

    public Player(player:Player): void {
        this._context.fillStyle = "black"
        this._context.fillRect(player.X, player.Y, player.Width, player.Height)
    }

    public Obstacle(obstacle:Obstacle): void {
        this._context.fillStyle = "black"
        this._context.fillRect(obstacle.X, obstacle.Y, obstacle.Width, obstacle.Height)
    }

    public Loading(color:string): void {
        this._context.fillStyle = color
        this._context.textAlign = "center"
        this._context.fillText("Carregando ...", this.Width / 2, this.Height / 2)
    }

    public Error(color:string): void {
        this._context.fillStyle = color
        this._context.textAlign = "center"
        this._context.fillText("Error ...", this.Width / 2, this.Height / 2)
    }

    public GameOver(color:string): void {
        this._context.fillStyle = color
        this._context.textAlign = "center"
        this._context.fillText("GameOver", this.Width / 2, this.Height / 2)
    }
}

class Obstacle {

    private _position:Position
    private _size:Size

    constructor(props:ObstacleProps) {
        this._size = props.size
        this._position = props.position
    }

    get X(): number { return this._position.x }
    get Y(): number { return this._position.y }
    get Position(): Position { return this._position }
    get Size(): Size { return this._size }
    get Width(): number { return this._size.width }
    get Height(): number { return this._size.height }

    public Refresh(speed:number): void {

        this._position.x += speed
    }
}

class Game {

    private _on:boolean = false
    private _gameOver:boolean = false
    private render:Render
    private player:Player
    private control:Control
    private _obstacles:Obstacle[] = []
    private _opticObstacle:ObstacleOption
    private _frames:{ spawnObstacle:number, addObstacleSpeed:number } = {
        addObstacleSpeed:0,
        spawnObstacle:0
    }

    constructor(props:GameProps) {
        
        this.render = new Render(props.renderProps)
        this.player = new Player(props.playerProps)
        this._opticObstacle = {
            spawn:{
                frame:props.obstacleOption.spawn.frame,
                value:0,
                max:props.obstacleOption.spawn.max
            },
            speed:{
                add:props.obstacleOption.speed.add,
                default:props.obstacleOption.speed.value,
                frame:props.obstacleOption.speed.frame,
                max:props.obstacleOption.speed.max,
                value:props.obstacleOption.speed.value
            },
            size:props.obstacleOption.size
        }
        this.control = new Control({
            keys:[
                { code:props.control.jump, cb:() => {
                    if (this._gameOver == true) return
                    this.player.Jump(this.render.Size)
                }},
                { code:"KeyR", cb:() => {
                    if (this._gameOver == false) return
                    this.Reset()
                } }
            ]
        })
        props.element.appendChild(this.render.Element)
        
    }

    get On(): boolean { return this._on }

    public Start(): Promise<void> {

        return new Promise(async (resolve,reject) => {

            try {
                this.render.Loading("white")
                if (this._on) throw ""
                setTimeout(() => {
                    this._on = true
                    resolve()
                },1000)


            } catch (reason) {
                this.render.Error("red")
                reject(reason)
            }

        })

    }

    private Reset(): void {

        this._gameOver = false
        this.player.Reset()
        this._frames.addObstacleSpeed = 0
        this._frames.spawnObstacle = 0
        this._opticObstacle.speed.value = this._opticObstacle.speed.default
        this._obstacles = []
    }

    public Refresh(): void {

        if (!this._on) throw ""
        this.Logic()
        this.Render()
    }

    private Logic(): void {

        this.control.Refresh()

        if (this._gameOver) return

        this._frames.addObstacleSpeed ++
        this._frames.spawnObstacle ++

        if (this._frames.spawnObstacle >= this._opticObstacle.spawn.frame) {
            this._frames.spawnObstacle = 0
            
            let random = Math.floor(Math.random() * 3)

            this._opticObstacle.spawn.value ++
            if (random == 0 || this._opticObstacle.spawn.value > this._opticObstacle.spawn.max) {
                this._opticObstacle.spawn.value = 0
                this.AddObstacle()
            }

        }

        if (this._frames.addObstacleSpeed >= this._opticObstacle.speed.frame) {
            this._frames.addObstacleSpeed = 0
            this._opticObstacle.speed.value = this._opticObstacle.speed.value >= this._opticObstacle.speed.max?this._opticObstacle.speed.max:this._opticObstacle.speed.value +this._opticObstacle.speed.add
        }

        let obstacles:Obstacle[] = []
        this._obstacles.forEach((obstacle, index) => {
            if (obstacle.X + obstacle.Width > 0) { 
                obstacle.Refresh(-this._opticObstacle.speed.value)
                obstacles.push(obstacle)

                if (this.player.Collision(obstacle)) {
                    this._gameOver = true
                }
            }
        })
        this._obstacles = obstacles
        obstacles = []

        this.player.Refresh(this.render.Size)
    }

    private Render(): void {

        this.render.Background("#202124")

        if (this._gameOver) {
            this.render.GameOver("red")
            return
        }

        this.render.Player(this.player)
        this._obstacles.forEach((obstacle) => { this.render.Obstacle(obstacle) })
    }

    private AddObstacle(): void {

        if (!this._on) throw ""

        this._obstacles.push(new Obstacle({
            position:{
                y:this.render.Height - this._opticObstacle.size.height,
                x:this.render.Width
            },
            size:this._opticObstacle.size
        }))

    }
}
 
const game = new Game({
    playerProps:{
        position:{ x:50, y:50 },
        size:{ width:50, height:50 },
        force:14,
        gravity:0.6
    },
    renderProps:{
        size:{
            width:1200,
            height:600
        }
    },
    control:{
        jump:"Space"
    },
    obstacleOption: {
        speed:{
            value:5,
            max:30,
            add:1,
            frame:250
        },
        spawn: {
            frame:110,
            max:2
        },
        size:{
            width:50,
            height:50
        }
    },
    element:document.querySelector("main") || document.body
})

game.Start()
.then(() => {
    function loop() {
        game.Refresh()
        requestAnimationFrame(loop)
    }
    loop()
})