var mongoose = require("mongoose");
var Message = mongoose.model("Message");

exports.create = function(req,res){
    var message = new Message(message);         //�������������Ϣ
    message.save(callback);                       //���浽���ݿ���
};

//��ѯ
exports.read = function(callback){
    Message.find().sort({"createAt":1}).limit(20).exec(callback); //����ʱ������������Ʋ�ѯ20 �����ݣ�
};