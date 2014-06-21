$(function() {

	/*
	 *if (docCookies.hasItem('location')) {
	 *  window.location = docCookies.getItem('location');
	 *}
	 */

	$("select[name='locations']").selectpicker({style: 'btn-primary', menuStyle: 'dropdown-inverse'});

	$("select[name='locations']").change(function(event) {
		var location = $(event.target).parent().attr('action') + '/' + $("select[name='locations'] option:selected").val();
		docCookies.setItem('location', location, 2147483647, '/');
		window.location = location;
	});

});
