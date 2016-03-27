module.exports = function(grunt) {

  // project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    less: {
      production: {
        options: {
          paths: ["app/static/css"],
          cleancss: true,
          plugins: [
            (new (require('less-plugin-clean-css'))({
              advanced: true,
              compatibility: 'ie8'
            }))
          ]
        },
        files: {
          "app/static/css/style.css": "app/static/css/style.less"
        }
      }
    },

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
    },

    watch: {
      less: {
        files: ['app/static/css/**/*.less'],
        tasks: ['less']
      },
      react: {
        files: ['app/static/js/**/*.jsx'],
        tasks: ['react']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-react');

  // default task
  grunt.registerTask('default', [
    'less',
    'react',
    'uglify'
  ]);
};
