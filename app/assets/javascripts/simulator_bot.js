function BotVillage(new_population_size, game_info) {
    var population_size = new_population_size;
    var max_score = game_info.max_score;
    var max_damage_allowed = game_info.max_damage_allowed;
    var risk_map_size = max_score + Math.abs(max_damage_allowed) + 10;

    var worst_damage = game_info.worst_damage;
    var mutation_rate = 0.2;
    var cur_gen = new Array(population_size);
    var dir_name = ['up', 'down', 'left', 'right'];

    this.initBots = function () {
        for (var i = 0; i < population_size; i++) {
            // create a risk map
            var cur_risk_map = new Array(risk_map_size);
            for (var j = 0; j < risk_map_size; j++) {
                cur_risk_map[j] = getRandNum(0, worst_damage);
            }

            var init_param = {
                lefty: getRandNum(0, 1) == 0,
                risk_map: cur_risk_map,
                init_dir: dir_name[getRandNum(0, dir_name.length - 1)]
            };
            cur_gen[i] = new Bot(game_info, init_param);
        }
    };

    // sort bots in descending order by score
    this.descendingBotSort = function (bot1, bot2) {
        return bot2.getScore() - bot1.getScore();
    };

    this.simulateOneGeneration = function () {

        var sum_score = 0, survivors = 0;

        // Let the current generation explore the board
        for (var i = 0; i < population_size; i++) {
            cur_gen[i].exploreTheBoard();
            sum_score += cur_gen[i].getScore();
            survivors += (cur_gen[i].getIsAlive()) ? 1 : 0;
        }

        cur_gen.sort(this.descendingBotSort);

        return {
            best_path: cur_gen[i].getPath(),
            best_score: cur_gen[i].getScore(),
            avg_score: (sum_score / population_size),
            survival_rate: 1 - (survivors / population_size)
        };
    };

    this.shouldMutate = function () {
        return Math.random() <= mutation_rate;
    };

    this.breedNextGeneration = function() {

        var best_bot = cur_gen[0];
        var second_bot = (cur_gen.length == 1) ? cur_gen[0] : cur_gen[1]; // second best bot
        var gene_interval = Math.floor(risk_map_size / population_size) * 2;

        cur_gen = [];

        for(var t=0; t < 2; t++) {
            var main_bot, support_bot, start, end, gene_from_main;
            if( t == 0 ) {
                // The first half of population is primarily based on the best bot
                main_bot = best_bot;
                support_bot = second_bot;
                start = 0;
                end = population_size / 2;
                gene_from_main = gene_interval;

            } else {
                // The second half of population is primarily based on the best bot
                main_bot = second_bot;
                support_bot = best_bot;
                start = population_size / 2;
                end = population_size;
                gene_from_main = gene_interval;
            }

            for (var i = start; i < end; i++) {
                var new_risk_map = new Array(risk_map_size);

                // Fill in risk map
                for (var j = 0; j < gene_from_main; j++) {
                    new_risk_map[j] =
                        this.shouldMutate() ? getRandNum(0, worst_damage) : main_bot.getRiskMap()[j];
                }

                for (var j = gene_from_main; j < risk_map_size; j++) {
                    new_risk_map[j] =
                        this.shouldMutate() ? getRandNum(0, worst_damage) : support_bot.getRiskMap()[j];
                }
                var init_param = {
                    lefty: getRandNum(0, 1) == 0,
                    risk_map: new_risk_map,
                    init_dir: dir_name[getRandNum(0, dir_name.length - 1)]
                };

                var child = new Bot(game_info, init_param);

                // apply mutation probability for each gene
                if(!this.shouldMutate()) {
                    child.setScanRange(main_bot.getScanRange());
                    child.setMaxMove(main_bot.getMaxMove());
                }
                if(!this.shouldMutate()) child.setChangeFreq(main_bot.getChangeFreq());
                if(!this.shouldMutate()) child.setIsLefty(main_bot.getIsLefty());
                if(!this.shouldMutate()) child.setInitDir(main_bot.getInitdir());

                cur_gen.push(child);
                gene_from_main += gene_interval;
            }
        }
    }
}

function Bot(game_info, init_param) {


    var scan_range = getRandNum(1, game_info.ability_limit - 2);
    var max_move = game_info.ability_limit - scan_range;
    var change_freq = getRandNum(1, game_info.max_change_interval);
    var max_damage_allowed = game_info.max_damage_allowed;
    var board_builder = game_info.board.clone();
    var board;
    var board_width = board_builder.getWidth();
    var board_height = board_builder.getHeight();
    var elm_set = board_builder.getElementSettings();
    var paths;
    var is_lefty = init_param.lefty;
    var risk_map = init_param.risk_map;
    var init_dir = init_param.init_dir;
    var cur_dir = init_dir;


    var moves_before_change = change_freq;

    var score = 0;
    var cur_row = 0;
    var cur_col = 0;
    var is_alive = true;

    var dir_map = {
        up: [-1, 0],
        down: [1, 0],
        left: [0, -1],
        right: [0, 1]
    };

    // Getter and setter methods
    this.getScanRange = function () {
        return scan_range;
    };
    this.setScanRange = function (new_scan_range) {
        scan_range = new_scan_range;
    };
    this.getMaxMove = function () {
        return max_move;
    };
    this.setMaxMove = function (new_max_move) {
        max_move = new_max_move;
    };
    this.getChangeFreq = function () {
        return change_freq;
    };
    this.setChangeFreq = function (new_change_freq) {
        change_freq = new_change_freq;
    };
    this.getIsLefty = function () {
        return is_lefty;
    };
    this.setIsLefty = function (new_is_lefty) {
        is_lefty = new_is_lefty;
    };
    this.getScore = function () {
        return score;
    };
    this.getPath = function() {
        return paths;
    };
    this.getIsAlive = function() {
        return is_alive;
    };
    this.getRiskMap = function() {
        return risk_map;
    };
    this.getInitdir = function() {
        return init_dir;
    };
    this.setInitDir = function(new_init_dir) {
        init_dir = new_init_dir;
        cur_dir = init_dir;
    };

    // Returns the direction where turned left from cur_dir
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

    // Return the direction when turned right form cur_dir
    this.getRight = function (cur_dir) {
        var res;
        switch (cur_dir) {
            case 'up':
                res = 'right';
                break;
            case 'right':
                res = 'down';
                break;
            case 'down':
                res = 'left';
                break;
            case 'left':
                res = 'up';
                break;
        }
        return res;
    };

    this.getRiskThreshold = function () {
        return risk_map[score - max_damage_allowed];
    };

    // Get next valid coordinate where the bot can move to
    this.getNextCoord = function () {
        var found_valid = false;
        var next_row, next_col;
        var next_dir = cur_dir;
        while (!found_valid) {
            next_row = cur_row + dir_map[next_dir][0];
            next_col = cur_col + dir_map[next_dir][1];

            if (this.isValidCoord(next_row, next_col)) {
                found_valid = true;
            } else {
                if (is_lefty) {
                    next_dir = this.getLeft(next_dir);
                    moves_before_change = change_freq;
                } else {
                    next_dir = this.getRight(next_dir);
                    moves_before_change = change_freq;
                }
            }
        }

        return {
            next_row: next_row,
            next_col: next_col,
            next_dir: next_dir
        };
    };

    // get distance to (row_t, col_t) from the current bot's position
    this.getDist = function (row_t, col_t) {
        return Math.sqrt(Math.pow(cur_row - row_t, 2) + Math.pow(cur_col - col_t, 2));
    };

    this.isValidCoord = function (row, col) {
        return 0 <= row && row < board_height && 0 <= col && col < board_width;
    };

    // A direction toward (row_t, col_t) form the current bot's position
    this.getDirection = function (row_t, col_t) {
        if (cur_row == row_t && cur_col == col_t) {
            console.log("Invalid argument given to getDirection");
            return "Invalid";
        }
        if (row_t < cur_row) return "up";
        if (row_t > cur_row) return "down";
        if (col_t < cur_col) return "left";
        return "right";
    };

    this.makeAMove = function () {

        // Check if this bot is broken
        if (score < max_damage_allowed) {
            is_alive = false;
            return;
        }

        // get current board
        board = board_builder.getBoard();

        // check if bot needs to change direction
        if (moves_before_change == 0) {
            moves_before_change = change_freq;
            cur_dir = is_lefty ? this.getLeft(cur_dir) : this.getRight(cur_dir);
        }

        // see if there is any gold
        var found_gold = false;
        var gold_row = -1;
        var gold_col = -1;
        for (var row = Math.max(0, cur_row - scan_range); row < Math.min(board_height - 1, cur_row + scan_range); row++) {
            for (var col = Math.max(0, cur_col - scan_range); col < Math.min(board_width - 1, cur_col + scan_range); col++) {
                if (row == cur_row && col == cur_col) continue;
                if (board[row][col].getType() == elm_set.gold.type) {
                    // go to the closet gold
                    if (!found_gold) {
                        found_gold = true;
                        gold_row = row;
                        gold_col = col;
                    } else if (this.getDist(row, col) < this.getDist(gold_row, gold_col)) {
                        gold_row = row;
                        gold_col = col;
                    }
                }
            }
        }

        // follow gold if it is within the scan range
        if (found_gold) {
            cur_dir = this.getDirection(gold_row, gold_col);
        }

        // get next coordinates
        var next_move = this.getNextCoord();

        // check if the next move will result in stepping into a threat
        var next_row = next_move.next_row;
        var next_col = next_move.next_col;
        var next_piece = board[next_row][next_col];
        var threat = 0;

        switch(next_piece.getType()) {
            case elm_set.mine.type:
                threat = elm_set.mine.damage;
                break;
            case elm_set.enemy.type:
                threat = elm_set.enemy.damage;
                break;
        }

        // we are stepping into a threat that is more than we want to handle
        if (threat > this.getRiskThreshold()) {
            // try different location if possible
            if (is_lefty) cur_dir = this.getLeft(cur_dir);
            else cur_dir = this.getRight(cur_dir);
            next_move = this.getNextCoord();
        }

        // update the current position
        cur_row = next_move.next_row;
        cur_col = next_move.next_col;
        cur_dir = next_move.next_dir;

        // update the score
        var stepped_piece = board[cur_row][cur_col];
        switch(stepped_piece.getType()) {
            case elm_set.gold.type:
                score += elm_set.gold.value;
                break;
            case elm_set.mine.type:
                score -= elm_set.mine.damage;
                break;
            case elm_set.enemy.type:
                score -= elm_set.enemy.damage;
                break;
            case elm_set.empty.type:
                break;
            default:
                console.log("Unrecognized type " + stepped_piece.getType() + " in MakeAMove");
        }

        moves_before_change--;
    };


    this.exploreTheBoard = function () {
        paths = [];
        console.log("Exploring the board....");

        for (var i = 0; i < max_move; i++) {
            this.makeAMove();
            board_builder.updateBoard(cur_row, cur_col, cur_dir);
            paths.push([cur_row, cur_col]);
        }

        console.log("Finished the exploration!");
    };
}