paella.addPlugin(function() {
    return class PlaylistPlugin extends paella.ButtonPlugin {        
        getAlignment() { return 'left'; }
        getSubclass() { return "playlistPlugin"; }
        getIndex() { return 400; }
        getName() { return "es.teltek.paella.playlistPlugin"; }
        getDefaultToolTip() { return base.dictionary.translate("Playlist"); }
        getButtonType() { return paella.ButtonPlugin.type.popUpButton; }
    
        checkEnabled(onSuccess) {        
            this._currentPlaylistId = base.parameters.get("playlistId");
            this._currentVideoId = base.parameters.get("videoId");
            this._currentVideoPos = base.parameters.get("videoPos");
            this._currentVideo=null;
            this._playlistVideos=[];
    
            if (this._currentPlaylistId && this._currentVideoId && this._currentVideoPos){
                onSuccess(true);
                }
            else {
                onSuccess(false);
                }
            }
        findVideo() {
            var currentVideo = null;
            var playlistPlugin = this;
            this._playlistVideos.find(function(item){
                if(item.id == playlistPlugin._currentVideoId) {
                    currentVideo = item;
                    if(item.pos == playlistPlugin._currentVideoPos) {
                        return true;
                        }
                    return false;
                    }
                });
            return currentVideo;
            }
        setup() {
            var url = this.config.playlistApi + "/" + this._currentPlaylistId;
            var playlistPlugin = this;
            base.ajax.get(
                {url: url},
                function(data, contentType, returnCode) {
                    playlistPlugin._playlistVideos = data;
                    playlistPlugin._currentVideo = playlistPlugin.findVideo();
                    //Is there a better way to relaunch buildContent?
                    var container = playlistPlugin.containerManager.containers[playlistPlugin.getName()];
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
            }
    
        buildContent(domElement) {
            //Removes every element.
            while(domElement.hasChildNodes()){
                domElement.removeChild(domElement.lastChild);
                }
            var playlistPlugin = this;
            this._playlistVideos.forEach(function(item){
                var elem = document.createElement('div');
                elem.className = "videobutton"+ (item == playlistPlugin._currentVideo  ?' playing':'');
                elem.innerHTML = item.name;
                $(elem).click(function(event) {
                    window.location.href=item.url;
                    });
                domElement.appendChild(elem);
                });
            }
    
        goToNextVideo(){
            var playlistPlugin = this;
            var index = this._playlistVideos.findIndex(
                function(elem){
                    return elem == playlistPlugin._currentVideo;
                    }
                );
            var length = this._playlistVideos.length;
            var next = this._playlistVideos[(index + 1) % length];
            window.location.href = next.url;
        }
    }
});

