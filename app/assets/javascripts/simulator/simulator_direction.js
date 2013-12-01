/**
 * Created by Seulgi on 11/30/13.
 */
function Direction() {
    var dir_name = ["up", "down", "left", "right"];
    var dir_map = {
        up: [-1, 0],
        down: [1, 0],
        left: [0, -1],
        right: [0, 1]
    };

    this.getDirName = function() {
        return dir_name;
    };

    this.getDirMap = function() {
        return dir_map;
    };

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
    };

    //Return the direction when turned left form cur_dir
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

}
