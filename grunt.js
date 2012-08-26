/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib');
  
  //grunt.loadTasks('tasks/');
             
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    dist: 'dist',
    dist_source: '<%= dist %>/bootstrap-editable',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> \n' +
        '* <%= pkg.description %>\n' +
        '* <%= pkg.homepage %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    clean: ['<config:dist>'],
    concat: {
      dist_js: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/js/bootstrap-editable.js>', '<file_strip_banner:src/js/bootstrap-datepicker.js>'],
        dest: '<%= dist_source %>/js/<%= pkg.name %>.js'
      },
      dist_css: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/css/bootstrap-editable.css>', '<file_strip_banner:src/css/datepicker.css>'],
        dest: '<%= dist_source %>/css/<%= pkg.name %>.css'
      }
    },
    /* disable that task as it's better to write changelog manualy
    changelog: {
       user: 'vitalets',
       repo: 'bootstrap-editable',
       dest: 'CHANGELOG.txt'
    },
    */
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist_js.dest>'],
        dest: '<%= dist_source %>/js/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      files: ['test/index.html']
    },
    lint: {
     //TODO: lint tests files
     //files: ['grunt.js', 'src/js/*.js', 'test/**/*.js']     
//      files: ['grunt.js', 'src/js/*.js']
      files: ['grunt.js', 'src/js/bootstrap-editable.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        evil: false  //allow eval
      },
      globals: {
        jQuery: true
      }
    },
    copy: {
        dist: {
            files: {
                '<%= dist_source %>/img' : 'src/img/*',
                '<%= dist_source %>/js/locales' : 'src/js/locales/*',
                '<%= dist_source %>': ['LICENSE-GPL', 'LICENSE-MIT', 'README.md', 'CHANGELOG.txt']
            },
            options: {
               flatten: true
            }
        },
        libs: {
            files: {
                '<%= dist %>/libs': ['libs/bootstrap/**', 'libs/jquery/**']
            },
            options: {
               basePath: 'libs', 
               flatten: false
            }
        }        
    },
    //compress does not work properly for MAC OS (see https://github.com/vitalets/bootstrap-editable/issues/19)
    //zip will be created manually
    /*
    compress: {
        zip: {
            options: {
                mode: "zip",
                //TODO: unfortunatly here <%= dist_source %> and <config:dist_source> does not work
                basePath: "dist"
               },
            files: {
                "<%= dist %>/bootstrap-editable-v<%= pkg.version %>.zip": ["<%= dist_source %>/ **", "<%= dist %>/libs/ **"]
            }
        },
        tgz: {
            options: {
                mode: "tgz",
                basePath: "dist"
               },
            files: {
                "<%= dist %>/bootstrap-editable-v<%= pkg.version %>.tar.gz": ["<%= dist_source %>/ **", "<%= dist %>/libs/ **"]
            }
        }
    },
    */    
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit');
  
  // build
  grunt.registerTask('build', 'clean lint qunit concat min copy');
  
 //to run particular task use ":", e.g. copy:libs 
};
