var version = require('./build/version'),
    setup = require('./build/setup'),
    path = require('path'),
    connect_livereload = require('connect-livereload');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-nuget');

    var ports = {
        server: 8001,
        livereload: 15151
    };
    var meta = {
        name: 'Fayde.KineticGraph'
    };

    var dirs = {
        test: {
            root: 'test'
        },
        testsite: {
            root: 'testsite',
            build: 'testsite/.build'
        }
    };

    function mount(connect, dir) {
        return connect.static(path.resolve(dir));
    }

    grunt.initConfig({
        ports: ports,
        meta: meta,
        dirs: dirs,
        pkg: grunt.file.readJSON('./package.json'),
        setup: {
            test: {
                cwd: dirs.test.root
            },
            testsite: {
                cwd: dirs.testsite.root
            }
        },
        typescript: {
            build: {
                src: ['src/_Version.ts', 'src/*.ts', 'src/**/*.ts'],
                dest: '<%= meta.name %>.js',
                options: {
                    target: 'es5',
                    declaration: true,
                    sourceMap: true
                }
            },
            test: {
                src: ['<%= dirs.test.root %>/**/*.ts', '!<%= dirs.test.root %>/lib/**/*.ts'],
                options: {
                    target: 'es5',
                    module: 'amd',
                    sourceMap: true
                }
            },
            testsite: {
                src: ['<%= dirs.testsite.root %>/**/*.ts', '!<%= dirs.testsite.root %>/lib/**/*.ts'],
                dest: '<%= dirs.testsite.build %>',
                options: {
                    basePath: dirs.testsite.root,
                    target: 'es5',
                    module: 'amd',
                    sourceMap: true
                }
            }
        },
        copy: {
            pretest: {
                files: [
                    { expand: true, flatten: true, src: ['Themes/*'], dest: '<%= dirs.test.root %>/lib/<%= meta.name %>/Themes', filter: 'isFile' },
                    { expand: true, flatten: true, src: ['<%= meta.name %>.js'], dest: '<%= dirs.test.root %>/lib/<%= meta.name %>', filter: 'isFile' },
                    { expand: true, flatten: true, src: ['<%= meta.name %>.d.ts'], dest: '<%= dirs.test.root %>/lib/<%= meta.name %>', filter: 'isFile' }
                ]
            },
            pretestsite: {
                files: [
                    { expand: true, flatten: true, src: ['Themes/*'], dest: '<%= dirs.testsite.root %>/lib/<%= meta.name %>/Themes', filter: 'isFile' },
                    { expand: true, flatten: true, src: ['<%= meta.name %>.js'], dest: '<%= dirs.testsite.root %>/lib/<%= meta.name %>', filter: 'isFile' },
                    { expand: true, flatten: true, src: ['<%= meta.name %>.d.ts'], dest: '<%= dirs.testsite.root %>/lib/<%= meta.name %>', filter: 'isFile' }
                ]
            }
        },
        qunit: {
            all: ['<%= dirs.test.root %>/**/*.html']
        },
        connect: {
            server: {
                options: {
                    port: ports.server,
                    base: dirs.testsite.root,
                    middleware: function (connect) {
                        return [
                            connect_livereload({ port: ports.livereload }),
                            mount(connect, dirs.testsite.build),
                            mount(connect, dirs.testsite.root)
                        ];
                    }
                }
            }
        },
        watch: {
            src: {
                files: ['src/**/*.ts'],
                tasks: ['typescript:build']
            },
            dist: {
                files: ['<%= meta.name %>.js'],
                tasks: ['copy:pretestsite']
            },
            testsitets: {
                files: ['<%= dirs.testsite.root %>/**/*.ts'],
                tasks: ['typescript:testsite']
            },
            testsitejs: {
                files: ['<%= dirs.testsite.root %>/**/*.js'],
                options: {
                    livereload: ports.livereload
                }
            },
            testsitefay: {
                files: ['<%= dirs.testsite.root %>/**/*.fap', '<%= dirs.testsite.root %>/**/*.fayde'],
                options: {
                    livereload: ports.livereload
                }
            }
        },
        open: {
            testsite: {
                path: 'http://localhost:<%= ports.server %>/default.html'
            }
        },
        version: {
            bump: {
            },
            apply: {
                src: './build/_VersionTemplate._ts',
                dest: './src/_Version.ts'
            }
        },
        nugetpack: {
            dist: {
                src: './nuget/<%= meta.name %>.nuspec',
                dest: './nuget/',
                options: {
                    version: '<%= pkg.version %>'
                }
            }
        },
        nugetpush: {
            dist: {
                src: './nuget/<%= meta.name %>.<%= pkg.version %>.nupkg'
            }
        }
    });

    grunt.registerTask('default', ['version:apply', 'typescript:build']);
    grunt.registerTask('test', ['setup:test', 'version:apply', 'typescript:build', 'copy:pretest', 'typescript:test', 'qunit']);
    grunt.registerTask('testsite', ['setup:testsite', 'version:apply', 'typescript:build', 'copy:pretestsite', 'typescript:testsite', 'connect', 'open', 'watch']);
    setup(grunt);
    version(grunt);
    grunt.registerTask('package', ['nugetpack:dist']);
    grunt.registerTask('publish', ['nugetpack:dist', 'nugetpush:dist']);
};