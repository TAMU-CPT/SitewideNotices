define(
	[
		'dojo/request',
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dijit/form/Button',
		'JBrowse/View/InfoDialog',
		'JBrowse/Plugin'
	],
	function(
		request,
		declare,
		lang,
		dijitButton,
		InfoDialog,
		JBrowsePlugin
	){
	return declare(JBrowsePlugin,  {
		constructor: function( args ) {
			var browser = this.browser;
			var thisB = this;
			browser.afterMilestone('initView', function(){
				console.log('SitewideNotice plugin starting');
				request(args.notice_url, {handleAs: 'json'}).then(function(data) {
					// If this returns successfully, then we have notices to render.
					var contents = "";
					for(var i=0; i<data.length; i++){
						contents += "<div class=\"sitewide-notice-container " + data[i].class + "\">";
						contents += "<div class=\"sitewide-notice-header\">" + data[i].title + "</div>";
						contents += "<div class=\"sitewide-notice-body\">" + data[i].message + "</div>";
						contents += "</div>";
					}
					var aboutDialog = new InfoDialog({
						title: args.popup_title || "Site Notice",
						content: contents,
						className: 'about-dialog'
					});

					var button = new dijitButton({
						label: args.label || 'Site Notice',
						iconClass: 'dijitIconError',
						style: {
							'background': args.background_color || 'red',
						},
						onClick: lang.hitch(aboutDialog, 'show')
					});
					browser.menuBar.appendChild(button.domNode);
				});
			});
		},
	});
});
