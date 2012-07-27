/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib');  
    
  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    dist: 'dist',
    dist_source: '<%= dist %>/bootstrap-editable',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> \n' +
        '* <%= pkg.description %>\n' +
        '* <%= pkg.homepage %>\n\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    clean: ['<config:dist>'],
    concat: {
      dist_js: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/js/<%= pkg.name %>.js>'],
        dest: '<%= dist_source %>/js/<%= pkg.name %>.js'
      },
      dist_css: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/css/<%= pkg.name %>.css>'],
        dest: '<%= dist_source %>/css/<%= pkg.name %>.css'
      }
    },
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
      files: ['grunt.js', 'src/js/*.js']
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
        browser: true
      },
      globals: {
        jQuery: true
      }
    },
    copy: {
        dist: {
            files: {
                '<%= dist_source %>/img' : 'src/img/*',
                '<%= dist_source %>': ['LICENSE-GPL', 'LICENSE-MIT', 'README.md']
            },
            options: {
               flatten: true
            }
        }
    },
    compress: {
        zip: {
            options: {
                mode: "zip",
                //TODO: unfortunatly here <%= dist_source %> and <config:dist_source> does not work
                basePath: "dist/bootstrap-editable"
               },
            files: {
                "<%= dist %>/bootstrap-editable-v<%= pkg.version %>.zip": "<%= dist_source %>/**"
            }
        }
    },    
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit');
  
  // build
  grunt.registerTask('build', 'clean lint concat min copy compress');

};
