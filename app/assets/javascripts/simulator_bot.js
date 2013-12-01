function BotVillage(population_size, game_info) {
    var population_size = population_size;
    var max_score = game_info.max_score;
    var max_damage_allowed = game_info.max_damage_allowed;
    var risk_map_size = max_score + Math.abs(max_damage_allowed) + 10;

    var worst_damage = game_info.worst_damage;
    var mutation_rate = 0.2;
    var bots = Array(population_size);
    var dir_name = ['up', 'down', 'left', 'right'];

    this.initBots = function () {
        for (var i = 0; i < population_size; i++) {
            // create a risk map
            var cur_risk_map = Array(risk_map_size);
            for (var j = 0; j < risk_map_size; j++) {
                cur_risk_map[j] = getRandNum(0, game_info.worst_damage);
            }

            var init_param = {
                lefty: getRandNum(0, 1) == 0,
                risk_map: cur_risk_map,
                init_dir: dir_name[getRandNum(0, dir_name.length - 1)]
            }
            bots[i] = new Bot(game_info, init_param);
        }
    }


    this.descendingBotSort = function (bot1, bot2) {
        return bot2.getScore() - bot1.getScore();
    }
    this.simulateOneGeneration = function () {
        console.log("simulating one generation");

        var botsAndPathByScore = new Array(population_size);

        var path;
        var numDead = 0;
        for (var i = 0; i < population_size; i++) {
            path = bots[i].exploreTheBoard();

            if (bots[i].score < bots[i].max_damage_allowed) {
                numDead++;
            }
            var pair = {bot: bots[i], path: path};
            botsAndPathByScore[i] = pair;
        }

        // Sort the (bot, its_path) pairs by bots' scores. Highest comes first.
        botsAndPathByScore.sort(function (pair1, pair2) {
            return pair2.bot.score - pair1.bot.score;
        });

        var result = {
            best_path: botsAndPathByScore[0].path,
            best_score: botsAndPathByScore[0].bot.score,
            survival_rate: 1 - (numDead / population_size)
        }

        return result;
    }


    this.doMutate = function (prob) {
        var ran = Math.random();
        return (ran > prob);
    }

    this.shouldMutate = function () {
        return Math.random() <= mutation_rate;
    }


    this.breedNextGenerationOld = function (topBot1, topBot2) {
        var cross_overs = Array(population_size);


        // TODO:
        var incre = Math.floor(risk_map_size / population_size) * 2;

        var increment1 = incre;
        var increment2 = incre;

        // This copies genes from bot 1.

        var topTwo = [topBot1, topBot2];

        for (var k = 0; k < topTwo.length; k++) {
            var start, end;
            var targetBot; // TODO: what is this variable doing?
            // TODO: The first half of population mutates based on the best bot
            if (k == 0) {
                start = 0;
                end = population_size / 2;
                bot1 = topBot1;
                bot2 = topBot2;
                delta = increment1;
            } else {
                // TODO: the second half of population mutates based on the second best bot
                start = population_size / 2;
                end = population_size;
                bot1 = topBot2;
                bot2 = topBot1;
                delta = increment2;
            }

            for (var i = start; i < end; i++) {

//                var game_info_dummy = {
//                    // TODO need to fill in board
//                    // board:
//                    ability_limit : 10,
//                    max_damage_allowed : 0,
//                    max_change_interval : 5
//                }

                var init_param_dummy = {
                    lefty: true,
                    risk_map: new Array(),
                    init_dir: dir_name[0]
                }

                var new_risk_map = new Array(risk_map_size);

                // TODO: factor out mutation probability as variable
                // Fill in risk map
                for (var j = 0; j < delta; j++) {
                    new_risk_map[j] =
                        this.doMutate(0.98) ? getRandNum(0, worst_damage) : bot1.risk_map[j];
                }

                for (var j = delta; j < risk_map_size; j++) {
                    new_risk_map[j] =
                        this.doMutate(0.98) ? getRandNum(0, worst_damage) : bot2.risk_map[j];
                }

//                var offspring = new Bot(game_info_dummy, init_param_dummy);
                var offspring = new Bot(game_info, init_param_dummy);

                // ability_lim is in game_info
//                var ability_lim = bot1.scan_range + bot1.max_move;

                // Features with mutation possiblity

                if (this.doMutate(0.98)) {
                    offspring.scan_range = getRandNum(1, ability_lim - 2);
                    offspring.max_move = ability_lim - offspring.scan_range;
                } else {
                    offspring.scan_range = bot1.scan_range;
                    offspring.max_move = bot1.max_move;
                }

                // TODO: Below line is making change_freq go over max_change_freq
                var mutation = Math.floor(Math.random() * 7);
                offspring.change_freq = this.doMutate(0.98) ? bot1.change_freq + mutation : bot1.change_freq;

                offspring.is_lefty = this.doMutate(0.98) ? getRandNum(0, 1) == 0 : bot1.is_lefty;

                offspring.cur_dir = this.doMutate(0.98) ? dir_name[getRandNum(0, dir_name.length - 1)] : bot1.cur_dir;


                offspring.moves_before_change = offspring.change_freq;

                offspring.max_damage_allowed = bot1.max_damage_allowed;

                offspring.risk_map = new_risk_map;

                // TODO offspring.board = TODO

                cross_overs[i] = offspring;

                delta = delta + incre;

            }

        }
        return cross_overs;
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

    var is_lefty = init_param.lefty;
    var risk_map = init_param.risk_map;
    var cur_dir = init_param.init_dir;

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
    }

    // Getter and setter methods
    this.getScanRange = function () {
        return scan_range;
    }
    this.setScanRange = function (new_scan_range) {
        scan_range = new_scan_range;
    }
    this.getMaxMove = function () {
        return max_move;
    }
    this.setMaxMove = function (new_max_move) {
        max_move = new_max_move;
    }
    this.getChangeFreq = function () {
        return change_freq;
    }
    this.setChangeFreq = function (new_change_freq) {
        change_freq = new_change_freq;
    }
    this.getIsLefty = function () {
        return is_lefty;
    }
    this.setIsLeft = function (new_is_lefty) {
        is_lefty = new_is_lefty;
    }
    this.getCurdir = function () {
        return cur_dir;
    }
    this.setCurDir = function (new_cur_dir) {
        cur_dir = new_cur_dir;
    }
    this.getScore = function () {
        return score;
    }


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
    }

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
    }

    this.getRiskThreshold = function () {
        return risk_map[score - max_damage_allowed];
    }

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
        var res = {
            next_row: next_row,
            next_col: next_col,
            next_dir: next_dir
        };
        return res;
    }

    // get distance to (row_t, col_t) from the current bot's position
    this.getDist = function (row_t, col_t) {
        return Math.sqrt(Math.pow(cur_row - row_t, 2) + Math.pow(cur_col - col_t, 2));
    }

    this.isValidCoord = function (row, col) {
        return 0 <= row && row < board_height && 0 <= col && col < board_width;
    }

    // A direction toward (row_t, col_t) form the current bot's position
    this.getDirection = function (row_t, col_t) {
        if (cur_row == row_t && cur_col == col_t) {
            console.log("Invalid argument given to getDirection");
            return;
        }
        if (row_t < cur_row) return "up";
        if (row_t > cur_row) return "down";
        if (col_t < cur_col) return "left";
        return "right";
    }

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

        // TODO: check if the next move will result in stepping into a threat
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
    }


    this.exploreTheBoard = function () {
        var paths = Array();
        console.log("Exploring the board....");

        for (var i = 0; i < max_move; i++) {
            this.makeAMove();
            board_builder.updateBoard(cur_row, cur_col, cur_dir);
            paths.push([cur_row, cur_col]);
        }
        console.log("Finished the exploration!");
        return paths;
    }
}