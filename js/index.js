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
    Jump(canvasSize) {
        if (this._position.y + this._size.height < canvasSize.height)
            return;
        this._speed.y = 0;
        this._speed.y -= this._force;
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
}
class Game {
    constructor(props) {
        this._on = false;
        this.render = new Render(props.renderProps);
        this.player = new Player(props.playerProps);
        this.control = new Control({
            keys: [
                { code: props.control.jump, cb: () => {
                        this.player.Jump(this.render.Size);
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
    Refresh() {
        if (!this._on)
            throw "";
        this.player.Refresh(this.render.Size);
        this.control.Refresh();
        //Render
        this.render.Background("#202124");
        this.render.Player(this.player);
    }
}
const game = new Game({
    playerProps: {
        position: { x: 50, y: 50 },
        size: { width: 50, height: 50 },
        force: 16,
        gravity: 0.8
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
