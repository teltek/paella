Class ("paella.plugins.MarksEditorPlugin",paella.editor.MainTrackPlugin, {
	tracks:null,
	selectedTrackItem:null,

	checkEnabled:function(onSuccess) {
		var This = this;
		this.tracks = [];
		paella.data.read('marks',{id:paella.initDelegate.getId()},function(data,status) {
			if (data && typeof(data)=='object' && data.marks && data.marks.length>0) {
				This.tracks = data.marks;
			}
			onSuccess(true);
		});
	},

	setup:function() {
		if (base.dictionary.currentLanguage()=="es") {
			var esDict = {
				'Chapter marks':'Marcas de capítulo',
				'Chapter mark':'Marca de capítulo',
				'Create a new chapter marks in the current position': 'Añade una marca de captitulo en el instante actual',
				'Delete selected chapter mark': 'Borra la marca de capítulo seleccionada'
			};
			base.dictionary.addDictionary(esDict);
		}
	},

	getTrackItems:function() {
		return this.tracks;
	},

	getTools:function() {
		return [
			{name:'create',label:base.dictionary.translate('Create'),hint:base.dictionary.translate('Create a new chapter marks in the current position')},
			{name:'delete',label:base.dictionary.translate('Delete'),hint:base.dictionary.translate('Delete selected chapter mark')}
		];
	},

	onToolSelected:function(toolName) {
		if (this.selectedTrackItem && toolName=='delete' && this.selectedTrackItem) {
			paella.events.trigger(paella.events.documentChanged);
			this.tracks.splice(this.tracks.indexOf(this.selectedTrackItem),1);
			return true;
		}
		else if (toolName=='create') {
			paella.events.trigger(paella.events.documentChanged);
			var start = paella.player.videoContainer.currentTime();
			var end = start + 1;
			var id = this.getTrackUniqueId();
			var content = base.dictionary.translate('Chapter mark');
			this.tracks.push({id:id,s:start,e:end,content:content,name:content});
			return true;
		}
	},

	getTrackUniqueId:function() {
		var newId = -1;
		if (this.tracks.length==0) return 1;
		for (var i=0;i<this.tracks.length;++i) {
			if (newId<=this.tracks[i].id) {
				newId = this.tracks[i].id + 1;
			}
		}
		return newId;
	},

	getName:function() {
		return "pumukitChapterMarkPlugin";
	},

	getTrackName:function() {
		return base.dictionary.translate("Chapter marks");
	},

	getColor:function() {
		return 'red';
	},

	getTextColor:function() {
		return 'rgb(90,90,90)';
	},

	onTrackChanged:function(id,start,end) {
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		if (item) {
			item.s = start;
			item.e = end;
			this.selectedTrackItem = item;
		}
	},

	onTrackContentChanged:function(id,content) {
		paella.events.trigger(paella.events.documentChanged);
		var item = this.getTrackItem(id);
		if (item) {
			item.content = paella.AntiXSS.htmlEscape(content);
			item.name = paella.AntiXSS.htmlEscape(content);
		}
	},

    isSegment:function() {
        return false;
    },

	allowEditContent:function() {
		return true;
	},

    allowResize:function() {
        return false;
    },

	getTrackItem:function(id) {
		for (var i=0;i<this.tracks.length;++i) {
			if (this.tracks[i].id==id) return this.tracks[i];
		}
	},

	contextHelpString:function() {
		if (base.dictionary.currentLanguage()=="es") {
			return "Utiliza esta herramienta para crear, borrar y editar marcas de capítulos. Para crear una marca, selecciona el instante de tiempo haciendo clic en el fondo de la línea de tiempo, y pulsa el botón 'Crear'. Utiliza esta pestaña para editar el texto de los capítulos";
		}
		else {
			return "Use this tool to create, delete and edit chapter marks. To create a chapter chapter, select the time instant clicking the timeline's background and press 'create' button. Use this tab to edit the chapter mark text.";
		}
	},

	onSave:function(success) {
		var data = {
			marks:this.tracks
		};
		paella.data.write('marks',{id:paella.initDelegate.getId()},data,function(response,status) {
                        if(typeof paella.plugins.marksPlayerPlugin !== 'undefined')
			    paella.plugins.marksPlayerPlugin.marks = data.marks;
			success(status);
		});

	}
});

paella.plugins.marksEditorPlugin = new paella.plugins.MarksEditorPlugin();

