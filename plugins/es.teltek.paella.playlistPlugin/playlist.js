Class ("paella.plugins.playlistPlugin",paella.ButtonPlugin,{
	currentSeriesId:null,
	currentVideoId:null,
	playlistVideos:[],

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return "playlistPlugin"; },
	getIndex:function() { return 400; },
	getName:function() { return "es.teltek.paella.playlistPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Playlist"); },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	checkEnabled:function(onSuccess) {
		this.currentSeriesId = base.parameters.get("seriesId");
		this.currentVideoId = base.parameters.get("videoId");
		if (this.currentSeriesId && this.currentVideoId ) {
			onSuccess(true);
		}
		else {
			onSuccess(false);
		}
	},

	setup:function() {
		//NOTE: Does not work with cross-domain requests unless CORS is set.
		var url = this.config.playlistApi + "/" + this.currentSeriesId;
		That = this;
		base.ajax.get(
			{url: url},
			function(data, contentType, returnCode) {
				That.playlistVideos = data;
				//Is there a better way to relaunch buildContent?
				container = That.containerManager.containers[That.getName()];
				if(container && container.element)
					That.buildContent(container.element);
			}
		);
	},

	buildContent:function(domElement) {
		//Removes every element.
		while(domElement.hasChildNodes()){
			domElement.removeChild(domElement.lastChild);
		}
		this.playlistVideos.forEach(function(item){
			var elem = document.createElement('div');
			elem.className = "videobutton"+ (item.id == That.currentVideoId ?' playing':'');
			elem.innerHTML = item.name;
			$(elem).click(function(event) {
				window.location.href=item.url;
			});
			domElement.appendChild(elem);
		});
	}
});

paella.plugins.playlistPlugin = new paella.plugins.playlistPlugin();
