

module.exports = function(grunt) {
  'use strict';

  // our *in order* IIFE source files
  var iifeFiles = [
    './src/js/util.js',
    './src/js/error-handler.js',
    // './src/js/dialog-view.js',
    // './src/js/button-view.js',
    './src/js/events.js',
    './src/js/buttons.js',
    // './src/js/controls-view.js',
    // './src/js/registration-view.js',
    // './src/js/search-view.js',
    // './src/js/devicelinking-view.js',
    // './src/js/continuewatching-view.js',
    // './src/js/autoplay-view.js',
    // './src/js/player-view.js',
    // './src/js/signin-view.js',
    // './src/js/springboard-view.js',
    // './src/js/seriesSpringboard-view.js',
    // './src/js/landingpage-view.js',
    // './src/js/menubar-view.js',
    // './src/js/listscreen-view.js',
    // './src/js/gridrow-view.js',
    //'./src/js/featuredrow-view.js',
    // './src/js/gridwrap-view.js',
    // './src/js/autoplayShoveler-view.js',
    // './src/js/seriesSpringboardShoveler-view.js',
    // './src/js/springboardShoveler-view.js',
    // './src/js/browseShoveler-view.js',
    // './src/js/shoveler-view.js',
    // './src/js/featured-model-json.js',
    './src/js/model-json.js',
    './src/js/app.js',
    './src/js/init.js'
  ];
  var mobileFiles = [
    './src/js/mobileutil.js',
    './src/js/mobileerror-handler.js',
    './src/js/mobileevents.js',
    './src/js/mobilebuttons.js',
    './src/js/mobilemodel-json.js',
    './src/js/mobileapp.js',
    './src/js/mobileinit.js'
  ];

  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: '\r\n' // separate with a newline
      },
      dev: {
        files: {
          './dev/js/<%= pkg.name %>.js': iifeFiles
        }
      },
      mobile: {
        files: {
          './dev/js/mobilepdr.js': mobileFiles
        }
      },
      build: {
        files: {
          './build/js/<%= pkg.name %>.js': iifeFiles
        }
      }
    },
    uglify: {
      dist: {
        options: {
          mangle: true
        },
        files: {
          './build/js/<%= pkg.name %>.min.js': ['./build/js/<%= pkg.name %>.js'],
          './build/js/mobilepdr.min.js': ['./build/js/mobilepdr.js']
        }
      }
    },
    jshint: {
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      },
      all: [
        './src/js/**/*.js'
      ]
    },
    sass: {
      dev: {
        options: {
          style: 'compact'
        },
        files: {
          './dev/css/<%= pkg.name %>.css': './src/scss/<%= pkg.name %>.scss'
        }
      },
      mobile: {
        options: {
          style: 'compact'
        },
        files: {
          './dev/css/mobilepdr.css': './src/scss/mobilepdr.scss'
        }
      },
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          './build/css/<%= pkg.name %>.min.css': './src/scss/<%= pkg.name %>.scss'
        }
      }
    },
    processhtml: {
      dev: {
        options: {
          process: true,
          data: {
            title: '<%= pkg.description %>'
          }
        },
        files: {
          './dev/index.html': ['./src/html/index.html'],
          './dev/mobileIndex.html': ['./src/html/mobileIndex.html'],
          './dev/desktop.html': ['./src/html/desktop.html']
        }
      },
      dist: {
        options: {

          process: true,
          data: {
            title: '<%= pkg.description %>'
          }
        },
        files: {
          './build/index.html': ['./src/html/index.html']
        }
      }
    },
    jasmine: {
      all: {
        src: iifeFiles,
        options: {
          'vendor': './src/libs/**/*.js',
          'specs': './spec/**/*.js'
        }
      }
    },
    watch: {
      files: ['./Gruntfile.js', './src/js/**/*.js', './src/scss/**/*.scss', './src/html/index.html'],
      tasks: ['jshint', 'concat:dev','concat:mobile', 'sass:mobile', 'sass:dev', 'processhtml:dev']
    },
    shell: {
      copylibs: {
        command: function(dir) {
          return 'mkdir ./' + dir + '/libs/ ' + '&& cp ./src/libs/* ./' + dir + '/libs';
        }
      },
      copyassets: {
        command: function(dir) {
          return 'mkdir ./' + dir + '/assets/ ' + '&& cp ./src/assets/* ./' + dir + '/assets';
        }
      },
      copytizenassets: {
        command: function(dir) {
          return 'cp ./src/tizenspecific/* ./' + dir + '/assets';
        }
      },
      copytizenconfig: {
        command: function(dir) {
          return 'cp ./src/tizenSpecific/config.xml ./' + dir + '/';
        }
      },
      compress: {
        command: 'cd ./build && zip -r ../<%= pkg.name %>.zip ./* && cd ..'
      },
      cleanDev: {
        command: 'rm -rf dev'
      },
      cleanBuild: {
        command: 'rm -rf build'
      },
      cleanZip: {
        command: 'rm -rf *.zip'
      },
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.option('force', true);

  grunt.registerTask('devtizen', ['shell:cleanDev',
    'jshint',
    'concat:dev',
    'sass:dev',
    'processhtml:dev',
    'shell:copylibs:dev',
    'shell:copyassets:dev',
    'shell:copytizenassets:dev',
    'shell:copytizenconfig:dev',
    'watch'
  ]);

  grunt.registerTask('dev', ['shell:cleanDev',
    'jshint',
    'concat:dev',
    'concat:mobile',
    'sass:dev',
    'sass:mobile',
    'processhtml:dev',
    'shell:copylibs:dev',
    'shell:copyassets:dev',
    'watch'
  ]);

  grunt.registerTask('test', ['jshint', 'jasmine:all']);

  grunt.registerTask('build', ['shell:cleanBuild',
    'jshint',
    'concat:build',
    'sass:dist',
    'uglify',
    'processhtml:dist',
    'shell:copylibs:build',
    'shell:copyassets:build'
  ]);

  grunt.registerTask('package', ['build', 'shell:compress']);
  grunt.registerTask('cleanDev', ['shell:cleanDev']);
  grunt.registerTask('cleanBuild', ['shell:cleanBuild']);
  grunt.registerTask('clean', ['shell:cleanDev', 'shell:cleanBuild', 'shell:cleanZip']);
  grunt.registerTask('default', ['package']);
};
