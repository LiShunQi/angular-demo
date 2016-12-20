/**
 * Created by Administrator on 2016/11/22.
 */
angular.module('userSingleApp',['ngRoute','ngTable'])
    .config(['$routeProvider','$locationProvider',function($routeProvider,$locationProvider) {
       //不显示#和!
        $locationProvider.html5Mode(true);//在AngularJS的module中的config方法中注入模块，开启html5Mode;
        $locationProvider.hashPrefix('!');
        
        //配置路由
        $routeProvider
            //路由到注册页
            .when('/user/signup', {
            templateUrl: 'template/signup.hbs',
            controller: 'signupController'
            })
            //路由到登陆页
            .when('/', {
                templateUrl: 'template/login.hbs',
                controller: 'loginController'
            })
            //个人信息页
            .when('/user/detail', {
                templateUrl: 'template/detail.hbs',
                controller: 'detailController'
            })
            //路由到编辑页
            .when('/user/edit', {
                templateUrl: 'template/edit.hbs',
                controller: 'editController'
            })
            .when('/user/userlist',{
                templateUrl: 'template/userlist.hbs',
                controller: 'userlistController'
            })    
            //路由到忘记密码页
            .when('/user/forgotpwd', {
                templateUrl: 'template/forgotpwd.hbs',
                controller: 'forgotpwdController'
            });

    }])
    .controller('signupController',['$http','$location','$scope',function($http,$location,$scope) {
        var self = this;
        $scope.pageClass = 'page-signup';
        self.message = '用户注册信息';
        //更换验证码的实现
        self.captcahSrc = '/captcha';
        self.refresh = function() {
            self.captcahSrc = '/captcha?id=' + Math.random();
        };
        //表单提交函数
        self.sigup = function() {
            // console.log(22);
            $http.post('/sigup',self.user).then(
                function(resq){
                    //验证码出错时返回错误
                    if(resq.data.captchaErrorMsg) {
                        self.captchaErrorMsg = resq.data.captchaErrorMsg;
                        return;
                    }
                    //路由到新路径(前台完成后跳到的页面)
                    $location.path('/user/userlist');//没有参数是获取当前路由
                }
            )
        };
        //表单验证
        self.check = function() {
            $http.post('/check',self.user).then(
                function(resp) {
                    if(resp.data.Msg) {
                        self.Msg = resp.data.Msg;
                        self.stateClass = 'alert-warning';
                    }else{
                        self.Msg = "";
                        self.stateClass = '';
                    }
                }
            )
        };
        
    }])
    .controller('loginController',['$http','$scope',function($http,$scope) {
        var self = this;
        $scope.pageClass = 'page-login';
        self.message = '用户登陆';
        self.login = function() {
            $http.post('/login',self.user).then(
                function(resp) {
                    // self.message = resp.data.msg;
                    // self.messageFull = resp.data.user.username + '你的密码是：'
                    //     + resp.data.user.password;
                    
                    self.returnClass = 'alert alert-success';
                    if(resp.data.users.length === 0) {
                        self.returnCLass = 'alert alert-danger';
                        self.messageFull = '请检查你的用户名或者密码!!';
                        return;
                    }
                    self.uid = resp.data.users[0]._id;
                    self.messageFull = resp.data.users[0].name +
                            '你邮箱' + resp.data.users[0].email;
                }
            )
        };
    }])
    .controller('detailController',['$scope','$routeParams','$http',function($scope,$routeParams,$http) {
        var self = this;
        $scope.pageClass = 'page-detail';
        self.currentTab = '';
        //self.personCount = 0;

        //获取页面地址栏中？号后的数据
        // self.message  = '用户个人信息' + $routeParams.uid;
        // self.uid = $routeParams.uid;
        // $http.get('/users/detail/?uid=' + self.uid).then(function(resp) {});

        self.keyInfo = {};
        self.mouseInfo = {};
        self.keyStroke = function(event) {
            self.keyInfo.keyCode = event.keyCode;
        };
        self.mouseClick = function(event) {
            self.mouseInfo.clientX = event.clientX;
            self.mouseInfo.clientY = event.clientY;
            self.mouseInfo.screenX = event.screenX;
            self.mouseInfo.screenY = event.screenY;
        };
        //上传文件
        self.template = 'template/photo.hbs';
        
        self.message = '用户个人信息'  + $routeParams.uid;
        self.myVar = 'images/3.jpg';
        self.uid = $routeParams.uid;
        var now = new Date();
        self.year = now.getFullYear();
        self.month = now.getMonth();
        self.timestr = Date.now();
        if($routeParams.imgpath) {
            self.myVar = $routeParams.imgpath;
        }

    }])
    .controller('editController',['$scope',function($scope) {
        var self = this;
        $scope.pageClass = 'page-edit';
        self.message = '用户编辑信息';
    }])
    .controller('userlistController',['$http','NgTableParams',
        '$scope','$location',function($http,NgTableParams,$scope,$location) {
        var self = this;
        $scope.pageClass = 'page-userlist';
        // self.data = [];
        self.message = '用户列表页面';
        // function buildTable(resq) {
        //     var data = resq.data.users;
        //     this.tableParams = new NgTableParams({}, {dataset: data});
        // }
        $http.get('/http-list').then(
            function(resq) {
                // buildTable(resq);
                // self.messageStr = resq.data.users[0].name;
                self.userData = resq.data.users;
                self.tableParams = new NgTableParams({}, {dataset: self.userData});
            }
        );
            //编辑用户
        self.editUser = function(obj) {
            self.uid = obj;
            self.editData = {gender:1};
            $http.get('/get-user-by-uid?uid=' + obj).then(
                function(resp) {
                    self.editData = resp.data.users[0];
                    // console.log(self.editData._id);
                }
            )
        };
         //保存编辑后的数据
        self.updataUser = function(obj) {
            self.uid = obj;
            $http.post('/updataUser-by-uid?uid=' + obj,self.editData).then(
                function(resp) {
                    
                }
            );
            parent.location.reload();
            // $location.path('')
        };
            //删除用户
        self.delUser = function(obj) {
            self.uid = obj;
            console.log(self.uid);
            $http.get('/delUser-uid?uid=' + obj).then(
                function(resp) {
                    
                }
            );
            $location.path('user/userlist');
            parent.location.reload();
        }
    }])
    .controller('forgotpwdController',['$scope',function($scope) {
        var self = this;
        $scope.pageClass = 'page-forgotpwd';
        self.message = '用户忘记密码信息';
    }]);



angular.module('mainApp',['userSingleApp','ngAnimate']);
