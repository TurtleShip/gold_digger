/**
 * This file contains javascript codes that are shared across
 * all pages. You shouldn't be putting javascript codes here
 * if at least one page doesn't require them.
 */

// deep copies array
// copied from stackoverflow
// http://stackoverflow.com/questions/2294703/multidimensional-array-cloning-using-javascript
Array.prototype.clone = function() {
    var arr = this.slice();
    for(var i = 0; i < this.length; i++) {
        if(this[i].clone) {
            arr[i] = this[i].clone();
        }
    }
    return arr;
}

// generate a random integer
getRandNum = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
