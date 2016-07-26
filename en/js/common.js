window.onscroll = function(){
	if(document.body.clientWidth>750)
	if($(document).scrollTop()>0){
		if($('.headerDark').attr('animate')!='true'){
			//$('.headerDark').css('background','#000');
			//$('.headerDark').css('top','-60px');
			//$(".headerDark").animate({top:'0'});
			//$('.headerDark').attr('animate','true');
		}
	}else{
		//$('.headerDark').stop(false,true).animate();
		//$('.headerDark').css('top','0');
		//$('.headerDark').css('background','none');
		//$('.headerDark').attr('animate','false');
		
	}
}

$(window).resize(function(){
   var $magicLine = $("#magic-line");
    $magicLine
        .width($(".current_page_item").width()-15)
        .css("left", $(".current_page_item a").position().left+8)
        .data("origLeft", $magicLine.position().left)
        .data("origWidth", $magicLine.width());
});

$(function() {

	if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)!=null) {
		return;
	}
	
    var $el, leftPos, newWidth;
    
    /*
        EXAMPLE ONE
    */
  
    /* Cache it */
    var $magicLine = $("#magic-line");
    
    $magicLine
        .width($(".current_page_item").width()-15)
        .css("left", $(".current_page_item a").position().left+8)
        .data("origLeft", $magicLine.position().left)
        .data("origWidth", $magicLine.width());
        
    $("#example-one li").find("a").hover(function() {
        $el = $(this);
        leftPos = $el.position().left+8;
        newWidth = $el.parent().width()-15;
        
        $magicLine.stop().animate({
            left: leftPos,
            width: newWidth
        });
    }, function() {
        $magicLine.stop().animate({
            left: $magicLine.data("origLeft"),
            width: $magicLine.data("origWidth")
        });    
    });
});