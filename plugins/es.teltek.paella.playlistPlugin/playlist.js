Class ("paella.plugins.playlistPlugin",paella.ButtonPlugin,{
	currentPlaylistId:null,
	currentVideoId:null,
	playlistVideos:[],

	getAlignment:function() { return 'left'; },
	getSubclass:function() { return "playlistPlugin"; },
	getIndex:function() { return 400; },
	getName:function() { return "es.teltek.paella.playlistPlugin"; },
	getDefaultToolTip:function() { return base.dictionary.translate("Playlist"); },
	getButtonType:function() { return paella.ButtonPlugin.type.popUpButton; },

	checkEnabled:function(onSuccess) {
		this.currentPlaylistId = base.parameters.get("playlistId");
		this.currentVideoId = base.parameters.get("videoId");
		if (this.currentPlaylistId && this.currentVideoId){
			onSuccess(true);
		}
		else {
			onSuccess(false);
		}
	},

	setup:function() {
		var url = this.config.playlistApi + "/" + this.currentPlaylistId;
		var playlistPlugin = this;
		base.ajax.get(
			{url: url},
			function(data, contentType, returnCode) {
				playlistPlugin.playlistVideos = data;
				//Is there a better way to relaunch buildContent?
				container = playlistPlugin.containerManager.containers[playlistPlugin.getName()];
				if(container && container.element)
					playlistPlugin.buildContent(container.element);
			}
		);
		paella.events.bind(
			paella.events.endVideo,
			function(event){
				playlistPlugin.goToNextVideo();
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
			elem.className = "videobutton"+ (item.id == this.currentVideoId ?' playing':'');
			elem.innerHTML = item.name;
			$(elem).click(function(event) {
				window.location.href=item.url;
			});
			domElement.appendChild(elem);
		});
	},

	goToNextVideo:function(){
		var playlistPlugin = this;
		var index = this.playlistVideos.findIndex(
			function(elem){
				return elem.id == playlistPlugin.currentVideoId;
			}
		);
		var length = this.playlistVideos.length;
		var next = this.playlistVideos[(index + 1) % length];
		window.location.href = next.url;
	}
});

paella.plugins.playlistPlugin = new paella.plugins.playlistPlugin();
