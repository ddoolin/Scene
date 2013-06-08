module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        less: {
            scene: {
                options: {
                    paths: ["public/css"],
                    yuicompress: true
                },
                files: {
                    "public/scene.css": ["public/css/main.less"]
                }
            }
        },
        concat: {
            scene: {
                options: {
                    separator: ";"
                },
                src: ["public/js/application.js",
                      "public/js/vendor/*.js",
                      "public/js/controllers/*.js",
                      "public/js/form-validators/*.js",
                      "public/js/views/*.js"],
                dest: "public/scene.js"
            }
        },
        uglify: {
            scene: {
                options: {
                    beautify: true,
                    mangle: { toplevel: true },
                    squeeze: { dead_code: false },
                    codegen: { quote_keys: true },
                    preserveComments: false,
                    compression: true
                },
                src: "public/scene.js",
                dest: "public/scene.min.js"
            }
        },
        watch: {
            styles: {
                files: ["public/css/**/*.less", "public/css/**/*.css"],
                tasks: ["less:scene"],
            },
            scripts: {
                files: ["public/js/**/*.js"],
                tasks: ["concat:scene", "uglify:scene"],
            }
        }
    });

    // Load plugins
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    // Tasks
    grunt.registerTask("default", ["watch"])
}
