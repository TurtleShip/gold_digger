// GUI variables
var canvas; // simulation will be drawn on this canvas
var board; // 2D array that stores locations of each component
var brush; // with this brush, we will paint our canvas
var cell_size = 10; // size of each element in the board
var board_width = 50;
var board_height = 50;

// All possible elements that can be placed on board
var elm_total = 0;
var gold_total = 25;
var empty = elm_total++, bot = elm_total++;
var mine = elm_total++, stone = elm_total++, knife = elm_total++, bullet = elm_total++;
var gold = elm_total++;
var empty_color = 'Gainsboro';
var bot_color = 'green';
var mine_color = 'red';
var stone_color = 'Chocolate';
var knife_color = 'Orange';
var bullet_color = 'OrangeRed';
var gold_color = 'yellow';

// variables that receive user inputs
var start_button;
var pause_button;
var stop_button;
var create_button;
var bot_total_select;
var speed_select;

var simulator;

var settings = {
    interval: 3000, // 3 seconds by default
    bot_total: 25,
    gen_total: 10
};

var move = [[1,0],[-1,0],[0,1],[0,-1]];



board = new Array(board_height);
for(var i = 0; i < board_height; i++) {
    board[i] = new Array(board_width);
}
var bot_loc;



function changeSettings(key, value) {
    console.log("ChangeSettings with key: " + key + ", value : " + value);
    settings[key] = value;
}

// paint board empty
function emptyBoard() {
    for(var row = 0; row < board_height; row++) {
        for(var col = 0; col < board_width; col++) {
            // start out empty for now
            board[row][col] = empty;
        }
    }

}

function getRandNum (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandCoord() {
    return [getRandNum(0, board_height-1), getRandNum(0, board_width-1)];
}

function putElement(coord, elm_type) {
    board[coord[0]][coord[1]] = elm_type;
}

function putElementRandom(elm_type) {
    var found = false;
    while(!found){
        var coord = getRandCoord();
        if(board[coord[0]][coord[1]] == empty) {
            board[coord[0]][coord[1]] = elm_type;
            found =true;
        }
    }
}

// Create a new board
function createBoard() {
    emptyBoard();
    // get new location for our bot
    bot_loc = getRandCoord();
    putElement(bot_loc, bot);
    for(var i = 0; i < gold_total; i++) {
        putElementRandom(gold);
    }

    console.log(bot_loc);
    paintBoard();
}

function updateBoard() {
    // update board based on bot's movement

    // erase bot
    board[bot_loc[0]][bot_loc[1]] = empty;
    var random_move = move[getRandNum(0, move.length-1)];
    bot_loc[0] = (bot_loc[0] + random_move[0] + board_height) % board_height;
    bot_loc[1] = (bot_loc[1] + random_move[1] + board_width) % board_width;

    board[bot_loc[0]][bot_loc[1]] = bot;

}

function paintCell(row, col, color) {
    brush.fillStyle = color;
    brush.fillRect(col*cell_size, row*cell_size, cell_size, cell_size);
}

function paintBoard() {
    // reset the canvas
    brush.fillStyle = "#FFFFFF";
    brush.fillRect(0,0, board_width * cell_size, board_height * cell_size);

    for(var row = 0; row < board_height; row++) {
        for(var col = 0; col < board_width; col++) {
            var element = board[row][col];

            switch(element) {
                case empty:
                    paintCell(row, col, empty_color);
                    break;
                case bot:
                    paintCell(row, col, bot_color);
                    console.log("Bot at " + row + " , " + col);
                    break;
                case mine:
                    paintCell(row, col, mine_color);
                    break;
                case stone:
                    paintCell(row, col, stone_color);
                    break;
                case knife:
                    paintCell(row, col, knife_color);
                    break;
                case bullet:
                    paintCell(row, col, bullet_color);
                    break;
                case gold:
                    paintCell(row, col, gold_color);
                    break;
                default:
                    console.log("Unrecognized element of value " + element);
            }
        }
    }
}

function simulateGeneration() {
    // run genentic algorithm
    console.log("Simulating a generation");
    updateBoard();
    paintBoard();
//    if(cur_gen == settings.gen_total) {
//        clearInterval(simulator);
//    }
}



function runSimulation() {
    console.log("simulating at speed " + settings.interval);
    simulator = setInterval(function(){simulateGeneration()}, settings.interval);
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
}

function create() {
    createBoard();
    create_button.removeAttr('disabled');;
    start_button.removeAttr('disabled');
    pause_button.attr('disabled', 'disabled');
    stop_button.attr('disabled', 'disabled');

}
$(function() {
    canvas = $("#canvas");

    console.log("deteci")
    // make sure that we are in the correct page
    if( canvas.length == 0 ) {
        return 0;
    }
    canvas.attr("width", board_width * cell_size);
    canvas.attr("height", board_height * cell_size);
    canvas = canvas[0];

    // get a brush with which we will paint our canvas
    brush = canvas.getContext('2d');
    createBoard();
    console.log("Canvas draw!");
//    runSimulation();
//    simulator = setInterval(function(){simulateGeneration()}, 1000);
//    runSimulation();
    console.log(canvas.toDataURL('image/png'));



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

//    var gen_total_select = $("gen_total_select");
    bot_total_select.change(function() { changeSettings("bot_total", parseInt(bot_total_select.val())) });
    speed_select.change(function() { changeSettings("interval", parseInt(speed_select.val())) });
//    gen_total_select.change(function() { changeSettings("interval", parseInt(gen_total_select.val())) });


})