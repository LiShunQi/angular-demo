/**
 * Created by Administrator on 2016/11/3.
 */


var static = require('../lib/static.js').map;
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
//验证码的实现
//var svgCaptcha = require('svg-captcha');
var captcha = require('svg-captcha-color').create({
    fontPath:'',//字体文件夹
    fontSize:30,//字体大小
    width:120,//验证码宽度
    height:40,//验证码高度
    counts:4,//验证码长度
    chars:'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',//验证码字符，由于0O1I易混淆，因此不推荐使用
    noise:2,//干扰线条数，填0则不绘制干扰线
    background:'#66CCFF'//验证码背景颜色
});
captcha.make();//返回值{data:SVG验证码数据,text:验证码文本}
var User_m = require('../models/user.js');//载入用户数据模式
var credentials = require('../credentials.js');
var emailService = require('../lib/email.js')(credentials);//邮箱服务
var crypto = require('crypto');
//上传文件依赖
var formidable = require('formidable');
var fs = require('fs');
const AVATAR_UPLOAD_FOLDER = '/avatar';

//GET home page
router.get('/',function(req,res,next){
    res.render('index',{title: 'Express'});//第二个参数上下文对象
});

//signUp
router.get('/signup',function(req,res,next){
    res.render('signup',{title: 'signup'});
});

//contact us
router.get('/contact',function(req,res,next){
    res.render('contact');
});

//about page
router.get('/about',function(req,res,next){
    res.render('about');
});

//form page
router.get('/textForm',function(req,res,next){
    res.render('textForm');
});

//customjs test
router.get("/customjs",function(req,res,next){
    res.render("customjs");
});

//angularJS
router.get('/angular',function(req,res,next){
    res.render('angular',{'formjs':"this is a angular server"});//上下文对象｛｝；
});

//user-table
router.get('/list',function(req,res,next){
    //使用默认布局（main.hbs）
    res.render('list',{title:'users list'});
});

//AngularJS-login
router.post('/login',function(req,res,next) {
   // var data = {};
   //  data.msg = '登陆成功';
   //  data.user = req.body;
   //  res.send(data);

    User_m.find({username: req.body.username,
    hashed_password: hashPW(req.body.password)})
        .select('username age email')
        .exec(function(err,users) {
            var data = {
                users: users.map(function(user) {
                    return {
                        _id: user._id,
                        name: user.username,
                        email:user.email,
                        age:user.age
                    };
                })
            };
            if(data.users.length > 0) {
                req.session.userSessionID = data.users[0].id;
            }
            res.send(data);
        })
});
//表单验证路由
router.post('/check',function(req,res,next) {
    User_m.count({email: req.body.email},function(err,docs) {
        var data = {};
        if(docs === 1) {
            data.Msg = '邮箱已被注册!!';
            console.log(data.Msg);
        }else{
            data.Msg = '';
            // console.log(555);
        }
        res.send(data);
    })
});
//验证码
//router.get('/captcha', function (req, res,next) {
//    var captcha = svgCaptcha.create();
//    req.session.captcha = captcha.text;
//
//    res.set('Content-Type', 'image/svg+xml');
//    res.status(200).send(captcha.data);
//});
router.get('/captcha',function(req,res,next) {
    var c=captcha.make();
    req.session.captcha=c.text;
    res.set('Content-Type','image/svg+xml');
    res.status(200).send(c.data);
});

router.post('/sigup',function(req,res,next) {
    if(req.session.captcha.toLowerCase() !== req.body.captcha.toLowerCase()) {
        var data = {captchaErrorMsg:'请你检查验证码是否正确'};
        return res.send(data);
    }
    var user = new User_m({username:req.body.username});
    user.set('hashed_password',hashPW(req.body.pwd));
    user.set('email',req.body.email);
    user.set('age',req.body.age);
    user.save(function(err) {
        if(err) {
            console.log('信息输入不正确！！');
            res.session.error = err;
            return res.redirect('/user/register');
        }else {
            console.log('=====register-save=====' + user.id + "==" + req.body.username +
                "==pwd==" + user.hashed_password);
            //发邮件；
            var html = '注册成功！！';
            emailService.send(req.body.email,"Thank you for signup!",html);
            req.session.user = user.id;
            req.session.username = user.username;
            req.session.msg = 'Authenticated as' + user.username;

            return res.redirect('/#!/user/userlist');
        }
    })
});

//编辑用户
router.get('/get-user-by-uid',function(req,res,next) {
    User_m.find().where('_id').equals(req.query.uid).exec(function(err,users) {
        var data = {
            users: users.map(function(user) {
                return {
                    _id: user._id,
                    name: user.username,
                    email:user.email,
                    age:user.age,
                    address: user.address,
                    phone: user.phone
                }
            })
        };
        res.send(data);
    })
});
//保存编辑后的用户数据
router.post('/updataUser-by-uid',function(req,res,next) {
    // console.log(req.query.uid);
    User_m.update({_id: req.query.uid},
        {$set: {username: req.body.name,
        email:req.body.email,
        nicName:req.body.nicName,
        age:req.body.age,
        address:req.body.address,
        phone:req.body.phone,
        update:true}},
        {
            upsert:false,
            multi:false,
            // strict:true
        },function(err) {
            if(err) {
                console.log('更新不成功！！');
            }else{
                console.log('更新成功！！');
            }
    })
});
//删除用户
router.get('/delUser-uid',function(req,res,next) {
    // console.log(req.query.uid);
    User_m.remove().where('_id').equals(req.query.uid).exec(function(err) {
        if(err) {
            console.log('删除不成功！！');
        }else{
            console.log('删除成功！！');
        }
    })

});

//用户列表路由
router.get('/http-list',function(req,res,next) {
    User_m.find({},function (err,users) {
        // //1.查询全部的记录
        // User_m.find({},function(err,users) {});
        // //2.查询age= '44'的记录
        // User_m.find().where('age').equals('44').exec(function(err,users) {
        // //3.查询age>10,从0开始的6条记录的username,age,eamil字段
        // User_m.find().where('age').gte(10).select('username age email').skip(0).limit(6).exec(function(err,users) {
        // //4.查询age=44，从0 开始的3条记录的username,age,email字段
        // User_m.find({age:44}).select('username age email').skip(0).limit(3).exec(function(err,users) {});
        // //5.查询所有记录的age和username字段；
        // User_m.find({},{age:true,username:true},function(err,users) {
        // //6.查询age=15的记录的age和username字段
        // User_m.find({age:15},{age:true,username:true},function(err,users) {});
        // //7.查询username=JACK 的记录
        // User_m.find({username:'Jack'},function(err,users) {});
        var data = {
            users: users.map(function(user) {
                return {
                    _id: user._id,
                    name: user.username,
                    email:user.email,
                    age:user.age
                }
            })
        };
        res.send(data);
    });

});

//上传文件路由
router.post('/photo/:year/:month/:timestr',function(req,res) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';  //设置编辑
    form.uploadDir = 'public' + AVATAR_UPLOAD_FOLDER;
    form.parse(req,function(err,fields,files) {
        if(err) return res.redirect(303,'/error');

        var extName = ''; //后缀名
        switch(files.photo.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
        }
        console.log(files);
        var newPath = 'public\\avatar_2\\'
        + req.params.timestr + '.' + extName;
        fs.renameSync(files.photo.path,newPath);//
        var imgpath = '/avatar_2/'
        + req.params.timestr + '.' + extName;
        return res.redirect('/user/detail?imgpath=' + imgpath);
    })
});

module.exports = router;

function hashPW(pwd) {
    return crypto.createHash('sha256').update(pwd).digest('base64').toString();
}