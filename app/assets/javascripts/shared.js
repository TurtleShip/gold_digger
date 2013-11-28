/**
 * This file contains javascript codes that are shared across
 * all pages. You shouldn't be putting javascript codes here
 * if at least one page doesn't require them.
 */

function showSlectedMenu() {
    var path = window.location.pathname;
    var link = $('a[href="' + path +'"]');
    link.parent().addClass('active');
}

// Starts function on page load
$(function() {
    showSlectedMenu();
})