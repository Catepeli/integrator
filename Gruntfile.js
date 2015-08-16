'use strict';

module.exports = function(grunt) {

	grunt.initConfig({
		sass: {
			app: {
				files: [{
					expand: true,
					cwd: '<%= cfg.sass %>',
					src: ['*.scss'],
					dest: '<%= cfg.css %>',
					ext: '.css'
				}]
			},
			// Voir https://github.com/sass/node-sass#options pour toutes les operations
			options: {
				sourceMap: true, 
				outputStyle: 'compressed',
				includePaths: [
				'bower_components/compass-mixins/lib',
				'bower_components/bootstrap-sass/assets/stylesheets'
				]
			}
		},
		watch: {
			sass: {
				// Watches all Sass or Scss files within the sass folder and one level down. 
				// If you want to watch all scss files instead, use the "**/*" globbing pattern
				files: ['*.scss'],
				// runs the task `sass` whenever any watched file changes 
				tasks: ['sass']

			},
			options: {
				cwd: '<%= cfg.sass %>',
				spawn: false,
				interrupt: true,
				// voir ici https://github.com/livereload/livereload-js
				// et ici https://addons.mozilla.org/fr/firefox/addon/livereload/
				// et ici https://github.com/gruntjs/grunt-contrib-watch/blob/master/docs/watch-examples.md#enabling-live-reload-in-your-html
				livereload: 35729,
				livereloadOnError: false,
				dateFormat: function(time) {
					grunt.log.write(grunt.template.today("[HH:MM:ss] "));
					grunt.log.writeln('Execution en '+time+'ms');
				}
			}
		},
		postcss: {
			options: {
				map: true, // sourcemaps
				processors: [
				require('pixrem')(), // add fallbacks for rem units, cf https://github.com/robwierzbowski/node-pixrem pour les browers supportés
				require('autoprefixer-core')({browsers: 'last 2 versions'}), // voir https://github.com/ai/browserslist pour definir les browers supportés
				require('cssnano')() // minify the result
				]
			},
			dist: {
				src: '<%= cfg.css %>/*.css'
			}
		},
		express: {
			options: {
				args: [] // url de redirection par defaut, par exemple ['http://www.foo.bar']
			},
			main: {
				options: {
					script: 'server.js'
				}
			}
		}
	});

	// lecture du fichier de configuration
	if (grunt.file.exists('config.json')) {
		grunt.config.merge(grunt.file.readJSON('config.json'));
	}

	// --sass=... et --css=... sont prioritaires par rapport au fichier de configuration
	var options = {};
	['sass','css'].forEach(function(arg) {
		if (grunt.option(arg)) {
			options[arg] = grunt.option(arg);
		}
	});

	// mise à jour de la configuration par rapport aux options passées en ligne de commande
	grunt.config.merge({
		cfg: options
	});
	
	var cfg = grunt.config.get('cfg');
	var sass = cfg.sass || grunt.fail.fatal("option --sass=<repertoire> manquant");
	var css = cfg.css || grunt.fail.fatal("option --css=<repertoire> manquant");

	grunt.file.isDir(sass) || grunt.fail.fatal("repertoire '"+sass+"' inexistant");
	grunt.file.isDir(css) || grunt.fail.warn("repertoire '"+css+"' inexistant");

	grunt.log.write("Répertoire source      : ").writeln(sass['cyan']);
	grunt.log.write("Répertoire destination : ").writeln(css['cyan']);
	
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-express-server');

	grunt.registerTask('default', ['sass', 'watch']);
	grunt.registerTask('serve', ['express', 'default']);

};
