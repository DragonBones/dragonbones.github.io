function initializeQuoteSliders() {
    window.setInterval(showNextQuoteSliderItem, 7000);
}

function showNextQuoteSliderItem() {
    var visibleItem = $(".quote-slider ul li").filter(':visible');
    var nextItem = visibleItem.next();
    if (nextItem.length == 0) {
        nextItem = visibleItem.siblings().first();
    }
    visibleItem.fadeToggle("slow", "linear", function () {
        nextItem.fadeToggle("slow", "linear");
    });
}

$(document).ready(function() {
    initializeQuoteSliders();
    $("#myCarousel").carousel();
});
