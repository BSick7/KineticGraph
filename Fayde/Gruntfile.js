var version = require('./build/version'),
    setup = require('./build/setup'),
    path = require('path'),
    connect_livereload = require('connect-livereload');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-symlink');
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
        clean: {
            bower: ['./lib'],
            test: ['<%= dirs.test.root %>/lib'],
            testsite: ['<%= dirs.testsite.root %>/lib']
        },
        setup: {
            fayde: {
                cwd: '.'
            }
        },
        symlink: {
            options: {
                overwrite: true
            },
            test: {
                files: [
                    { src: './lib/qunit', dest: '<%= dirs.test.root %>/lib/qunit' },
                    { src: './lib/requirejs', dest: '<%= dirs.test.root %>/lib/requirejs' },
                    { src: './lib/requirejs-text', dest: '<%= dirs.test.root %>/lib/requirejs-text' },
                    { src: './lib/minerva', dest: '<%= dirs.test.root %>/lib/minerva' },
                    { src: './lib/fayde', dest: '<%= dirs.test.root %>/lib/fayde' },
                    { src: './themes', dest: '<%= dirs.test.root %>/lib/Fayde.KineticGraph/themes' },
                    { src: './Fayde.KineticGraph.js', dest: '<%= dirs.test.root %>/lib/Fayde.KineticGraph/Fayde.KineticGraph.js' },
                    { src: './Fayde.KineticGraph.d.ts', dest: '<%= dirs.test.root %>/lib/Fayde.KineticGraph/Fayde.KineticGraph.d.ts' },
                    { src: './Fayde.KineticGraph.js.map', dest: '<%= dirs.test.root %>/lib/Fayde.KineticGraph/Fayde.KineticGraph.js.map' },
                    { src: './src', dest: '<%= dirs.test.root %>/lib/Fayde.KineticGraph/src' }
                ]
            },
            testsite: {
                files: [
                    { src: './lib/requirejs', dest: '<%= dirs.testsite.root %>/lib/requirejs' },
                    { src: './lib/requirejs-text', dest: '<%= dirs.testsite.root %>/lib/requirejs-text' },
                    { src: './lib/minerva', dest: '<%= dirs.testsite.root %>/lib/minerva' },
                    { src: './lib/fayde', dest: '<%= dirs.testsite.root %>/lib/fayde' },
                    { src: './themes', dest: '<%= dirs.testsite.root %>/lib/Fayde.KineticGraph/themes' },
                    { src: './Fayde.KineticGraph.js', dest: '<%= dirs.testsite.root %>/lib/Fayde.KineticGraph/Fayde.KineticGraph.js' },
                    { src: './Fayde.KineticGraph.d.ts', dest: '<%= dirs.testsite.root %>/lib/Fayde.KineticGraph/Fayde.KineticGraph.d.ts' },
                    { src: './Fayde.KineticGraph.js.map', dest: '<%= dirs.testsite.root %>/lib/Fayde.KineticGraph/Fayde.KineticGraph.js.map' },
                    { src: './src', dest: '<%= dirs.testsite.root %>/lib/Fayde.KineticGraph/src' }
                ]
            },
            localfayde: {
                files: [
                    { src: '../../Fayde', dest: './lib/Fayde' }
                ]
            }
        },
        typescript: {
            build: {
                src: ['src/_Version.ts', 'src/*.ts', 'src/**/*.ts', 'lib/**/*.d.ts'],
                dest: '<%= meta.name %>.js',
                options: {
                    target: 'es5',
                    declaration: true,
                    sourceMap: true
                }
            },
            test: {
                src: ['<%= dirs.test.root %>/**/*.ts', '!<%= dirs.test.root %>/lib/**/*.ts', 'lib/**/*.d.ts'],
                options: {
                    target: 'es5',
                    module: 'amd',
                    sourceMap: true
                }
            },
            testsite: {
                src: ['<%= dirs.testsite.root %>/**/*.ts', '!<%= dirs.testsite.root %>/lib/**/*.ts', 'lib/**/*.d.ts'],
                dest: '<%= dirs.testsite.build %>',
                options: {
                    basePath: dirs.testsite.root,
                    target: 'es5',
                    module: 'amd',
                    sourceMap: true
                }
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
    grunt.registerTask('test', ['version:apply', 'typescript:build', 'typescript:test', 'qunit']);
    grunt.registerTask('testsite', ['version:apply', 'typescript:build', 'typescript:testsite', 'connect', 'open', 'watch']);
    setup(grunt);
    version(grunt);
    grunt.registerTask('package', ['nugetpack:dist']);
    grunt.registerTask('publish', ['nugetpack:dist', 'nugetpush:dist']);
    grunt.registerTask('lib:reset', ['clean', 'setup', 'symlink:test', 'symlink:testsite']);
    grunt.registerTask('link:fayde' ['symlink:localfayde']);
};