const socket = io();

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: "arcade", arcade: { gravity: { y: 500 }, debug: false } },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, obstacles = [], otherPlayers = {};

function preload() {
    this.load.image("player", "player.png"); // Character sprite
    this.load.image("obstacle", "obstacle.png"); // Obstacle sprite
}

function create() {
    player = this.physics.add.sprite(400, 500, "player").setScale(0.5);
    player.setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();

    socket.on("updatePlayers", (players) => {
        for (let id in players) {
            if (id !== socket.id) {
                if (!otherPlayers[id]) {
                    otherPlayers[id] = this.physics.add.sprite(players[id].x, players[id].y, "player").setScale(0.5);
                } else {
                    otherPlayers[id].setPosition(players[id].x, players[id].y);
                }
            }
        }
    });

    socket.on("updateObstacles", (data) => {
        obstacles.forEach((ob) => ob.destroy());
        obstacles = [];
        data.forEach((ob) => {
            let obstacle = this.physics.add.sprite(ob.x, ob.y, "obstacle").setScale(0.5);
            obstacles.push(obstacle);
        });
    });
}

function update() {
    let moveData = { x: player.x, y: player.y };

    if (this.cursors.left.isDown) {
        player.setVelocityX(-200);
        moveData.x -= 5;
    } else if (this.cursors.right.isDown) {
        player.setVelocityX(200);
        moveData.x += 5;
    } else {
        player.setVelocityX(0);
    }

    if (this.cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-300);
        moveData.y -= 10;
    }

    socket.emit("playerMove", moveData);
}
