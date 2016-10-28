var mongoose = require('mongoose'),
    User = mongoose.model('User');
var async = require("async");                        //�첽�������
var gravatar = require("gravatar");                 //ͨ��ͷ��

//�����û�ID��ѯ����
exports.findUserById = function(req,res){
    var userId = req.session.userId;                  //��ȡsession�е�userId
    if(userId){                                          //���userID����
        User.find({_id:userId}).exec(function(err,user){      //�����û�ID�����û���Ϣ
            if(err){
                res.json(404,{msg:err});
            }else{
                res.json(user);                         //��ѯ��������json��ʽ���͵��ͻ���
            }
        })
    }else{
        res.status(404).json(null);
    }
};

//�����û���д��email��¼
exports.findByEmailOrCreate = function(req,res){
    var email = req.body.email;                        //��ȡPOST������Ϣ
    if(email != undefined){                           //�ж�email�Ƿ����
        User.findOne({email:email}).exec(function(err,user){  //����email��ѯ�û����ж����ݿ����Ƿ���ڵ�ǰ�û�
            if(err){
                res.json(404,{msg: err});               //��ѯ����
            }else{
                if(user){                               //�ж��û��Ƿ���ڣ�������ھ͵�¼
                    onlines(user._id,req,res);          //����û����ھ͵�¼������Ҫ�����û�����Ϣ
                }else{
                    saveUser(email,req,res);            //�����µ��û����ڵ�¼
                }
            }
        })
    }else{
        res.status(404).json({msg:"������������ַ"});
    }
};

//�����û�ID������online�ֶε�ֵ
function onlines(userId,req,res){
    User.findOneAndUpdate({_id:userId},{$set:{online:true}},{new: true}).exec(function(err,user){  //new:����Ϊtrue������ʾ���ĺ������
        if(err){
            res.json(404,{msg: err});
        }else{
            req.session.userId = user._id;           //������session�У�������req.session��ȡ
            res.json(user);
        }
    })
}


//����
exports.online = function(userId,callback){
    User.findOneAndUpdate({_id:userId},{$set:{online:true}},{new: true},callback)
};

//����
exports.offline = function(userId,callback){
    User.findOneAndUpdate({_id:userId},{$set:{online:false}},{new: true},callback)
};


//������µ��û���Ҫ���浽���ݿ���
function saveUser(email,req,res){
    var user = new User();
    user.name = email.split('@')[0];
    user.email = email;
    user.avatarUrl = gravatar.url(email);
    user.save(function(err,user){
        if(err){
            res.json({msg:err});
        }else{
            var userId = user._id;
            onlines(userId,req,res);                     //��¼����
        }
    })
}

//�˳���¼
exports.logout = function(req,res){
    var userId = req.session.userId;                //��ȡsession�е�id
    User.findOneAndUpdate({_id:userId},{$set:{online:false}},{new: true}).exec(function(err,user){
        if(err){
            res.json(404,{msg:err});
        }else{
            res.json("success");
            req.session.destroy(function(){        //destroy()��ɾ��session�ػ���Ϣ
                console.log("session��Ϣ��ɾ��")
            })
        }
    })
};

//��ȡ������������
exports.getOnlineUsers = function(callback){
    User.find({online:true},callback);
};
