import * as me from "melonjs";
// ==========================================
// 1. GAME SETTINGS & THE MAZE
// ==========================================
const TILE = 16; // Each grid square is 16x16 pixels
// 1 = Wall, 0 = Dot, 2 = Empty Space
const MAZE = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 2, 1, 2, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 2, 1, 1, 2, 1, 1, 2, 1, 0, 1, 1, 1, 1],
    [2, 2, 2, 2, 0, 2, 2, 1, 2, 2, 2, 1, 2, 2, 0, 2, 2, 2, 2],
    [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 1, 1, 1, 1],
    [1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
const COLS = MAZE[0].length;
const ROWS = MAZE.length;
// Score and Game Status
let score = 0;
let gameOver = false;
let gameWon = false;
// ==========================================
// 2. PAC-MAN & GHOST POSITIONS
// ==========================================
// Pac-Man starts near the bottom
let pacman = {
    tileX: 9,
    tileY: 16,
    dirX: 0,
    dirY: 0,
    moveTimer: 0
};
// Blinky (the red ghost) starts in the middle
let ghost = {
    tileX: 9,
    tileY: 8,
    dirX: 0,
    dirY: 0,
    moveTimer: 0
};
// Helper: Check if a grid tile is a solid wall
function isWall(tileX, tileY) {
    if (tileX < 0 || tileX >= COLS || tileY < 0 || tileY >= ROWS) return true;
    return MAZE[tileY][tileX] === 1;
}
// ==========================================
// 3. THE GAME SCREEN (DRAWING & MOVING)
// ==========================================
class PacmanScreen extends me.Stage {
    onResetEvent() {
        // Listen for arrow keys on your keyboard
        me.input.bindKey(me.input.KEY.LEFT, "left");
        me.input.bindKey(me.input.KEY.RIGHT, "right");
        me.input.bindKey(me.input.KEY.UP, "up");
        me.input.bindKey(me.input.KEY.DOWN, "down");
        // Add our custom visual drawer to the game
        me.game.world.addChild(new GameRenderer());
    }
}
class GameRenderer extends me.Renderable {
    constructor() {
        super(0, 0, COLS * TILE, ROWS * TILE + 30);
        this.isPersistent = true;
        this.floating = true;
        this.anchorPoint.set(0, 0);
    }
    update(dt) {
        if (gameOver || gameWon) return false;
        // 1. Read player keyboard input
        if (me.input.isKeyPressed("left")) { pacman.dirX = -1; pacman.dirY = 0; }
        if (me.input.isKeyPressed("right")) { pacman.dirX = 1; pacman.dirY = 0; }
        if (me.input.isKeyPressed("up")) { pacman.dirX = 0; pacman.dirY = -1; }
        if (me.input.isKeyPressed("down")) { pacman.dirX = 0; pacman.dirY = 1; }
        // 2. Move Pac-Man once every 140 milliseconds
        pacman.moveTimer += dt;
        if (pacman.moveTimer > 140) {
            pacman.moveTimer = 0;
            let nextX = pacman.tileX + pacman.dirX;
            let nextY = pacman.tileY + pacman.dirY;
            // Only step forward if the next square is not a wall
            if (!isWall(nextX, nextY)) {
                pacman.tileX = nextX;
                pacman.tileY = nextY;
                // Eat dot
                if (MAZE[pacman.tileY][pacman.tileX] === 0) {
                    MAZE[pacman.tileY][pacman.tileX] = 2; // Turn dot into empty space
                    score += 10;
                    this.checkWinCondition();
                }
            }
        }
        // 3. Move Ghost toward Pac-Man once every 220 milliseconds (slower than player)
        ghost.moveTimer += dt;
        if (ghost.moveTimer > 220) {
            ghost.moveTimer = 0;
            this.moveGhostTowardPacman();
        }
        // 4. Check if ghost touched Pac-Man
        if (ghost.tileX === pacman.tileX && ghost.tileY === pacman.tileY) {
            gameOver = true;
        }
        return true; // Redraw screen
    }
    // Simple Ghost Intelligence: Picks whichever direction gets closer to Pac-Man
    moveGhostTowardPacman() {
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 }, // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 } // Right
        ];
        let bestDir = null;
        let shortestDistance = Infinity;
        for (let dir of directions) {
            let checkX = ghost.tileX + dir.x;
            let checkY = ghost.tileY + dir.y;
            if (!isWall(checkX, checkY)) {
                // Distance formula between ghost's next step and Pac-Man
                let dist = Math.hypot(checkX - pacman.tileX, checkY - pacman.tileY);
                if (dist < shortestDistance) {
                    shortestDistance = dist;
                    bestDir = dir;
                }
            }
        }
        if (bestDir) {
            ghost.tileX += bestDir.x;
            ghost.tileY += bestDir.y;
        }
    }
    checkWinCondition() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (MAZE[r][c] === 0) return; // Still dots left
            }
        }
        gameWon = true;
    }
    // ==========================================
    // 4. DRAW EVERYTHING ON THE SCREEN
    // ==========================================
    draw(renderer) {
        // Draw the maze
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let tileType = MAZE[r][c];
                if (tileType === 1) {
                    // Blue wall square
                    renderer.setColor("#1919A6");
                    renderer.fillRect(c * TILE, r * TILE, TILE, TILE);
                } else if (tileType === 0) {
                    // Small yellow dot
                    renderer.setColor("#FFB897");
                    renderer.fillRect(c * TILE + 6, r * TILE + 6, 4, 4);
                }
            }
        }
        // Draw Pac-Man (Yellow circle)
        renderer.setColor("#FFFF00");
        renderer.fillArc(
            pacman.tileX * TILE + TILE / 2,
            pacman.tileY * TILE + TILE / 2,
            TILE / 2 - 1,
            0,
            Math.PI * 2
        );
        // Draw Ghost (Red square)
        renderer.setColor("#FF0000");
        renderer.fillRect(ghost.tileX * TILE + 1, ghost.tileY * TILE + 1, TILE - 2, TILE - 2);
        // Draw Score
        renderer.setColor("#FFFFFF");
        renderer.getContext().font = "14px Arial";
        renderer.getContext().fillText(`SCORE: ${score}`, 10, ROWS * TILE + 20);
        // Draw Game Over or Victory message
        if (gameOver) {
            renderer.setColor("#FF0000");
            renderer.getContext().font = "22px Arial";
            renderer.getContext().fillText("GAME OVER!", 80, ROWS * TILE / 2);
        } else if (gameWon) {
            renderer.setColor("#00FF00");
            renderer.getContext().font = "22px Arial";
            renderer.getContext().fillText("YOU WIN!", 90, ROWS * TILE / 2);
        }
        // Draw the coordinates on the second canvas
        const coords = document.getElementById("coords").getContext("2d");
        coords.clearRect(0, 0, 200, 60);
        coords.fillStyle = "#FFFFFF";
        coords.font = "14px Arial";
        coords.fillText("Pac-Man: x " + pacman.tileX + ", y " + pacman.tileY, 10, 20);
        coords.fillText("Ghost: x " + ghost.tileX + ", y " + ghost.tileY, 10, 45);
    }
}

export default PacmanScreen;
