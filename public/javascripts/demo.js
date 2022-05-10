$(function() {
    console.log( "ready!" );
    $(document).on('click', function(){
        $('#console1').html($('#console1').html()+"clicked"+"<br/>");
    });

    $(document).on('click touchstart', function(){
        $('#console2').html($('#console2').html()+"click touchstart"+"<br/>");
    });

    $(document).on('touchstart', function(){
        $('#console3').html($('#console3').html()+"touchstart"+"<br/>");
    });
});
