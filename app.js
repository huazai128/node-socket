var express = require("express");                      //
var async = require("async");                           //异步处理机制
var bodyParser = require("body-parser");              //处理POST请求JSON参数解析成req.body
var cookieParser = require("cookie-parser");          //cookie存储
var session = require("express-session");             //session回话
var app = express();
var mongoose = require("mongoose");
//数据模型
require("./module/message.js");
require('./module/user.js');
mongoose.Promise = require('bluebird');                //使用es6语法Promise对象
mongoose.connect('mongodb://localhost/myapp');        //链接数据库

var path = require("path");
var port = process.env.PORT || 8080;                      //端口号
var Controllers  = require("./controller");           //要放在signedCookieParser前面
var signedCookieParser = cookieParser("technode");   //设置 secret：防止cookie被窃取；对cookie进行加密
var MongoStore = require("connect-mongo")(session);  //session持久化存储信息
var sessionStore = new MongoStore({
    url: 'mongodb://localhost/technode'
});

//中间件的全局配置
app.use(bodyParser.json());                              //表示POST请求只接受JSON格式数据
app.use(bodyParser.urlencoded({extended:true}));       //urlencoded：编码设置，extended：设置参数的类型，false:表示只接受数组和string，true：接受任何的数据类型
app.use(cookieParser());                                 //cookie设置
app.use(session({
    secret:"technode",                                   //secret:设置session加密，防止被窃取
    resave:true,                                          //
    saveUninitialized:false,                            //初始化数据不保存
    cookie:{
        maxAge: 60 * 60 * 1000                             //设置为一小时
    },
    store:sessionStore                                   //持久性存储；设置存储方式为内存存储方式
}));
app.use(express.static(path.join(__dirname,"/static")));    //配置静态文件目

//路由
app.get("/api/validate",Controllers.User.findUserById);
app.post("/api/login",Controllers.User.findByEmailOrCreate);
app.get("/api/logout",Controllers.User.logout);

app.use(function(req,res){
    res.sendFile(path.join(__dirname,"./static/index.html"))
});
var server = app.listen(port,function(){
    console.log("端口号: " + port);
});
var io = require("socket.io").listen(server);         //在socket中绑定server；这是服务端socket服务

//请求登录验证;用户获取用于获取session的信息；这样就可以在socket.io共享session信息
io.set('authorization', function (handshakeData, callback) {    //设置session
    signedCookieParser(handshakeData, {}, function(err) {       //解析客服端的cookie字符串
        if (err) {
            callback(err, false)
        } else {
            //handshakeData.signedCookies['connect.sid']：是cookie定义的字符串
            sessionStore.get(handshakeData.signedCookies['connect.sid'], function(err, session) { //通过cookie中保存到session的id获取服务端对象的 session
                if (err) {
                    callback(err.message, false)
                } else {
                    handshakeData.session = session;                //在socket使用session
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
    name:"node机器人",
    avatarUrl: 'http://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Robot_icon.svg/220px-Robot_icon.svg.png'
};

//进入到聊天室
io.sockets.on("connection",function(socket){       //连接sockets
    var userId =  socket.request.session.userId;
    Controllers.User.online(userId,function(err,user){
        if(err){
            socket.emit("err",{mesg:err})
        }else{
            socket.broadcast.emit("users.add",user);      //broadcast：广播
            socket.broadcast.emit("messages.add",{
                content: user.name + "进入了聊天室",
                creator: SYSTEM,
                createAt: new Date()
            })
        }
    });
    socket.on("disconnect",function(){                 //关闭连接
        Controllers.User.offline(userId,function(err,user){
            if(err){
                socket.emit("err",{
                    mesg:err
                })
            }else{
                socket.broadcast.emit("users.remove",user);
                socket.broadcast.emit("messages.add",{
                    content:user.name + "离开了聊天室",
                    creator:SYSTEM,
                    createAt: new Date()
                })
            }
        })
    });
    socket.on("technode.read",function(){             //定义事件
        async.parallel([                                //parallel：并行执行多个函数，每个函数都是立即执行，不需要等待其它函数先执行。传给最终callback的数组中的数据按照tasks中声明的顺序，而不是执行完成的顺序。
            function(done){
                Controllers.User.getOnlineUsers(done);  //查询所有在线人数
            },
            function(done){
                Controllers.Message.read(done);        //获取聊天信息
            }
        ],function(err,resutls){                         //最终的callback函数接受，数组内函数的结果
            if(err){
                socket.emit("err",{                      //触发错误事件
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
    socket.on("message.create",function(message){   //添加新的信息
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


