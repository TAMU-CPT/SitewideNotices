define(
	[
		'dojo/request',
		'dojo/cookie',
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dijit/form/Button',
		'JBrowse/View/InfoDialog',
		'JBrowse/Plugin'
	],
	function(
		request,
		cookie,
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
			this.args = args;
			browser.afterMilestone('initView', function(){
				console.log('SitewideNotice plugin starting');
				request(args.notice_url, {handleAs: 'json', preventCache: true}).then(function(data) {
					thisB.notices = data;
					// Initialize the data into a datastructure which we'll access later.
					var contents = "";
					for(var i=0; i<data.length; i++){
						contents += "<div class=\"sitewide-notice-container " + data[i].class + "\">";
						contents += "<div class=\"sitewide-notice-header\">" + data[i].title + "</div>";
						contents += "<div class=\"sitewide-notice-body\">" + data[i].message + "</div>";
						contents += "</div>";
					}
					thisB.contents = contents;
					// Check if there are any unseen notices, if there are, make this button BRIGHT.
					// Otherwise we can leave it as the background, without an icon.
					var popup_color = 'none';
					var icon = 'dijitLeaf';
					if(thisB.any_unseen_notices(data)){
						popup_color = args.background_color || 'red';
						icon = 'dijitIconError';
					}

					var button = new dijitButton({
						label: args.label || 'Site Notice',
						iconClass: icon,
						style: {
							'background': popup_color,
						},
						onClick: lang.hitch(thisB, 'show_popup')
					});
					browser.menuBar.appendChild(button.domNode);
				});
			});
		},

		get_seen: function(){
			// Parse the user's cookie into an ID list.
			var data = decodeURIComponent((cookie("jbrowseSiteWideNotices") || '')).split(',');
			return data;
		},

		any_unseen_notices: function(data){
			// Check if there are any notices the user has NOT seen before based on notice ID.
			// Get our previous cookies
			var cookieData = this.get_seen();
			for(var i=0; i<data.length; i++){
				if(cookieData.indexOf(data[i].id) === -1){
					// Then they have NOT seen this notice
					return true;
				}
			}
			return false
		},

		mark_all_read: function(){
			// Mark all (currently visible) notices as read, add them to the pile.
			var cookieData = this.get_seen();
			for(var i=0; i<this.notices.length; i++){
				// If we haven't seen this ID before, push it to the list.
				if(cookieData.indexOf(this.notices[i].id) === -1){
					cookieData.push(this.notices[i].id)
				}
			}
			// Seriealize it into a cookie.
			cookie("jbrowseSiteWideNotices", cookieData.join(','), { expires: 15000 });
		},

		show_popup: function() {
			// Trigger the popup
			var aboutDialog = new InfoDialog({
				title: this.args.popup_title || "Site Notice",
				content: this.contents,
				className: 'about-dialog'
			});
			aboutDialog.show();
			this.mark_all_read();
		},
	});
});
