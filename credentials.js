/**
 * Created by Administrator on 2016/11/25.
 */
//凭证文件
module.exports = {
    cookieSecret: '把你的cookie 秘钥放在这里',
    QQMail: {
        user: '454757929@qq.com',
        password: 'mnkmtrtqdputbjdg'
    },
    mongo: {
        development: {
            connectionString: "mongodb://dbadmin:123456@localhost:27017/admin"
        },
        production: {
            connectionString: 'mongodb://dbadmin:123456@localhost:27017/admin'
        }
    }
};
