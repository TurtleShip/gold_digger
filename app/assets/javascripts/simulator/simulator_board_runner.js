function BoardRunner(board_width, board_height, gold_total, mine_total, enemy_total) {

    var board;
    var direction = new Direction(); // helps with directions
    var dir_map = direction.getDirMap();

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

    // maximum and minimum number of frequency where enemy change direction
    // change below values to change the behavior of enemies
    var min_change_freq = 3;
    var max_change_freq = 10;

    // make a deep copy of BoardRunner
    this.clone = function() {

        var new_board_runner = new BoardRunner(board_width, board_height, gold_total, mine_total, enemy_total);
        var new_board = new Array(board_height);
        var i,j;
        for (i = 0; i < board_height; i++) {
            new_board[i] = new Array(board_width);
        }
        for( i = 0; i < board_height; i++) {

            for(j=0; j < board_width; j++) {
                new_board[i][j] = board[i][j].clone();
            }
        }
        new_board_runner.setBoard(new_board);
        return new_board_runner;
    };

    // getter and setter methods
    this.getWidth = function() {
        return board_width;
    };

    this.getHeight = function() {
        return board_height;
    };

    this.getElementSettings = function() {
        return element_settings;
    };

    this.getBoard = function () {
        return board;
    };

    this.setBoard = function (new_board) {
        board = new_board;
    };
    // end of getter and setter methods


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

        var bot = new Piece(element_settings.bot.type, direction.getRandDir(), element_settings.bot.color);
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

    this.isValidCoord = function (row, col) {
        return 0 <= row && row < board_height && 0 <= col && col < board_width;
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
                next_dir = direction.getLeft(next_dir);
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
                    case element_settings.empty.type:
                    case element_settings.bot.type:
                        break;
                    case element_settings.gold.type:
                    case element_settings.mine.type:
                        // do NOT override enemies
                        if(board[r][c].getType() != element_settings.enemy.type) {
                            board[r][c] = prev_board[r][c];
                        }
                        break;
                    case element_settings.enemy.type:
                        var old_enemy = prev_board[r][c];
                        if(old_enemy.getTotalMove() % old_enemy.getChangeFreq() == 0) {
                            old_enemy.setDir(direction.getRandDirDiff(old_enemy.getDir()));
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