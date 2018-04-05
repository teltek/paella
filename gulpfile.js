"use strict"
const	gulp = require('gulp'),
		concat = require('gulp-concat'),
		connect = require('gulp-connect'),
		replace = require('gulp-replace'),
		less = require('gulp-less'),
		traceur = require('gulp-traceur'),
		merge = require('gulp-merge-json'),
		fs = require('fs'),
		minify = require('gulp-minify'),
		uglify = require('gulp-uglify-es').default,
		flatten = require('gulp-flatten'),
		path = require('path'),

		exec = require('child_process').execSync,

		runSequence = require('run-sequence'),
		nightwatch = require('gulp-nightwatch'),
		glob = require('glob-all');		;

var config = {
	outDir:'build/'
};


gulp.task("test:nightwatch:local:run", function(){
	return gulp.src('')
	.pipe(nightwatch({
		configFile: 'tests/nightwatch/nightwatch.js'
	}));
});


gulp.task("test:local", function(cb){
	runSequence('test:nightwatch:local:run', cb)
});


function getVersion() {
	let pkg = require('./package.json');
	try {
		let rev = exec('git show --oneline -s');
		let re = /([a-z0-9:]+)\s/i;
		let reResult = re.exec(rev);
		if (reResult && !/fatal/.test(reResult[1])) {
			return pkg.version + ' - build: ' + reResult[1];
		}
		else {
			return pkg.version;
		}
	}
	catch (e) {
		return pkg.version;
	}
}

function getFiles(dir,fileExt,filelist) {
	let fs = require('fs'),
	files = fs.readdirSync(dir);
	filelist = filelist || [];
	if (!Array.isArray(fileExt)) {
		fileExt = [fileExt];
	}
	files.forEach(function(file) {
		let ext = file.split('.').pop();
		if (fs.statSync(dir + '/' + file).isDirectory() && file!='deps') {
			filelist = getFiles(dir + file + '/', fileExt, filelist);
		}
		else if (fileExt.indexOf(ext)!=-1) {
			filelist.push(dir + file);
		}
	});
	return filelist;
}

gulp.task("webserver", function() {
	connect.server({
		name: 'Paella Player',
    	root: 'build',
    	port: 8000,
	});
});

gulp.task("compileES5", function() {
	let files = getFiles("src/","js");
	files = getFiles("plugins/","js",files);
	return gulp.src(files)
		.pipe(concat("paella_player.js"))
		.pipe(traceur())
		.pipe(replace(/@version@/,getVersion()))
		.pipe(uglify())
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("compileES2015", function() {
	let files = getFiles("src/","js");
	files = getFiles("plugins/","js",files);
	return gulp.src(files)
		.pipe(concat("paella_player_es2015.js"))
		.pipe(replace(/@version@/,getVersion()))
		.pipe(uglify())
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("compileDebugES5", function() {
	let files = getFiles("src/","js");
	files = getFiles("plugins/","js",files);
	return gulp.src(files)
		.pipe(traceur())
		.pipe(concat("paella_player.js"))
		.pipe(replace(/\@version\@/,getVersion()))
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("compileDebugES2015", function() {
	let files = getFiles("src/","js");
	files = getFiles("plugins/","js",files);
	return gulp.src(files)
		.pipe(concat("paella_player_es2015.js"))
		.pipe(replace(/\@version\@/,getVersion()))
		.pipe(gulp.dest(`${config.outDir}player/javascript/`));
});

gulp.task("compile",["compileES5","compileES2015"]);
gulp.task("compileDebug",["compileDebugES5","compileDebugES2015"]);

gulp.task("styles", function() {
	let p = [];
	function genSkin(skinPath) {
		var stat = fs.statSync(skinPath);
		if (stat.isDirectory()) {
			
		}
		fs.readdirSync(skinPath)
			.forEach(function(pathItem) {
				if (pathItem.substr(pathItem.length - 5) == ".less") {
					let fullPath = path.join(skinPath,pathItem);
					p.push(gulp.src([fullPath,
							'resources/style/*.less',
							'resources/style/*.css',
							'plugins/**/*.less',
							'plugins/**/*.css',
							'vendor/plugins/**/*.less',
							'vendor/plugins/**/*.css'])
						.pipe(concat(`style_${pathItem}`))
						.pipe(less())
						.pipe(gulp.dest(`${config.outDir}player/resources/style`)));
				}
			});
	}
	genSkin('resources/style/skins');
	genSkin('vendor/skins');
	return Promise.all(p);
});

gulp.task("copy", function() {
	let p = [
		gulp.src('config/**')
			.pipe(gulp.dest(`${config.outDir}player/config`)),

		gulp.src('repository_test/**')
			.pipe(gulp.dest(`${config.outDir}`)),

		gulp.src('javascript/*')
			.pipe(gulp.dest(`${config.outDir}player/javascript/`)),

		gulp.src('resources/bootstrap/**')
			.pipe(gulp.dest(`${config.outDir}player/resources/bootstrap`)),

		gulp.src('resources/images/**')
			.pipe(gulp.dest(`${config.outDir}player/resources/images`)),

		gulp.src('resources/style/fonts/**')
			.pipe(gulp.dest(`${config.outDir}player/resources/style/fonts`)),

		gulp.src(['*.html'])
			.pipe(gulp.dest(`${config.outDir}player/`)),

		gulp.src('node_modules/traceur/bin/traceur-runtime.js')
			.pipe(minify({ ext: { min: '.min.js' }}))
			.pipe(gulp.dest(`${config.outDir}player/javascript`))
	];

	function addPlugins(pluginPath) {
		fs.readdirSync(pluginPath).forEach((dir) => {
			var fullDir = path.join('plugins',dir);
			var resourcesDir = path.join(fullDir,'resources/**');
			var depsDir = path.join(fullDir,'deps/**');
			p.push(gulp.src(resourcesDir)
				.pipe(gulp.dest(`${config.outDir}player/resources/style`)));
			p.push(gulp.src(depsDir)
				.pipe(gulp.dest(`${config.outDir}player/resources/deps`)));
		});
	}

	addPlugins('plugins');
	addPlugins('vendor/plugins');

	return Promise.all(p);
});



 
gulp.task("dictionary", function(cb) {	
	let p = [];
	let langs = [];
	glob.sync([
		'localization/*',
	]).forEach((l) => {
		let re = RegExp(".*_([a-z]+)(\-[a-zA-Z]+)?\.json");
		let result = re.exec(l);
		if (result && !langs.includes(result[1])) {	
			langs.push(result[1]);
		}
	});

	langs.forEach((lang) => {
		p.push(gulp.src([
			`localization/**${lang}**.json`,
			`plugins/**/localization/${lang}**.json`
			])
			.pipe(merge(`paella_${lang}.json`))
			.pipe(gulp.dest(`${config.outDir}player/localization`)));		
	});
	return Promise.all(p);
});


gulp.task("setupBower", function() {
	config.outDir = "../bower-paella/";
});


gulp.task("build", ["compile","styles","dictionary","copy"]);
gulp.task("buildDebug", ["compileDebug","styles","dictionary","copy"]);
gulp.task("buildBower", ["setupBower","build"]);

gulp.task("watch", function() {
	return gulp.watch([
		'index.html',
		'config/**',
		'plugins/**',
		'vendor/plugins/**',
		'src/*.js'
	],["build"]);
});

gulp.task("watchDebug", function() {
	return gulp.watch([
		'index.html',
		'resources/**',
		'repository_test/**',
		'config/**',
		'plugins/**',
		'vendor/plugins/**',
		'src/*.js'
	],["buildDebug"]);
});

gulp.task("tools", function() {
	let p = [
		gulp.src('tools/**')
			.pipe(gulp.dest(`${config.outDir}tools`)),

		gulp.src('src/flash_streaming/*.swf')
			.pipe(gulp.dest(`${config.outDir}tools/rtmp-test/`))
	];
	return Promise.all(p);
});

gulp.task("default",["build"]);
gulp.task("serve",["buildDebug","webserver","tools","watchDebug"]);

// Compatibility
gulp.task("server.release",["build","webserver","tools","watch"]);
gulp.task("server.debug",["buildDebug","webserver","tools","watchDebug"]);
gulp.task("build.debug",["buildDebug"]);
gulp.task("build.release",["build"]);

gulp.task("build.bower",["buildBower"]);
