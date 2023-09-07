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
    control:{ 
        jump:string
    }
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
    private _speed:Position = { x:0, y:0 }
    private _size:Size
    private _gravity:number
    private _force:number

    constructor(props:PlayerProps) {
        this._position = props.position
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

    public Jump(canvasSize:Size): void {

        if (this._position.y + this._size.height < canvasSize.height) return
        this._speed.y = 0
        this._speed.y -= this._force

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
}

class Game {

    private _on:boolean = false
    private render:Render
    private player:Player
    private control:Control

    constructor(props:GameProps) {
        
        this.render = new Render(props.renderProps)
        this.player = new Player(props.playerProps)
        this.control = new Control({
            keys:[
                { code:props.control.jump, cb:() => {
                    this.player.Jump(this.render.Size)
                }}
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

    public Refresh(): void {

        if (!this._on) throw ""

        this.player.Refresh(this.render.Size)
        this.control.Refresh()
        
        //Render
        this.render.Background("#202124")
        this.render.Player(this.player)
    }

}
 
const game = new Game({
    playerProps:{
        position:{ x:50, y:50 },
        size:{ width:50, height:50 },
        force:16,
        gravity:0.8
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