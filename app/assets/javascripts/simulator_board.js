function Piece(type, dir, color) {
    var type = type;
    var dir = dir;
    var color = color;
    var change_freq;
    var total_move = 0;

    this.getType = function () {
        return type;
    }

    this.setDir = function (new_dir) {
        dir = new_dir;
    }

    this.getDir = function () {
        return dir;
    }

    this.getColor = function () {
        return color;
    }

    this.getChangeFreq = function() {
        return change_freq;
    }

    this.setChangeFreq = function(new_change_freq) {
        change_freq = new_change_freq;
    }

    this.getTotalMove = function() {
        return total_move;
    }

    this.setTotalMove = function(new_total_move) {
        total_move = new_total_move;
    }

    this.clone = function() {
        var new_piece = new Piece(type,dir,color);
        new_piece.setChangeFreq(change_freq);
        return new_piece;
    }
}


function Board(board_width, board_height, gold_total, mine_total, enemy_total) {

    var board;

    var dir_name = ["up", "down", "left", "right"];
    var dir_map = {
        up: [-1, 0],
        down: [1, 0],
        left: [0, -1],
        right: [0, 1]
    };

    var element_settings = {
        empty: {
            type: 'empty',
            color: 'Gainsboro'
        },
        bot: {
            type: "bot",
            color: 'green'
        },
        gold: {
            type: "gold",
            color: "yellow",
            value: 10
        },
        mine: {
            type: "mine",
            color: "red",
            damage: 5

        },
        enemy: {
            type: "enemy",
            color: "blue",
            damage: 10
        }
    };

    // maximum and minimum number of frequency where enemy change direciton
    // change below values to change the behavior of enemies
    var min_change_freq = 3;
    var max_change_freq = 10;

    this.clone = function() {
        var new_board_builder = new Board(board_width, board_height, gold_total, mine_total, enemy_total);
        var new_board = new Array(board_height);
        var i,j;
        for (i = 0; i < board_height; i++) {
            new_board[i] = new Array(board_width);
        }
        for(i=0; i < board_height; i++) {
            for(j=0; j < board_width; j++) {
                new_board[i][j] = board[i][j].clone();
            }
        }
        new_board_builder.setBoard(new_board);

        return new_board_builder;
    };

    this.getWidth = function() {
        return board_width;
    };

    this.getHeight = function() {
        return board_height;
    };

    this.getElementSettings = function() {
        return element_settings;
    };

    this.getRandCoord = function () {
        return [getRandNum(0, board_height - 1), getRandNum(0, board_width - 1)];
    };

    this.putElement = function (coord, piece) {
        board[coord[0]][coord[1]] = piece;
    };

    this.putElementRandom = function (elm_type) {
        var found = false;
        while (!found) {
            var coord = this.getRandCoord();
            if (board[coord[0]][coord[1]].getType() == element_settings.empty.type) {
                board[coord[0]][coord[1]] = new Piece(elm_type, this.getRandDir(), element_settings[elm_type].color);
                if(elm_type == element_settings.enemy.type) {
                    board[coord[0]][coord[1]].setChangeFreq(getRandNum(min_change_freq,max_change_freq));
                }
                found = true;
            }
        }
    };

    // get random direction
    this.getRandDir = function () {
        return dir_name[getRandNum(0, dir_name.length - 1)];
    };

    // get random direction that doesn't equal to the given direction
    this.getRandDirDiff = function(cur_dir) {
        var new_dir = cur_dir;
        while(new_dir == cur_dir) {
            new_dir = this.getRandDir();
        }
        return new_dir;

    }

    this.emptyBoard = function () {
        for (var row = 0; row < board_height; row++) {
            for (var col = 0; col < board_width; col++) {
                board[row][col] = new Piece(element_settings.empty.type, "nowhere", element_settings.empty.color);
            }
        }
    };

    this.initBoard = function () {
        board = new Array(board_height);
        var i;
        for (i = 0; i < board_height; i++) {
            board[i] = new Array(board_width);
        }

        this.emptyBoard();

        var bot = new Piece(element_settings.bot.type, this.getRandDir(), element_settings.bot.color);
        this.putElement([0, 0], bot);

        for (i = 0; i < gold_total; i++) {
            this.putElementRandom(element_settings.gold.type);
        }

        for (i = 0; i < mine_total; i++) {
            this.putElementRandom(element_settings.mine.type);
        }

        for (i = 0; i < enemy_total; i++) {
            this.putElementRandom(element_settings.enemy.type);
        }
    };

    this.getBoard = function () {
        return board;
    };

    this.setBoard = function (new_board) {
        board = new_board;
    };

    this.isValidCoord = function (row, col) {
        return 0 <= row && row < board_height && 0 <= col && col < board_width;
    };

    this.getLeft = function (cur_dir) {
        var res;
        switch (cur_dir) {
            case 'up':
                res = 'left';
                break;
            case 'left':
                res = 'down';
                break;
            case 'down':
                res = 'right';
                break;
            case 'right':
                res = 'up';
        }
        return res;
    };


    // Get next valid coordinate where the given enemy can move to
    this.getNextCoord = function (cur_row, cur_col, cur_dir) {
        var found_valid = false;
        var next_row, next_col;
        var next_dir = cur_dir;
        while (!found_valid) {
            next_row = cur_row + dir_map[next_dir][0];
            next_col = cur_col + dir_map[next_dir][1];

            if (this.isValidCoord(next_row, next_col)) {
                found_valid = true;
            } else {
                next_dir = this.getLeft(next_dir);
            }
        }

        return {
            next_row: next_row,
            next_col: next_col,
            next_dir: next_dir
        };
    };


    this.updateBoard = function (bot_row, bot_col, bot_dir) {
        var prev_board = board.clone();
        this.emptyBoard();

        // move other pieces
        for (var r = 0; r < board_height; r++) {
            for (var c = 0; c < board_width; c++) {
                switch (prev_board[r][c].getType()) {
                    case "empty":
                    case "bot":
                        break;
                    case "gold":
                    case "mine":
                        // do NOT override enemies
                        if(board[r][c].getType() != element_settings.enemy.type) {
                            board[r][c] = prev_board[r][c];
                        }
                        break;
                    case "enemy":
                        var old_enemy = prev_board[r][c];
                        if(old_enemy.getTotalMove() % old_enemy.getChangeFreq() == 0) {
                            old_enemy.setDir(this.getRandDirDiff(old_enemy.getDir()));
                        }
                        var next_move = this.getNextCoord(r,c,old_enemy.getDir());
                        var new_enemy =
                            new Piece(element_settings.enemy.type, next_move["next_dir"],element_settings.enemy.color);
                        new_enemy.setChangeFreq((old_enemy.getChangeFreq()));
                        new_enemy.setTotalMove(old_enemy.getTotalMove()+1);
                        board[next_move["next_row"]][next_move["next_col"]] = new_enemy;
                        break;
                }
            }
        }

        board[bot_row][bot_col] = new Piece(element_settings.bot.type, bot_dir, element_settings.bot.color);
    };
}