/**
 * Created by rubenrua on 10/05/2017.
 */
Class ("paella.JWPlayerVideo", paella.VideoElementBase,{
    _readyPromise:null,

    initialize:function(id,stream,left,top,width,height) {
        this.parent(id,stream,'div',left,top,width,height);
        var This = this;
        this._readyPromise = $.Deferred();

        Object.defineProperty(this, 'video', {
            get:function() { return This._jwplayer; }
        });

    },

    _deferredAction:function(action) {
        return new Promise((resolve,reject) => {
            this._readyPromise.then(function() {
                    resolve(action());
                },
                function() {
                    reject();
                });
        });
    },

    _loadDeps:function() {
        return new Promise((resolve,reject) => {
            if (!window.$paella_jwplayer) {
                require(['resources/deps/jwplayer/jwplayer.js'],function(jwplayer) {
                    window.$paella_jwplayer = jwplayer;
                    //TODO get from config
                    window.jwplayer.key="";
                    resolve(window.$paella_jwplayer);
                });
            }
            else {
                resolve(window.$paella_jwplayer);
            }
        });
    },

    load:function() {
        let This = this;
        return new Promise((resolve,reject) => {
            var source = this._stream.sources.jwplayer;
            if (source && source.length>0) {
                source = source[0];
                this._loadDeps()
                    .then(function(jwplayer) {


                        This._jwplayer = jwplayer(This.identifier).setup({
                            file: 'https://dls2.uvigo.es/vod/2105/93471.mp4',
                            autostart: This._autoplay,
                            width: "100%",
                            aspectratio: "16:9",
                            controls: false,
                        });

                        //Add to jwplayer onReady callback
                        This._readyPromise.resolve();

                        resolve();
                    });
            }
            else {
                reject(new Error("Invalid source"));
            }
        });
    },

    getQualities:function() {
        return this._deferredAction(() => {
            //Not implemented
            return [100];
        });
    },

    setQuality:function(index) {
        return this._deferredAction(() => {
            //Not implemented
        });
    },

    getQualities:function() {
        return this._deferredAction(() => {
            //Not implemented
            //TODO
            return 100;
        });
    },

    // Initialization functions
    getVideoData:function() {
        var This = this;
        return new Promise((resolve,reject) => {
            var stream = this._stream.sources.jwplayer[0];
            this._deferredAction(() => {
                var videoData = {
                    duration: This.video.getDuration(),
                    currentTime: This.video.getPosition(),
                    volume: This.video.getVolume(),
                    paused: "paused" == This.video.getState(),
                    ended: "complete" == This.video.getState(),
                    res: {
                        w: stream.res.w,
                        h: stream.res.h
                    }
                };
                resolve(videoData);
            })
        });
    },

    play:function() {
        let This = this;
        return new Promise((resolve,reject) => {
            This.video.play();
        });
    },


    pause:function() {
        return this._deferredAction(() => {
            this.video.pause();
        });
    },


    isPaused:function() {
        return this._deferredAction(() => {
            return "paused" == this.video.getState()
        });
    },

    duration:function() {
        return this._deferredAction(() => {
            return this.video.getDuration();
        });
    },

    setCurrentTime:function(time) {
        return this._deferredAction(() => {
            this.video.seek(time);
        });
    },


    currentTime:function() {
        return this._deferredAction(() => {
            return this.video.getPosition();
        });
    },

    setVolume:function(volume) {
        return this._deferredAction(() => {
            this.video.setVolume && this.video.setVolume(volume * 100);
        });
    },

    volume:function() {
        return this._deferredAction(() => {
            return this.video.getVolume() / 100;
        });
    },



});

Class ("paella.videoFactories.JWPlayerVideoFactory", {
    initJWPlayer:function() {
        if (!this._initialized) {
            console.log("paella.videoFactories.YoutubeVideoFactory init")
            this._initialized = true;
        }
    },

    isStreamCompatible:function(streamData) {
        try {
            for (var key in streamData.sources) {
                if (key=='jwplayer') return true;
            }
        }
        catch (e) {}
        return false;
    },

    getVideoObject:function(id, streamData, rect) {
        this.initJWPlayer();
        return new paella.JWPlayerVideo(id, streamData, rect.x, rect.y, rect.w, rect.h);
    }
});
