//js实现观察者模式
function _ccObserver(){
	if(!(this instanceof _ccObserver)){
		return new _ccObserver();
	}
	this.listeners = {}
};
_ccObserver.prototype = {
	on: function (key, callback) { this.addListener(key, callback); },
	off: function (key, callback) { this.removeListener(key, callback); },
	addListener: function (key, callback) {
		if(!this.listeners[key]) {
			this.listeners[key] = [];
		}
		this.listeners[key].push(callback);
	},
	removeListener: function (key, callback) {
		if(this.listeners[key]) {
			if(callback) {
				for (var i = 0; i < this.listeners[key].length; i++) {
					if (this.listeners[key][i] === callback) {
						delete this.listeners[key][i];
					}
				}
			}else {
				this.listeners[key] = [];
			}
		}
	},
	notifyAll: function (key, info) {
		if(!this.listeners[key]) return;
		for (var i = 0; i < this.listeners[key].length; i++) {
			if (typeof this.listeners[key][i] === 'function') {
				try{
				   this.listeners[key][i](info);
				}catch(e){
				   console.error(" error: " + e.message + "\r\n" + e.stack);	
				}
			}
		}
	},
	make: function (o) {
		for (var i in this) {
			o[i] = this[i];
			o.listeners = {}
		}
	}
};

//Jssip网页软电话 
function jsSipUA() {
    // 呼入电话接听超时时间, 秒
    var inboundCallAnswerTimeOut = 15;
    var _jsSipUA = this;
    var observer = new _ccObserver(); 
	observer.make(_jsSipUA);
    this.incomingSession = null;
    this.audioHandler = null;
    this.outgoingSession = null;
    var useragent=null;
    var host;
    var websocketUrl;
    var user;
    var password;
    var uri;
    var nameAudioIn = 0;
    var nameAudioOut = 0;
    // 声音文件根目录路径
    var ctx = "";
    var _jsSipMediaFiles = {
        // outgoing_call_ringing: new Audio(ctx +" callcenter/sounds/ringing.wav"),
        // outgoing_call_rejected: new Audio(ctx + "callcenter/sounds/outgoing-call-rejected.wav"),
        // hangup: new Audio(ctx + "callcenter/sounds/hangup.wav"),
        outgoing_call_ringing: new Audio(_jsSipMediaFileBase64.ringing),
        outgoing_call_rejected: new Audio(_jsSipMediaFileBase64.outgoingcallrejected),
        hangup: new Audio(_jsSipMediaFileBase64.hangup),
        dtmfDir: ctx + "callcenter/sounds/digits/",
        incomingcall: new Audio(_jsSipMediaFileBase64.incomingcall),
        answered: new Audio(_jsSipMediaFileBase64.answered)
    };
    //电话呼入提示音播放器
    var _incomingcallSoundPlayer =  _jsSipMediaFiles.incomingcall;
    //电话呼出提示音播放器
    var _outgoingcallSoundPlayer =  _jsSipMediaFiles.outgoing_call_ringing;
    //处理电话呼入提示音播放的函数
    var playIncomingcallSoundHandler = null;
    //电话呼入超时未被接听后取消播放铃音，
    var cancelIncomingcallSoundHandler = null;
    //处理电话呼出提示音播放的函数
    var playOutgoingcallSoundHandler = null;
    //电话呼出超时未被接听后取消播放声音
    var cancelOutgoingcallSoundHandler = null;
    var showDebugInfo = false;
    //启用/禁用调试消息输出
    this.enableDebug = function (boolEnable) {
        showDebugInfo = boolEnable;
    };
    this.checkIP = function (ip)   
	{   
	    var re =  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/ ;  
	    return re.test(ip);   
	};
    //是否正在外呼叫中
    this.isInOutgoingCalling = false;
    //是否有呼入电话等待接听
    this.isInboundCalling = false;
    //外呼电话是否接通，是否在通话中
    this.isCallConnected = false;
    //呼入电话是否接通
    this.isAnswered = false;    
	//分机是否处于空闲中
    this.isExtensionFree = function () {
        return !_jsSipUA.isAnswered && !_jsSipUA.isCallConnected && !_jsSipUA.isInOutgoingCalling && !_jsSipUA.isInboundCalling;
    };
    var isAutoAnswer = true;
    //设置自动应答
    this.setAutoAnswer = function (boolAutoAnswer) {
        isAutoAnswer = boolAutoAnswer;
    };
    //设置呼入电话接听超时时间;
    this.setCallAnswerTimeOut = function(timeOutSecs){
        inboundCallAnswerTimeOut = timeOutSecs;
    };
    this.getAutoAnswer = function () {
        return isAutoAnswer;
    };
    var isDoNotDisturb = false;
    //免打扰设置
    this.setDoNotDisturb = function(boolDND)
    {
        isDoNotDisturb = boolDND;
    };
    this.getDoNotDisturb = function () {
        return isDoNotDisturb;
    };
    this.play = function(audioObject){

         try{
            // comment this line to disable phone event sound.
            //autoplay.setAttribute("autoplay","autoplay"); 
            if(_jsSipUA.audioHandler) {
                _jsSipUA.audioHandler.setAttribute("autoplay","autoplay"); 
            }
            audioObject.muted = false;
            audioObject.play();
         }catch(e){

         }
    };
    //呼入电话取消振铃
    this.stopRinging = function () {		
        try {
            _incomingcallSoundPlayer.pause();
        }
        catch (e){
           console.log(e);
        }
        clearInterval(_jsSipUA.playIncomingcallSoundHandler);
        clearTimeout(_jsSipUA.cancelIncomingcallSoundHandler);
        _jsSipUA.isInboundCalling = false;
    };
    //电话呼入开始振铃
    this.startRinging = function () {
        _jsSipUA.isInboundCalling = true;
        _jsSipUA.play(_incomingcallSoundPlayer);
        _jsSipUA.playIncomingcallSoundHandler = setInterval(function () {
			console.log("New incoming call , notify to answer the call please  ....");
            _jsSipUA.play( _incomingcallSoundPlayer );
        }, 5000);
        _jsSipUA.cancelIncomingcallSoundHandler = setTimeout(function () {
            if (!_jsSipUA.isAnswered) {
                _jsSipUA.incomingSession._request.reply(480, "No_USER_ANSWER");
                _jsSipUA.closeIncomingSession();
                _jsSipUA.stopRinging();
                console.log("电话超时未接听","incoming_call_timeout");
            }
        }, inboundCallAnswerTimeOut * 1000);
    };

    //呼出电话取消振铃提示音
    this.stopPlaySound = function () {
        try {
            _outgoingcallSoundPlayer.pause();
        }
        catch (e){
           console.log(e);
        }
        clearInterval(_jsSipUA.playOutgoingcallSoundHandler);
        clearTimeout(_jsSipUA.cancelOutgoingcallSoundHandler);
        _jsSipUA.isInOutgoingCalling = false;
    };
    //电话外呼开始播放提示音
    this.startPlaySound = function () {
        _jsSipUA.isInOutgoingCalling = true;
        _jsSipUA.play(_outgoingcallSoundPlayer );
        _jsSipUA.playOutgoingcallSoundHandler = setInterval(function () { 
              _jsSipUA.play(_outgoingcallSoundPlayer );
        }, 6000);
        _jsSipUA.cancelOutgoingcallSoundHandler = setTimeout(function () {
            if (!_jsSipUA.isCallConnected) {
                try {
                    _jsSipUA.outgoingSession._request.cancel();
                }
                catch (e)
                {
                   console.log(e);
                }
                _jsSipUA.closeOutgoingSession();
                _jsSipUA.stopPlaySound();
                console.log("呼叫超时，对方未接听.",'out_going_timeout');
                _jsSipUA.playCancelCallSound();
            }
        }, 47000);
    };

    //播放拨号盘按键音
    this.playDTMFClickSound = function (dtmf) {
        if(dtmf=="*") dtmf = "star";
        if(dtmf=="#") dtmf = "pound";
        new Audio(_jsSipMediaFiles.dtmfDir + dtmf + ".wav").play();
    };

    //停止播放对方声音
    this.pauseAudioStream = function () {
        try {
            _jsSipUA.audioHandler.pause();
        }
        catch (e)
        {
           console.log(e);
        }
    };

    //通话被取消时播放声音提示
    this.playCancelCallSound = function () {
        _jsSipUA.play( _jsSipMediaFiles.outgoing_call_rejected );
    };

    //播放挂机声音
    this.playHangupSound = function () {
        try{ 
            _jsSipUA.play(_jsSipMediaFiles.hangup );
        }catch(e){ 
        }
    };

    //播放应答声音
    this.playAnsweredSound = function () {
        try{ 
            _jsSipUA.play( _jsSipMediaFiles.answered );
        }catch(e){ 
        }
    };
 
    //关闭呼入session
    this.closeIncomingSession = function () {
        try {
            _jsSipUA.incomingSession._close();
        }
        catch (e)
        {
           console.log(e);
        }
        _jsSipUA.incomingSession = null;
    };
    //关闭外呼session
    this.closeOutgoingSession = function () {
        try {
            if( _jsSipUA.outgoingSession != null) {
                _jsSipUA.outgoingSession._close();
            }
        }
        catch (e)
        {
           console.log(e);
        }
        _jsSipUA.outgoingSession = null;
    };

    this.terminateSession = function () {
        var session = _jsSipUA.outgoingSession || _jsSipUA.incomingSession;
        session.terminate();
        console.log('disconnect');
        useragent.stop();
    };
    
    this.getSession = function () {
    	return _jsSipUA.outgoingSession || _jsSipUA.incomingSession;
    };
  
    this.checkHostName = function(){
        var tips = "错误，必须使用 http://localhost 或者 https://youdomain.com 访问! 否则无法使用网页电话的通话能力!";
        if(_jsSipUA.checkIP( window.location.hostname)) {
            console.error(tips);
            //return false;
        }
		if(window.location.protocol === 'file:'){
			console.error(tips);
            //return false;
		}
        if(window.location.protocol === "http:" && window.location.hostname != "localhost" ){
            console.error(tips);
            //return false;
        }
        return true;
    };

    this.register = function (phoneConfig) {
        if(!_jsSipUA.checkHostName()){
            return false;
        }

        websocketUrl = 'ws://' + phoneConfig["fsHost"]  
                     + ':' + phoneConfig["fsPort"] ;
        host = phoneConfig["fsHost"] ;
        user = phoneConfig["extnum"];
        password = phoneConfig["password"];
        this.audioHandler = phoneConfig["audioHandler"];
        uri = "sip:" + user + "@" + host;
        var socket = new JsSIP.WebSocketInterface(websocketUrl);
        var configuration = {
            sockets: [socket],
            'uri': uri,
            'authorization_user': user,
            'password': password,
            'register_expires': 9000,
            'register': true
        };
        console.log('configuration:', websocketUrl, 'extnum=', user);
        useragent = new JsSIP.UA(configuration);
        useragent.start();
        useragent.on('registered', function (data) {
            console.log("分机注册成功.","registered");
            _jsSipUA.notifyAll("registered", "分机注册成功.");
        });
        useragent.on('unregistered', function (data) {
            console.log("分机未注册.","unregistered");
        });
        useragent.on('registrationFailed', function (e) { 
            var statusCode = (e.response != null && typeof(e.response.status_code) != "undefined" )  ? e.response.status_code : 0;
            var tips = "分机注册失败.";
            if(statusCode == 403){
                tips += "分机账号或者密码错误";
                alert(tips);
            }
            console.log(tips,"registrationFailed", );
            _jsSipUA.notifyAll("registrationFailed", tips);
        });

        //WebSocket connection events
        useragent.on('connecting', function () {
           console.log("try to connecting freeswitch server...")
        });
        useragent.on('connected', function () {
           console.log("Successfully connected to freeswitch server.")
        });
        useragent.on('disconnected', function () {
        	_jsSipUA.notifyAll('disconnected','尝试登录分机中.');
            console.log("trying to re-register to freeswitch server.");
            useragent.start();//断开后自动重新连接
        });
        
        //New incoming or outgoing call event
        useragent.on('newRTCSession', function (data) {
            if (data.session.direction == "incoming") {
                //有新来电时，先判断用户是否在通话中，如果用户忙则拒绝新来电
                if(!_jsSipUA.isExtensionFree())
                {
                    data.session._request.reply(486, "USER_BUSY_IN_CALLING");
                    console.log("漏接的电话", data.session._request.from._uri, data.session._request.from._uri._user);
                    return;
                }
                _jsSipUA.incomingSession = data.session;
                console.log(_jsSipUA.incomingSession);
                var remoteCaller = _jsSipUA.incomingSession._request.from._uri._user;
                var _callerInfo = "新来电，来自" + remoteCaller;
                console.log(_callerInfo);
				
                if(_jsSipUA.getDoNotDisturb())
                {
                    console.log("免打扰已启用，将拒绝新来电 " +remoteCaller,"");
                    _jsSipUA.incomingSession._request.reply(480, "DoNotDisturb_Is_Enabled.");
                }
				
				var sipAutoAnswerHeaderChecked = data.session._request.data.indexOf("answer-after") > 0;
                if(_jsSipUA.getAutoAnswer())
                { 
                    console.log("开启了自动应答，尝试自动接听电话");
                    _jsSipUA.answer();
                }else{					
					if(sipAutoAnswerHeaderChecked){
						console.log("外呼电话时，先自动接通分机...");			
					    _jsSipUA.answer();					    		 
					}else{
						_jsSipUA.notifyAll(
						    'inbound_call', 
							{"caller": remoteCaller, 
							 "callee" :  _jsSipUA.incomingSession._request.to._uri._user,
							 "tips": "新来电，来自" +  remoteCaller
							}
						); 
					}
                };
								
                data.session.on("confirmed", function (data) { 
                    _jsSipUA.stopRinging();
					if(!sipAutoAnswerHeaderChecked){
						console.log(_jsSipUA.incomingSession);
						_jsSipUA.notifyAll('confirmed', 
						   {"caller": remoteCaller, 
							"callee" :  _jsSipUA.incomingSession._request.to._uri._user,
							"tips": "电话已经接通，来自" +  remoteCaller
						   }
						); 
					}else{
						console.log("分机已经接通，正在外呼中...");
					}
                });

                
                data.session.on('sdp', function(data){                    
                    console.info('onSDP', data.sdp);
                });

                data.session.on("hold", function (data) {
                    _jsSipUA.notifyAll('hold', "当前的通话被保持，客户将现在无法听到您的讲话");
                });
                //注意：通话保持之后，可能导致客户端rtp_timeout而挂机
                data.session.on("unhold", function (data) { 
                    _jsSipUA.notifyAll('unhold', "通话被保持被解除");
                });
                data.session.on("muted", function (data) {                    
                    _jsSipUA.notifyAll('muted', "静音中，对方无法听到您的声音");
                });
                data.session.on("unmuted", function (data) { 
                    _jsSipUA.notifyAll('unmuted', "静音解除");
                });
                data.session.on('progress', function (data) { 
                    if(!_jsSipUA.getDoNotDisturb()) {
                        if(!_jsSipUA.getAutoAnswer()){
                            _jsSipUA.startRinging();
                            console.log("新来电"+ remoteCaller,'income_progress');
                        }
                    }
                });
                data.session.on('ended', function (data) {
                        console.log('Inbound call ended.',data);
						_jsSipUA.isInboundCalling = false;
                                            
                        _jsSipUA.isAnswered = false;
                        //_jsSipUA.playHangupSound();
                        var hangupInfo = "通话已结束.";
                        var remoteUser = "";
                        if (data.originator == "remote") {
                            remoteUser = "对方" + data.message.from.uri.user;
                        }
                        if (data.originator == "local" && data.message == null) {
                            remoteUser = "您";
                        }
                        _jsSipUA.notifyAll('hungup', hangupInfo); 
                        _jsSipUA.pauseAudioStream();
                        _jsSipUA.closeIncomingSession();
						_jsSipUA.stopRinging();
                     
                });
            }
            else if (data.session.direction == "outgoing") {
                _jsSipUA.outgoingSession = data.session;
                var _progressInfo = "开始呼叫 " + data.session._request.to._uri._user;
                console.log(_progressInfo,"out_progress");

                data.session.connection.addEventListener("addstream", function (ev) {
                    console.info('onaddstream from remote1 - ', ev.stream);
                    _jsSipUA.audioHandler.srcObject  = ev.stream; 
                 });
 
                data.session.on('sdp', function(data){
                    // console.info('onSDP, type - ', data.type, ' sdp - ', data.sdp);
                     if(data.type == 'offer2') {
                        data.sdp = data.sdp.replace('UDP/TLS/RTP/SAVPF 111 63 9 0 8 13 110 126', 'RTP/SAVPF 0 8 101')
                        .replace("a=rtpmap:126 telephone-event/8000","a=rtpmap:101 telephone-event/8000")
                        .replace("a=rtpmap:111 opus/48000/2\r\n", "")
                        .replace("a=rtcp-fb:111 transport-cc\r\n", "")
                        .replace("a=fmtp:111 minptime=10;useinbandfec=1\r\n", "")
                        .replace("a=rtpmap:63 red/48000/2\r\n", "")
                        .replace("a=fmtp:63 111/111\r\n", "")
                        .replace("a=rtpmap:9 G722/8000\r\n", "")
                        .replace("a=rtpmap:13 CN/8000\r\n", "")
                        .replace("a=rtpmap:110 telephone-event/48000\r\n", "")
                        .replace("a=extmap-allow-mixed\r\n", "")
                        .replace("a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level\r\n", "")
                        .replace("a=extmap:2 http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time\r\n", "")
                        .replace("a=extmap:3 http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01\r\n", "")
                        .replace("a=extmap:4 urn:ietf:params:rtp-hdrext:sdes:mid\r\n", "")
                        //.replace("a=setup:actpass", "a=setup:active")
                        .replace("a=group:BUNDLE 0\r\n", "") ;
                        console.info('onSDP, changed sdp - ', data.sdp);
                     } 
                  });

            }
        });
    };

    /**
     *  应答呼入通话
     */
    this.answer = function () {
        if (_jsSipUA.incomingSession != null && !_jsSipUA.isAnswered) { 
            _jsSipUA.isAnswered = true; 
            _jsSipUA.incomingSession.answer({'mediaConstraints' : { 'audio': true, 'video': false }}); 
            //拿到远程的音频流
            _jsSipUA.incomingSession.connection.addEventListener("addstream", function (ev) {
                console.info('onaddstream from remote - ', ev.stream);
                _jsSipUA.audioHandler.srcObject  = ev.stream;
            });
        } 
    };

    //执行外呼
    this.makeCall = function (dest) {
        if(!_jsSipUA.isExtensionFree()){ 
            return {"tips":"当前在外呼或通话中，请结束当前通话后再尝试外呼!", "success": false};
        }
        var eventHandlers = {
            'progress': function (data) {
               console.log(data);
                _jsSipUA.startPlaySound();
            },
            'hold': function (data) { 
                _jsSipUA.notifyAll('hold', "当前的通话被保持，双方无法都无法听到彼此的声音");
            },
            //注意：通话保持之后，可能导致客户端rtp_timeout而挂机
            'unhold': function (data) { 
                _jsSipUA.notifyAll('unhold', "通话被保持被解除");
            },
            'muted': function (data) { 
                _jsSipUA.notifyAll('muted', "静音中，对方无法听到您的声音");
            },
            'unmuted': function (data) { 
                _jsSipUA.notifyAll('unmuted', "静音被解除");
            },
            'failed': function (data) {
               console.log(data);
                _jsSipUA.stopPlaySound();
                console.log("呼叫失败，详情:" + data.cause,'failed');
                _jsSipUA.closeOutgoingSession();
                _jsSipUA.playCancelCallSound();
            },
            'confirmed': function (data) {
                _jsSipUA.isCallConnected = true;
                _jsSipUA.stopPlaySound(); 
                console.log('外呼电话已接通', data);
                var remoteCallee = _jsSipUA.outgoingSession._request.to._uri._user; 
                _jsSipUA.notifyAll('confirmed', 
                       {"callee": remoteCallee, 
                        "caller" :  _jsSipUA.outgoingSession._request.from._uri._user,
                        "tips": "电话已经接通，to " +  remoteCallee
                       }
                );  
            },
            'ended': function (data) {
                    console.log('Outbound call ended.',data);
                
                    _jsSipUA.isCallConnected = false;
                    _jsSipUA.isInOutgoingCalling = false;
                    _jsSipUA.playHangupSound();
                    var hangupInfo = "挂断了电话.";
                    var remoteUser = "";
                    if (data.originator == "remote") {
                        remoteUser = "对方" + data.message.from._uri._user;
                    }
                    if (data.originator == "local" && data.message == null) {
                        remoteUser = "您";
                    }
                    _jsSipUA.notifyAll('hungup', remoteUser + hangupInfo); 
                    _jsSipUA.closeOutgoingSession();
                    _jsSipUA.pauseAudioStream();
					_jsSipUA.stopRinging();
                 
            }
        };
        var options = {
            'eventHandlers': eventHandlers,
            'mediaConstraints': {
                audio: true,
                video: false
            },
            'sessionTimersExpires': 9000
        };
        useragent.call('sip:' + dest + '@' + host, options);
        return {"tips":"success", "success": true};;
    };

    this.sendDtmf = function (dtmf) { 
        if(dtmf.length != 1){  
            return {"tips": "dtmf必须为数字或者*#，且一次只能发送一个字符", "success": false};
        }
        var session = _jsSipUA.outgoingSession || _jsSipUA.incomingSession;
        if (session != null) { 
            var tones = dtmf;
            var options = {'duration': 160, 'interToneGap': 1200};
            _jsSipUA.playDTMFClickSound(dtmf);
            session.sendDTMF(tones, options);
            return {"tips": "ok", "success": true};
        }else{
            return {"tips": "当前不在通话中，不可发送dtmf", "success": false};
        }
    };

    this.unregister = function () {
        var options = {
            all: true
        };
        useragent.unregister(options);
    };

    this.hangup = function () {
        if (_jsSipUA.incomingSession != null) {
            if (!_jsSipUA.isAnswered) {
               console.log("挂断未接听的呼入电话");
                _jsSipUA.incomingSession._request.reply(480, "USER_BUSY");
            }
            else {
               console.log("挂断已接听的呼入电话");
                _jsSipUA.incomingSession.terminate();
            }
        }
        else if (_jsSipUA.outgoingSession != null) {
            if (!_jsSipUA.isCallConnected) {
               console.log("取消外呼电话");
                _jsSipUA.outgoingSession._request.cancel();
            }
            else
            {
               console.log("挂断已已接通的外呼电话");
                _jsSipUA.outgoingSession.terminate();
            }
        }
    };

    //是否已经静音
    var isMuted = false;
    //静音
    this.mute = function () {
        if(isMuted) return;
        isMuted = true;
        if (_jsSipUA.incomingSession != null) {
            if (_jsSipUA.isAnswered) {
                _jsSipUA.incomingSession.mute();
            }
        }
        else if (_jsSipUA.outgoingSession != null) {
            if (_jsSipUA.isCallConnected) {
                _jsSipUA.outgoingSession.mute();
            }
        }
    };

    //取消静音
    this.unmute = function () {
        if(!isMuted) return;
        isMuted = false;
        if (_jsSipUA.incomingSession != null) {
            if (_jsSipUA.isAnswered) {
                _jsSipUA.incomingSession.unmute();
                console.log("session unmuted.");
            }
        }
        else if (_jsSipUA.outgoingSession != null) {
            if (_jsSipUA.isCallConnected) {
                _jsSipUA.outgoingSession.unmute();
                console.log("session unmuted.");
            }
        }
    };

    var isHold = false;
    //通话保持
    this.hold = function () {
        var session = _jsSipUA.incomingSession || _jsSipUA.outgoingSession;
        if (!isHold) { 
            isHold = true;
            session.hold();
        }
    };
    //通话解除保持
    this.unhold = function () {
        var session = _jsSipUA.incomingSession || _jsSipUA.outgoingSession;
        if (isHold) {
            isHold = false;
            session.unhold();
        }  
    };

};
