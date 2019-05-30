paella.addPlugin(function() {
    return class LiveStreamIndicator extends paella.VideoOverlayButtonPlugin {
        isEditorVisible() { return paella.editor.instance!=null; }
        getIndex() {return 10;}
        getSubclass() { return "liveIndicator"; }
        getAlignment() { return 'right'; }
        getDefaultToolTip() { return base.dictionary.translate("This video is a live stream"); }
        getName() { return "es.upv.paella.liveStreamingIndicatorPlugin"; }

        checkEnabled(onSuccess) {
            onSuccess(paella.player.isLiveStream());
        }

        setup() {
            //<div class="lds-ripple"><div></div><div></div></div>
            this.button.insertAdjacentHTML('beforeend', '<span style="color: white; font-size: 150%">●</span><span id="text_broadcast" style="padding-left: 5px;color: white;">LIVE <span id="ngrp-info"></span></span>');

            var container = document.createElement('div');
            container.className = "playButtonOnScreen";
            container.id = 'paella_plugin_PlayButtonOnScreen';
            container.style.width = "100%";
            container.style.height = "100%";
            container.style['line-height'] = '100vh';
            container.style['text-align'] = 'center';
            $(container).click(function (e) { document.querySelector('#paella_plugin_PlayButtonOnScreen').hidden = true; });
            paella.player.videoContainer.domElement.appendChild(container);
            container.insertAdjacentHTML('beforeend', '<i class="icon-volume-mute" style="font-size: 40vh; color: white; border: 5px solid; border-radius: 100%; padding: 11vh; cursor: pointer; line-height: inherit;"></i>');
        }


/*
paella.events.bind(paella.events.setVolume, function(e) {
  document.querySelector('#paella_plugin_PlayButtonOnScreen').hidden = true;
});
*/



        action(button) {
            paella.messageBox.showMessage(base.dictionary.translate("Live streaming mode: This is a live video, so, some capabilities of the player are disabled"));
        }
    }
});
