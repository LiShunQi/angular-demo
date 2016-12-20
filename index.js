//导入系统依赖模块
var express = require('express'),
    fs = require('fs'),
    url = require('url'),
    INDEX_HTML = fs.readFileSync(
        __dirname + '/public/index.html','utf-8'
    ),
    ACCEPTABLE_URLS = ['/user/signup','/user/login','/user/detail',
        '/user/edit','/user/userlist','/user/forgotpwd'];

//实例化Express应用
var app = express();
//中间件
app.use(function (req,res,next) {
    var parts = url.parse(req.url);
    var urlCounter = ACCEPTABLE_URLS.length;
    for(var i = 0 ; i < urlCounter; i++) {
        if(parts.pathname.indexOf(ACCEPTABLE_URLS[i]) === 0) {
            //当我们找到了一条
            return res.send(200,INDEX_HTML);
        }
    }
    return next();
});

var bodyParser = require('body-parser');

var credentials = require('./credentials.js'); //导入凭证文件
app.use(require('cookie-parser')(credentials.cookieSecret));

app.use(require('express-session')());

var emailService = require('./lib/email.js')(credentials);
//database configuration
var mongoose = require('mongoose');
var options = {
    server: {
        socketOptions: {keepAlive: 1}//保持长链接
    }
};

mongoose.Promise = global.Promise;

switch(app.get('env')){  //获取环境变量
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString,options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString,options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}

var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');






//设置handlebars 视图引擎及视图目录和视图文件扩展名
var handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main', // 设置默认布局为main
        extname: '.hbs', // 设置模板引擎文件后缀为.hbs
        //创建一个Handlebars 辅助函数，让它给出一个到静态资源的链接：
        helpers: {
            static: function(name) {
                return require('./lib/static.js').map(name);
            },
            section : function(name, options) {
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

//app.set('views', path.join(__dirname, 'views'));
//Add Static Service
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));//小图标的路径
//导入自定义模块（路由、模型、模式）
var routes_index = require('./routes/index');

// 设置端口号
app.set('port', process.env.PORT || 3005);//变量port

//中间件(局部文件)自定义的中间件
app.use(function(req,res,next){
    if(!res.locals.partials) res.locals.partials = {};
    res.locals.partials.discountContext = {
        locations: [{product: 'book',price: '99.00'}]
    };
    next();
});

//设置路由
app.use('/', routes_index);

app.use(function(req, res){
    res.status(404);
    //不使用布局（母版main）
    res.render('errors/404',{layout: null});
});

// 定制500 页面
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    //使用指定布局
    res.render('errors/500',{layout: 'error',title:'This pang with error layout'});
});

app.listen(app.get('port'), function(){
    console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
});