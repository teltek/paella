
paella.addPlugin(function() {
	return class integratedDurationPlugin extends paella.ButtonPlugin {
		getAlignment() { return 'left'; }
		getSubclass() { return 'integratedDurationButton'; }
		getName() { return "es.teltek.paella.integratedDurationPlugin"; }
		getDefaultToolTip() { return base.dictionary.translate("Duration"); }
		getIndex() {return 190;}

		checkEnabled(onSuccess) {
			onSuccess(true);
		}

		setup() {
		    let self = this;
			paella.events.bind(paella.events.timeUpdate,function(event,params) {self.changeTime();});
		}

		changeTime(){
		    let thisClass = this;
		    
            paella.player.videoContainer.currentTime().then(function(duration) {
                paella.player.videoContainer.duration().then(function(d) {
                      duration = parseInt(duration);
                      thisClass.setText(thisClass.secondsToHours(duration) + " / " + thisClass.secondsToHours(parseInt(d)));
                });
		    });
        }

        getText() {
            return "00:00 / 00:00";
        }

        secondsToHours(sec_numb) {
            let hours   = Math.floor(sec_numb / 3600);
            let minutes = Math.floor((sec_numb - (hours * 3600)) / 60);
            let seconds = sec_numb - (hours * 3600) - (minutes * 60);

            if (minutes < 10) {minutes = "0"+minutes;}
            if (seconds < 10) {seconds = "0"+seconds;}

            if(hours === 0) {
                return minutes + ':' + seconds;
            }

            if(minutes === 0) {
                return '0:' + seconds;
            }

            return hours + ':' + minutes + ':' + seconds;
        }

	};
});
