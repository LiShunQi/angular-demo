module.exports=function(grunt){
    //配置
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        //检查style css语法
        csslint:{
            src:['public/stylesheets/*.css']
        },
        //合并css文件
        concat:{
            css:{
                src:['public/stylesheets/*.css'],
                /*根据目录下文件情况配置*/
                dest:'public/stylesheets/<%=pkg.name%>.css'
            }
        },
        //压缩style css文件为.min.css
        cssmin:{
            options:{
                //移除css文件中的所有注释
                keepSpecialComments:0
            },
            minify:{
                expand:true,
                cwd:'public/stylesheets',
                src:['<%=pkg.name%>.css'],
                dest:'public/stylesheets/dist/',
                ext:'.min.css'
            }
        },
        //压缩优化图片大小
        imagemin:{
            dist:{
                options:{
                    optimizationLevel:3
                },
                files:[
                    {
                        expand:true,
                        cwd:'public/images',
                        //优化img目录下所有png/jpg/jepg图片
                        src:['**/*.{png,jpg,jpeg}'],
                        //优化后的图片保存位置，默认覆盖
                        dest:'public/images/'
                    }
                ]
            }
        },

        //检查JavaScript语法
        jshint:{
            all:[
                'Gruntfile.js',
                'public/javascripts/jqCss.js',
                'public/javascripts/jqCss2.js',
                'public/javascripts/attr.js'
            ]
        },

        //最小化，混淆，合并js文件
        uglify:{
            build:{
                src:'public/javascripts/*.js',
                dest:'public/build/<%= pkg.name %>.min.js'
            }
        },


        //监控
        watch:{
            css:{
                files:"public/stylesheets/*.css",
                tasks:['csslint'],
                options:{
                    //livereload:true,
                    spawn:false
                }
            },
            script:{
                files:'public/javascripts/*.js',
                tasks:['jshint'],
                options:{
                    spawn:false
                }
            }
        }


    });
    //加载插件
    //grunt.loadNpmTasks('grunt-contrib-csslint');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.loadNpmTasks('grunt-contrib-cssmin');
    //grunt.loadNpmTasks('grunt-contrib-imagemin');
    [
        'grunt-contrib-csslint',
        'grunt-contrib-concat',
        'grunt-contrib-cssmin',
        'grunt-contrib-imagemin',
        'grunt-contrib-jshint',
        'grunt-contrib-uglify',
        'grunt-contrib-watch',
    ].forEach(function (task){
        grunt.loadNpmTasks(task);
    });


    //默认任务用于后端（服务器端）
    grunt.registerTask('default',['jshint']);

    //静态任务用于前端
    grunt.registerTask('static',['csslint','concat','cssmin','imagemin','uglify']);

    //监控
    //grunt.registerTask('watch',['watch']);
};
