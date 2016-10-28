//�Ի���Ϣ
var mongoose = require("mongoose");                //�ṩ�ṹ������ģ��
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
    content:String,                                   //�Ի�����
    creator:{
        _id:Schema.ObjectId,                          //������ѯ
        email:{type:String,required:true},
        name:String,
        avatar:String
    },
    createAt:{type:Date,default:Date.now}
});
mongoose.model("Message",MessageSchema);