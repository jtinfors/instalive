$(function() {
	$("select[name='locations']").selectpicker({style: 'btn-primary', menuStyle: 'dropdown-inverse'});

	$("select[name='locations']").change(function(event) {
		console.log($(event.target).parent().attr('action'));
		window.location = $(event.target).parent().attr('action') + '/' + $("select[name='locations'] option:selected").val();
	});
});
