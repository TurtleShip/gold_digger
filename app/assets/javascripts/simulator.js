// GUI variables
var canvas; // simulation will be drawn on this canvas
var initial_board; // 2D array that stores locations of each component
var simulation_board; // board used to simulate the current generation
var brush; // with this brush, we will paint our canvas
var cell_size = 10; // size of each element in the board
var board_width = 25;
var board_height = 25;
var gold_total = 40;
var mine_total = 5;
var enemy_total = 10;

// variables that receive user inputs
var start_button;
var pause_button;
var stop_button;
var create_button;
var bot_total_select;
var speed_select;

var simulator;

// variables to output results
var gen_id;
var gen_id_show;
var result;
var best_path;
var best_score_show;
var avg_score_show;
var survivors_show;


var settings = {
    interval: -1, // uninitialized
    bot_total: -1, // uninitialized
    gen_total: 25
};

var bot_loc;
var bots;
var move = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1]
];


function changeSettings(key, value) {
    console.log("ChangeSettings with key: " + key + ", value : " + value);
    settings[key] = value;
}

function paintCell(row, col, color) {
    brush.fillStyle = color;
    brush.fillRect(col * cell_size, row * cell_size, cell_size, cell_size);
}

function paintBoard() {
    var cur_board = simulation_board.getBoard();
    for (var row = 0; row < board_height; row++) {
        for (var col = 0; col < board_width; col++) {
            var element = cur_board[row][col];
            paintCell(row, col, element.getColor());
        }
    }
}

// simulate one step within a generation
function simulateStep(step_id) {
    if (step_id < best_path.length) {
        simulation_board.updateBoard(best_path[step_id][0], best_path[step_id][1], "hello");
        paintBoard();
        var caller = arguments.callee;
        simulator = setTimeout(function () {
            caller(step_id + 1);
        }, settings.interval);
    } else {
        finishGeneration();
    }
}

function startGeneration() {
    console.log("Simulating a generation " + gen_id);
    gen_id_show.text(gen_id);

    // TODO: simulate bots and save results
    
    result = bots.simulateOneGeneration();

    // show results for the current generation
    best_score_show.text(result.best_score);
    avg_score_show.text(result.avg_score);
    survivors_show.text(result.survivors + " out of " + settings.bot_total);

    // display path taken by the best bot of the current generation
    best_path = result.best_path;
    simulation_board = initial_board.clone();
    simulateStep(0);
}

function finishGeneration() {


    // TODO: make next generation
    bots.breedNextGeneration();
    gen_id++;
    startGeneration();
}

function createBoard() {
    initial_board = new Board(board_width, board_height, gold_total, mine_total, enemy_total);
    initial_board.initBoard();
    simulation_board = initial_board.clone();
    paintBoard();
}
function runSimulation() {
    console.log("simulating at speed " + settings.interval);

    // TODO: create bots here
    var elm_set = initial_board.getElementSettings();;

    var game_info = {
//        board: board.clone(),
        board: initial_board,
        max_score: elm_set.gold.value * gold_total,
        max_damage_allowed: -(elm_set.mine.damage * mine_total, elm_set.enemy.damage * enemy_total),
        worst_damage: Math.max(elm_set.mine.damage, elm_set.enemy.damage),
        ability_limit: 200,
        max_change_interval: 5
    };

    // TODO: replace the below line with new BotVillage(settings.bot_total, game_info) later.
    bots = new BotVillage(2, game_info);
    bots.initBots();
    startGeneration();
}

function start() {
    create_button.attr('disabled', 'disabled');
    start_button.attr('disabled', 'disabled');
    pause_button.removeAttr('disabled');
    stop_button.removeAttr('disabled');
    bot_total_select.attr('disabled', 'disabled');
    speed_select.attr('disabled', 'disabled');
    runSimulation();
}

function pause() {
    console.log("simulation paused");
    create_button.attr('disabled', 'disabled');
    pause_button.attr('disabled', 'disabled');
    start_button.removeAttr('disabled');
    stop_button.removeAttr('disabled');
    clearInterval(simulator);

}

function stop() {
    console.log("simulation stopped");
    create_button.removeAttr('disabled');
    start_button.attr('disabled', 'disabled');
    pause_button.attr('disabled', 'disabled');
    stop_button.attr('disabled', 'disabled');
    bot_total_select.removeAttr('disabled');
    speed_select.removeAttr('disabled');
    clearInterval(simulator);
    gen_id = 0;

}

function create() {
    createBoard();
    create_button.removeAttr('disabled');
    start_button.removeAttr('disabled');
    pause_button.attr('disabled', 'disabled');
    stop_button.attr('disabled', 'disabled');

}
$(function () {
    canvas = $("#canvas");

    // make sure that we are in the correct page
    if (canvas.length == 0) {
        return 0;
    }
    canvas.attr("width", board_width * cell_size);
    canvas.attr("height", board_height * cell_size);
    canvas = canvas[0];

    // get a brush with which we will paint our canvas
    brush = canvas.getContext('2d');
    createBoard();
    console.log("Canvas draw!");

    create_button = $("#create_button");
    start_button = $("#start_button");
    pause_button = $("#pause_button");
    stop_button = $("#stop_button");

    create_button.click(create);
    start_button.click(start);
    pause_button.click(pause);
    stop_button.click(stop);


    bot_total_select = $("#bot_total_select");
    speed_select = $("#speed_select");

    bot_total_select.change(function () {
        changeSettings("bot_total", parseInt(bot_total_select.val()))
    });
    speed_select.change(function () {
        changeSettings("interval", parseInt(speed_select.val()))
    });

    // load the default settings
    changeSettings("bot_total", parseInt(bot_total_select.val()));
    changeSettings("interval", parseInt(speed_select.val()));

    gen_id = 0;
    gen_id_show = $("#gen_id");
    best_score_show = $("#best_score");
    avg_score_show = $("#avg_score");
    survivors_show = $("#survivors");

})