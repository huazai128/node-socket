//对话信息
var mongoose = require("mongoose");                //提供结构化数据模型
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    content:String,                                   //对话内容
    creator:{
        _id:Schema.ObjectId,                          //关联查询
        email:{type:String,required:true},
        name:String,
        avatar:String
    },
    createAt:{type:Date,default:Date.now}
});
mongoose.model("Message",MessageSchema);