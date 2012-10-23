function initializeQuoteSliders() {
    window.setInterval(showNextQuoteSliderItem, 5000);
}

function showNextQuoteSliderItem() {
    var visibleItem = $(".quote-slider ul li").filter(':visible');
    var nextItem = visibleItem.next();
    if (nextItem.length == 0) {
        nextItem = visibleItem.siblings().first();
    }
    visibleItem.toggle("drop", function () {
        nextItem.toggle("drop");
    });
}

$(document).ready(function() {
    initializeQuoteSliders();
});
