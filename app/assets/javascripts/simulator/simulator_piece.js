/**
 * Created by Seulgi on 11/30/13.
 */
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