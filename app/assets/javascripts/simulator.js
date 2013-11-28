
var canvas; // simulation will be drawn on this canvas
var board; // 2D array that stores locations of each component

var board_width = 50;
var board_height = 50;

var bot_total = 25;
var gen_total = 100;

var move = [[1,0],[-1,0],[0,1],[0,-1]];

// All possible elements that can be placed on board
var empty = 0, mine = -1, bot = 2;

board = new Array(board_height);
for(var i = 0; i < board_height; i++) {
    board[i] = new Array(board_width);
}

// Create a new board
function createBoard() {

    for(var row = 0; row < board_height; row++) {
        for(var col = 0; col < board_width; col++) {
            // start out empty for now
            board[row][col] = empty;
        }
    }

    // Add bots on the top row
    for(var col = 0; col < board_width; col++) {
        board[0][col] = bot;
    }
}


//$(function() {
//    canvas = $("#canvas");
//    // make sure that we are in the correct page
//    if( canvas.length == 0 ) {
//        return 0;
//    }
//})