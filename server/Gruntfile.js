module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jade: {
            floud: {
                options: {
                    data: {
                        debug: true
                    },
                    pretty: true,
                    client: false
                },
                files: [{
                    cwd: 'assets/views/',
                    src: ['*.jade'],
                    dest: 'public/views',
                    expand: true,
                    ext: '.html'
                }]
            }
        },
        watch: {
            jade: {
                files: ['assets/views/**/*.jade'],
                tasks: ['jade']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jade');

    // Default task(s).
    grunt.registerTask('default', ['jade', 'watch']);

};