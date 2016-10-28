var express = require("express");                      //
var async = require("async");                           //�첽�������
var bodyParser = require("body-parser");              //����POST����JSON����������req.body
var cookieParser = require("cookie-parser");          //cookie�洢
var session = require("express-session");             //session�ػ�
var app = express();
var mongoose = require("mongoose");
//����ģ��
require("./module/message.js");
require('./module/user.js');
mongoose.Promise = require('bluebird');                //ʹ��es6�﷨Promise����
mongoose.connect('mongodb://localhost/myapp');        //�������ݿ�

var path = require("path");
var port = process.env.PORT || 8080;                      //�˿ں�
var Controllers  = require("./controller");           //Ҫ����signedCookieParserǰ��
var signedCookieParser = cookieParser("technode");   //���� secret����ֹcookie����ȡ����cookie���м���
var MongoStore = require("connect-mongo")(session);  //session�־û��洢��Ϣ
var sessionStore = new MongoStore({
    url: 'mongodb://localhost/technode'
});

//�м����ȫ������
app.use(bodyParser.json());                              //��ʾPOST����ֻ����JSON��ʽ����
app.use(bodyParser.urlencoded({extended:true}));       //urlencoded���������ã�extended�����ò��������ͣ�false:��ʾֻ���������string��true�������κε���������
app.use(cookieParser());                                 //cookie����
app.use(session({
    secret:"technode",                                   //secret:����session���ܣ���ֹ����ȡ
    resave:true,                                          //
    saveUninitialized:false,                            //��ʼ�����ݲ�����
    cookie:{
        maxAge: 60 * 60 * 1000                             //����ΪһСʱ
    },
    store:sessionStore                                   //�־��Դ洢�����ô洢��ʽΪ�ڴ�洢��ʽ
}));
app.use(express.static(path.join(__dirname,"/static")));    //���þ�̬�ļ�Ŀ

//·��
app.get("/api/validate",Controllers.User.findUserById);
app.post("/api/login",Controllers.User.findByEmailOrCreate);
app.get("/api/logout",Controllers.User.logout);

app.use(function(req,res){
    res.sendFile(path.join(__dirname,"./static/index.html"))
});
var server = app.listen(port,function(){
    console.log("�˿ں�: " + port);
});
var io = require("socket.io").listen(server);         //��socket�а�server�����Ƿ����socket����

//�����¼��֤;�û���ȡ���ڻ�ȡsession����Ϣ�������Ϳ�����socket.io����session��Ϣ
io.set('authorization', function (handshakeData, callback) {    //����session
    signedCookieParser(handshakeData, {}, function(err) {       //�����ͷ��˵�cookie�ַ���
        if (err) {
            callback(err, false)
        } else {
            //handshakeData.signedCookies['connect.sid']����cookie������ַ���
            sessionStore.get(handshakeData.signedCookies['connect.sid'], function(err, session) { //ͨ��cookie�б��浽session��id��ȡ����˶���� session
                if (err) {
                    callback(err.message, false)
                } else {
                    handshakeData.session = session;                //��socketʹ��session
                    if (session.userId) {
                        callback(null, true)
                    } else {
                        callback('No login')
                    }
                }
            })
        }
    })
});

const  SYSTEM ={
    name:"node������",
    avatarUrl: 'http://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Robot_icon.svg/220px-Robot_icon.svg.png'
};

//���뵽������
io.sockets.on("connection",function(socket){       //����sockets
    var userId =  socket.request.session.userId;
    Controllers.User.online(userId,function(err,user){
        if(err){
            socket.emit("err",{mesg:err})
        }else{
            socket.broadcast.emit("users.add",user);      //broadcast���㲥
            socket.broadcast.emit("messages.add",{
                content: user.name + "������������",
                creator: SYSTEM,
                createAt: new Date()
            })
        }
    });
    socket.on("disconnect",function(){                 //�ر�����
        Controllers.User.offline(userId,function(err,user){
            if(err){
                socket.emit("err",{
                    mesg:err
                })
            }else{
                socket.broadcast.emit("users.remove",user);
                socket.broadcast.emit("messages.add",{
                    content:user.name + "�뿪��������",
                    creator:SYSTEM,
                    createAt: new Date()
                })
            }
        })
    });
    socket.on("technode.read",function(){             //�����¼�
        async.parallel([                                //parallel������ִ�ж��������ÿ��������������ִ�У�����Ҫ�ȴ�����������ִ�С���������callback�������е����ݰ���tasks��������˳�򣬶�����ִ����ɵ�˳��
            function(done){
                Controllers.User.getOnlineUsers(done);  //��ѯ������������
            },
            function(done){
                Controllers.Message.read(done);        //��ȡ������Ϣ
            }
        ],function(err,resutls){                         //���յ�callback�������ܣ������ں����Ľ��
            if(err){
                socket.emit("err",{                      //���������¼�
                    msg:err
                })
            }else{
                socket.emit("technode.read",{
                    user:resutls[0],
                    messages:resutls[1]
                })
            }
        })
    });
    socket.on("message.create",function(message){   //����µ���Ϣ
        Controllers.Message.create(message,function(err,message){
            if(err){
                socket.emit("err",{
                    msg:err
                })
            }else{
                io.sockets.emit("message.create",message)
            }
        })
    })
});


