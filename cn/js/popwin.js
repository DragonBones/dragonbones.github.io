
//Blog:http://www.frontopen.com/
var popWin = {
    scrolling: 'no',
    //是否显示滚动条 no,yes,auto

int: function() {
        this.mouseClose();
        this.closeMask();
        //this.mouseDown();

    },

showWin: function(width, height, title, src,call) {
        var iframeHeight = height - 52;
        var marginLeft = width / 2;
        var marginTop = height / 2+title;
        var inntHtml = '';
        inntHtml += '<div id="mask" style="width:100%; height:100%; position:fixed; top:0; left:0; z-inde:9999;background:#000000; filter:alpha(opacity=80); -moz-opacity:0.8; -khtml-opacity: 0.8; opacity:0.8;"></div>'
        inntHtml += '<div id="maskTop" style="width: ' + width + 'px; height: ' + height + 'px;  position: fixed; top: 50%; left: 50%; margin-left: -' + marginLeft + 'px; margin-top: -' + marginTop + 'px; z-index: 2999; ">'
        inntHtml += '<div id="maskTitle" style="position: relative;">'
        inntHtml += '' + '' + ''
        inntHtml += '<div id="popWinClose" style="width: 38px; height: 38px; cursor: pointer; position: absolute; top: -16px; right: 40px; z-index: 3999;background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5N2IyNDA5OS1lZGMzLTRhNGYtOGFjYS04ZjE5YjY2MzY2NDciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEM4ODNEODQwNTQ1MTFFNjk2RERBMjYxMzRFNTQxMDUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEM4ODNEODMwNTQ1MTFFNjk2RERBMjYxMzRFNTQxMDUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YmQyMjZkYWMtYzllZS00N2VjLTgzMmEtNGE5MjhkODY3YjQxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk3YjI0MDk5LWVkYzMtNGE0Zi04YWNhLThmMTliNjYzNjY0NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnHDUA8AAAN6SURBVHjaxJhfSNNRFMfPTwUhNKQxe1hNhZZgZQ+RUk9KQQmRTiuQeiiFIDapQHush/bmpMLhQ2QU1fMkB77UQy+bjGVUsM16ccaEHkpiIzAUO2edn83afr/7+93ftgNfuPv9ueez87v33HuP0t3VBSbsEOoE6jhqP2ovqo7vZVFfUJ9QYdRr1EejDmoMPEuOr6KGUW0az+1iHUad52tx1DTqIYPrWpUg/HXUEmpCB6qYtfG7S9xXjSyYCzWPuo+ygbzZuK957tsU2BlUDHUErDfq8y37MAR2ERVE7YTSWT37uCQKdhb11ODEMGvk4wn71ARrRT1HVUP5rJp9thYDI/oXHOJyWz37rikE5tEb6LW1tdDf3w+KokCJJoR3K4wtzc1q8qSBuEML6q7PB31uN9jtdohEIkLe6E94vF5wOByQTCb1Hj+KmkL9UsGItE/rDTdGqre3909yc7mE4FSogYEB6OjogEwmA8lEQusVCsw3VEQFe4Sya72RwA53NzbCPpdLCE6Fok+v/l5JpyEajepFjdbdKQJrx8Ztkc8SDoeF4P6FIpsJBiEQCIi4oQAFCWwQG6dFRyjBNSKcqwhcMajJyUnY3NwUdfOZwG5g46CR6RPRgPPKQ5H9UHA/9h4b7UbnNkVmdGwMenp6tq6lUiloamqShSL7QBHzaaUJI5FraGiwAiqX7KtkMj05nfD7c5HKt+XlZRmo3EpQJZOqcwPd49n2+cicTmfuM8usEASWMQtFA92dN9DzI0djTwIuQ2BpK6BoTA0PDcHc3JwVcGka/N3YOCALpY6pQqmEftN1A/aGwGgJOGUFlFaeMwg3TWA/sXHNKiiL4G4R2FdsXNBbxL0jI4YzeiG4bDYLiXhcyxXdvKOmi8e6oxF3BiqEaPKk+/7x8a0JEYvFIDQ7q+cqx6JwiaCOD6M2vT3ZHtzw0S7BSPKkYUDRDoVCsLa2pvXodxQlxaySV7ugxfweVNZu8oF4254/wIfQStk7ZvjvMLLOB91MBaCo0DLIDAXPlYt8Mt4oI9QGB2RR7yT+EnW5THDk4wr7FKpd0Mn4nGgtS+LzUf3smdFqzwwfQhdKALXAfQfN1seoXNnJqWTVAqBV7quT+5aqKNJMeYBqQY3SEdMEUILfbeG+1nWTskRx+CTqGPwtDqtbdEo3anGYznSvwERx+LcAAwBlY1WO3jX3nwAAAABJRU5ErkJggg==);"></div>'
        inntHtml += '</div>'
        inntHtml += '<div style="position:absolute;"><iframe onload="mobile_popiframe.focus()" id="mobile_popiframe" width="' + width + '" height="' + iframeHeight + '" frameborder="0" scrolling="' + this.scrolling + '" src="' + src + '"></iframe>'
        $("body").append(inntHtml);
        this.int();


    },

mouseClose: function() {
        $("#popWinClose").on('mouseenter', 
        function() {
            $(this).css("background-image", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5N2IyNDA5OS1lZGMzLTRhNGYtOGFjYS04ZjE5YjY2MzY2NDciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEM4ODNEODQwNTQ1MTFFNjk2RERBMjYxMzRFNTQxMDUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEM4ODNEODMwNTQ1MTFFNjk2RERBMjYxMzRFNTQxMDUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YmQyMjZkYWMtYzllZS00N2VjLTgzMmEtNGE5MjhkODY3YjQxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk3YjI0MDk5LWVkYzMtNGE0Zi04YWNhLThmMTliNjYzNjY0NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnHDUA8AAAN6SURBVHjaxJhfSNNRFMfPTwUhNKQxe1hNhZZgZQ+RUk9KQQmRTiuQeiiFIDapQHush/bmpMLhQ2QU1fMkB77UQy+bjGVUsM16ccaEHkpiIzAUO2edn83afr/7+93ftgNfuPv9ueez87v33HuP0t3VBSbsEOoE6jhqP2ovqo7vZVFfUJ9QYdRr1EejDmoMPEuOr6KGUW0az+1iHUad52tx1DTqIYPrWpUg/HXUEmpCB6qYtfG7S9xXjSyYCzWPuo+ygbzZuK957tsU2BlUDHUErDfq8y37MAR2ERVE7YTSWT37uCQKdhb11ODEMGvk4wn71ARrRT1HVUP5rJp9thYDI/oXHOJyWz37rikE5tEb6LW1tdDf3w+KokCJJoR3K4wtzc1q8qSBuEML6q7PB31uN9jtdohEIkLe6E94vF5wOByQTCb1Hj+KmkL9UsGItE/rDTdGqre3909yc7mE4FSogYEB6OjogEwmA8lEQusVCsw3VEQFe4Sya72RwA53NzbCPpdLCE6Fok+v/l5JpyEajepFjdbdKQJrx8Ztkc8SDoeF4P6FIpsJBiEQCIi4oQAFCWwQG6dFRyjBNSKcqwhcMajJyUnY3NwUdfOZwG5g46CR6RPRgPPKQ5H9UHA/9h4b7UbnNkVmdGwMenp6tq6lUiloamqShSL7QBHzaaUJI5FraGiwAiqX7KtkMj05nfD7c5HKt+XlZRmo3EpQJZOqcwPd49n2+cicTmfuM8usEASWMQtFA92dN9DzI0djTwIuQ2BpK6BoTA0PDcHc3JwVcGka/N3YOCALpY6pQqmEftN1A/aGwGgJOGUFlFaeMwg3TWA/sXHNKiiL4G4R2FdsXNBbxL0jI4YzeiG4bDYLiXhcyxXdvKOmi8e6oxF3BiqEaPKk+/7x8a0JEYvFIDQ7q+cqx6JwiaCOD6M2vT3ZHtzw0S7BSPKkYUDRDoVCsLa2pvXodxQlxaySV7ugxfweVNZu8oF4254/wIfQStk7ZvjvMLLOB91MBaCo0DLIDAXPlYt8Mt4oI9QGB2RR7yT+EnW5THDk4wr7FKpd0Mn4nGgtS+LzUf3smdFqzwwfQhdKALXAfQfN1seoXNnJqWTVAqBV7quT+5aqKNJMeYBqQY3SEdMEUILfbeG+1nWTskRx+CTqGPwtDqtbdEo3anGYznSvwERx+LcAAwBlY1WO3jX3nwAAAABJRU5ErkJggg==)");

        });

        $("#popWinClose").on('mouseleave', 
        function() {
            $(this).css("background-image", "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo5N2IyNDA5OS1lZGMzLTRhNGYtOGFjYS04ZjE5YjY2MzY2NDciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEM4ODNEODQwNTQ1MTFFNjk2RERBMjYxMzRFNTQxMDUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEM4ODNEODMwNTQ1MTFFNjk2RERBMjYxMzRFNTQxMDUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YmQyMjZkYWMtYzllZS00N2VjLTgzMmEtNGE5MjhkODY3YjQxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk3YjI0MDk5LWVkYzMtNGE0Zi04YWNhLThmMTliNjYzNjY0NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnHDUA8AAAN6SURBVHjaxJhfSNNRFMfPTwUhNKQxe1hNhZZgZQ+RUk9KQQmRTiuQeiiFIDapQHush/bmpMLhQ2QU1fMkB77UQy+bjGVUsM16ccaEHkpiIzAUO2edn83afr/7+93ftgNfuPv9ueez87v33HuP0t3VBSbsEOoE6jhqP2ovqo7vZVFfUJ9QYdRr1EejDmoMPEuOr6KGUW0az+1iHUad52tx1DTqIYPrWpUg/HXUEmpCB6qYtfG7S9xXjSyYCzWPuo+ygbzZuK957tsU2BlUDHUErDfq8y37MAR2ERVE7YTSWT37uCQKdhb11ODEMGvk4wn71ARrRT1HVUP5rJp9thYDI/oXHOJyWz37rikE5tEb6LW1tdDf3w+KokCJJoR3K4wtzc1q8qSBuEML6q7PB31uN9jtdohEIkLe6E94vF5wOByQTCb1Hj+KmkL9UsGItE/rDTdGqre3909yc7mE4FSogYEB6OjogEwmA8lEQusVCsw3VEQFe4Sya72RwA53NzbCPpdLCE6Fok+v/l5JpyEajepFjdbdKQJrx8Ztkc8SDoeF4P6FIpsJBiEQCIi4oQAFCWwQG6dFRyjBNSKcqwhcMajJyUnY3NwUdfOZwG5g46CR6RPRgPPKQ5H9UHA/9h4b7UbnNkVmdGwMenp6tq6lUiloamqShSL7QBHzaaUJI5FraGiwAiqX7KtkMj05nfD7c5HKt+XlZRmo3EpQJZOqcwPd49n2+cicTmfuM8usEASWMQtFA92dN9DzI0djTwIuQ2BpK6BoTA0PDcHc3JwVcGka/N3YOCALpY6pQqmEftN1A/aGwGgJOGUFlFaeMwg3TWA/sXHNKiiL4G4R2FdsXNBbxL0jI4YzeiG4bDYLiXhcyxXdvKOmi8e6oxF3BiqEaPKk+/7x8a0JEYvFIDQ7q+cqx6JwiaCOD6M2vT3ZHtzw0S7BSPKkYUDRDoVCsLa2pvXodxQlxaySV7ugxfweVNZu8oF4254/wIfQStk7ZvjvMLLOB91MBaCo0DLIDAXPlYt8Mt4oI9QGB2RR7yT+EnW5THDk4wr7FKpd0Mn4nGgtS+LzUf3smdFqzwwfQhdKALXAfQfN1seoXNnJqWTVAqBV7quT+5aqKNJMeYBqQY3SEdMEUILfbeG+1nWTskRx+CTqGPwtDqtbdEo3anGYznSvwERx+LcAAwBlY1WO3jX3nwAAAABJRU5ErkJggg==)");

        });

    },

closeMask: function() {
        $("#popWinClose").on('click', 
        function() {
            $("#mask,#maskTop").fadeOut(function() {
                $(this).remove();

            });

        });

    }


};