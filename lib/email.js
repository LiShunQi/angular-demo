/**
 * Created by Administrator on 2016/11/25.
 */
var nodemailer = require('nodemailer');

module.exports = function(credentials) {
    var mailTransport = nodemailer.createTransport('SMTP',{
        //service: 'qq',
        host: 'smtp.qq.com',//主机
        secureConnection: true,//使用SSL
        port:465,//SMTP 端口
        auth: {
            user: credentials.QQMail.user,//帐号
            pass: credentials.QQMail.password//密码
        }
    });

    var from = '"from RIMI " <454757929@qq.com>';
    var errorRecipient = '454757929@qq.com';
    return {
        send: function(to, subj,body) {
            mailTransport.sendMail({
                from: from,
                to: to,
                subject: subj,
                html:body,
                generateTextFromHtml: true
            },function(err){
                if(err) console.error('Unable to send email :' + err);
            });
        },
        emailError: function(message,filename,exception) {
            var body = '<h1>Meadowlark Travel Site Error</h1>' +
                'message: <br><pre>' + message + '</pre><br>';
            if(exception) body += 'exception:<br></pre>' + exception + '</pre><br>';
            if(filename) body += 'filename: <br><pre>' + filename + '</pre><br>';
            mailTransport.sendMail({
                from: from,
                to: errorRecipient,
                subject: 'Meadowlark Traval Site Error',
                html: body,
                generateTextFromHtml: true
            },function(err){
                if(err) console.error('Unable to send email:' + err);
            });
        }
    };

};
