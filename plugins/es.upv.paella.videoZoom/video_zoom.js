(function() {
    let g_canvasWidth = 320;
    let g_canvasHeight = 180;

    function getThumbnailContainer(videoIndex) {
        let container = document.createElement('canvas');
        container.width = g_canvasWidth;
        container.height = g_canvasHeight;
        container.className = "zoom-thumbnail";
        container.id = "zoomContainer" + videoIndex;
        return container;
    }

    function getZoomRect() {
        let zoomRect = document.createElement('div');
        zoomRect.className = "zoom-rect";

        return zoomRect;
    }

    function updateThumbnail(thumbElem) {
        let player = thumbElem.player;
        let canvas = thumbElem.canvas;
        player.captureFrame()
            .then((frameData) => {
                let ctx = canvas.getContext("2d");
                ctx.drawImage(frameData.source,0,0,g_canvasWidth,g_canvasHeight);
            });
    }

    function setupButtons(videoPlayer) {
        let wrapper = videoPlayer.parent;
        let wrapperDom = wrapper.domElement;

        let zoomButton = document.createElement('button');
        wrapperDom.appendChild(zoomButton);
        zoomButton.className = "videoZoomButton btn zoomIn";
        zoomButton.innerHTML = '<i class="glyphicon glyphicon-zoom-in"></i>'
        $(zoomButton).on('mousedown',() => {
            paella.player.videoContainer.disablePlayOnClick();
            videoPlayer.zoomIn();
        });
        $(zoomButton).on('mouseup',() => {
            setTimeout(() => paella.player.videoContainer.enablePlayOnClick(),10);
        });

        zoomButton = document.createElement('button');
        wrapperDom.appendChild(zoomButton);
        zoomButton.className = "videoZoomButton btn zoomOut";
        zoomButton.innerHTML = '<i class="glyphicon glyphicon-zoom-out"></i>'
        $(zoomButton).on('mousedown',() => {
            paella.player.videoContainer.disablePlayOnClick();
            videoPlayer.zoomOut();
        });
        $(zoomButton).on('mouseup',() => {
            setTimeout(() => paella.player.videoContainer.enablePlayOnClick(),10);
        });
    }

    class VideoZoomPlugin extends paella.VideoOverlayButtonPlugin {
        getIndex() {return 10; }
        getSubclass() { return "videoZoom"; }
        getAlignment() { return 'right'; }
        getDefaultToolTip() { return ""; }

        checkEnabled(onSuccess) {
            onSuccess(true);
        }

        setup() {
            var thisClass = this;
            this._thumbnails = [];
            this._visible = false;
            function checkVisibility() {
                let buttons = $('.videoZoomButton');
                let thumbs = $('.videoZoom');
                if (this._visible) {
                    buttons.show();    
                    thumbs.show();
                }
                else {
                    buttons.hide();
                    thumbs.hide();
                }
            }

            paella.player.videoContainer.videoPlayers()
                .then((players) => {
                    players.forEach((player,index) => {
                        if (player.allowZoom()) {
                            this._visible = player.zoomAvailable();
                            setupButtons.apply(this,[player]);
                            player.supportsCaptureFrame().then((supports) => {
                                if (supports) {
                                    let thumbContainer = document.createElement('div');
                                    thumbContainer.className = "zoom-container"
                                    let thumb = getThumbnailContainer.apply(this,[index]);
                                    let zoomRect = getZoomRect.apply(this);
                                    this.button.appendChild(thumbContainer);
                                    thumbContainer.appendChild(thumb);
                                    thumbContainer.appendChild(zoomRect);
                                    $(thumbContainer).hide();
                                    this._thumbnails.push({
                                        player:player,
                                        thumbContainer:thumbContainer,
                                        zoomRect:zoomRect,
                                        canvas:thumb
                                    });
                                    checkVisibility.apply(this);
                                }
                            })
                        }
                    });
                });
            
            let update = false;
            paella.events.bind(paella.events.play,(evt) => {
                let updateThumbs = () => {
                    this._thumbnails.forEach((item) => {
                        updateThumbnail(item);
                    });
                    if (update) {
                        setTimeout(() => {
                            updateThumbs();
                        }, 2000);
                    }
                }
                update = true;
                updateThumbs();
            });

            paella.events.bind(paella.events.pause,(evt) => {
                update = false;
            });

            paella.events.bind(paella.events.videoZoomChanged, (evt,target) => {
                this._thumbnails.some((thumb) => {
                    if (thumb.player==target.video) {
                        if (thumb.player.zoom>100) {
                            $(thumb.thumbContainer).show();
                            let x = target.video.zoomOffset.x * 100 / target.video.zoom;
                            let y = target.video.zoomOffset.y * 100 / target.video.zoom;
                            
                            let zoomRect = thumb.zoomRect;
                            $(zoomRect).css({
                                left: x + '%',
                                top: y + '%',
                                width: (10000 / target.video.zoom) + '%',
                                height: (10000 / target.video.zoom) + '%'
                            });
                        }
                        else {
                            $(thumb.thumbContainer).hide();
                        }
                        return true;
                    }
                })
            });

            paella.events.bind(paella.events.zoomAvailabilityChanged, (evt,target) => {
                this._visible = target.available;
                checkVisibility.apply(this);
            });
        }

        action(button) {
            //paella.messageBox.showMessage(base.dictionary.translate("Live streaming mode: This is a live video, so, some capabilities of the player are disabled"));
        }

        getName() {
            return "es.upv.paella.videoZoomPlugin";
        }
    }

    paella.plugins.videoZoomPlugin = new VideoZoomPlugin();

    class VideoZoomToolbarPlugin extends paella.ButtonPlugin {
        getAlignment() { return 'right'; }
        getSubclass() { return "videoZoomToolbar"; }
        getIndex() { return 2030; }
        getMinWindowSize() { return (paella.player.config.player &&
                                    paella.player.config.player.videoZoom &&
                                    paella.player.config.player.videoZoom.minWindowSize) || 600; }
        getName() { return "es.upv.paella.videoZoomToolbarPlugin"; }
        getDefaultToolTip() { return base.dictionary.translate("Change theme"); }
        getButtonType() { return paella.ButtonPlugin.type.popUpButton; }

        checkEnabled(onSuccess) {
            paella.player.videoContainer.videoPlayers()
                .then((players) => {
                    let pluginData = paella.player.config.plugins.list["es.upv.paella.videoZoomToolbarPlugin"];
                    let playerIndex = pluginData.targetStreamIndex;
                    this.targetPlayer = players.length>playerIndex ? players[playerIndex] : null;
                    onSuccess(paella.player.config.player.videoZoom.enabled &&
                              this.targetPlayer &&
                              this.targetPlayer.allowZoom());
                });
        }
        
        buildContent(domElement) {
            paella.events.bind(paella.events.videoZoomChanged, (evt,target) => {
                this.setText(Math.round(target.video.zoom) + "%");
            });

            this.setText("100%");

            function getZoomButton(className,onClick) {
                let btn = document.createElement('div');
                btn.className = `videoZoomToolbarItem ${ className }`;
                btn.innerHTML = `<i class="glyphicon glyphicon-${ className }"></i>`;
                $(btn).click(onClick);
                return btn;
            }
            domElement.appendChild(getZoomButton('zoom-in',(evt) => {
                this.targetPlayer.zoomIn();
            }));
            domElement.appendChild(getZoomButton('zoom-out',(evt) => {
                this.targetPlayer.zoomOut();
            }));
        }
    }


    paella.plugins.videoZoomToolbarPlugin = new VideoZoomToolbarPlugin();


})();