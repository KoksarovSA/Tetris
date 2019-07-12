class Game {
    static points = {
        '1': 40,
        '2': 100,
        '3': 300,
        '4': 1200
    };
    static stateGame = 0;
    score = 0;
    lines = 0;
    playfield = this.createPlayfield(); //Массив игрового поля
    activePiece = this.createPiece(); //Активная фигура
    nextPiece = this.createPiece(); //Следующая фигура

    get level() {
        return Math.floor(this.lines * 0.1);
    }

    //Метод создаёт игровое поле(массив) и добавляет на него активную фигуру(массив) по её координате, возвращает игровое поле(массив)
    getState() {
        const playfield = this.createPlayfield();
        const { y: pieceY, x: pieceX, blocks } = this.activePiece;

        for (let y = 0; y < this.playfield.length; y++) {
            playfield[y] = [];
            for (let x = 0; x < this.playfield[y].length; x++) {
                playfield[y][x] = this.playfield[y][x];
            }
        }
        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if (blocks[y][x]) {
                    playfield[pieceY + y][pieceX + x] = blocks[y][x];
                }
            }
        }
        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            nextPiece: this.nextPiece,
            playfield
        };
    }

    //Метод создаёт и возвращает пустое игровое поле(массив)
    createPlayfield() {
        const playfield = [];
        for (let y = 0; y < 20; y++) {
            playfield[y] = [];
            for (let x = 0; x < 10; x++) {
                playfield[y][x] = 0;
            }
        }
        return playfield;
    }

    //Метод создаёт и возвращает рандомную фигуру(массив) с её начальными координатами
    createPiece() {
        const index = Math.floor(Math.random() * 7);
        const type = 'IJLOSTZ'[index];
        const piece = {};
        switch (type) {
            case 'I':
                piece.blocks = [
                    [0, 0, 0, 0],
                    [1, 1, 1, 1],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 'J':
                piece.blocks = [
                    [0, 0, 0],
                    [2, 2, 2],
                    [0, 0, 2]
                ];
                break;
            case 'L':
                piece.blocks = [
                    [0, 0, 0],
                    [3, 3, 3],
                    [3, 0, 0]
                ];
                break;
            case 'O':
                piece.blocks = [
                    [0, 0, 0, 0],
                    [0, 4, 4, 0],
                    [0, 4, 4, 0],
                    [0, 0, 0, 0]
                ];
                break;
            case 'S':
                piece.blocks = [
                    [0, 0, 0],
                    [0, 5, 5],
                    [5, 5, 0]
                ];
                break;
            case 'T':
                piece.blocks = [
                    [0, 0, 0],
                    [6, 6, 6],
                    [0, 6, 0]
                ];
                break;
            case 'Z':
                piece.blocks = [
                    [0, 0, 0],
                    [7, 7, 0],
                    [0, 7, 7]
                ];
                break;
            default:
                throw new Error('Неизвестный тип фигуры');
        }
        piece.x = Math.floor((10 - piece.blocks[0].length) / 2);
        piece.y = -1;
        return piece;
    }

    //Метод перемещает активную фигуру по игровому полю влево
    movePieceLeft() {
        this.activePiece.x -= 1;
        if (this.hasCollision()) {
            this.activePiece.x += 1;
        }
    }

    //Метод перемещает активную фигуру по игровому полю вправо
    movePieceRight() {
        this.activePiece.x += 1;
        if (this.hasCollision()) {
            this.activePiece.x -= 1;
        }
    }
    //Метод перемещает активную фигуру по игровому полю вниз
    movePieceDown() {
        this.activePiece.y += 1;
        if (this.hasCollision()) {
            this.activePiece.y -= 1;
            this.lockPiece();
            const clearLines = this.clearLines();
            this.updateScore(clearLines);
            this.updatePieces();
            if (this.hasGameOver()) {               
                return true;
            }
            else {
                return false;
            }
        }
    }

    //Метод вызывает вращение фигуры по часовой стрелке, если возникает коллизия возвращает обратно
    rotatePiece() {
        this.rotationBlocks();
        if (this.hasCollision()) {
            this.rotationBlocks(false);
        }
    }

    //Метод вращает фигуру
    rotationBlocks(clockwise = true) {
        const blocks = this.activePiece.blocks;
        const length = blocks.length;
        const temp = [];
        for (let i = 0; i < length; i++) {
            temp[i] = new Array(length).fill(0);
        }
        if (clockwise) {
            for (let y = 0; y < length; y++) {
                for (let x = 0; x < length; x++) {
                    temp[x][y] = blocks[length - 1 - y][x];
                }
            }
        }
        else {
            for (let y = 0; y < length; y++) {
                for (let x = 0; x < length; x++) {
                    temp[x][y] = blocks[y][length - 1 - x];
                }
            }
        }

        this.activePiece.blocks = temp;
        if (this.hasCollision()) {
            this.activePiece.blocks = blocks;
        }
    }
    //Метод проверки коллизий, возвращает false если фигура вышла за края массива
    hasCollision() {
        const { y: pieceY, x: pieceX, blocks } = this.activePiece;
        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if (blocks[y][x] &&
                    ((this.playfield[pieceY + y] === undefined || this.playfield[pieceY + y][pieceX + x] === undefined) || this.playfield[pieceY + y][pieceX + x])) {
                    return true;
                }
            }
        }
        return false;
    }

    //метод фиксирует фигуру на поле, вызывается при достижении нижней границы игрового поля
    lockPiece() {
        const { y: pieceY, x: pieceX, blocks } = this.activePiece;

        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if (blocks[y][x]) {
                    this.playfield[pieceY + y][pieceX + x] = blocks[y][x];
                }
            }
        }
    }

    //Метод меняет активную фигуру на следующую, создаёт новую следующую фигуру
    updatePieces() {
        this.activePiece = this.nextPiece;
        this.nextPiece = this.createPiece();
    }

    //Метод обновляет очки в зависимости от уровня и количества удалёных линий
    updateScore(clearedLines) {
        if (clearedLines > 0) {
            this.score += Game.points[clearedLines] * (this.level + 1);
            this.lines += clearedLines;
        }
    }

    //Метод отчистки заполненной линии
    clearLines() {
        const rows = 20;
        const columns = 10;
        let lines = [];
        for (let y = rows - 1; y >= 0; y--) {
            let numberOfBlocks = 0;
            for (let x = 0; x < columns; x++) {
                if (this.playfield[y][x]) {
                    numberOfBlocks += 1;
                }
            }
            if (numberOfBlocks === 0) {
                break;
            }
            else if (numberOfBlocks < columns) {
                continue;
            }
            else if (numberOfBlocks === columns) {
                lines.unshift(y);
            }
        }
        for (let index of lines) {
            this.playfield.splice(index, 1);
            this.playfield.unshift(new Array(columns).fill(0));
        }
        return lines.length;
    }

    hasGameOver() {

        for (let x = 0; x < this.playfield[1].length; x++) {
            if (this.playfield[1][x]) {
                return true;
            }
        }
        return false;
    }
}


class View {
    static colors = {
        '1': 'cyan',
        '2': 'blue',
        '3': 'orange',
        '4': 'yellow',
        '5': 'green',
        '6': 'purple',
        '7': 'red'
    }
    constructor(element, width, height, rows, columns) {
        this.element = element;
        this.width = width;
        this.height = height;

        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.context = this.canvas.getContext('2d');

        this.playfieldBorderWidth = 4;
        this.playfieldX = this.playfieldBorderWidth;
        this.playfieldY = this.playfieldBorderWidth;
        this.playfieldWidth = this.width * 2 / 3;
        this.playfieldHeight = this.height;
        this.playfieldInnerWidth = this.playfieldWidth - this.playfieldBorderWidth * 2;
        this.playfieldInnerHeight = this.playfieldHeight - this.playfieldBorderWidth * 2;

        this.panelX = this.playfieldWidth + 10;
        this.panelY = 0;
        this.panelWidth = this.width / 3;
        this.panelHeight = this.height;

        this.blockWidth = this.playfieldInnerWidth / columns;
        this.blockHeight = this.playfieldInnerHeight / rows;

        this.element.appendChild(this.canvas);
    }

    //Метод отчищает экран и запускает отрисовку фигуры на игровом поле, в качестве параметра принимает массив игрового поля
    renderMainScreen(state) {
        this.clearScreen();
        this.renderPlayfield(state);
        this.renderPanel(state);
    }

    //Метод отрисовывает фигуру на игровом поле по параметру массива игрового поля
    renderPlayfield({ playfield }) {
        this.clearScreen();
        for (var y = 0; y < playfield.length; y++) {
            for (var x = 0; x < playfield[y].length; x++) {
                const block = playfield[y][x];
                if (block) {
                    this.renderBlock(
                        this.playfieldX + (x * this.blockWidth),
                        this.playfieldY + (y * this.blockHeight),
                        this.blockWidth,
                        this.blockHeight,
                        View.colors[block]
                    );
                }
            }
        }
        this.context.strokeStyle = 'white';
        this.context.lineWidth = this.playfieldBorderWidth;
        this.context.strokeRect(0, 0, this.playfieldWidth, this.playfieldHeight);
    }


    renderPanel({ level, score, lines, nextPiece }) {
        this.context.textAlign = 'start';
        this.context.textBaseline = 'top';
        this.context.fillStyle = 'white';
        this.context.font = '14px "Press Start 2P"';

        this.context.fillText(`Level: ${level}`, this.panelX, this.panelY + 0);
        this.context.fillText(`Score: ${score}`, this.panelX, this.panelY + 24);
        this.context.fillText(`Lines: ${lines}`, this.panelX, this.panelY + 48);
        this.context.fillText(`Next: `, this.panelX, this.panelY + 96);

        for (var y = 0; y < nextPiece.blocks.length; y++) {
            for (var x = 0; x < nextPiece.blocks[y].length; x++) {
                const block = nextPiece.blocks[y][x];
                if (block) {
                    this.renderBlock(
                        this.panelX + 80 + (x * this.blockWidth * 0.5),
                        this.panelY + 70 + (y * this.blockHeight * 0.5),
                        this.blockWidth * 0.5,
                        this.blockHeight * 0.5,
                        View.colors[block])
                }
            }
        }
    }

    //Метод отчищает экран
    clearScreen() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    renderStartScreen() {
        this.context.fillStyle = 'white';
        this.context.font = '18px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('Press ENTER to Start', this.width / 2, this.height / 2);
    }

    renderPauseScreen() {
        this.context.fillStyle = 'rgba(0,0,0,0.75)';
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.fillStyle = 'white';
        this.context.font = '18px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('Press ENTER to resume', this.width / 2, this.height / 2);
    }

    renderGameOverScreen({ score }) {
        this.clearScreen();
        this.context.fillStyle = 'white';
        this.context.font = '18px "Press Start 2P"';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillText('GAME OVER', this.width / 2, this.height / 2 - 48);
        this.context.fillText(`Score: ${score}`, this.width / 2, this.height / 2);

    }

    //Метод создаёт блоки из которых состоит фигура
    renderBlock(x, y, width, height, color) {
        this.context.fillStyle = color;
        this.context.strokeStyle = 'black';
        this.context.lineWidth = 2;
        this.context.fillRect(x, y, width, height);
        this.context.strokeRect(x, y, width, height);
    }
}
//Привязка действий перемещения и отрисовки фигур к клавишам клавиатуры
document.addEventListener('keydown', event => {
    switch (event.keyCode) {
        case 37:
            if (Game.stateGame === 1) {
                game.movePieceLeft();
                view.renderMainScreen(game.getState());
            }
            break;
        case 38:
            if (Game.stateGame === 1) {
                game.rotatePiece();
                view.renderMainScreen(game.getState());
            }
            break;
        case 39:
            if (Game.stateGame === 1) {
                game.movePieceRight();
                view.renderMainScreen(game.getState());
            }
            break;
        case 40:
            if (Game.stateGame === 1) {
                game.movePieceDown();
                view.renderMainScreen(game.getState());
            }
            break;
        case 13:
            if (Game.stateGame === 0) { game.playfield = game.createPlayfield(); }
            if (Game.stateGame !== 1) {
                Game.stateGame = 1;                
                view.renderMainScreen(game.getState());
                this.timer = setInterval(function () {
                    if (game.movePieceDown()) {
                        view.clearScreen();
                        view.renderGameOverScreen(game.getState());
                        clearInterval(timer);
                        Game.stateGame = 0;
                    }
                    else {
                        game.movePieceDown();
                        view.renderMainScreen(game.getState());
                    }
                }, 1000 - (game.level*100));
            }
            break;
        case 80:
            if (Game.stateGame === 1) {
                Game.stateGame = 2;
                clearInterval(timer);
                view.renderPauseScreen();
            }
            break;
    }
});
const root = document.querySelector('#root');
const game = new Game();
const view = new View(root, 480, 640, 20, 10);
window.game = game;
window.view = view;
var timer;
console.log(game);
view.renderStartScreen();