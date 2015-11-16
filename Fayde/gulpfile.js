var fs = require('fs'),
    typings = require('bower-typings'),
    allTypings = typings(),
    name = 'Fayde.KineticGraph',
    meta = {
        name: name,
        src: [
            'typings/*.d.ts',
            'src/_version.ts',
            'src/**/*.ts'
        ].concat(typings({includeSelf: false})),
        scaffolds: [
            {
                name: 'test',
                symdirs: ['dist', 'src', 'themes'],
                src: [
                    'typings/*.d.ts',
                    'test/**/*.ts',
                    '!test/lib/**/*.ts',
                    'dist/' + name + '.d.ts'
                ].concat(allTypings)
            },
            {
                name: 'testsite',
                ignore: 'lib/qunit',
                port: 8001,
                symdirs: ['dist', 'src', 'themes'],
                src: [
                    'typings/*.d.ts',
                    'testsite/**/*.ts',
                    '!testsite/lib/**/*.ts',
                    'dist/' + name + '.d.ts'
                ].concat(allTypings)
            }
        ]
    };

fs.readdirSync('./gulp')
    .forEach(function (file) {
        require('./gulp/' + file)(meta);
    });
