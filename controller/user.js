var mongoose = require('mongoose'),
    User = mongoose.model('User');
var async = require("async");                        //异步处理机制
var gravatar = require("gravatar");                 //通用头像

//根据用户ID查询数据
exports.findUserById = function(req,res){
    var userId = req.session.userId;                  //获取session中的userId
    if(userId){                                          //如果userID存在
        User.find({_id:userId}).exec(function(err,user){      //根据用户ID查找用户信息
            if(err){
                res.json(404,{msg:err});
            }else{
                res.json(user);                         //查询的数据已json形式传送到客户端
            }
        })
    }else{
        res.status(404).json(null);
    }
};

//根据用户填写的email登录
exports.findByEmailOrCreate = function(req,res){
    var email = req.body.email;                        //获取POST请求信息
    if(email != undefined){                           //判断email是否存在
        User.findOne({email:email}).exec(function(err,user){  //根据email查询用户，判断数据库中是否存在当前用户
            if(err){
                res.json(404,{msg: err});               //查询出错
            }else{
                if(user){                               //判断用户是否存在，如果存在就登录
                    onlines(user._id,req,res);          //如果用户存在就登录，不需要保存用户的信息
                }else{
                    saveUser(email,req,res);            //保存新的用户；在登录
                }
            }
        })
    }else{
        res.status(404).json({msg:"请输入的邮箱地址"});
    }
};

//根据用户ID，更新online字段的值
function onlines(userId,req,res){
    User.findOneAndUpdate({_id:userId},{$set:{online:true}},{new: true}).exec(function(err,user){  //new:设置为true：是显示更改后的数据
        if(err){
            res.json(404,{msg: err});
        }else{
            req.session.userId = user._id;           //保存在session中；可以在req.session获取
            res.json(user);
        }
    })
}


//在线
exports.online = function(userId,callback){
    User.findOneAndUpdate({_id:userId},{$set:{online:true}},{new: true},callback)
};

//离线
exports.offline = function(userId,callback){
    User.findOneAndUpdate({_id:userId},{$set:{online:false}},{new: true},callback)
};


//如果是新的用户就要保存到数据库中
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
            onlines(userId,req,res);                     //登录在线
        }
    })
}

//退出登录
exports.logout = function(req,res){
    var userId = req.session.userId;                //获取session中的id
    User.findOneAndUpdate({_id:userId},{$set:{online:false}},{new: true}).exec(function(err,user){
        if(err){
            res.json(404,{msg:err});
        }else{
            res.json("success");
            req.session.destroy(function(){        //destroy()：删除session回话信息
                console.log("session信息已删除")
            })
        }
    })
};

//获取所有在线人数
exports.getOnlineUsers = function(callback){
    User.find({online:true},callback);
};
