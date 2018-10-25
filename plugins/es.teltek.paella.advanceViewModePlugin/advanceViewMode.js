paella.addPlugin(function () {

    function setupButtons(videoPlayer) {

        let wrapper = videoPlayer.parent;
        let wrapperDom = wrapper.domElement;

        let fullScreenButton = document.createElement('button');
        wrapperDom.appendChild(fullScreenButton);
        fullScreenButton.className = "fullscreen_button";
        if (paella.player.isFullScreen()) {
            fullScreenButton.innerHTML = '<i class="glyphicon glyphicon-resize-small"></i>';
        } else {
            fullScreenButton.innerHTML = '<i class="glyphicon glyphicon-resize-full"></i>';
        }
        $(fullScreenButton).on('mouseup', () => {
            setFullScreen(wrapperDom.id);
        });


        if ('slide_professor' === paella.player.selectedProfile || 'professor_slide' === paella.player.selectedProfile) {
            let changeLayoutButton = document.createElement('button');
            wrapperDom.appendChild(changeLayoutButton);
            changeLayoutButton.className = "layout_button";
            changeLayoutButton.innerHTML = '<i class="glyphicon glyphicon-transfer"></i>';
            $(changeLayoutButton).on('mousedown', () => {
                changeLayouts();
            });
        }
    }

    function changeLayouts() {
        if ('slide_professor' === paella.player.selectedProfile) {
            paella.player.setProfile('professor_slide');
        } else {
            paella.player.setProfile(paella.Profiles.getDefaultProfile());
        }
    }

    function setFullScreen(id) {
        if (paella.player.isFullScreen()) {
            paella.player.setProfile(paella.Profiles.getDefaultProfile());
            paella.player.exitFullScreen();
        } else {
            if (id === "masterVideoWrapper") {
                paella.player.setProfile("professor");
            }
            if (id === "slaveVideoWrapper") {
                paella.player.setProfile("slide");
            }

            paella.player.goFullScreen();
            paella.player.videoContainer.play();
        }
    }

    return class advanceViewModePlugin extends paella.EventDrivenPlugin {

        getName() {
            return "es.teltek.paella.advanceViewModePlugin";
        }

        getDefaultToolTip() {
            return base.dictionary.translate("Change video layout");
        }

        checkEnabled(onSuccess) {
            onSuccess(!paella.player.videoContainer.isMonostream);
        }

        getIndex() {
            return 10;
        }

        getSubclass() {
            return "advanceViewMode";
        }

        getAlignment() {
            return 'right';
        }

        getDefaultToolTip() {
            return "Layout advance mode";
        }

        setup() {
            paella.player.videoContainer.videoPlayers()
                .then((players) => {
                    players.forEach((player, index) => {
                        setupButtons.apply(this, [player]);
                    });
                });

            paella.events.bind(paella.events.exitFullscreen, function (event, params) {
                paella.player.setProfile(paella.Profiles.getDefaultProfile());
                paella.player.videoContainer.play();
            });

            paella.events.bind(paella.events.enterFullscreen, function (event, params) {
                paella.player.videoContainer.play();
            });

        }
    };
});
