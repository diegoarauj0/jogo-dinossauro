"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Control {
    constructor(props) {
        this._keys = [];
        this.SetKeys = props.keys;
        this.AddEvent();
    }
    set SetKeys(keys) {
        keys.forEach((key) => { this._keys.push({ pressed: false, code: key.code, cb: key.cb }); });
    }
    AddEvent() {
        document.addEventListener("keydown", (Event) => {
            this._keys.forEach((key) => {
                if (key.code == Event.code) {
                    key.pressed = true;
                }
            });
        });
        document.addEventListener("keyup", (Event) => {
            this._keys.forEach((key) => {
                if (key.code == Event.code) {
                    key.pressed = false;
                }
            });
        });
    }
    Refresh() {
        this._keys.forEach((key) => {
            if (key.pressed) {
                key.cb();
            }
        });
    }
}
class Player {
    constructor(props) {
        this._speed = { x: 0, y: 0 };
        this._position = props.position;
        this._origin = { x: props.position.x, y: props.position.y };
        this._size = props.size;
        this._force = props.force;
        this._gravity = props.gravity;
    }
    get X() { return this._position.x; }
    get Y() { return this._position.y; }
    get Position() { return this._position; }
    get Size() { return this._size; }
    get Width() { return this._size.width; }
    get Height() { return this._size.height; }
    Refresh(canvasSize) {
        //"gravidade"
        this._speed.y += this._gravity;
        this._position.y += this._speed.y;
        if (this._position.y + this._size.height > canvasSize.height) {
            this._speed.y = 0;
            this._position.y = canvasSize.height - this._size.height;
        }
    }
    Reset() {
        this._speed = { x: 0, y: 0 };
        this._position = { x: this._origin.x, y: this._origin.y };
    }
    Jump(canvasSize) {
        if (this._position.y + this._size.height < canvasSize.height)
            return;
        this._speed.y = 0;
        this._speed.y -= this._force;
    }
    Collision(obstacle) {
        let CollisionX = obstacle.X + obstacle.Width > this.X && obstacle.X < this.X + this.Width;
        let CollisionY = this.Y + this.Height > obstacle.Y;
        if (CollisionX && CollisionY) {
            return true;
        }
        return false;
    }
}
class Render {
    constructor(props) {
        this._canvasElement = document.createElement("canvas");
        this._context = this._canvasElement.getContext("2d");
        this._size = props.size;
        this.SetCanvasSize = props.size;
    }
    set SetCanvasSize(size) {
        let innerWidth = window.innerWidth;
        let innerHeight = window.innerHeight;
        if (innerWidth / innerHeight > this.Width * this.Height) {
            innerWidth = innerHeight * this.Width * this.Height;
        }
        else {
            innerHeight = innerWidth / this.Width * this.Height;
        }
        this._context.scale(innerWidth / size.width, innerHeight / size.height);
        this._canvasElement.width = window.innerWidth > size.width ? size.width : size.width * (innerWidth / size.width);
        this._canvasElement.height = window.innerHeight > size.height ? size.height : size.height * (innerHeight / size.height);
        this._size = {
            width: window.innerWidth > size.width ? size.width : size.width * (innerWidth / size.width),
            height: window.innerHeight > size.height ? size.height : size.height * (innerHeight / size.height)
        };
    }
    get Size() { return this._size; }
    get Width() { return this._size.width; }
    get Height() { return this._size.height; }
    get Element() { return this._canvasElement; }
    Background(color) {
        this._context.fillStyle = color;
        this._context.fillRect(0, 0, this.Width, this.Height);
    }
    Player(player) {
        this._context.fillStyle = "black";
        this._context.fillRect(player.X, player.Y, player.Width, player.Height);
    }
    Obstacle(obstacle) {
        this._context.fillStyle = "black";
        this._context.fillRect(obstacle.X, obstacle.Y, obstacle.Width, obstacle.Height);
    }
    Loading(color) {
        this._context.fillStyle = color;
        this._context.textAlign = "center";
        this._context.fillText("Carregando ...", this.Width / 2, this.Height / 2);
    }
    Error(color) {
        this._context.fillStyle = color;
        this._context.textAlign = "center";
        this._context.fillText("Error ...", this.Width / 2, this.Height / 2);
    }
    GameOver(color) {
        this._context.fillStyle = color;
        this._context.textAlign = "center";
        this._context.fillText("GameOver", this.Width / 2, this.Height / 2);
    }
}
class Obstacle {
    constructor(props) {
        this._size = props.size;
        this._position = props.position;
    }
    get X() { return this._position.x; }
    get Y() { return this._position.y; }
    get Position() { return this._position; }
    get Size() { return this._size; }
    get Width() { return this._size.width; }
    get Height() { return this._size.height; }
    Refresh(speed) {
        this._position.x += speed;
    }
}
class Game {
    constructor(props) {
        this._on = false;
        this._gameOver = false;
        this._obstacles = [];
        this._frames = {
            addObstacleSpeed: 0,
            spawnObstacle: 0
        };
        this.render = new Render(props.renderProps);
        this.player = new Player(props.playerProps);
        this._opticObstacle = {
            spawn: {
                frame: props.obstacleOption.spawn.frame,
                value: 0,
                max: props.obstacleOption.spawn.max
            },
            speed: {
                add: props.obstacleOption.speed.add,
                default: props.obstacleOption.speed.value,
                frame: props.obstacleOption.speed.frame,
                max: props.obstacleOption.speed.max,
                value: props.obstacleOption.speed.value
            },
            size: props.obstacleOption.size
        };
        this.control = new Control({
            keys: [
                { code: props.control.jump, cb: () => {
                        if (this._gameOver == true)
                            return;
                        this.player.Jump(this.render.Size);
                    } },
                { code: "KeyR", cb: () => {
                        if (this._gameOver == false)
                            return;
                        this.Reset();
                    } }
            ]
        });
        props.element.appendChild(this.render.Element);
    }
    get On() { return this._on; }
    Start() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.render.Loading("white");
                if (this._on)
                    throw "";
                setTimeout(() => {
                    this._on = true;
                    resolve();
                }, 1000);
            }
            catch (reason) {
                this.render.Error("red");
                reject(reason);
            }
        }));
    }
    Reset() {
        this._gameOver = false;
        this.player.Reset();
        this._frames.addObstacleSpeed = 0;
        this._frames.spawnObstacle = 0;
        this._opticObstacle.speed.value = this._opticObstacle.speed.default;
        this._obstacles = [];
    }
    Refresh() {
        if (!this._on)
            throw "";
        this.Logic();
        this.Render();
    }
    Logic() {
        this.control.Refresh();
        if (this._gameOver)
            return;
        this._frames.addObstacleSpeed++;
        this._frames.spawnObstacle++;
        if (this._frames.spawnObstacle >= this._opticObstacle.spawn.frame) {
            this._frames.spawnObstacle = 0;
            let random = Math.floor(Math.random() * 3);
            this._opticObstacle.spawn.value++;
            if (random == 0 || this._opticObstacle.spawn.value > this._opticObstacle.spawn.max) {
                this._opticObstacle.spawn.value = 0;
                this.AddObstacle();
            }
        }
        if (this._frames.addObstacleSpeed >= this._opticObstacle.speed.frame) {
            this._frames.addObstacleSpeed = 0;
            this._opticObstacle.speed.value = this._opticObstacle.speed.value >= this._opticObstacle.speed.max ? this._opticObstacle.speed.max : this._opticObstacle.speed.value + this._opticObstacle.speed.add;
        }
        let obstacles = [];
        this._obstacles.forEach((obstacle, index) => {
            if (obstacle.X + obstacle.Width > 0) {
                obstacle.Refresh(-this._opticObstacle.speed.value);
                obstacles.push(obstacle);
                if (this.player.Collision(obstacle)) {
                    this._gameOver = true;
                }
            }
        });
        this._obstacles = obstacles;
        obstacles = [];
        this.player.Refresh(this.render.Size);
    }
    Render() {
        this.render.Background("#202124");
        if (this._gameOver) {
            this.render.GameOver("red");
            return;
        }
        this.render.Player(this.player);
        this._obstacles.forEach((obstacle) => { this.render.Obstacle(obstacle); });
    }
    AddObstacle() {
        if (!this._on)
            throw "";
        this._obstacles.push(new Obstacle({
            position: {
                y: this.render.Height - this._opticObstacle.size.height,
                x: this.render.Width
            },
            size: this._opticObstacle.size
        }));
    }
}
const game = new Game({
    playerProps: {
        position: { x: 50, y: 50 },
        size: { width: 50, height: 50 },
        force: 14,
        gravity: 0.6
    },
    renderProps: {
        size: {
            width: 1200,
            height: 600
        }
    },
    control: {
        jump: "Space"
    },
    obstacleOption: {
        speed: {
            value: 5,
            max: 30,
            add: 1,
            frame: 250
        },
        spawn: {
            frame: 110,
            max: 2
        },
        size: {
            width: 50,
            height: 50
        }
    },
    element: document.querySelector("main") || document.body
});
game.Start()
    .then(() => {
    function loop() {
        game.Refresh();
        requestAnimationFrame(loop);
    }
    loop();
});
