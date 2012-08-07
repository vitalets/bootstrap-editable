/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib');
         
  grunt.registerTask('changelog', 'My super task.', function() {
      var GitHubApi = require("github");
      var github = new GitHubApi({
          version: "3.0.0"
      });

      var done = this.async();
      
      github.issues.getAllMilestones({
          user: 'vitalets',
          repo: 'bootstrap-editable',
          state: 'closed',
          sort: 'completeness'
      }, function(err, res) {
          
          function writeFile() {
             var lines = [], line;
             var moment = require('moment');
             lines.push('Bootstrap-editable change log'); 
             lines.push('============================='); 
             
             for(var i=0; i<res.length; i++) {  
                lines.push("\r\n"); 
                lines.push('Version '+res[i].title + (res[i].due_on ? ' '+moment(res[i].due_on).format('MMM D, YYYY') : '')); 
                lines.push('-----------------------'); 
                var issues = res[i].issues;
                for(var j=0; j<issues.length; j++) {
                   lines.push('#'+issues[j].number+': '+issues[j].title+' (' + (issues[j].assignee ? ('@'+issues[j].assignee.login) : '') + ')');  
                }
             }
             
             var fs = require('fs');
             fs.writeFileSync('changelog', lines.join("\r\n"), 'utf8');
          }
          
          var finished = 0;
          for(var i=0; i<res.length; i++) {
              console.log('Requesting '+res[i].title);  
              github.issues.repoIssues({
                  user: 'vitalets',
                  repo: 'bootstrap-editable',
                  milestone: res[i].number,
                  state: 'closed'
              }, (function(r) {
                   return function(err2, issues) {
                      r.issues = issues;
                      finished++;
                      console.log('loaded issues for ' + r.title + ': '+issues.length);  
                      if(finished == res.length) {
                          console.log('Finished: '+finished);
                          writeFile();
                          done(true);
                      }
                   }
              })(res[i]));                 
          }
      }); 
  });
             
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
        },
        libs: {
            files: {
                '<%= dist %>/libs': ['libs/bootstrap/**', 'libs/jquery/**', 'libs/jquery-ui/**']
            },
            options: {
               basePath: 'libs', 
               flatten: false
            }
        }        
    },
    compress: {
        zip: {
            options: {
                mode: "zip",
                //TODO: unfortunatly here <%= dist_source %> and <config:dist_source> does not work
                basePath: "dist"
               },
            files: {
                "<%= dist %>/bootstrap-editable-v<%= pkg.version %>.zip": "<%= dist %>/**"
            }
        }
    },    
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit');
  
  // build
  grunt.registerTask('build', 'clean lint qunit concat min copy compress');
  
 //to run particular task use ":", e.g. copy:libs 
};
