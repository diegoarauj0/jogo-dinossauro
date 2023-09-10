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
        keys.forEach((key) => { this._keys.push({ pressed: false, repete: key.repete, code: key.code, cb: key.cb }); });
    }
    AddEvent() {
        document.addEventListener("keydown", (Event) => {
            this._keys.forEach((key) => {
                if (key.code == Event.code) {
                    if (key.repete) {
                        key.pressed = true;
                        return;
                    }
                    key.cb();
                }
            });
        });
        document.addEventListener("keyup", (Event) => {
            this._keys.forEach((key) => {
                if (key.code == Event.code && key.repete) {
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
        this._playerIsJumping = false;
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
            this._playerIsJumping = false;
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
        this._playerIsJumping = true;
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
class Sprite {
    constructor() {
        this._frame = 0;
        this._stat = "";
        this._animation = [];
        this._await = 0;
    }
    get Animation() {
        return this._animation.filter((animation) => { return animation.name == this._stat; })[0];
    }
    get Sprite() {
        var _a;
        return (_a = this.Animation) === null || _a === void 0 ? void 0 : _a.sprites[this._frame];
    }
    set Stat(stat) {
        if (stat == this._stat)
            return;
        this._frame = 0;
        this._await = 0;
        this._stat = stat;
    }
    Load(animations) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            for (let animation in animations) {
                let sprites = [];
                for (let sprite in animations[animation].sprites) {
                    let image = yield LoadImage(animations[animation].sprites[sprite].src);
                    sprites.push({
                        image: image,
                        time: animations[animation].sprites[sprite].time
                    });
                }
                this._animation.push({
                    name: animations[animation].name,
                    sprites: sprites
                });
                resolve();
            }
        }));
    }
    Refresh() {
        if (this.Animation == undefined)
            return;
        this._await++;
        if (this._await < this.Animation.sprites[this._frame].time)
            return;
        this._await = 0;
        if (this._frame >= this.Animation.sprites.length - 1) {
            this._frame = 0;
            return;
        }
        this._frame++;
    }
}
class Render {
    constructor(props) {
        this._canvasElement = document.createElement("canvas");
        this._context = this._canvasElement.getContext("2d");
        this.spritePlayer = new Sprite();
        this.spriteObstacle = new Sprite();
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
    Load() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Fonts
                this.Background("#202124");
                this.Text("Carregando Fonts ...", "white", "center", this.Width / 2, this.Height / 2, "20px Arial", true);
                const Handjet = new FontFace("Handjet", "url(fonts/Handjet/Handjet.ttf)");
                document.fonts.add(yield Handjet.load());
                //Image
                this.Background("#202124");
                this.Text("Carregando Imagens ...", "white", "center", this.Width / 2, this.Height / 2, "25px Handjet", true);
                yield this.spritePlayer.Load([
                    { name: "parado", sprites: [
                            { src: "image/dino0.png", time: 25 },
                            { src: "image/dino1.png", time: 25 },
                        ] },
                    { name: "pulando", sprites: [
                            { src: "image/dino2.png", time: 25 },
                        ] }
                ]);
                yield this.spriteObstacle.Load([
                    { name: "parado", sprites: [
                            { src: "image/obs0.png", time: 25 }
                        ] }
                ]);
                resolve();
            }
            catch (reason) {
                reject(reason);
            }
        }));
    }
    Background(color) {
        this._context.fillStyle = color;
        this._context.fillRect(0, 0, this.Width, this.Height);
    }
    Player(player, hitBox) {
        if (hitBox) {
            this._context.fillStyle = "#00000065";
            this._context.fillRect(player.X, player.Y, player.Width, player.Height);
        }
        this.spritePlayer.Sprite ? this._context.drawImage(this.spritePlayer.Sprite.image, player.X, player.Y, player.Width, player.Height) : null;
    }
    Obstacle(obstacle, hitBox) {
        if (hitBox) {
            this._context.fillStyle = "black";
            this._context.fillRect(obstacle.X, obstacle.Y, obstacle.Width, obstacle.Height);
        }
        this.spriteObstacle.Sprite ? this._context.drawImage(this.spriteObstacle.Sprite.image, obstacle.X, obstacle.Y, obstacle.Width, obstacle.Height) : null;
    }
    filterVHS(amount, size) {
        this._context.fillStyle = "white";
        let count = 0;
        while (count <= amount) {
            let positionX = Math.floor(Math.random() * this.Width - 1);
            let positionY = Math.floor(Math.random() * this.Width - 1);
            this._context.fillRect(positionX, positionY, size.width, size.height);
            count++;
        }
    }
    Text(text, color, textAlign, x, y, font, shadow) {
        font ? this._context.font = font : null;
        this._context.textAlign = textAlign;
        if (shadow) {
            this._context.fillStyle = "black";
            this._context.fillText(text, x + 3, y + 3);
        }
        this._context.fillStyle = color;
        this._context.fillText(text, x, y);
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
        this._hitBox = false;
        this._frames = {
            addObstacleSpeed: 0,
            spawnObstacle: 0
        };
        this.render = new Render(props.renderProps);
        this.player = new Player(props.playerProps);
        this._points = {
            value: 0,
            record: Number(isNaN(Number(localStorage.getItem("points"))) ? 0 : localStorage.getItem("points"))
        };
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
                { code: props.control.jump, repete: true, cb: () => {
                        if (this._gameOver == true)
                            return;
                        this.player.Jump(this.render.Size);
                    } },
                { code: "KeyR", cb: () => {
                        if (this._gameOver == false)
                            return;
                        this.Reset();
                    } },
                { code: "KeyH", cb: () => {
                        this._hitBox = !this._hitBox;
                    } }
            ]
        });
        props.element.appendChild(this.render.Element);
    }
    get On() { return this._on; }
    Start() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (this._on)
                    throw "";
                yield this.render.Load();
                this.render.spritePlayer.Stat = "parado";
                this.render.spriteObstacle.Stat = "parado";
                setTimeout(() => {
                    this._on = true;
                    resolve();
                }, 1000);
            }
            catch (reason) {
                this.render.Background("#202124");
                this.render.Text("Não foi possível carregar o jogo :(", "red", "center", this.render.Width / 2, this.render.Height / 2, "25px Handjet, Arial", true);
                reject(reason);
            }
        }));
    }
    Reset() {
        this._gameOver = false;
        this.player.Reset();
        this._points.value = 0;
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
        this._points.value++;
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
        this._obstacles.forEach((obstacle) => {
            if (obstacle.X + obstacle.Width > 0) {
                obstacle.Refresh(-this._opticObstacle.speed.value);
                obstacles.push(obstacle);
                if (this.player.Collision(obstacle)) {
                    this._gameOver = true;
                    if (this._points.record < this._points.value) {
                        this._points.record = this._points.value;
                        localStorage.setItem("points", String(this._points.record));
                    }
                }
            }
        });
        this._obstacles = obstacles;
        obstacles = [];
        this.player.Refresh(this.render.Size);
    }
    Render() {
        //BackGround
        this.render.Background("#202124");
        //Player
        this.render.spritePlayer.Stat = "parado";
        if (this.player._playerIsJumping)
            this.render.spritePlayer.Stat = "pulando";
        this.render.spritePlayer.Refresh();
        this.render.Player(this.player, this._hitBox);
        //Obstacle
        this.render.spriteObstacle.Refresh();
        this._obstacles.forEach((obstacle) => { this.render.Obstacle(obstacle, this._hitBox); });
        if (this._gameOver) {
            //GameOver
            this.render.Text("Game Over", "red", "center", this.render.Width / 2, this.render.Height / 2 - 35, "40px Handjet", true);
            this.render.Text('Aperte "R" para recomeçar do zero', "red", "center", this.render.Width / 2, this.render.Height / 2, "25px Handjet", true);
            return;
        }
        //Normal
        //Text
        this.render.Text(`${this._points.value > this._points.record ? `Novo record => ${this._points.value}` : `Pontos => ${this._points.value}/${this._points.record}`}`, this._points.value > this._points.record ? "green" : "white", "right", this.render.Width - 10, 30, "25px Handjet", true);
        this.render.Text(`Data => ${new Date().getDate()}/${new Date().getMonth() + 1}/${new Date().getFullYear()}`, "white", "left", 10, 30, "25px Handjet", true);
        this.render.Text(`Velocidade => ${this._opticObstacle.speed.value}`, "white", "left", 10, 60, "25px Handjet", true);
        this.render.filterVHS(50, {
            width: 1,
            height: 1
        });
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
        size: { width: 65, height: 65 },
        force: 14,
        gravity: 0.6
    },
    renderProps: {
        size: {
            width: 1000,
            height: 500
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
            frame: 90,
            max: 2
        },
        size: {
            width: 50,
            height: 50
        }
    },
    element: document.querySelector("main") || document.body
});
function LoadImage(src) {
    return new Promise((resolve) => {
        let image = new Image();
        image.src = src;
        image.addEventListener("load", () => { resolve(image); });
    });
}
game.Start()
    .then(() => {
    function loop() {
        game.Refresh();
        requestAnimationFrame(loop);
    }
    loop();
})
    .catch((r) => { console.error(r); });
