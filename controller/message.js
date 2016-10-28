var mongoose = require("mongoose");
var Message = mongoose.model("Message");

exports.create = function(req,res){
    var message = new Message(message);         //往集合中添加信息
    message.save(callback);                       //保存到数据库中
};

//查询
exports.read = function(callback){
    Message.find().sort({"createAt":1}).limit(20).exec(callback); //根据时间进行升序，限制查询20 条数据；
};