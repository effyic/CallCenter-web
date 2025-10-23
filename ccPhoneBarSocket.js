/*
 * 呼叫中心电话工具条
 * author: easycallcenter365@126.com
 * 2025-04-08
*/

function _phoneBarObserver(){
	if(!(this instanceof _phoneBarObserver)){
		return new _phoneBarObserver();
	}
	this.listeners = {}
};
_phoneBarObserver.prototype = {
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
				this.listeners[key][i](info);
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

//呼叫中心websocket通信对象
"use strict";
function ccPhoneBarSocket() {
	var observer = new _phoneBarObserver(); 
	observer.make(this);
	var _cc = this;
	var ws = null; 
	var wsuri = null;
	var isConnected = false;
	/* 通话已建立 */
	var callConnected = false;
	/*
	 *  是否可以发送视频通话邀请;
	 */
	var canSendVideoReInvite = false;
	/**
	 * 是否开启了坐席状态列表订阅
	 * @type {boolean}
	 */
	this.subscribeAgentListStarted = false;
	this.iframe = null;
	this.callConfig = {
		 // 使用默认的UI，还是使用自定义的UI
		'useDefaultUi': false,
		//呼叫控制服务器地址
		'ipccServer': '127.0.0.1:8443',
		//是否启用websocket安全连接
		'enableWss' : false,
		//语音编码
		'callCodec' : 'pcma',
		//是否发送心跳数据
		'enableHeartBeat' : true,
		//送心跳数据的时间间隔; 秒;
		'heartBeatIntervalSecs' : 16,
		// 工具条外呼时： 软电话和外呼通话，使用相同的语音编码，避免转码，从而提高性能;
		// 但是!： 如果客户端是网页电话，且外呼线路使用g729编码时，该参数需要设置为false，
		// 因为网页电话不支持g729编码; [此时会产生语音编码的转码]
		'useSameAudioCodeForOutbound' : true,
		// 令牌
		'loginToken' : '',

		 // 网关列表, 如果是注册模式： 网关地址参数则填写为网关名称;
		 // 安全起见，生产环境，需要把该参数加密为base64格式;
		'gatewayList' : [],

	    'gatewayEncrypted' : false,

		 // 分机注册配置;
		 //Freeswitch服务器地址
		 'fsServer' : '192.168.3.111:5060',
		 // 分机账户
		 'extnum' : '',
		 // 工号
		 'opnum' : '',
		 //业务组编号
		 'groupId' : '',
		 //全部业务组列表
		 'groups' : null,
		 //全部坐席人员列表
		 'agentList' : null,
		 'extPassword': 'zfAn1l2mjx86lyX9U33xNf%2FKx15dOf6ucnDDK9nfnkA%3D',  // 分机密码
		 'phoneType': 'EyeBeam',         // 电话类型
		 'webPhoneUrl' : 'None',

		 // 客户端软电话代理配置信息
		 'localHostProxyVersion' : 'v20221130_1736',  // 本地代理软件的版本信息
		 'localHostProxyPort' : 8888    // 本地代理软件端口;
	};

	/**
	 * 在指定html对象后追加新元素
	 * @param newElement
	 * @param targetElement
	 */
	this.insertAfter = function(newElement,targetElement)
	{
		var parent = targetElement.parentNode;
		if(parent.lastChild === targetElement)
		{
			parent.appendChild(newElement);
		}else{
			parent.insertBefore(newElement,targetElement.nextSibling);
		}
	};

	this.trim = function (str) {
		return str.replace(/^\s\s*/,'').replace(/\s\s*$/, '');
	};
    this.getIsConnected = function(){
    	return isConnected;
    };
    /**
     *  获取通话状态
     * @returns {boolean} true通话中，false通话未建立;
     */
    this.getCallConnected = function(){
        return callConnected;
    };
    /**
     *  设置通话状态;
     * @param value true通话中，false通话未建立
     * @returns {*}
     */
    this.setCallConnected = function(value){
        callConnected = value;
    };

	/**
	 *  设置一个标志，指示是否可以发起视频通话;
	 * 仅限通话为音频通话且通话已经接通时方可允许发起视频邀请；
	 * @param value
	 */
	this.setCanSendVideoReInvite = function(value){
		canSendVideoReInvite = value;
	};

	/**
	 *  设置一个标志，指示是否可以发起视频通话;
	 * @param value
	 */
	this.getCanSendVideoReInvite = function(){
	    return 	canSendVideoReInvite;
	};

	this.setHeartbeat = function()
	{
		setInterval(function(){
			//如果启用了心跳，而且用户已经登录上线,则发送心跳数据
			if(_cc.callConfig.enableHeartBeat && _cc.getIsConnected()){
				console.debug("try to send heartbeat.");
				var heartBeat = {};
				heartBeat.action="setHearBeat";
				heartBeat.body = "{}";
				_cc.sendMsg(heartBeat);
			}
		}, _cc.callConfig.heartBeatIntervalSecs * 1000);
	};

	this.loadScript = function(destUrl, callbackFunc){
		var script = document.createElement("script");   
        script.type = "text/javascript";
        script.src = destUrl;
		if(null != callbackFunc){
		   script.onload=function(){callbackFunc();}
		}
		document.getElementsByTagName('head')[0].appendChild(script);		 
	};

    // 初始化websocket连接参数
	this.initConfig = function(config) {
		console.log("🔧 执行 initConfig()");
		//把config中的属性全部拷贝到callConfig中;
		for(var element in config) {
			this.callConfig[element] = config[element];
		}

		var _loginToken = this.callConfig["loginToken"];
		if(typeof(_loginToken) == "undefined" && _loginToken === "") {
			alert("电话工具条：无法获取 loginToken!");
			return;
		} 
 
	    console.log("callConfig:", this.callConfig);
	    wsuri = 'ws://' + this.callConfig.ipccServer +
	    			'/call-center/websocketServer?' +
			'&loginToken=' + this.callConfig.loginToken;
			 
	    console.log("🔧 构建的 wsuri:", wsuri);
	    var ipccServerIpAddr = this.callConfig.ipccServer.split(":");
	    if(this.callConfig.enableWss &&  this.checkIP(ipccServerIpAddr)){
	    	var tipsError = "ERROR! 启用了wss之后，必须使用域名访问websocketServer! " + this.callConfig.ipccServer;
	    	console.log(tipsError);
	    	alert(tipsError);
		}
	    if(this.callConfig.enableHeartBeat) {
			_cc.setHeartbeat();
		}  
		 
		//var downLoadUrl = "http://192.168.66.71:81/soft/callcenter-soft/LocalHostProxy/LocalHostProxy-" +
							  _cc.callConfig["localHostProxyVersion"] + ".zip";
		//console.log("客户端代理软件的下载地址:", downLoadUrl);
        //this.createIframe("http://127.0.0.1:8888/getVersion");

        if(_cc.callConfig["useDefaultUi"]){
			this.initPhoneBarUI();
		}
	};

	//检测ip地址是否合法;
	this.checkIP = function (ip)   
	{   
	    var re =  /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/ ;  
	    return re.test(ip);   
	};

	//断开到呼叫控制服务器的连接 
	this.disconnect = function(){
		console.log("执行 disconnect()");
		// 发送断开命令
		if (ws && ws.readyState === WebSocket.OPEN) {
			var cmdInfo = {};
			cmdInfo.action="setAgentStatus";
			cmdInfo.body = {"cmd" : "disconnect", "args" : { "msg" : "disconnection opt triggered by js client." } };
			ws.send(JSON.stringify(cmdInfo));
			// 关闭 WebSocket 连接
			ws.close();
		}
		// 清空 wsuri，避免下次使用旧的 loginToken
		wsuri = null;
		console.log("disconnect() 完成，wsuri 已清空:", wsuri);
	};

	/**
	 *  获取当前坐席登录的分机号码
	 * @returns {string|*}
	 */
	this.getExtNum = function(){
		return this.callConfig.extnum;
	};

	/**
	 *  获取当前坐席登录的工号
	 * @returns {string|*}
	 */
	this.getOpNum = function(){
		return this.callConfig.opnum;
	};

	/**
	 *  获取当前坐席的业务组编号
	 * @returns {string|*}
	 */
	this.getGroupId = function(){
		return this.callConfig.groupId;
	};


	/**
	 *  获取全部业务组列表
	 * @returns {string|*}
	 */
	this.getGroups = function(){
		return  JSON.parse(JSON.stringify(this.callConfig.groups));
	};

    this.findAgentByOpNum  = function (opnum){
    	if(_cc.callConfig.agentList == null) return null;

		for (var key in _cc.callConfig.agentList) {
			let item = _cc.callConfig.agentList[key];
            if(item["opnum"] === opnum){
            	//add _arrayIndex property to record index
            	item["_arrayIndex"] = key;
            	return item;
			}
		}
		return null;
	};

	this.updateAgentList = function (agentList) {
		for (var key in agentList) {
			let item = agentList[key];
            var existItem = this.findAgentByOpNum(item["opnum"]);
            if(existItem != null){
				var newStatus = item["agentStatus"];
				var oldStatus = existItem["agentStatus"];
				var logoutTime = item["logoutTime"];
				if(logoutTime > 0){
					//删除元素
					console.info("delete offline user",item["opnum"], "index=", key);
					_cc.callConfig.agentList.splice(existItem["_arrayIndex"], 1);
					continue;
				}
				if(newStatus != oldStatus){
					existItem["agentStatus"] = newStatus;
				}
			}else{
				if(_cc.callConfig.agentList != null) {
					_cc.callConfig.agentList[_cc.callConfig.agentList.length + 1] = item;
				}
			}
		}
	};

	//连接到呼叫控制服务器
	this.connect = function() {
		console.log("执行 connect()，当前 wsuri:", wsuri);
		
		// 检查 wsuri 是否已配置
		if (!wsuri || wsuri === null) {
			console.error("❌ 无法连接：wsuri 未配置！请先调用 initConfig()");
			return;
		}
		
		if ('WebSocket' in window)
			ws = new WebSocket(wsuri);
		else {
			console.log('您的浏览器不支持websocket，您无法使用本页面的功能!');
			return;
		}
		//收到消息
		ws.onmessage = function(evt) {
			console.log("recv msg from websocket server: ", evt.data);
			var msg = JSON.parse(evt.data);
			console.log("parsed json data:", msg);
			var resp_status = msg["status"];
			switch(resp_status) {
				case 200:
					isConnected = true;
					_cc.callConfig.extnum = msg.object["extnum"];
					_cc.callConfig.opnum = msg.object["opnum"];
					_cc.callConfig.groupId = msg.object["groupId"];
					_cc.callConfig.groups = msg.object["groups"];
					console.log('ipcc连接成功.', 'connected_ipcc_server');
					_cc.notifyAll(ccPhoneBarSocket.eventList.ws_connected, msg);
					_cc.setStatus(ccPhoneBarSocket.agentStatusEnum.busy);
					break;
				default:
					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.caller_hangup) ||
						parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.CONFERENCE_MODERATOR_HANGUP)) {
						_cc.setCallConnected(false);
						_cc.setCanSendVideoReInvite(false);
						_cc.callConfig.agentList = null;
						_cc.unSubscribeAgentList();
						console.log("caller_hangup")
					}
					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.callee_answered)) {
						_cc.setCallConnected(true);
						console.log("callee_answered")
					}
					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.new_inbound_call)) {
						_cc.setCallConnected(true);
						console.log("new_inbound_call")
					}
					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.caller_answered) ||
						parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.callee_answered)) {
						if (msg["object"]["callType"] === "audio") {
							_cc.setCanSendVideoReInvite(true);
							_cc.notifyAll(ccPhoneBarSocket.eventList.on_audio_call_connected, "audio call connected.")
							console.log("current callType is audio.")
						}
						if (msg["object"]["callType"] === "video") {
							_cc.setCanSendVideoReInvite(false);
							_cc.notifyAll(ccPhoneBarSocket.eventList.on_video_call_connected, "video call connected.")
							console.log("current callType is video.")
						}
					}

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.customer_channel_hold)) {
						_cc.changeUiOnHold();
					}

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.customer_channel_unhold)) {
						_cc.changeUiOnUnHold();
					}

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.customer_on_hold_hangup)) {
						_cc.changeUiOnUnHold();
						$("#holdBtn").removeClass('on');
						$("#callStatus").text("保持的通话已挂机.");
					}

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.customer_channel_call_wait)) {
						$("#stopCallWait").show();
						$("#doConsultationBtn").hide();
						$("#callStatus").text("客户电话等待中.");
						// _cc.showTransferAreaUI();
					}

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.customer_channel_off_call_wait)) {
						$("#stopCallWait").hide();
                        $("#transferCallWait").hide();
						_cc.hideTransferAreaUI();
						$("#callStatus").text("等待的电话已接回.");
					}

                    if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.inner_consultation_start)) {
                        $("#callStatus").text("咨询已开始.");
                        $("#transferCallWait").show();
                    }

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.inner_consultation_stop)) {
						$("#callStatus").text("咨询已结束.");
						$("#transferCallWait").hide();
					}

                    if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.customer_on_call_wait_hangup)) {
						$("#stopCallWait").hide();
                        $("#transferCallWait").hide();
						$("#callStatus").text("等待的客户已挂机.");
					}

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.inner_consultation_start)) {
						$("#holdBtn").removeClass('on');
						$("#hangUpBtn").removeClass('on');
						$("#transferBtn").removeClass('on');
					}

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.transfer_call_success)) {
						var extNum = msg["object"]["callee"];
						if(extNum === _cc.getExtNum()) {
							$("#holdBtn").addClass('on');
							$("#hangUpBtn").addClass('on');
							$("#transferBtn").addClass('on');
						}

					}

					if (parseInt(resp_status) === parseInt(ccPhoneBarSocket.eventList.agent_status_data_changed)) {
						if(_cc.subscribeAgentListStarted) {
							if (_cc.callConfig.agentList == null) {
								_cc.callConfig.agentList = JSON.parse(msg.object);
							}else{
								// 更新列表;
                                _cc.updateAgentList(JSON.parse(msg.object));
							}
						}
					}
					_cc.notifyAll(resp_status, msg);
					break;
			}
		};
		//关闭连接时触发  
		ws.onclose = function(evt) {
			console.log("WebSocket onclose 事件触发 - 连接已关闭");
			isConnected = false;
			_cc.notifyAll(ccPhoneBarSocket.eventList.ws_disconnected, "ipccserver 连接断开.");
			// 注意：onclose 是连接关闭后的回调，此时连接已经关闭，不需要再调用 ws.close()
		};
		ws.onopen = function(evt) {
			console.log("ipccserver websocket onopen...");
		};
	};
	
	//发送消息给呼叫控制服务器
	this.sendMsg = function(jsonObject) {
		console.debug("ws.send:", jsonObject);
		ws.send(JSON.stringify(jsonObject));
	};

	this.changeUiOnHold = function() {
		$("#holdBtnLi").hide();
		$("#unHoldBtnLi").show();
		$("#unHoldBtn").addClass('on');
	};

	this.changeUiOnUnHold = function() {
		$("#holdBtnLi").show();
		$("#holdBtn").addClass('on');
		$("#unHoldBtnLi").hide();
	};

	this.hideTransferAreaUI = function(){
		var transferArea = document.getElementById("transfer_area");
		transferArea.style.display = "none";
	};

	this.showTransferAreaUI = function(){
		var transferArea = document.getElementById("transfer_area");
		transferArea.style.display = "block";
	};

	/**
	 *  设置状态为空闲
	 */
	this.setStatusFree = function(){
		this.setStatus(ccPhoneBarSocket.agentStatusEnum.free);
	};

	/**
	 *  设置状态为忙碌
	 */
	this.setStatusBusy = function(){
		this.setStatus(ccPhoneBarSocket.agentStatusEnum.busy);
	};

	ccPhoneBarSocket.utils = {

		/**
		 * 读取 URL 中的指定查询参数值
		 * @param {string} paramName - 要获取的参数名称
		 * @returns {string|null} 返回参数值，如果不存在则返回 null
		 */
		getQueryParam :	function (paramName) {
			const url = window.location.href; // 获取当前页面 URL
			const params = new URLSearchParams(new URL(url).search); // 创建 URLSearchParams 对象
			return params.get(paramName); // 获取指定参数值
		}
	};

	/**
	 *  座席状态枚举;
	 * @type {{rest: number, calling: number, busy: number, free: number, justLogin: number, meeting: number, train: number}}
	 */
	ccPhoneBarSocket.agentStatusEnum = {

		/**
		 *  刚刚上线，尚未就绪中;
		 */
		"justLogin" : 1,

		/**
		 * 空闲
		 */
		"free"  :  2,

		/**
		* 忙碌
		*/
		"busy"  :  3,

		/**
		 * 小休
		 */
		"busy_rest"  :  31,

		/**
		 * 会议
		 */
		"busy_meeting"  :  32,

		/**
		 * 培训
		 */
		"busy_training"  :  33,

		/**
		 * 通话中
		 */
		"incall" : 4,

		/**
		 * 话后处理，填写表单中
		 */
		"fill_form" : 5,

		/**
		 * 会议中
		 */
		"conference"  :  6
	};

	//定义视频level-id
	ccPhoneBarSocket.videoLevels = {
		"Smooth" :  { "levelId" : "42e00b",  "description" : "流畅"  },
		"Smooth2" :  { "levelId" : "42e00c",  "description" : "流畅+"  },
		"Smooth3" :  { "levelId" : "42e00d",  "description" : "流畅++"  },
		"Clear" : { "levelId" : "42e014",  "description" : "清晰"  },
		"Clear2" :  { "levelId" : "42e015",  "description" : "清晰+"  },
		"Clear3" :  { "levelId" : "42e016",  "description" : "清晰++"  },
		"HD" :   { "levelId" : "42e01e",  "description" : "高清"  },
		"HD2" :  { "levelId" : "42e01f",  "description" : "高清+"  }
	};


	/**
	 * 系统事件列表;
	 * @type {{}}
	 */
	ccPhoneBarSocket.eventList = {
		// 当音频通话已建立
		"on_audio_call_connected" : "100",
		"on_video_call_connected" : "101",

		// websocketServer连接成功
		"ws_connected": "200",
		// 当前用户已在其他设备登录;
		"user_login_on_other_device" : "201",
		// 用户下线
		"ws_disconnected" : "202",
		// 通话状态发生改变 [监听的数据]
		"call_session_status_data_changed" : "203",
        // 坐席状态列表发生改变
        "agent_status_data_changed" : "205",
		//请求参数错误
		"request_args_error" : "400",
		//服务器内部错误
		"server_error" : "500",
		// 语音编码不匹配
		"server_error_audio_codec_not_match" : "501",
		// 主叫接通
		"caller_answered" : "600",
		//  主叫挂断
		"caller_hangup" : "601",
		// 主叫忙; 上一通电话未挂机
		"caller_busy" : "602",
		//主叫未登录
        "caller_not_login" : "603",
		//主叫应答超时
		"caller_respond_timeout" : "604",
		// 被叫接通
		"callee_answered" : "605",
        // 被叫挂断
		"callee_hangup" : "606",
		//被叫振铃
        "callee_ringing" : "607",
		// 座席状态改变
		"status_changed" : "608",
		// 一个完整的外呼任务结束： [可能尝试了一个或多个网关]
		"outbound_finished" : "611",

		// 预测外呼，分配的来电;
		"PREDICTIVE_CALL_INBOUND" : "612",

         // ACD队列分配的新来电
		"new_inbound_call" : "613",

         // 当前业务组实时排队人数
		"acd_group_queue_number" : "615",


		/**
		 * 收到转接的来电请求
		 */
		"transfer_call_recv" :  616,

		/**
		 * 锁定坐席失败
		 */
		"lock_agent_fail" :  617,

		/**
		 * 通话已经转接成功
		 */
		"transfer_call_success" :  618,

		/**
		 * 产生asr语音识别结果
		 */
		"asr_result_generate" :  619,

		/**
		 * ASR语音识别流程结束（坐席侧）
		 */
		"asr_process_end_agent" :  620,

		/**
		 * ASR语音识别流程结束（客户侧）
		 */
		"asr_process_end_customer" :  621,

		"asr_process_started" : 622,

		/**
		 * customer call session hold.
		 */
		"customer_channel_hold" : 623,

		/**
		 * customer call session unHold.
		 */
		"customer_channel_unhold" : 624,

		/**
		 * customer call session on hold is hangup.
		 */
		"customer_on_hold_hangup" : 625,

		"inner_consultation_request" : 626,

		/**
		 * customer call session on call-wait.
		 */
		"customer_channel_call_wait" : 627,

		/**
		 * customer call session off call-wait.
		 */
		"customer_channel_off_call_wait" : 628,

		/**
		 * customer call session on call-wait is hangup.
		 */
		"customer_on_call_wait_hangup" : 629,

		/**
		 *  extension on line event
		 */
		"extension_on_line" : 630,

		/**
		 * extension off line event
		 */
		"extension_off_line" : 631,

        /**
         * Notify the agent that the call consultation has started.
         */
        "inner_consultation_start" : 632,

        /**
         *  Notify the agent that the call consultation has stopped.
         */
        "inner_consultation_stop" : 633,


	    /**
		* 多人电话会议，重复的被叫 ,
		*/
		"conference_repeat_callee"  :  660 ,

		 /**
		 * 多人电话会议，呼叫成员超时 ,
		 */
		 "CONFERENCE_CALL_MODERATOR_TIMEOUT"  :  661 ,

		/**
		 * 多人电话会议，成员接通 ,
		 */
		"CONFERENCE_MEMBER_ANSWERED"  :  662 ,


		/**
		 * 多人电话会议，成员挂机 ,
		 */
		"CONFERENCE_MEMBER_HANGUP"  :  663 ,

		/**
		 * 多人电话会议，成员禁言成功 ,
		 */
		"CONFERENCE_MEMBER_MUTED_SUCCESS"  :  666 ,


		/**
		 * 多人电话会议，成员禁言失败 ,
		 */
		"CONFERENCE_MEMBER_MUTED_FAILED"  : 665  ,

		/**
		 * 多人电话会议，成员解除禁言成功 ,
		 */
		"CONFERENCE_MEMBER_UNMUTED_SUCCESS"  :  667 ,


		/**
		 * 多人电话会议，成员解除禁言失败 ,
		 */
		"CONFERENCE_MEMBER_UNMUTED_FAILED"  : 668  ,

		/**
		 * 多人电话会议，会议成员不存在，无法执行相关操作：
		 */
		"CONFERENCE_MEMBER_NOT_EXISTS"  : "669"  ,

		/**
		 * 多人电话会议，主持人重置会议 ,
		 */
		"CONFERENCE_MODERATOR_RESET"  : "670"  ,

		/**
		 * 多人电话会议，主持人接通 ,
		 */
		"CONFERENCE_MODERATOR_ANSWERED"  : "671"  ,


		/**
		 * 多人电话会议，主持人挂机，会议结束 ,
		 */
		"CONFERENCE_MODERATOR_HANGUP"  : "672",

		/*
		 * 成员视频禁用成功
		 */
		"CONFERENCE_MEMBER_VMUTED_SUCCESS" : "674",

		/*
		 * 成员解除视频禁用成功
		 */
		"CONFERENCE_MEMBER_UnVMUTED_SUCCESS" : "676",

		/**
		 * 多人电话会议，成员解除视频禁用失败;
		 */
		"CONFERENCE_MEMBER_UnVMUTED_FAILED"  : "677",

		/**
		 * 成功把通话转接到多人视频会议
		 */
		"CONFERENCE_TRANSFER_SUCCESS_FROM_EXISTED_CALL"  :  "678",

		/**
		 *  outbound start event
		 */
		"OUTBOUND_START" : "679"
	};

	this.createIframe = function(src){
        var _iframe = document.createElement("iframe");
        _iframe.style.width = '0';
        _iframe.style.height = '0';
        _iframe.style.margin = '0';
        _iframe.style.padding = '0';
        _iframe.style.overflow = 'hidden';
        _iframe.style.border = 'none';
        _iframe.src = src;
        document.body.appendChild(_iframe);
        _cc.iframe = _iframe;
    };

    this.openSoftPhone = function (){		
		//打开软电话
		var softPhoneUrl = "http://127.0.0.1:" + _cc.callConfig["localHostProxyPort"] + 
		                   "/autoSetExtension?server=" + encodeURIComponent(_cc.callConfig["fsServer"].split(':')[0]) +
						   "&port=" + _cc.callConfig["fsServer"].split(':')[1] +
						   "&extnum=" + _cc.callConfig["extnum"] +
						   "&pass=" + encodeURIComponent(_cc.callConfig["extPassword"]) +
						   "&phoneType=" + _cc.callConfig["phoneType"] +
						   "&version=" + encodeURIComponent(_cc.callConfig["localHostProxyVersion"]) +
						   "&webPhoneUrl=" + encodeURIComponent(_cc.callConfig["webPhoneUrl"]) +
						   "";
	  console.log("softPhoneUrl:", softPhoneUrl);					   
      _cc.iframe.src = softPhoneUrl;
	};

	/**
	 * 设置座席状态
	 * @param status  agentStatusEnum
	 */
	this.setStatus = function (status) {
		var cmdInfo = {};
		cmdInfo.action="setAgentStatus";
		cmdInfo.body = {"cmd" : "setStatus", "args" : { "status" : status } };
		ws.send(JSON.stringify(cmdInfo));
	};

	//注销登录;
	this.logOff = function () {
		var cmdInfo = {};
		cmdInfo.action="setAgentStatus";
		cmdInfo.body = {"cmd" : "disconnect", "args" : { "cause": "disconnect request from js client." }  };
		ws.send(JSON.stringify(cmdInfo));
	};

	/**
	 *  在咨询失败的情况下使用该按钮，接回处于等待中的电话
	 */
	this.stopCallWaitBtnClickUI = function () {
		var cmd = {};
		cmd.action="callWait";
		cmd.body = {"cmd" : "stop", "args" : {} };
		ws.send(JSON.stringify(cmd));
	};

    /**
     * 在咨询成功的情况下使用该按钮，把电话转接给专家坐席。
     */
	this.transferCallWaitBtnClickUI = function () {
        this.callControl("transferCallWait", {})
    };

	this.consultationBtnClickUI = function () {
        let transferType = "outer";
        let phoneNumber = $("#externalPhoneNumber").val().trim();
        if (phoneNumber === "") {
			transferType = "inner";
            var groupId = $("#transfer_to_groupIds").val();
            if ($.trim(groupId) == "") {
                alert("请选择业务组!");
                $("#transfer_to_groupIds").focus();
                return;
            }
            var member = $("#transfer_to_member").val();
            if ($.trim(member) == "") {
                alert("请选择要咨询的坐席成员!");
                $("#transfer_to_member").focus();
                return;
            }

            var selectText = $('#transfer_to_member option:selected').text();
            if (selectText.indexOf("空闲") == -1) {
                alert("请选择空闲的坐席成员!");
                $("#transfer_to_member").focus();
                return;
            }

            if (member == this.getOpNum()) {
                alert("不能咨询自己，请选择其他坐席成员!");
                return;
            }
            phoneNumber = member;
        }
        this.callControl("consultation", {"to": phoneNumber, "transferType": transferType});

    };

	/**
	 *  处理通话转接按钮点击事件
	 */
	this.transferBtnClickUI = function() {
	    let transferType = "outer";
	    let phoneNumber = $("#externalPhoneNumber").val().trim();
        if(phoneNumber === "") {
            transferType = "inner";
            var groupId = $("#transfer_to_groupIds").val();
            if ($.trim(groupId) === "") {
                alert("请选择转接的业务组!");
                $("#transfer_to_groupIds").focus();
                return;
            }
            var member = $("#transfer_to_member").val();
            if ($.trim(member) === "") {
                alert("请选择转接的坐席成员!");
                $("#transfer_to_member").focus();
                return;
            }

            var selectText = $('#transfer_to_member option:selected').text();
            if (selectText.indexOf("空闲") === -1) {
                alert("请选择空闲的坐席成员!");
                $("#transfer_to_member").focus();
                return;
            }
            if (member === this.getOpNum()) {
                alert("不能转给自己，请选择其他坐席成员!");
                return;
            }
            phoneNumber = member;
        }
        this.transferCall(phoneNumber, transferType);
	};

	/**
	 *  处理通话转接
     *  @param userCodeOrPhone 工号或者电话号码
     *  @param transferType 转接类型：工号还是外部号码（inner or outer）
	 */
	this.transferCall = function(userCodeOrPhone, transferType) {
	    if(transferType === "inner") {
            if (userCodeOrPhone !== this.getOpNum()) {
                this.callControl("transferCall", {"to": userCodeOrPhone, "transferType" : "inner" })
            } else {
                console.error("cant not transfer call to yourself.")
            }
        }else{
            this.callControl("transferCall", {"to": userCodeOrPhone, "transferType" : "outer" })
        }
	};

	//挂机
	this.hangup = function() {
		this.callControl("endSession", {})
	};

	// 呼叫控制相关操作;
	this.callControl = function(action, argsObject){
		var sessionControl = {};
		sessionControl.action="call";
		sessionControl.body = {"cmd" : action, "args" : argsObject };
		ws.send(JSON.stringify(sessionControl));
	};

	this.checkCallConfirmed = function () {
		if(!_cc.getIsConnected()){
			console.log('请先上线.');
			return false;
		}
		if(!_cc.getCallConnected()){
			console.log('当前没有通话.');
			return false;
		}
		return true;
	};

	/**
	 *  send and play mp4 video file.
	 */
	this.sendVideoFile = function (mp4FilePath) {
		if(!_cc.checkCallConfirmed()){
			return false;
		}
		if(typeof(mp4FilePath) == "undefined" || mp4FilePath.trim().length === 0){
			console.log("Parameter mp4FilePath is missing!")
			return false;
		}
		this.callControl(
			"playMp4File",
			{ "mp4FilePath" : mp4FilePath }
		);
		return true;
	};

	/**
	 *  发起视频通话邀请
	 */
	this.reInviteVideoCall = function(){
        if(!_cc.checkCallConfirmed()){
        	return false;
		}
		if(!_cc.getCanSendVideoReInvite()){
			console.log('cant not send video reInvite. ',
				'Precondition is:  Call is connected and  callType is audio.');
			return false;
		}
		this.callControl(
			"reInviteVideo",
			{}
		);
		return true;
	};

	/**
	 *  发起外呼
	 * @param phoneNumber 被叫号码
	 * @param callType 通话类型:视频通话、音频通话
	 * @param videoLevel 视频通话的profile-level-id
	 */
	this.call = function(phoneNumber, callType, videoLevel){
		if(typeof(videoLevel) == "undefined" || videoLevel.trim().length === 0){
			videoLevel = ccPhoneBarSocket.videoLevels.HD.levelId;
			console.log("auto default set videoLevel=", videoLevel);
		}
		if(typeof(callType) == "undefined" || callType.trim().length === 0){
			callType = "audio";
			console.log("auto default set callType=", callType);
		}

		console.log("call config videoLevel=" + videoLevel + ", callType=" + callType);

		if(phoneNumber==null || phoneNumber.length===0) {
			console.log('请输入外呼号码！');
			return;
		}
		if(phoneNumber.trim().length < 3){
			alert('请输入正确格式的外呼号码！');
			return;
		}
		if(!_cc.getIsConnected()){
			console.log('请先上线.');
			return;
		}
		let outboundInfo = {
			"gatewayList": _cc.callConfig.gatewayList,
			'destPhone': phoneNumber,
			'gatewayEncrypted' : _cc.callConfig.gatewayEncrypted,
			'useSameAudioCodeForOutbound' : _cc.callConfig.useSameAudioCodeForOutbound,
			'callType' :  callType,
			'videoLevel' : videoLevel
		};
		this.callControl(
			"startSession",
			outboundInfo
		);
	};
	
	this.callEx = function(phoneNumber){
		if(phoneNumber == null || phoneNumber.length === 0) {
			console.log('请输入外呼号码！');
			return;
		}
		if(!_cc.getIsConnected()){
			_cc.connect();
			_cc.on(ccPhoneBarSocket.eventList.ws_connected, function(){
				_cc.off(ccPhoneBarSocket.eventList.ws_connected); //取消事件订阅
				_cc.call(phoneNumber);
			});
			return;
		}
		_cc.call(phoneNumber);
	 };


	/************************  以下是网页工具条ui代码   ************************/

	/**
	 *  根据服务器响应状态码去查找action
	 * @param code
	 * @returns {string}
	 */
	ccPhoneBarSocket.findItemByCode = function(code){
		for(var item in ccPhoneBarSocket.eventListWithTextInfo ){
			if(ccPhoneBarSocket.eventListWithTextInfo[item].code === code){
				return ccPhoneBarSocket.eventListWithTextInfo[item];
			}
		}
	};

	/**
	 *  服务器响应状态枚举值;
	 */
	  ccPhoneBarSocket.eventListWithTextInfo = {
		"ws_connected": { "code": 200,  msg:"已签入",
			btn_text:[{id:"#onLineBtn",name:"签出"}],
			enabled_btn:['#setFree','#callBtn','#onLineBtn', '#consultationBtn']
		},
		"ws_disconnected": { "code" : 202, msg:"服务器连接断开",
			btn_text:[{id:"#onLineBtn",name:"签入"}],
			enabled_btn:['#onLineBtn']
		},
		"user_login_on_other_device": { "code" : 201, msg:"用户已在其他设备登录",
			btn_text:[{id:"#onLineBtn",name:"签入"}],
			enabled_btn:['#onLineBtn']
		},
		"request_args_error":{ "code" : 400, msg:"客户端请求参数错误",
			btn_text:[],
			enabled_btn:[]
		},
		"server_error":{ "code" : 500, msg:"服务器内部错误",
			btn_text:[],
			enabled_btn:[]
		},
		"caller_answered":{ "code" : 600, msg:"分机已接通",
			btn_text:[],
			enabled_btn:['#resetStatus', '#hangUpBtn', '#transferBtn', '#holdBtn', '#consultationBtn']
		},
		"caller_hangup":{ "code" : 601, msg:"分机已挂断",
			btn_text:[],
			enabled_btn:['#onLineBtn', '#resetStatus', '#callBtn', '#setFree', '#consultationBtn' ]
		},
		"caller_busy":{ "code" : 602, msg:"分机忙,上一通电话未挂断",
			btn_text:[],
			enabled_btn:['#onLineBtn', '#resetStatus', '#callBtn', '#setFree', '#consultationBtn']
		},
		"caller_not_login":{ "code" : 603, msg:"分机未登录，请检查",
			btn_text:[],
			enabled_btn:['#onLineBtn', '#resetStatus', '#callBtn', '#setFree', '#consultationBtn']
		},
		"caller_respond_timeout":{ "code" : 604, msg:"分机未应答超时，请重新打开分机",
			btn_text:[],
			enabled_btn:['#onLineBtn', '#resetStatus', '#callBtn', '#setFree', '#consultationBtn']
		},
		"callee_answered":{ "code" : 605, msg:"被叫已接通",
			btn_text:[],
			enabled_btn:['#resetStatus', '#hangUpBtn', '#transferBtn', '#holdBtn', '#consultationBtn' ]
		},
		"callee_hangup":{ "code" : 606, msg:"通话结束",
			btn_text:[],
			enabled_btn:['#onLineBtn', '#resetStatus', '#callBtn', '#setFree' , '#consultationBtn']
		},
		"callee_ringing":{ "code" : 607, msg:"被叫振铃中",
			btn_text:[],
			enabled_btn:['#resetStatus', '#hangUpBtn', '#transferBtn', '#consultationBtn']
		},
		"status_changed":{ "code" : 608, msg:"状态已改变",
			btn_text:[],
			enabled_btn:[ ]
		},
		"free":{ "code" : 0, msg:"空闲中",
			btn_text:[],
			enabled_btn:['#setBusy','#onLineBtn', '#consultationBtn']
		},
		"busy":{ "code" : 1, msg:"忙碌",
			btn_text:[],
			enabled_btn:['#setFree', '#onLineBtn',  '#callBtn', '#consultationBtn']  //  '#transferBtn'
		},
		"customer_channel_hold" : { "code" : 623, msg:"通话已保持.",
			btn_text:[],
			enabled_btn:['#setFree',  '#callBtn', '#unHoldBtn', '#consultationBtn' ]
		},
	   "customer_channel_unhold" : { "code" : 624, msg:"通话已接回.",
			  btn_text:[],
			  enabled_btn:[ '#hangUpBtn', '#holdBtn' ]
		}
	};

	ccPhoneBarSocket.phone_buttons = ['#setFree', '#setBusy', '#callBtn','#hangUpBtn' , '#resetStatus' ,'#onLineBtn', '#transferBtn', '#holdBtn', '#unHoldBtn', '#consultationBtn'];

	// 更新状态显示
	this.updatePhoneBar = function (msg, status_key) {
		if(!_cc.callConfig.useDefaultUi){
			console.log("callConfig.useDefaultUi = false ， 已禁用默认ui工具条按钮.");
			return;
		}

		if (msg) {
			$("#callStatus").text(msg.msg);
		}
		var status_info = ccPhoneBarSocket.findItemByCode(status_key);
		if (!status_info) {
			return;
		}

		if(status_info.code === ccPhoneBarSocket.eventListWithTextInfo.status_changed.code){
			if(msg.object.status === ccPhoneBarSocket.agentStatusEnum.free){
				status_info = ccPhoneBarSocket.eventListWithTextInfo.free;
			}else{
				status_info = ccPhoneBarSocket.eventListWithTextInfo.busy;
			}
		}
		// 判断当前是否为状态改变的事件;
		// 显示预设的消息;
		var msgSet = status_info.msg;

		if(msgSet && msgSet.length > 0){
			$("#callStatus").text(msgSet);
		}

		var btn_text = status_info.btn_text;
		var enabled_btn = status_info.enabled_btn;
		if (btn_text) {
			$.each(btn_text, function (i, d) {
				// 先尝试查找子元素中的span，如果没有则查找兄弟元素
				var $target = $(d.id).find('span');
				if ($target.length === 0) {
					$target = $(d.id).next();
				}
				$target.text(d.name);
			});
		}

		if (enabled_btn.length === 0) {
			return;
		}

		var all_btn = ccPhoneBarSocket.phone_buttons;
		for (var i in all_btn) {
			var idx = $.inArray(all_btn[i], enabled_btn);
			if (idx < 0) {
				$(all_btn[i]).removeClass('on');
			} else {
				$(enabled_btn[idx]).addClass('on');
			}
		}
	};

	/**
	 *  初始化电话工具条ui按钮;
	 */
	this.initPhoneBarUI = function () {

		window.onbeforeunload = function () {
			if (!confirm('关闭网页将导致您无法接听电话，确定要关闭吗 ?')) return false;
		};

		$("#unHoldBtnLi").hide();

		if(!_cc.callConfig.useDefaultUi){
			console.log("callConfig.useDefaultUi = false ， 已禁用默认ui工具条按钮.");
			return;
		}

        $('#conferenceBtn').on('click', function () {
                if(!_cc.getIsConnected()){
                    console.log('请先上线.');
                    return;
                }
                var confObjId = document.getElementById("conference_area");
                if(confObjId.style.display === "block"){
					confObjId.style.display = "none";
				}else{
					confObjId.style.display = "block";
				}

        });

		$('#callBtn').on('click', function () {
			if ($(this).hasClass('on')) {
				var destPhone = $.trim($("#ccphoneNumber").val());
				var videoLevel = document.getElementById("videoLevelSelect").value;
				var callType = document.forms[0].callType.value;
				_cc.call(destPhone, callType,  videoLevel);
			}
		});
		$('#setFree').on('click', function () {
			if ($(this).hasClass('on')) {
				_cc.setStatus(ccPhoneBarSocket.agentStatusEnum.free);
			}
		});
		$('#setBusy').on('click', function () {
			if ($(this).hasClass('on')) {
				_cc.setStatus(ccPhoneBarSocket.agentStatusEnum.busy);
			}
		});

		$('#setBusySubList').on('change', function () {
			 let itemValue = $('#setBusySubList').val();
			 console.log('set busy subStatus', itemValue);
			 _cc.setStatus(itemValue);
		});

		$('#hangUpBtn').on('click', function () {
			alert('点击挂机')
			if ($(this).hasClass('on')) {
				alert('点击挂机--挂断')
				_cc.hangup();
			}
		});

		$('#holdBtn').on('click', function () {
			if ($(this).hasClass('on')) {
				_cc.holdCall();
			}
		});

		$('#unHoldBtn').on('click', function () {
			if ($(this).hasClass('on')) {
				_cc.unHoldCall();
			}
		});

		$("#doTransferBtn").hide();
		$('#transferBtn').on('click', function () {
			if ($(this).hasClass('on')) {
				if(!_cc.getIsConnected()){
					console.log('请先上线.');
					return;
				}
				var transferArea = document.getElementById("transfer_area");
				if(transferArea.style.display === "block"){
					transferArea.style.display = "none";
					_phoneBar.unSubscribeAgentList();
					$("#doTransferBtn").hide();
					$("#doConsultationBtn").hide();
				}else{
					transferArea.style.display = "block";
					populateGroupIdOptions();
					_phoneBar.subscribeAgentList();
					$("#doTransferBtn").show();
					$("#doConsultationBtn").hide();
				}
			}
		});

        $("#stopCallWait").hide();
        $("#transferCallWait").hide();
		$("#doConsultationBtn").hide();
		$('#consultationBtn').on('click', function () {
			if ($(this).hasClass('on')) {
				if(!_cc.getIsConnected()){
					console.log('请先上线.');
					return;
				}
				var transferArea = document.getElementById("transfer_area");
				if(transferArea.style.display === "block"){
					transferArea.style.display = "none";
					_phoneBar.unSubscribeAgentList();
					$("#doConsultationBtn").hide();
					$("#doTransferBtn").hide();
				}else{
					transferArea.style.display = "block";
					populateGroupIdOptions();
					_phoneBar.subscribeAgentList();
					$("#doConsultationBtn").show();
					$("#doTransferBtn").hide();
				}
			}
		});

		$('#onLineBtn').on('click', function () {
			if ($(this).hasClass('on')) {
				if (_cc.getIsConnected()) {
					_cc.disconnect();
				} else {
					_cc.connect();
				}
			}else {
				alert('当前不允许签出!');
			}
		});

		$('#resetStatus').on('click', function () {
			console.log('强置按钮被点击，开始执行强置逻辑');
			// 先执行hangup逻辑（如果当前有通话）
			if (!jsSipUAInstance.isExtensionFree()) {
				jsSipUAInstance.hangup();
				// alert("强置按钮执行hangup");
			}
			_phoneBar.disconnect();
			console.log("强置按钮执行disconnect");
			// 等待断开完成后自动重新签入
			setTimeout(function() {
				console.log("开始自动重新签入");
				if (typeof autoSignin === 'function') {
					autoSignin();
				} else {
					console.error('autoSignin函数未定义，回退到页面刷新');
					window.onbeforeunload = null;
					location.reload();
				}
			}, 1000); // 等待1秒确保断开完成
		});

		//拨号文本框;收到键盘回车事件之后立即拨号
		$("#ccphoneNumber").keydown(function (e) {
			var curKey = e.which;
			if (curKey === 13) {
				var destPhone = $.trim($("#ccphoneNumber").val());
				var videoLevel = document.getElementById("videoLevelSelect").value;
				var callType = document.forms[0].callType.value;
				_cc.call(destPhone,callType, videoLevel);
				return false;
			}
		});

		//ESC按键挂机功能支持
		$(document).keyup(function (e) {
			var key = e.which;
			if (key === 27) {
				console.log('按下了ESC键, 即将发送挂机指令.');
				if(_cc.getIsConnected()){
					if(_cc.callConfig["useDefaultUi"]) {
						if ($('#hangUpBtn').hasClass('on')) {
							_cc.hangup();
						}
					}else{
						_cc.hangup();
					}
				}
			}
		});
	};

	/**
	 *  保持通话
	 */
	this.holdCall = function(){
		var cmd = {};
		cmd.action="callHold";
		cmd.body = {"cmd" : "hold", "args" : {} };
		ws.send(JSON.stringify(cmd));
	};

	/**
	 *  接回保持的通话
	 */
	this.unHoldCall = function(){
		var cmd = {};
		cmd.action="callHold";
		cmd.body = {"cmd" : "unhold", "args" : {} };
		ws.send(JSON.stringify(cmd));
	};

	/**
	 *  订阅坐席状态列表
	 */
	this.subscribeAgentList = function(){
		var cmd = {};
		cmd.action="pollAgentList";
		cmd.body = {"cmd" : "subscribe", "args" : {} };
		ws.send(JSON.stringify(cmd));
		_cc.subscribeAgentListStarted = true;
	};

	/**
	 *  取消订阅坐席状态列表
	 */
	this.unSubscribeAgentList = function(){
		if(_cc.subscribeAgentListStarted) {
			_cc.subscribeAgentListStarted = false;
			_cc.callConfig.agentList = null;
			var cmd = {};
			cmd.action = "pollAgentList";
			cmd.body = {"cmd": "unSubscribe", "args": {}};
			ws.send(JSON.stringify(cmd));
		}
	};

	/*************************  以下是电话会议相关  ***************************/

	/**
	 *  启动会议； 仅限使用默认UI场景下使用;
	 */
	this.conferenceStartBtnUI = function(customerName){
		var callType = document.getElementById("conf_call_type").value;
		var confTemplate = document.getElementById("conf_template").value;
		var layOut = document.getElementById("conf_layout").value;

		_cc.setStatusBusy();

		// 禁用外呼按钮
		$("#callBtn").removeClass('on');

		// 禁用置闲按钮
		$("#setFree").removeClass('on');

		// 禁用签出按钮
		$("#onLineBtn").removeClass('on');

		document.getElementById("startConference").setAttribute("disabled", "true");

		if(_cc.getCallConnected()) {
			let tips = "是否把当前通话转换为会议 ?";
			console.log(tips);
			if(confirm(tips)) {
				_cc.transferToConference(layOut, confTemplate, callType, customerName);
			}else{
				document.getElementById("startConference").removeAttribute("disabled");
			}
		}else {
			_cc.conferenceStart(layOut, confTemplate, callType);
		}
	};

	/**
	 *  添加会议成员； 仅限使用默认UI场景下使用;
	 */
	this.conferenceAddMemberBtnUI = function (reInvite, memberPhoneParam,  memberNameParam) {
		var memberName = "";
		var memberPhone = "";
		var memberCallType = $.trim(document.getElementById("member_call_type").value);
		var memberVideoLevel = $.trim(document.getElementById("member_video_level").value);

		if(reInvite === 0) {
			memberName = $("#member_name").val();
			memberPhone = $("#member_phone").val();
			if (memberName.length === 0 || $.trim(memberName) === "") {
				alert('请填写参会者姓名!');
				return;
			}
			if (memberPhone.length === 0 || $.trim(memberPhone) === "") {
				alert('请填写参会者手机号!');
				return;
			}

			memberName = $.trim(memberName);
			memberPhone = $.trim(memberPhone);
			// 使用会员成员html模版添加新成员
			var templateObj = document.getElementById("conf_member_template");

			var existMember = document.getElementById("conf_member_" + memberPhone) != null;
			if (existMember) {
				alert('会议成员已经存在，请不要重复添加!');
				return;
			}

			var memberHtmlItem = templateObj.innerHTML;
			memberHtmlItem = memberHtmlItem.replace(new RegExp("{member_name}", "gm"), memberName);
			memberHtmlItem = memberHtmlItem.replace(new RegExp("{member_phone}", "gm"), memberPhone);
			memberHtmlItem = memberHtmlItem.replace(new RegExp("{member_status}", "gm"), "即将呼叫");

			var li = document.createElement("li");
			li.setAttribute("id", "conf_member_" + memberPhone);
			li.setAttribute("class", "conf_member_item_row");
			li.innerHTML = memberHtmlItem;

			_cc.insertAfter(li, templateObj);

			$("#member_name").val('');
			$("#member_phone").val('');
		}else{
			memberName = memberNameParam;
			memberPhone = memberPhoneParam;
		}

		// 隐藏 mute及 vmute按钮
		var memberItemId = "#conf_member_" + memberPhone;
		$(".conf_mute", $(memberItemId)).find("img").hide();
		$(".conf_vmute", $(memberItemId)).find("img").hide();
		$(".conf_re_invite", $(memberItemId)).hide();
		$(".conf_status", $(memberItemId)).html("即将呼叫");

		_cc.conferenceAddMembers( [
			{"name": memberName, "phone": memberPhone, "callType" : memberCallType,  "videoLevel": memberVideoLevel}
		]);
	};

	/**
	 *  从现有通话添加会议成员；
	 */
	this.conferenceAddMemberFromExistCall = function (memberName, memberPhone) {
		if (memberName.length === 0 || $.trim(memberName) === "") {
			alert('请填写参会者姓名!');
			return;
		}
		if (memberPhone.length === 0 || $.trim(memberPhone) === "") {
			alert('请填写参会者手机号!');
			return;
		}
		memberName = $.trim(memberName);
		memberPhone = $.trim(memberPhone);

		// 使用html模版添加新成员
		var templateObj = document.getElementById("conf_member_template");
		var existMember = document.getElementById("conf_member_" + memberPhone) != null;
		if (existMember) {
			alert('会议成员已经存在，请不要重复添加!');
			return;
		}

		var memberHtmlItem = templateObj.innerHTML;
		memberHtmlItem = memberHtmlItem.replace(new RegExp("{member_name}", "gm"), memberName);
		memberHtmlItem = memberHtmlItem.replace(new RegExp("{member_phone}", "gm"), memberPhone);
		memberHtmlItem = memberHtmlItem.replace(new RegExp("{member_status}", "gm"), "即将呼叫");
		var li = document.createElement("li");
		li.setAttribute("id", "conf_member_" + memberPhone);
		li.setAttribute("class", "conf_member_item_row");
		li.innerHTML = memberHtmlItem;
		_cc.insertAfter(li, templateObj);

		// 隐藏 mute及 vmute按钮
		var memberItemId = "#conf_member_" + memberPhone;
		$(".conf_mute", $(memberItemId)).find("img").show();
		$(".conf_vmute", $(memberItemId)).find("img").show();
		$(".conf_re_invite", $(memberItemId)).hide();
		$(".conf_status", $(memberItemId)).html("通话中").css("color", "green");
	};

	/**
	 *  通话转为会议
	 * @param layOut
	 * @param confTemplate
	 * @param callType
	 * @param customerName
	 */
	this.transferToConference = function (layOut, confTemplate, callType, customerName) {
		console.log("try to transferToConference: ", layOut, confTemplate, callType, customerName);
		_cc.callControl(
			"transferToConference",
			{
				"layOut": layOut,
				'callType': callType,
				'confTemplate': confTemplate,
				'customerName' : customerName
			}
		);
	};


	/**
	 *  主持人启动电话会议
	 * @param layOut 会议布局
	 * @param confTemplate 会议模版
	 * @param callType 会议类型
	 */
	this.conferenceStart = function(layOut, confTemplate, callType) {
		console.log("正常发起多方通话");
		var cmd = {};
		cmd.action = "conference";
		cmd.body = {"method": "startconf", "args": {
				"layOut": layOut,
				'callType': callType,
				'confTemplate': confTemplate
			}};
		ws.send(JSON.stringify(cmd));
	};


	/**
	 *  VMute会议成员（不显示视频）;
	 **/
	this.conferenceVMuteMember = function(members) {
		// single phone
		if(typeof(members) === "string") {
			this.conferenceControl("vmute",
				[
					{"phone": members}
				]
			);
		}else{
			// multiple phones array, e.g.: [  {"phone": '15005600321'}, {"phone": '15005600323'} ]
			this.conferenceControl("vmute", members);
		}
	};


	/**
	 *  UnVMute会议成员（显示视频）;
	 **/
	this.conferenceUnVMuteMember = function(members) {
		// single phone
		if(typeof(members) === "string") {
			this.conferenceControl("unvmute",
				[
					{"phone": members}
				]
			);
		}else{
			// multiple phones array, e.g.: [  {"phone": '15005600321'}, {"phone": '15005600323'} ]
			this.conferenceControl("unvmute", members);
		}
	};

	/**
	 *  禁言会议成员
	 **/
	this.conferenceMuteMember = function(members) {
		// single phone
		if(typeof(members) === "string") {
			this.conferenceControl("mute",
				[
					{"phone": members}
				]
			);
		}else{
			// multiple phones array, e.g.: [  {"phone": '15005600321'}, {"phone": '15005600323'} ]
			this.conferenceControl("mute", members);
		}
	};

	/**
	 *  解禁会议成员
	 **/
	this.conferenceUnMuteMember = function(members) {
		// single phone
		if(typeof(members) === "string") {
			this.conferenceControl("unmute",
				[
					{"phone": members}
				]
			);
		}else{
			// multiple phones array, e.g.: [  {"phone": '15005600321'}, {"phone": '15005600323'} ]
			this.conferenceControl("unmute", members);
		}
	};

	/**
	 *  增加会议成员
	 **/
	this.conferenceAddMembers = function(members) {
		this.conferenceControl("add", members)
	};


	/**
	 *  移除会议成员
	 **/
	this.conferenceRemoveMembers = function(members) {
		// single phone
		if(typeof(members) === "string") {
			var memberItemObj = $("#conf_member_" + members);
			if($(".conf_status", memberItemObj).text() === "通话中") {
				this.conferenceControl("remove",
					[
						{"phone": members}
					]
				);
			}
			memberItemObj.remove();
		}else{
			// multiple phones array, e.g.: [  {"phone": '15005600321'}, {"phone": '15005600323'} ]
			this.conferenceControl("remove", members);
		}
	};

	/**
	 *  结束电话会议
	 **/
	this.conferenceEnd = function() {
		this.conferenceControl("endconf", [])
	};


	/**
	 *  电话会议控制相关操作
	 * @param action 操作
	 * @param phoneList 会议成员
	 */
	this.conferenceControl = function (action, phoneList) {
		var cmd = {};
		cmd.action = "conference";
		cmd.body = { "method": action, "memberList": phoneList };
		ws.send(JSON.stringify(cmd));
	};

    /*************************  以下是通话监听相关  ***************************/

    /**
     *   拉取监听的通话列表
     */
    this.callMonitorDataPull = function (){
        var cmd = {};
        cmd.action = "monitorData";
        cmd.body = {};
        ws.send(JSON.stringify(cmd));
    };

	/**
	 *   拉取排队中的电话列表
	 */
	this.inboundCallQueuePull = function (){
		var cmd = {};
		cmd.action = "inboundMonitorData";
		cmd.body = {};
		ws.send(JSON.stringify(cmd));
	};

    // 构造通话监听参数
    this.monitorControl = function(action, argsObject){
        var sessionControl = {};
        sessionControl.action="callMonitor";
        sessionControl.body = {"cmd" : action, "args" : argsObject };
        ws.send(JSON.stringify(sessionControl));
    };

    /**
     * 通话监听
     * @param { 通话id } callId
     * @returns
     */
    this.callMonitorStart = function(callId){
        if(callId == null || callId.length === 0) {
            console.log('请提供待监听电话的 callId ！');
            return;
        }

        if(!_cc.getIsConnected()){
            console.log('请先上线.');
            return;
        }

        this.monitorControl(
            "startMonitoring",
            {
                'callSpyId': callId
            }
        );
    };


    /**
     * 结束监听
     */
    this.callMonitorEnd = function(){
        if(!_cc.getIsConnected()){
            console.log('请先上线.');
            return;
        }

        this.monitorControl(
            "endMonitoring",{}
        );
    };

}

