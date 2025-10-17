// 修改2:弹窗中填入签入信息包括密码，目前只有点击签入按钮才调用
var _phoneBar = new ccPhoneBarSocket();
var scriptServer = "172.16.1.111";
var extnum = '1103'; //分机号
var opnum = '1103'; //工号
var gatewayList = [
    {
        "uuid": "1",
        "updateTime": 1758862985998,
        "gatewayAddr": "172.16.1.112:5060",
        "callerNumber": "007",
        "calleePrefix": "",
        "priority": 1,
        "concurrency": 2,
        "register": false,
        "audioCodec": "pcma"
    }
];

var jsSipUAInstance = new jsSipUA();

// 初始化 _callConfig
var _callConfig = {
  'useDefaultUi': true,
  'loginToken': '',
  'ipccServer': scriptServer + ':1081',
  'gatewayList': gatewayList,
  'gatewayEncrypted': false
};

// 修改1:这三个现在需要签入时候调用
function loadLoginToken () {
  // 目前已经把 projectId 和 groupId合并为同一个参数;
  var getTokenUrl = "http://" + scriptServer + ":8880/call-center/create-token";
  var destUrl = getTokenUrl + "?extnum=" + extnum + "&opnum=" + opnum
    + "&groupId=" + groupId + "&skillLevel=" + skillLevel;

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = destUrl;
  document.getElementsByTagName('head')[0].appendChild(script);
}

// 修改4:可忽略
function loadExtPassword (extPassword) {
  // extPassword 参数从弹窗中获取
  var url = "http://" + scriptServer + ":8880/call-center/create-ext-password?pass=" + extPassword;
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

// 修改5:可忽略 接口返回错误
function loadGatewayList () {
  var url = "http://" + scriptServer + ":8880/call-center/create-gateway-list";
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
loadGatewayList();

// 自动签入+外呼极简模式
function simpleAutoInit() {
  // 1. 解析URL参数
  const params = new URLSearchParams(window.location.search);
  const extnum = params.get("extnum") || '';  // 分机号
  const opnum = params.get("opnum") || '';    // 工号
  const pass = params.get("pass") || '';      // 密码
  const phone = params.get("phone") || '';    // 要外呼的号码
  window._autoCallTarget = phone;

  // 2. 简化UI，只保留必要按钮和状态显示
  $('#phone-bar').html(`
    <div><audio hidden="true" id="audioHandler" controls="controls" autoplay="autoplay"></audio></div>
    <div style="display:flex;justify-content:center;align-items:center;height:180px;">
      <a href="#" id="hangUpBtn" class="gj_btn" style="width:64px;height:64px;"></a>
      <span style="margin-left:18px;font-size:18px;font-weight:bold;">挂机</span>
    </div>
    <div id="autoCallStatus" style="text-align:center;color:#6b9aff;margin-top:10px;"></div>
    <div id="callStatus" style="text-align:center;margin-top:10px;"></div>
  `);
  $("#hangUpBtn").removeClass("off").addClass("on");

  // 3. 验证参数
  if (!extnum || !opnum || !pass || !phone) {
    $("#autoCallStatus").text("URL参数不全，请确保提供 extnum、opnum、pass 和 phone 参数！");
    return;
  }

  // 4. 开始自动签入流程
  $("#autoCallStatus").text("正在自动签入...");
  
  // 更新全局变量
  window.extnum = extnum;
  window.opnum = opnum;
  window.groupId = 1;
  window.skillLevel = 9;

  // 加载 token 和密码
  loadLoginToken();
  loadExtPassword(pass);

  // 5. 等待异步加载完成
  let checkCount = 0;
  const maxCheckCount = 100; // 10秒超时
  const checkInterval = setInterval(() => {
    checkCount++;
    const tokenLoaded = typeof(loginToken) !== "undefined" && loginToken;
    const passwordLoaded = typeof(_phoneEncryptPassword) !== "undefined" && _phoneEncryptPassword;
    
    if (tokenLoaded && passwordLoaded) {
      clearInterval(checkInterval);
      
      // 6. 配置参数
      _callConfig["loginToken"] = loginToken;
      _callConfig["extPassword"] = _phoneEncryptPassword;
      _callConfig["gatewayList"] = gatewayList;
      
      $("#autoCallStatus").text("签入成功，3秒后自动外呼...");
      
      // 7. 初始化电话条
      _phoneBar.initConfig(_callConfig);
      
      // 8. 注册软电话
      jsSipUAInstance.register({
        extnum,
        password: pass,
        fsHost: scriptServer,
        fsPort: '5066',
        audioHandler: document.getElementById("audioHandler")
      });
      
      // 9. 连接WebSocket
      _phoneBar.connect();
      
      // 10. 启动定时自动外呼
      setTimeout(() => {
        if (_phoneBar.getIsConnected()) {
          $("#autoCallStatus").text("正在外呼：" + window._autoCallTarget);
          _phoneBar.call(window._autoCallTarget, 'audio');
        } else {
          $("#autoCallStatus").text("连接未就绪，无法外呼！");
        }
      }, 3000);
      
    } else if (checkCount >= maxCheckCount) {
      clearInterval(checkInterval);
      $("#autoCallStatus").text("自动签入失败，超时！");
    }
  }, 100);

  // 11. 挂机按钮事件处理
  $('#hangUpBtn').off('click').on('click', function(e) {
    e.preventDefault();
    if ($(this).hasClass('on')) {
      if (jsSipUAInstance.hangup) {
        jsSipUAInstance.hangup();
      }
      if (_phoneBar.disconnect) {
        _phoneBar.disconnect();
      }
      $("#autoCallStatus").text("已挂机");
      $("#callStatus").text("");
      $(this).removeClass('on').addClass('off');
    }
  });

  // 12. 监听通话状态
  _phoneBar.on(ccPhoneBarSocket.eventList.callee_answered, function(msg) {
    $("#callStatus").text("通话中");
  });
  
  _phoneBar.on(ccPhoneBarSocket.eventList.callee_hangup, function(msg) {
    $("#callStatus").text("对方已挂机");
  });
  
  _phoneBar.on(ccPhoneBarSocket.eventList.caller_hangup, function(msg) {
    $("#callStatus").text("已挂机");
  });
}

// 为了兼容性，保留一个空的 init 函数
function init() {
  console.log("init() is deprecated, using simpleAutoInit() instead");
  simpleAutoInit();
}

// 强制替换唯一入口（彻底屏蔽其它入口/签入弹窗）
$(document).ready(function(){
  simpleAutoInit();
});

