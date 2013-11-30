function BotVillage(population_size, game_info) {
    var population_size = population_size;
    var max_score = game_info.max_score;
    var max_damage_allowed = game_info.max_damage_allowed;
    var risk_map_size = max_score + Math.abs(max_damage_allowed) + 10;

    var bots = Array(population_size);
    var dir_name = ['up', 'down', 'left', 'right'];

    this.initBots = function() {
        for(var i = 0; i < population_size; i++) {
            // create a risk map
            var cur_risk_map = Array(risk_map_size);
            for(var j=0; j < risk_map_size; j++) {
                cur_risk_map[j] = getRandNum(0, game_info.worst_damage);
            }

            var init_param = {
                lefty: getRandNum(0,1) == 0,
                risk_map: cur_risk_map,
                init_dir: dir_name[getRandNum(0, dir_name.length-1)]
            }
            bots[i] = new Bot(game_info, init_param);
        }
    }

    this.simulateOneGeneration = function() {
        var best_path, best_score;
        for(var i = 0; i < population_size; i++) {
            // TODO: update best_score and best_path
            // TODO: based on best_score value
            best_path = bots[i].exploreTheBoard();
        }
        return best_path;
    }

    this.breedCrossOver = function() {

    }

    this.breedMutation = function() {

    }

    this.breedNextGeneration = function() {
        this.breedCrossOver();
        this.breedMutation();

    }


}


function Bot(game_info, init_param) {

//    var scan_range = getRandNum(1, game_info.ability_limit - 2);
    var scan_range = 10;
    var max_move = game_info.ability_limit - scan_range;
    var change_freq = getRandNum(1, game_info.max_change_interval);
    var max_damage_allowed = game_info.max_damage_allowed;
    var board_builder = game_info.board;
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
        up: [-1,0],
        down: [1,0],
        left: [0, -1],
        right: [0, 1]
    }

    // Returns the direction where turned left from cur_dir
    this.getLeft = function(cur_dir) {
        var res;
        switch(cur_dir) {
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
    this.getRight = function(cur_dir) {
        var res;
        switch(cur_dir) {
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
        while(!found_valid) {
            next_row = cur_row + dir_map[next_dir][0];
            next_col = cur_col + dir_map[next_dir][1];

            if(this.isValidCoord(next_row, next_col)) {
                found_valid = true;
            } else {
                if(is_lefty) {
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
    this.getDist = function(row_t, col_t) {
        return Math.sqrt(Math.pow(cur_row - row_t, 2) + Math.pow(cur_col - col_t, 2)  );
    }

    this.isValidCoord = function(row, col) {
        return 0 <= row && row < board_height && 0 <= col && col < board_width;
    }

    // A direction toward (row_t, col_t) form the current bot's position
    this.getDirection = function(row_t, col_t) {
        if(cur_row == row_t && cur_col == col_t) {
            console.log("Invalid argument given to getDirection");
            return;
        }
        if(row_t < cur_row) return "up";
        if(row_t > cur_row) return "down";
        if(col_t < cur_col) return "left";
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
        if( moves_before_change == 0) {
            moves_before_change = change_freq;
            cur_dir = is_lefty ? this.getLeft(cur_dir) : this.getRight(cur_dir);
        }

        // see if there is any gold
        var found_gold = false;
        var gold_row = -1;
        var gold_col = -1;
        for(var row = Math.max(0, cur_row - scan_range); row < Math.min(board_height-1, cur_row + scan_range); row++) {
            for(var col = Math.max(0, cur_col - scan_range); col < Math.min(board_width-1, cur_col + scan_range); col++) {
                if(board[row][col].getType() == elm_set.gold.type) {
                    // go to the closet gold
                    if(!found_gold) {
                        found_gold = true;
                        gold_row = row;
                        gold_col = col;
                    } else if(this.getDist(row,col) < this.getDist(gold_row, gold_col)) {
                        gold_row = row;
                        gold_col = col;
                    }
                }
            }
        }

        if(found_gold) {
            if(gold_row == cur_row && gold_col == cur_col) {
                score += elm_set.gold.value;
            } else {
                cur_dir = this.getDirection(gold_row, gold_col);
            }

        }

        // get next coordinates
        var next_move = this.getNextCoord();

        // TODO: check if the next move will result in stepping into a threat
        var next_row = next_move.next_row;
        var next_col = next_move.next_col;
        var threat = 0;


        // we are stepping into a threat that is more than we want to handle
        if(threat > this.getRiskThreshold()) {
            // try different location if possible
            if(is_lefty) cur_dir = this.getLeft(cur_dir);
            else this.getRight(cur_dir);
            next_move = this.getNextCoord();
        } else {

        }

        // update the current position
        cur_row = next_move.next_row;
        cur_col = next_move.next_col;
        cur_dir = next_move.next_dir;

        moves_before_change--;
    }


    this.exploreTheBoard = function() {
        var paths = Array();
        console.log("Exploring the board....");

        for(var i = 0; i < max_move; i ++) {
            this.makeAMove();
            board_builder.updateBoard(cur_row, cur_col, cur_dir);
            paths.push([cur_row, cur_col]);
        }
        console.log("Finished the exploration!");
        return paths;
    }
}