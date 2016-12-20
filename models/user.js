/**
 * Created by Administrator on 2016/11/25.
 */
var mongoose = require('mongoose');
// var userSchema = mongoose.Schema({
//     username: String,
//     hashed_password: String,
//     email:String,
//     age: Number
// });

var Schema = mongoose.Schema;
var userSchema = new Schema({
    username: {type: String, required: true},
    hashed_password: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    age: {type: Number, required: true},
    // gender: {type: String, required: true},
    // loginName: {type: String, required: true},
    nicName: {type: String, required: false},
    phone: {type: Number, required: false},
    address: {type: String, required: false}
    // picture: {type: Schema.Types.Mixed, required: true},
    // createdAt: {type: Data, default: Data.now}
});

var User = mongoose.model('User',userSchema);
module.exports = User;
