paella.addPlugin(function () {
    return class simpleSoundControlPlugin extends paella.ButtonPlugin {
        getAlignment() {
            return 'left';
        }

        getSubclass() {
            return 'simpleSoundButton';
        }

        getIconClass() {
            return 'icon-volume-high';
        }

        getName() {
            return "es.teltek.paella.simpleSoundControlPlugin";
        }

        getDefaultToolTip() {
            return base.dictionary.translate("Volume");
        }

        getIndex() {
            return 141;
        }

        checkEnabled(onSuccess) {
            this._tempMasterVolume = 0;
            this._inputMaster = null;
            this._control_NotMyselfEvent = true;
            this._storedValue = false;
            let enabled = true;
            onSuccess(enabled);
        }

        setup() {
            var self = this;

            var rangeInputMaster = document.getElementById('soundRange');
            paella.player.videoContainer.masterVideo().volume()
                .then((vol) => {
                    rangeInputMaster.value = vol;
                });

            function updateMasterVolume() {
                var masterVolume = $(rangeInputMaster).val();
                self._control_NotMyselfEvent = false;
                paella.player.videoContainer.setVolume({ master:masterVolume });
            }

            $(rangeInputMaster).bind('input', function (e) { updateMasterVolume(); });
            $(rangeInputMaster).change(function() { updateMasterVolume(); });

            paella.events.bind(paella.events.setVolume, (event,params) => {
                rangeInputMaster.value = params.master;
                this.updateClass();
            });

            self.updateClass();

            var Keys = {Tab:9,Return:13,Esc:27,End:35,Home:36,Left:37,Up:38,Right:39,Down:40};

            $(this.button).keyup(function(event) {
                if(thisClass.isPopUpOpen()) {
                    paella.player.videoContainer.volume().then((v) => {
                        let newvol = -1;
                        if (event.keyCode == Keys.Left) {
                            newvol = v - 0.1;
                        }
                        else if (event.keyCode == Keys.Right) {
                            newvol = v + 0.1;
                        }

                        if (newvol!=-1) {
                            newvol = newvol<0 ? 0 : newvol>1 ? 1 : newvol;
                            paella.player.videoContainer.setVolume(newvol).then((v) => {
                            });
                        }
                    });
                }
            });

            paella.events.bind(paella.events.videoUnloaded, function (event, params) {
                self.storeVolume();
            });

            paella.events.bind(paella.events.singleVideoReady, function (event, params) {
                self.loadStoredVolume(params);
            });

            paella.events.bind(paella.events.setVolume, function (evt, par) {
                self.updateVolumeOnEvent(par);
            });
        }

        action() {
            var thisClass = this;

            paella.player.videoContainer.mainAudioPlayer().volume()
                .then(function (v) {
                    if (v === 0) {
                        paella.player.videoContainer.setVolume({master: 1});
                    } else {
                        paella.player.videoContainer.setVolume({master: 0});
                    }

                    thisClass.updateClass();
                });

        }

        updateVolumeOnEvent(volume) {
            var thisClass = this;

            if (thisClass._control_NotMyselfEvent) {
                thisClass._inputMaster = volume.master;
            }
            else {
                thisClass._control_NotMyselfEvent = true;
            }
        }

        storeVolume() {
            var This = this;
            paella.player.videoContainer.mainAudioPlayer().volume()
                .then(function (v) {
                    This._tempMasterVolume = v;
                    This._storedValue = true;
                });
        }

        loadStoredVolume(params) {
            if (this._storedValue === false) {
                this.storeVolume();
            }

            if (this._tempMasterVolume) {
                paella.player.videoContainer.setVolume({master: this._tempMasterVolume});
            }
            this._storedValue = false;
        }

        getText() {
            return '<div class="range"><input id="soundRange" type="range" min="0" max="1" step="0.01"/></div>';
        }

        updateClass() {
            var selected = '';

            paella.player.videoContainer.mainAudioPlayer().volume()
                .then((volume) => {
                    if (volume === undefined) {
                        selected = 'icon-volume-mid';
                    }
                    else if (volume === 0) {
                        selected = 'icon-volume-mute';
                    }
                    else if (volume < 0.33) {
                        selected = 'icon-volume-low';
                    }
                    else if (volume < 0.66) {
                        selected = 'icon-volume-mid';
                    }
                    else {
                        selected = 'icon-volume-high';
                    }
                    this.changeIconClass(selected);
                });
        }
    };
});
