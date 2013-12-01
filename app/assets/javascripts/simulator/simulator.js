/**
 * Created by Seulgi on 11/30/13.
 */
function Simulator() {

    // GUI variables
    var canvas; // simulation will be drawn on this canvas
    var initial_board_runner; // The board runner that we start with
    var simulation_board_runner; // The board runner used to simulate the current generation
    var brush; // with this brush, we will paint our canvas
    var cell_size = 10; // size of each element in the board
    var board_width = 25;
    var board_height = 25;


    // variables that receive user inputs
    var user_settings = {
        gold_total: -1,
        mine_total: -1,
        enemy_total: -1,
        bot_total: -1,
        interval: -1, // determines how fast the simulation should run
        damage_allowed: -1
    };

    var gold_total_select;
    var mine_total_select;
    var enemy_total_select;
    var bot_total_select;
    var speed_select;
    var damage_allowed_select;

    var start_button;
    var pause_button;
    var stop_button;
    var create_button;
    var simulator;


    // variables to output results
    var cur_gen;
    var gen_id;
    var gen_id_show;
    var result;
    var best_path;
    var best_score_show;
    var avg_score_show;
    var survivors_show;
    var best_scan_show;
    var best_max_move_show;


    this.changeUserSettings = function(key, value) {
        console.log("Change user settings key : " + key + " , value : " + value);
        user_settings[key] = value;
    };

    this.paintCell = function(row, col, color) {
        brush.fillStyle = color;
        brush.fillRect(col * cell_size, row * cell_size, cell_size, cell_size);
    };

    this.paintBoard = function() {
        var cur_board = simulation_board_runner.getBoard();
        for (var row = 0; row < board_height; row++) {
            for (var col = 0; col < board_width; col++) {
                var element = cur_board[row][col];
                this.paintCell(row, col, element.getColor());
            }
        }
    };

    // simulate one step in a generation
    this.simulateStep = function(step_id) {
        if (step_id < best_path.length) {
            simulation_board_runner.updateBoard(best_path[step_id][0], best_path[step_id][1], "NA");
            this.paintBoard();
            var caller = arguments.callee;
            simulator = setTimeout(function () {
                caller(step_id + 1);
            }, user_settings.interval);
        } else {
            this.finishGeneration();
        }
    };

    this.startGeneration = function() {
        result = cur_gen.simulateOneGeneration();

        // show results for the current generation
        gen_id_show.text(gen_id);
        best_score_show.text(result.best_score);
        avg_score_show.text(result.avg_score);
        survivors_show.text(result.survivors + " out of " + user_settings.bot_total);

        // display path taken by the best bot of the current generation
        best_path = result.best_path;
        simulation_board_runner = initial_board_runner.clone();
        this.simulateStep(0);
    };

    this.finishGeneration = function() {
        // make next generation
        gen_id++;
        cur_gen.breedNextGeneration();
        this.startGeneration();
    };

    this.createBoard = function() {
        initial_board_runner = new BoardRunner(board_width, board_height,
            user_settings.gold_total, user_settings.mine_total, user_settings.enemy_total);
        initial_board_runner.initBoard();
        simulation_board_runner = initial_board_runner.clone();
        this.paintBoard();
    };

    this.runSimulation = function() {
        var elm_set = initial_board_runner.getElementSettings();
        var game_info = {
            board: initial_board_runner,
            max_score: elm_set.gold.value * user_settings.gold_total,
            max_damage: -(elm_set.mine.damage * user_settings.mine_total + elm_set.enemy.damage * user_settings.enemy_total),
            max_damage_allowed: user_settings.damage_allowed,
            ability_limit: 200,
            max_change_interval: 10
        };

        cur_gen = new BotVillage(user_settings.bot_total, game_info);
        cur_gen.initBots();
        this.startGeneration();
    };

    this.start = function() {
        create_button.attr('disabled', 'disabled');
        start_button.attr('disabled', 'disabled');
        pause_button.removeAttr('disabled');
        stop_button.removeAttr('disabled');
        bot_total_select.attr('disabled', 'disabled');
        speed_select.attr('disabled', 'disabled');
        this.runSimulation();
    };

    this.pause = function() {
        create_button.attr('disabled', 'disabled');
        pause_button.attr('disabled', 'disabled');
        start_button.removeAttr('disabled');
        stop_button.removeAttr('disabled');
        clearInterval(simulator);
    };

    this.stop = function() {
        create_button.removeAttr('disabled');
        start_button.attr('disabled', 'disabled');
        pause_button.attr('disabled', 'disabled');
        stop_button.attr('disabled', 'disabled');
        bot_total_select.removeAttr('disabled');
        speed_select.removeAttr('disabled');
        clearInterval(simulator);
        gen_id = 0;
    };

    this.init = function() {
        console.log("init button clicked");
        this.createBoard();
        create_button.removeAttr('disabled');
        start_button.removeAttr('disabled');
        pause_button.attr('disabled', 'disabled');
        stop_button.attr('disabled', 'disabled');

    };

    // call this method to link to your GUI
    this.linkToGUI = function() {
        canvas = $("#canvas");

        // make sure that we are in the correct page
        if (canvas.length == 0) {
            console.log("Make sure you follow pre-requisites to call simulator.");
            return;
        }

        canvas.attr("width", board_width * cell_size);
        canvas.attr("height", board_height * cell_size);
        canvas = canvas[0];

        // get a brush with which we will paint our canvas
        brush = canvas.getContext('2d');

        create_button = $("#create_button");
        start_button = $("#start_button");
        pause_button = $("#pause_button");
        stop_button = $("#stop_button");

        // yeah,, I know. The below bind function is quite clever of me :-)
        create_button.click(this.init.bind(this));
        start_button.click(this.start.bind(this));
        pause_button.click(this.pause.bind(this));
        stop_button.click(this.stop.bind(this));

        gold_total_select = $("#gold_total_select");
        mine_total_select = $("#mine_total_select");
        enemy_total_select = $("#enemy_total_select");
        bot_total_select = $("#bot_total_select");
        speed_select = $("#speed_select");
        damage_allowed_select = $("#damage_allowed_select");

        // yet another clever use of bind :-)
        gold_total_select.change(function() {
            this.changeUserSettings("gold_total", parseInt(gold_total_select.val()));
        }.bind(this));
        mine_total_select.change(function() {
            this.changeUserSettings("mine_total", parseInt(mine_total_select.val()));
        }.bind(this));
        enemy_total_select.change(function() {
            this.changeUserSettings("enemy_total", parseInt(enemy_total_select.val()));
        }.bind(this));
        bot_total_select.change(function () {
            this.changeUserSettings("bot_total", parseInt(bot_total_select.val()))
        }.bind(this));
        speed_select.change(function () {
            this.changeUserSettings("interval", parseInt(speed_select.val()))
        }.bind(this));
        damage_allowed_select.change(function() {
            this.changeUserSettings("damage_allowed", parseInt(damage_allowed_select.val()));
        }.bind(this));

        // load the default settings
        this.changeUserSettings("gold_total", parseInt(gold_total_select.val()));
        this.changeUserSettings("mine_total", parseInt(mine_total_select.val()));
        this.changeUserSettings("enemy_total", parseInt(enemy_total_select.val()));
        this.changeUserSettings("bot_total", parseInt(bot_total_select.val()));
        this.changeUserSettings("interval", parseInt(speed_select.val()));
        this.changeUserSettings("damage_allowed", parseInt(damage_allowed_select.val()));

        // paint a board based on th default settings
        this.createBoard();
        gen_id = 0;
        gen_id_show = $("#gen_id");
        best_score_show = $("#best_score");
        avg_score_show = $("#avg_score");
        survivors_show = $("#survivors");
        best_scan_show = $("#best_scan_range");
        best_max_move_show = $("best_max_move");
    }
}
