module.exports = function(grunt) {

  // project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    react: {
      dynamic_mappings: {
        files: [
          {
            expand: true,
            cwd: 'app/static/js/',
            src: ['**/*.jsx'],
            dest: 'app/static/js/',
            ext: '.js'
          }
        ]
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      my_target: {
        files: [{
          expand: true,
          cwd: 'app/static/js/',
          src: '**/*.js',
          dest: 'app/static/js/'
        }]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-react');

  // default task
  grunt.registerTask('default', [
    'react',
    'uglify'
  ]);
};
