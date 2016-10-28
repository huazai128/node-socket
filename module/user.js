//用户模型
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email:{type:String,required:true},
    name:String,
    online:{type:Boolean,default:false},
    avatarUrl:String
});
mongoose.model("User",UserSchema);
