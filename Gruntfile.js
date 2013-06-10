module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      css: {
        files: '**/*.styl',
        tasks: ['stylus'],
        options: {
          interrupt: true
        }
      }
    },
    stylus: {
      compile: {
        files: {
          'public/css/style.css': ['public/css/style.styl'] // compile and concat into single file
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['stylus']);

};