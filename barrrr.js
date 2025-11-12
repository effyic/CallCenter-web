// 修改2:弹窗中填入签入信息包括密码，目前只有点击签入按钮才调用
var _phoneBar = new ccPhoneBarSocket();
var scriptServer = "outbound.skiffchat.com";
var extnum = ''; //分机号
var opnum = ''; //工号
var gatewayList = [
    {
        "uuid": "1",
        "updateTime": 1758862985998,
        "gatewayAddr": "172.16.1.111:5060",
        "callerNumber": "007",
        "calleePrefix": "",
        "priority": 1,
        "concurrency": 2,
        "register": false,
        "audioCodec": "pcma"
    }
  ]

var jsSipUAInstance = new jsSipUA();

// 签入时间计时器
var loginTimeInterval = null;
var loginStartTime = null;

// 启动签入时间计时器
function startLoginTimer() {
  // 清除已存在的定时器
  if (loginTimeInterval) {
    clearInterval(loginTimeInterval);
  }
  
  // 记录签入开始时间
  loginStartTime = new Date();
  
  // 每秒更新一次
  loginTimeInterval = setInterval(function() {
    var now = new Date();
    var elapsed = Math.floor((now - loginStartTime) / 1000); // 经过的秒数
    
    var hours = Math.floor(elapsed / 3600);
    var minutes = Math.floor((elapsed % 3600) / 60);
    var seconds = elapsed % 60;
    
    // 格式化为 HH:MM:SS
    var timeStr = 
      (hours < 10 ? '0' : '') + hours + ':' +
      (minutes < 10 ? '0' : '') + minutes + ':' +
      (seconds < 10 ? '0' : '') + seconds;
    
    $("#loginTime").text(timeStr);
  }, 1000);
  
  // 立即显示 00:00:00
  $("#loginTime").text("00:00:00");
}

// 停止签入时间计时器
function stopLoginTimer() {
  if (loginTimeInterval) {
    clearInterval(loginTimeInterval);
    loginTimeInterval = null;
  }
  loginStartTime = null;
  $("#loginTime").text("00:00:00");
}

// 弹窗工具函数（不依赖Bootstrap）
var ModalUtil = {
  show: function(modalId) {
    var modal = document.getElementById(modalId);
    var overlay = document.getElementById(modalId + '-overlay');
    if (modal) {
      modal.classList.add('show');
      if (overlay) overlay.classList.add('show');
    }
  },
  hide: function(modalId) {
    var modal = document.getElementById(modalId);
    var overlay = document.getElementById(modalId + '-overlay');
    if (modal) {
      modal.classList.remove('show');
      if (overlay) overlay.classList.remove('show');
    }
  },
  remove: function(modalId) {
    var modal = document.getElementById(modalId);
    var overlay = document.getElementById(modalId + '-overlay');
    if (modal) modal.remove();
    if (overlay) overlay.remove();
  }
};

var skillLevel = 9; //技能等级
var groupId = 1; // 业务组id
var pass = ''; // 密码
var phone = ''; // 要外呼的号码
var tokenId = ''; // 签入token
var workTicketId = ''; // 工单id

// 根据uid获取用户信息的函数
async function getUserInfoByUid(uid) {
  if (!uid) {
    throw new Error('用户ID不能为空');
  }
  
  try {
    console.log('正在获取用户信息，uid:', uid);
    
    const response = await fetch(`https://${scriptServer}/aicall/api/extension/usercode?userCode=${uid}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`服务器响应错误，状态码: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code === 0 && data.data) {
      console.log('成功获取用户信息:', data.data);
      return {
        extNum: data.data.extNum,
        extPass: data.data.extPass,
        userCode: data.data.userCode
      };
    } else {
      throw new Error(data.msg || '获取用户信息失败，请检查用户ID是否正确');
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    
    // 根据错误类型提供更友好的错误信息
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络连接或联系管理员');
    } else if (error.message.includes('状态码')) {
      throw new Error('服务器暂时不可用，请稍后重试');
    } else {
      throw error;
    }
  }
}

//  new1.自动从地址栏获取参数
if (window.location.href.toString().indexOf("?") != -1) {
  console.log(ccPhoneBarSocket.utils);
  let uid = ccPhoneBarSocket.utils.getQueryParam("uid");

  // 如果有uid参数，则通过接口获取用户信息
  if (uid) {
    getUserInfoByUid(uid).then(userInfo => {
      extnum = userInfo.extNum;
      opnum = userInfo.userCode; // 使用userCode作为opnum
      pass = userInfo.extPass;
      
      console.log("从接口获取到的用户信息:", "extnum=", extnum, "opnum=", opnum, "pass=", pass);
      
      // 获取其他参数
      phone = ccPhoneBarSocket.utils.getQueryParam("phone");
      groupId = ccPhoneBarSocket.utils.getQueryParam("groupId") || 1;
      tokenId = ccPhoneBarSocket.utils.getQueryParam("tokenId");
      workTicketId = ccPhoneBarSocket.utils.getQueryParam("workTicketId");
      
      console.log("所有参数:", "extnum=", extnum, "opnum=", opnum, "pass=", pass, "phone=", phone, "groupId=", groupId, "tokenId=", tokenId, "workTicketId=", workTicketId);
      
      // 如果获取到所有必要参数，自动启动外呼流程
      if (extnum && opnum && pass && phone) {
        // 页面加载完成后自动启动 修改1017
        $(document).ready(function() {
          autoCallInit();
        });
      }
    }).catch(error => {
       console.error("获取用户信息失败:", error);
       
       // 显示用户友好的错误提示
       const errorMsg = `获取用户信息失败: ${error.message}`;
       alert(errorMsg);
       
       // 可以在页面上显示错误信息（如果有相应的UI元素）
       const statusElement = document.getElementById('callStatus');
       if (statusElement) {
         statusElement.textContent = '用户信息获取失败';
         statusElement.style.color = '#ff4757';
       }
     });
  }else{
    const statusElement = document.getElementById('callStatus');
    if (statusElement) {
      statusElement.textContent = '缺少uid参数';
      statusElement.style.color = '#ff4757';
    }
  }
}

function resetExtNumAndOpNum (ext, op, groupId) {
  window.location.href = "?extNum=" + ext + "&opNum=" + op + "&groupId=" + groupId;
};


// new2
function loadLoginToken () {

  // 目前已经把 projectId 和 groupId合并为同一个参数;
  var getTokenUrl = "https://" + scriptServer + "/call-center/create-token";
  var destUrl = getTokenUrl + "?extnum=" + extnum + "&opnum=" + opnum
    + "&groupId=" + groupId + "&skillLevel=" + skillLevel
    ;

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = destUrl;
  document.getElementsByTagName('head')[0].appendChild(script);
}

// new3
function loadExtPassword (extPassword) {
  // extPassword 参数从弹窗中获取
  var url = "https://" + scriptServer + "/call-center/create-ext-password?pass=" + extPassword;
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}


// 修改5:可忽略 接口返回错误
function loadGatewayList () {
  var url = "https://" + scriptServer + "/call-center/create-gateway-list";
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
loadGatewayList();

// 将视频级别填充到下拉列表中的函数
function populateVideoLevelDropdown (objId) {
  let select = document.getElementById(objId);
  if (select == null) return;
  // 遍历视频级别数据
  for (let key in ccPhoneBarSocket.videoLevels) {
    if (ccPhoneBarSocket.videoLevels.hasOwnProperty(key)) {
      let level = ccPhoneBarSocket.videoLevels[key];
      let option = document.createElement('option');
      option.value = level.levelId; // 设置值为 levelId
      option.text = level.description; // 显示文本
      select.appendChild(option);
    }
  }
  select.value = ccPhoneBarSocket.videoLevels.HD.levelId;
}

var _callConfig = null;

function onConferenceEnd () {
  document.getElementById("endConference").setAttribute("disabled", "true");
  document.getElementById("startConference").removeAttribute("disabled");
  document.getElementById("conference_member_list").style.display = "none";
  
  // 启用外呼按钮
  $("#callBtn").addClass('on');
  // 启用置闲按钮
  $("#setFree").addClass('on');
  // 启用签出按钮
  $("#onLineBtn").addClass('on');
  //移除所有的参会成员
  $(".conf_member_item_row").remove();

  let tips = "多方通话结束";
  $("#callStatus").text(tips);
  $("#agentStatus").text(tips);
}

function onConferenceStart () {
  document.getElementById("endConference").removeAttribute("disabled");
  document.getElementById("conference_member_list").style.display = "block";
  
  let tips = "多方通话进行中";
  $("#callStatus").text(tips);
  $("#agentStatus").text(tips);
}

/**
 *  成功把电话转接到多人视频会议
 */
function onTransferToConferenceSuccess (msg) {
  $("#callStatus").text("已接入多方会议");
  $("#setFree").removeClass("on");
  $("#setBusy").removeClass("on");
  $("#callBtn").removeClass("on");

  //界面显示成功转接到视频会议电话
  var phone = msg.object.phone;
  var name = msg.object.phone;
  console.log("onTransferToConferenceSuccess:", msg);
  _phoneBar.conferenceAddMemberFromExistCall(name, phone);
}


// 以下是通话转接操作界面的功能
// 注意：不在这里获取元素，因为此时DOM还未创建

// 填充 transfer_to_groupId 数据
function populateGroupIdOptions () {
  const transferToGroupId = document.getElementById("transfer_to_groupIds");
  if (!transferToGroupId) {
    console.error('找不到 transfer_to_groupIds 元素');
    return;
  }
  
  transferToGroupId.length = 0; //清除所有选项
  let groups = _phoneBar.callConfig.groups;
  console.log('groups = ', groups);
  groups.forEach(group => {
    const option = document.createElement("option");
    option.value = group.groupId;
    option.textContent = group.bizGroupName;
    transferToGroupId.appendChild(option);
  });
  if (transferToGroupId.selectedIndex == -1) {
    transferToGroupId.selectedIndex = 0;
  }
};

// 根据选中的 groupId 填充 transfer_to_member 数据
function populateMemberIdOptions (members, selectedGroupId) {
  console.log('当前成员', members, '选中组', selectedGroupId);
  const transferToMember = document.getElementById("transfer_to_member");
  if (!transferToMember) {
    console.error('找不到 transfer_to_member 元素');
    return;
  }
  
  if (!Array.isArray(members)) {
    console.error("populateMemberOptions: members is not a Array.", members);
    return;
  }
  transferToMember.innerHTML = '<option value="">请选择</option>';
  members
    .filter(member => member.groupId === selectedGroupId)
    .forEach(member => {
      const option = document.createElement("option");
      const statusMap = { 1: "刚签入", 2: "空闲", 3: "忙碌", 4: "通话中", 5: "事后处理" };
      option.value = member.opnum;
      option.textContent = `${member.opnum}(${statusMap[member.agentStatus] || ""})`;
      transferToMember.appendChild(option);
    });
};

function refreshMemberIdList () {
  const transferToGroupId = document.getElementById("transfer_to_groupIds");
  const transferToMember = document.getElementById("transfer_to_member");
  
  if (!transferToGroupId || !transferToMember) {
    console.error('找不到转接相关元素');
    return;
  }
  
  const selectedGroupId = transferToGroupId.value;
  if (selectedGroupId != "") {
    let origValue = transferToMember.value;
    populateMemberIdOptions(_phoneBar.callConfig.agentList, selectedGroupId);
    //判断原始选择项是否还存在，存在则重新赋值;
    let hasValue = transferToMember.querySelector(`option[value="${origValue}"]`) !== null;
    if (hasValue) {
      transferToMember.value = origValue;
    }
  }
}

/* asr实时对话文本框的功能 */
_phoneBar.on(ccPhoneBarSocket.eventList.asr_process_started, function (msg) {
  $(chatMessages).html("");
});
_phoneBar.on(ccPhoneBarSocket.eventList.asr_result_generate, function (msg) {
  handleAsrMessage(msg);
});
_phoneBar.on(ccPhoneBarSocket.eventList.asr_process_end_customer, function (msg) {
  handleAsrMessage(msg);
});
_phoneBar.on(ccPhoneBarSocket.eventList.asr_process_end_agent, function (msg) {
  handleAsrMessage(msg);
});
const chatMessages = document.getElementById('chat-messages');
$("#chat-container").hide();
function handleAsrMessage (data) {
  
}
function addMessageToChat (role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message ' + (role === 1 ? 'customer' : 'agent');

  // 添加角色名称
  const roleHeader = document.createElement('div');
  roleHeader.className = 'message-header';
  roleHeader.textContent = role === 1 ? '客户' : '我';

  const messageContent = document.createElement('div');
  messageContent.textContent = text;

  // messageDiv.appendChild(roleHeader);
  messageDiv.appendChild(messageContent);
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}
function addSystemMessage (text) {
  const systemMessage = document.createElement('div');
  systemMessage.className = 'system-message';
  systemMessage.textContent = text;
  chatMessages.appendChild(systemMessage);
  scrollToBottom();
}
function scrollToBottom () {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//页面刷新或者关闭时，自动挂机; 避免导致投诉
window.onbeforeunload = function () {
    // 判断分机是否
    if (!jsSipUAInstance.isExtensionFree()) {
        jsSipUAInstance.hangup();
    }
     _phoneBar.disconnect();
};

// 接听电话
function answer() {
    jsSipUAInstance.answer();
}

function init () {
  // 页面加载时首先检查录音权限
  window.audioPermissionChecker.checkAudioPermission().then(hasPermission => {
      if (hasPermission) {
          console.log('录音权限检查通过，可以正常使用电话功能');
      } else {
          console.warn('录音权限检查失败，部分功能可能受限');
          return; // 拒绝签入
      }
  });


  $("#unHoldBtnLi").hide();
  $("#conferenceBtn").removeClass("on").addClass("off");
  
  // 隐藏接听和会议按钮
  $("#conferenceBtn").parent().hide();
  $("#answer_btn").parent().hide();

 // <div id="chat-container">
  //   <div id="chat-messages" class="message-container"></div>
  // </div>

  // 调用函数填充视频清晰度的下拉列表
  populateVideoLevelDropdown('videoLevelSelect');
  populateVideoLevelDropdown('member_video_level');


  // websocket通信对象断开事件;
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.ws_disconnected.code, function (msg) {
    console.log(msg);
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.ws_disconnected.code);
    $("#transfer_area").hide();
    $("#conferenceBtn").removeClass("on").addClass("off");
    jsSipUAInstance.unregister();
    // 停止签入时间计时器
    stopLoginTimer();
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.OUTBOUND_START, function (msg) {
    console.log('outbound_start', msg);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.request_args_error.code, function (msg) {
    console.log(msg);
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.request_args_error.code);
  });

  //用户已在其他设备登录
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.user_login_on_other_device.code, function (msg) {
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.user_login_on_other_device.code);
    alert(ccPhoneBarSocket.eventListWithTextInfo.user_login_on_other_device.msg);
  });

  //websocket连接成功
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.ws_connected.code, function (msg) {
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.ws_connected.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_ringing.code, function (msg) {
    console.log(msg.content, "被叫振铃事件");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_ringing.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.caller_answered.code, function (msg) {
    console.log(msg, "主叫接通");
    // 1112 start
    $('.auto-call-status-container').css("background-image","url(images/icon/calling.png)")
    $('.auto-call-status-container').css("min-height","300px")
    // 1112 end
    $("#agentStatus").text("通话中").css('color', '#2FC77D');
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.caller_answered.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.caller_hangup.code, function (msg) {
    console.log(msg, "主叫挂断");
    $("#agentStatus").text("通话结束");
   
    $("#reInviteVideoBtn").attr("disabled", "disabled");
    $("#sendVideoFileBtn").attr("disabled", "disabled");
    $("#transfer_area").hide();
    $("#answer_btn").removeClass("on").addClass("off");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.caller_hangup.code);
  });
    // 非通话状态显示灰色挂机按钮
  function updateAgentStatus() {
    const hangupImg = $("#hangUpBtn img");
    hangupImg.attr("src", "images/grayHangup.png");
    hangupImg.css("box-shadow", "0 0 10px rgba(224, 260, 156, 0.3)");
  }
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_answered.code, function (msg) {
    console.log(msg, "被叫接通");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_answered.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_hangup.code, function (msg) {
    console.log(msg, "被叫挂断");
    $("#transfer_area").hide();
    $("#answer_btn").removeClass("on").addClass("off");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_hangup.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.status_changed.code, function (msg) {
    console.log("座席状态改变: ", msg["object"]["text"]);
    if(msg["object"]["text"] == "置忙"){
      msg["object"]["text"] = "小休";
    }else if(msg["object"]["text"] == "置闲"){
      msg["object"]["text"] = '闲'
    }
    $("#agentStatus").text(msg["object"]["text"]);

    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.status_changed.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.acd_group_queue_number, function (msg) {
    console.log("当前排队人数消息: ", msg);
    $("#queueStat").text(msg["object"]["queue_number"]);
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.on_audio_call_connected, function (msg) {
    console.log("音频通话已建立: ", msg);
    $("#reInviteVideoBtn").removeAttr("disabled");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.customer_channel_hold, function (msg) {
    console.log("客户通话已保持: ", msg);
    $("#callStatus").text("通话已保持");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.customer_channel_unhold, function (msg) {
    console.log("客户通话已接回.", msg);
    $("#callStatus").text("客户通话已接回");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.on_video_call_connected, function (msg) {
    console.log("视频通话已建立: ", msg);
    $("#sendVideoFileBtn").removeAttr("disabled");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.inner_consultation_start, function (msg) {
    $("#callStatus").text("咨询开始.");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.inner_consultation_stop, function (msg) {
    $("#callStatus").text("咨询结束.");
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.transfer_call_success, function (msg) {
    $("#callStatus").text("电话转接成功.");
    $("#externalPhoneNumber").val('');
  });

  // 订阅的坐席状态列表发生改变
  _phoneBar.on(ccPhoneBarSocket.eventList.agent_status_data_changed, function (msg) {
    console.log("订阅作息状态发生改变！！！！.");
    // 当 transfer_to_groupId 值改变时更新 transfer_to_member
    const transferToGroupId = document.getElementById("transfer_to_groupIds");
    if (transferToGroupId) {
      $(transferToGroupId).off("change");
      $(transferToGroupId).on("change", function () {
        refreshMemberIdList();
      });
      refreshMemberIdList();
    }
  });

  /* conference related events  */
  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_ANSWERED, function (msg) {
    console.log("会议成员已经接通.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var memberItemId = "#conf_member_" + memberPhone;

    $(".conf_status", $(memberItemId)).text(msg.object.status);
    $(".conf_status", $(memberItemId)).html("通话中").css("color", "green");

    $(".conf_mute", $(memberItemId)).find("img").show();
    $(".conf_vmute", $(memberItemId)).find("img").show();
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_VMUTED_SUCCESS, function (msg) {
    console.log("会议成员已被禁用视频.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var muteObj = $(".conf_vmute", $("#conf_member_" + memberPhone));
    muteObj.find("img")[0].src = "images/no_video.jpg";
    muteObj.find("a").removeAttr("onclick");
    muteObj.find("a").off("click");
    muteObj.find("a").on("click", function () {
      _phoneBar.conferenceUnVMuteMember(memberPhone);
    });
  });
  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_UnVMUTED_SUCCESS, function (msg) {
    console.log("会议成员启用视频成功.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var muteObj = $(".conf_vmute", $("#conf_member_" + memberPhone));
    muteObj.find("img")[0].src = "images/video.jpg";
    muteObj.find("a").removeAttr("onclick");
    muteObj.find("a").off("click");
    muteObj.find("a").on("click", function () {
      _phoneBar.conferenceVMuteMember(memberPhone);
    });
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_MUTED_SUCCESS, function (msg) {
    console.log("会议成员已被禁言.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var muteObj = $(".conf_mute", $("#conf_member_" + memberPhone));
    muteObj.find("img")[0].src = "images/unmute.jpg";
    muteObj.find("a").removeAttr("onclick");
    muteObj.find("a").off("click");
    muteObj.find("a").on("click", function () {
      _phoneBar.conferenceUnMuteMember(memberPhone);
    });
  });
  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_UNMUTED_SUCCESS, function (msg) {
    console.log("会议成员解除禁言成功.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var muteObj = $(".conf_mute", $("#conf_member_" + memberPhone));
    muteObj.find("img")[0].src = "images/mute.jpg";
    muteObj.find("a").removeAttr("onclick");
    muteObj.find("a").off("click");
    muteObj.find("a").on("click", function () {
      _phoneBar.conferenceMuteMember(memberPhone);
    });
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MEMBER_HANGUP, function (msg) {
    console.log("会议成员已经挂机.", msg);
    var memberPhone = $.trim(msg.object.phone);
    var memberItemId = "#conf_member_" + memberPhone;

    // 隐藏 mute及 vmute按钮
    $(".conf_mute", $(memberItemId)).find("img").hide();
    $(".conf_vmute", $(memberItemId)).find("img").hide();
    $(".conf_re_invite", $(memberItemId)).show();

    var answerStatus = (msg.object.answeredTime === 0) ? "未接通" : msg.object.hangupClause;
    var color = (msg.object.answeredTime === 0) ? "red" : "green";
    $(".conf_status", $(memberItemId)).html("已挂机(" + answerStatus + ")").css("color", color);
    $(".conf_status", $(memberItemId)).fadeTo('fast', 0.1).fadeTo('fast', 1.0);
    var blinkText = setInterval(function () {
      $(".conf_status", $(memberItemId)).fadeTo('fast', 0.1).fadeTo('fast', 1.0);
    }, 700); // 每0.5秒闪烁一次

    setTimeout(function () {
      console.log("memberItemId=", memberItemId);
      clearInterval(blinkText);
      // $(memberItemId).remove(); //暂不自动移除参会者，由主持人手动操作处理;
    }, 5000);
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MODERATOR_ANSWERED, function (msg) {
    console.log("电话会议开始，主持人已接通.", msg);
    onConferenceStart();
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_MODERATOR_HANGUP, function (msg) {
    console.log("电话会议结束，主持人已挂机.", msg);
    onConferenceEnd();
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.CONFERENCE_TRANSFER_SUCCESS_FROM_EXISTED_CALL, function (msg) {
    console.log("成功把通话转接到多人视频会议.", msg);
    onTransferToConferenceSuccess(msg);
  });

  _phoneBar.on(ccPhoneBarSocket.eventList.new_inbound_call, function (msg) {
      console.log("新来电: ", msg.object.uuid);
  });

  // JsSIP 网页电话
  jsSipUAInstance.on('inbound_call', function (msg) {
      console.log('收到呼入来电，请弹窗确认框，以便确认是否接听...', msg);
      $("#answer_btn").removeClass("off").addClass("on");
      $("#hangUpBtn").removeClass("off").addClass("on");
      
      // 检查是否启用了自动接听
      var isAutoAnswer = $('#autoAnswerToggle').is(':checked');
      
      if (isAutoAnswer) {
        // 自动接听，不显示弹窗
        console.log('自动接听已启用，直接接听来电');
        jsSipUAInstance.answer();
        return;
      }
      
      // 未启用自动接听，显示来电弹窗
      var caller = msg.caller || '未知号码';
      var modalHtml =
        '<div class="modal-overlay" id="incomingCallModal-overlay"></div>' +
        '<div class="modal" id="incomingCallModal">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<h5 class="modal-title">来电提醒</h5>' +
        '</div>' +
        '<div class="modal-body" style="text-align: center; padding: 30px 20px;min-height: 100px;">' +
        '<div style="font-size: 18px; margin-bottom: 10px;">来电号码</div>' +
        '<div style="font-size: 24px; font-weight: bold; color: #4a90e2; margin-bottom: 30px;">' + caller + '</div>' +
        '</div>' +
        '<div class="modal-footer" style="text-align: center; padding: 20px;">' +
        '<button type="button" class="btn btn-success" id="answerCallBtn" style="margin-right: 20px; padding: 10px 30px; font-size: 16px;">接听</button>' +
        '<button type="button" class="btn btn-danger" id="rejectCallBtn" style="padding: 10px 30px; font-size: 16px;">取消</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
      
      // 移除旧弹窗
      ModalUtil.remove('incomingCallModal');
      
      // 添加弹窗到页面
      $('body').append(modalHtml);
      
      // 显示弹窗
      ModalUtil.show('incomingCallModal');
      
      // 接听按钮点击事件
      $(document).off('click', '#answerCallBtn').on('click', '#answerCallBtn', function() {
        console.log('用户点击接听按钮');
        jsSipUAInstance.answer();
        ModalUtil.hide('incomingCallModal');
        setTimeout(function() {
          ModalUtil.remove('incomingCallModal');
        }, 300);
      });
      
      // 取消按钮点击事件
      $(document).off('click', '#rejectCallBtn').on('click', '#rejectCallBtn', function() {
        jsSipUAInstance.hangup();
        ModalUtil.hide('incomingCallModal');
        setTimeout(function() {
          ModalUtil.remove('incomingCallModal');
        }, 300);
      });
  });

  jsSipUAInstance.on('disconnected', function (msg) {
      console.log('网页电话连接已经断开...', msg);
  });
  jsSipUAInstance.on('registered', function () {
      console.log('registered', '分机注册成功');
  });
  jsSipUAInstance.on('registrationFailed', function (msg) {
      console.log(msg, 'registrationFailed');
      _phoneBar.disconnect();
      // 停止签入时间计时器
      stopLoginTimer();
  });
  jsSipUAInstance.on('confirmed', function (msg) {
      console.log('电话接通', msg, 'confirmed');
      jsSipUAInstance.playAnsweredSound();
      $("#answer_btn").removeClass("on").addClass("off");
      
      // 电话接通后关闭来电弹窗
      if ($('#incomingCallModal').length > 0) {
        ModalUtil.hide('incomingCallModal');
        setTimeout(function() {
          ModalUtil.remove('incomingCallModal');
        }, 300);
      }
  });
  jsSipUAInstance.on('hungup', function (msg) {
      console.log('通话结束', 'hungup');
      updateAgentStatus()
      // 挂断后关闭来电弹窗（如果还存在）
      if ($('#incomingCallModal').length > 0) {
        ModalUtil.hide('incomingCallModal');
        setTimeout(function() {
          ModalUtil.remove('incomingCallModal');
        }, 300);
      }
  });

  //通话保持；双方无法听到彼此的声音
  jsSipUAInstance.on('hold', function (msg) {
      console.log(msg);
  });

  //通话解除保持
  jsSipUAInstance.on('unhold', function (msg) {
      console.log(msg);
  });

  //通话静音; [客户无法听到自己的声音]
  jsSipUAInstance.on('muted', function (msg) {
      console.log(msg);
      //$("#unmuteBtn").removeClass("on").addClass("off");
  });
  // 通话静音解除
  jsSipUAInstance.on('unmuted', function (msg) {
      console.log(msg);
      //$("#unmuteBtn").removeClass("off").addClass("on");
  });

  // 电话工具条参数配置;
  _callConfig = {
    'useDefaultUi': true,
    // loginToken 信息是加密的字符串， 包含以下字段信息：extnum[分机号]、opnum[工号]、groupId[业务组]、skillLevel[技能等级]
    'loginToken': '',

    // 电话工具条服务器端的地址; 端口默认是1081
    'ipccServer': scriptServer + ':38701',

    // 网关列表， 默认需要加密后在在通过客户端向呼叫系统传递;
    // 注意在注册模式下，网关参数更改之后，必须重启语音服务 [docker restart freeswitch] 方可生效，不支持热更新;
    // 支持多个网关同时使用，按照优先级依次使用, 支持网关负载容错溢出 [第一条网关外呼出错后，自动使用第二条网关重试，直至外呼不出错] ;
    'gatewayList': gatewayList,

    // 网关列表信息是否为加密模式;
    'gatewayEncrypted': false
  };

  // 使用工具条之前需要先初始化 _callConfig 参数， 填充各个字段的值： 合计7个字段，必须填写正确 ；
  //********************************************************************************************
  // 以下代码设置加密的参数： loginToken、extPassword、gatewayList；   在本页面的demo演示中需要调用服务器端接口获取密文字符串;
  // 注意：此部分逻辑已移至签入确认按钮中执行

  // 添加签入按钮点击事件 - 显示签入信息弹窗
  $(document).on('click', '#onLineBtn', function(e) {
    e.preventDefault();
    
    // 先判断是签出还是签入
    if ($(this).hasClass('on')) {
        if (_phoneBar.getIsConnected()) {
            // 执行签出
            _phoneBar.disconnect();
            jsSipUAInstance.unregister();
            $("#conferenceBtn").removeClass("on").addClass("off");
            // 停止签入时间计时器
            stopLoginTimer();
            // 清空表单字段（如果存在）
            $('#signinOpnum').val('');
            $('#signinPassword').val('');
            $('#signinExtnum').val('');
            _callConfig["loginToken"] = '';
            _callConfig["extPassword"] = '';
            // 清空全局变量
            if (typeof loginToken !== 'undefined') {
                loginToken = undefined;
            }
            if (typeof _phoneEncryptPassword !== 'undefined') {
                _phoneEncryptPassword = undefined;
            }
            console.log('签出成功，已清空表单和配置');
            return; // 签出后直接返回，不显示弹窗
        } else {
            // 未签入状态，显示签入弹窗
            // 在登录前再次检查录音权限
            window.audioPermissionChecker.checkAudioPermission().then(hasPermission => {
              if (hasPermission) {
                  console.log('录音权限检查通过，可以正常使用电话功能');
              } else {
                  console.warn('录音权限检查失败，部分功能可能受限');
                  return; // 拒绝签入
              }
            });
        }
    } else {
        alert('当前不允许签出!');
        return;
    }
    
    // 以下是签入弹窗的显示逻辑
    var signinModalHtml =
      '<div class="modal-overlay" id="signinModal-overlay"></div>' +
      '<div class="modal" id="signinModal">' +
      '<div class="modal-dialog">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title">座席签入</h5>' +
      '<button type="button" class="btn-close" onclick="ModalUtil.hide(\'signinModal\')"></button>' +
      '</div>' +
      '<div class="modal-body">' +
      '<div class="form-group">' +
      '<label class="form-label">分机工号</label>' +
      '<input type="text" class="form-input" id="signinOpnum" placeholder="请输入分机工号">' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">座席密码</label>' +
      '<input type="password" class="form-input" id="signinPassword" placeholder="请输入座席密码">' +
      '</div>' +
      '<div class="form-group">' +
      '<label class="form-label">分机号码</label>' +
      '<input type="text" class="form-input" id="signinExtnum" placeholder="请输入分机号码">' +
      '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button type="button" class="btn btn-secondary" onclick="ModalUtil.hide(\'signinModal\')">取消</button>' +
      '<button type="button" class="btn btn-primary" id="confirmSigninBtn">确认签入</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    ModalUtil.remove('signinModal');
    
    // 添加弹窗到页面
    $('body').append(signinModalHtml);
    
    // 显示弹窗
    ModalUtil.show('signinModal');

    // 点击遮罩层关闭
    $('#signinModal-overlay').click(function() {
      ModalUtil.hide('signinModal');
    });
  });

    // 确认签入按钮点击事件
    $(document).on('click', '#confirmSigninBtn', function() {
      console.log('确认签入按钮！！！！');
      var opnumValue = $('#signinOpnum').val();
      var passwordValue = $('#signinPassword').val();
      var extnumValue = $('#signinExtnum').val();
      
      if (!opnumValue || !passwordValue || !extnumValue) {
        alert('请填写完整的签入信息！');
        return;
      }
      
      // 关闭弹窗
    ModalUtil.hide('signinModal');
      
      // 更新全局变量
      extnum = extnumValue;
      opnum = opnumValue;
      
      console.log('开始签入流程：', {
        opnum: opnumValue,
        password: passwordValue,
        extnum: extnumValue
      });
      
      // 按顺序调用加载函数
      loadLoginToken();
      loadExtPassword(passwordValue);
      
      // 等待所有脚本加载完成后初始化配置
      var checkCount = 0;
      var maxCheckCount = 100; // 最多检查100次（10秒）
      var checkInterval = setInterval(function() {
        checkCount++;
        
        // 检查必需的全局变量是否都已加载
        var tokenLoaded = typeof(loginToken) !== "undefined";
        var passwordLoaded = typeof(_phoneEncryptPassword) !== "undefined";
        
        if (tokenLoaded && passwordLoaded) {
          clearInterval(checkInterval);
          
          // 配置 loginToken
          if (typeof (loginToken) != "undefined") {
            _callConfig["loginToken"] = loginToken;
          } else {
            alert("电话工具条：无法获取 loginToken!");
            return;
          }

          // 配置 extPassword
          if (typeof (_phoneEncryptPassword) != "undefined") {
            _callConfig["extPassword"] = _phoneEncryptPassword;
          } else {
            alert("电话工具条：无法获取 _phoneEncryptPassword!");
            return;
          }

          // 配置 gatewayList
          _callConfig["gatewayList"] = gatewayList;

          // 初始化电话工具条
          _phoneBar.initConfig(_callConfig);
          console.log('✅ 电话工具条配置初始化完成');

          var _phoneConfig = {
              'extnum': extnumValue,		//分机号
              'password': passwordValue,	//分机密码  
            'fsHost': scriptServer,//电话服务器主机host地址，必须是 "域名格式的"，不能是ip地址
              'fsPort': '38700',		//电话服务器端口，必须是数字
              'audioHandler': document.getElementById("audioHandler"),
          };

          //设置来电接听超时时间
          jsSipUAInstance.setCallAnswerTimeOut(20);

        // 设置来电是否自动应答（默认不自动接听）
          jsSipUAInstance.setAutoAnswer(false);

          jsSipUAInstance.register(_phoneConfig);

          // 建立 WebSocket 连接
          _phoneBar.connect();
          
        // 启动签入时间计时器，从点击确认签入开始计时
        // startLoginTimer();
        
        // $("#conferenceBtn").removeClass("off").addClass("on");
        
        } else if (checkCount >= maxCheckCount) {
          // 超时处理
          clearInterval(checkInterval);
        }
      }, 100); // 每100ms检查一次
  });

  // 添加自动接听切换事件
  $(document).on('change', '#autoAnswerToggle', function() {
    var isChecked = $(this).is(':checked');
    if (typeof jsSipUAInstance !== 'undefined') {
      jsSipUAInstance.setAutoAnswer(isChecked);
      console.log('自动接听已' + (isChecked ? '启用' : '禁用'));
    }
  });

  // 添加咨询/转接按钮点击事件
  $(document).on('click', '#consultationBtn, #transferBtn', function(e) {
    e.preventDefault();

    var modalHtml =
      '<div class="modal-overlay" id="consultationModal-overlay"></div>' +
      '<div class="modal" id="consultationModal">' +
      '<div class="modal-dialog modal-dialog-lg">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title">转接/咨询操作</h5>' +
      '<button type="button" class="btn-close" onclick="ModalUtil.hide(\'consultationModal\')"></button>' +
      '</div>' +
      '<div class="modal-body" id="consultationModalBody">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    ModalUtil.remove('consultationModal');

    // 添加弹窗到页面
    $('body').append(modalHtml);

    // 把 transfer_area 的内容移动到弹窗中
    var transferContent = $('#transfer_area > td > table').detach();
    $('#consultationModalBody').append(transferContent);
    $('#transfer_area').hide();

    // 显示弹窗
    ModalUtil.show('consultationModal');

    // 点击遮罩层关闭
    $('#consultationModal-overlay').click(function() {
      var transferContent = $('#consultationModalBody table').detach();
      $('#transfer_area > td').append(transferContent);
      $('#transfer_area').hide();
      ModalUtil.hide('consultationModal');
    });

    // 等弹窗显示后再初始化数据
    setTimeout(function() {
      populateGroupIdOptions();
    }, 100);

    // 弹窗关闭处理
    $(document).on('click', '.btn-close', function() {
      var transferContent = $('#consultationModalBody table').detach();
      $('#transfer_area > td').append(transferContent);
      $('#transfer_area').hide();
    });
  });

  // 添加会议按钮点击事件
  $(document).on('click', '#conferenceBtn', function(e) {
    e.preventDefault();

    var modalHtml =
      '<div class="modal-overlay" id="conferenceModal-overlay"></div>' +
      '<div class="modal" id="conferenceModal">' +
      '<div class="modal-dialog modal-dialog-lg">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title">会议管理</h5>' +
      '<button type="button" class="btn-close" onclick="ModalUtil.hide(\'conferenceModal\')"></button>' +
      '</div>' +
      '<div class="modal-body" id="conferenceModalBody">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    ModalUtil.remove('conferenceModal');

    // 添加弹窗到页面
    $('body').append(modalHtml);

    // 把 conference_area 的内容移动到弹窗中
    var conferenceContent = $('#conference_area > td > div').detach();
    $('#conferenceModalBody').append(conferenceContent);
    $('#conference_area').hide();

    // 显示弹窗
    ModalUtil.show('conferenceModal');

    // 点击遮罩层关闭
    $('#conferenceModal-overlay').click(function() {
      var conferenceContent = $('#conferenceModalBody > div').detach();
      $('#conference_area > td').append(conferenceContent);
      $('#conference_area').hide();
      ModalUtil.hide('conferenceModal');
    });

    // 弹窗关闭处理
    $(document).on('click', '.btn-close', function() {
      var conferenceContent = $('#conferenceModalBody > div').detach();
      $('#conference_area > td').append(conferenceContent);
      $('#conference_area').hide();
    });
  });

}



// 录音权限检查功能
class AudioPermissionChecker {
    constructor() {
        this.hasPermission = false;
        this.isChecking = false;
    }

    // 检查录音权限
    async checkAudioPermission() {
        if (this.isChecking) {
            return this.hasPermission;
        }

        this.isChecking = true;

        try {
            // 检查浏览器是否支持getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('不支持录音功能');
            }

            // 请求录音权限
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: true,
                video: false 
            });

            // 获取权限成功，立即停止录音流
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                this.hasPermission = true;
                console.log('录音权限获取成功');
                return true;
            }
        } catch (error) {
            this.hasPermission = false;
            console.error('录音权限获取失败:', error);
            
            // 根据错误类型显示不同的提示信息
            let errorMessage = '录音权限获取失败：';
            
            if (error.name === 'NotAllowedError') {
                errorMessage += '用户拒绝了录音权限。请允许此网站使用麦克风。';
            } else if (error.name === 'NotFoundError') {
                errorMessage += '未找到录音设备。请检查麦克风是否正确连接。';
            } else if (error.name === 'NotSupportedError') {
                errorMessage += '不支持录音功能。';
            } else {
                errorMessage += error.message || '未知错误';
            }
            
            this.showPermissionDialog(errorMessage);
            return false;
        } finally {
            this.isChecking = false;
        }
    }

    // 显示权限提示对话框
    showPermissionDialog(message) {
        const dialogHtml = `
            <div id="audioPermissionModal" class="audio-permission-modal" style="
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
            ">
                <div class="audio-permission-content" style="
                    background-color: #fff;
                    border-radius: 8px;
                    width: 500px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    position: relative;
                    padding: 20px;
                ">
                    <div class="audio-permission-header" style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        border-bottom: 1px solid #ddd;
                        padding-bottom: 15px;
                    ">
                        <h3 style="margin: 0; color: #e74c3c;">⚠️ 录音权限需要</h3>
                        <span class="close" onclick="hideAudioPermissionDialog()" style="
                            color: #999;
                            font-size: 24px;
                            font-weight: bold;
                            cursor: pointer;
                            line-height: 1;
                        ">&times;</span>
                    </div>
                    <div class="audio-permission-body">
                        <p style="margin-bottom: 15px; line-height: 1.6;">${message}</p>
                        <div style="text-align: center;">
                            <button onclick="retryAudioPermission()" style="
                                background-color: #007cba;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                margin: 5px;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                            ">重新检查权限</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 移除已存在的对话框
        const existingModal = document.getElementById('audioPermissionModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 添加新对话框
        document.body.insertAdjacentHTML('beforeend', dialogHtml);
    }

    // 隐藏权限对话框
    hidePermissionDialog() {
        const modal = document.getElementById('audioPermissionModal');
        if (modal) {
            modal.remove();
        }
    }

    // 获取当前权限状态
    getPermissionStatus() {
        return this.hasPermission;
    }
}

// 创建全局录音权限检查器实例
window.audioPermissionChecker = new AudioPermissionChecker();

// 全局函数
window.hideAudioPermissionDialog = function() {
    window.audioPermissionChecker.hidePermissionDialog();
};

window.retryAudioPermission = async function() {
    window.audioPermissionChecker.hidePermissionDialog();
    await window.audioPermissionChecker.checkAudioPermission();
};

window.continueWithoutPermission = function() {
    window.audioPermissionChecker.hidePermissionDialog();
    console.warn('用户选择在没有录音权限的情况下继续使用');
};

function transferBtnClickUI() {
    if (typeof _phoneBar !== 'undefined') {
        _phoneBar.transferBtnClickUI();
        var transferContent = $('#consultationModalBody table').detach();
        $('#transfer_area > td').append(transferContent);
        $('#transfer_area').hide();
        ModalUtil.hide('consultationModal');
    }
}

$(document).on('click', '#unmuteBtn', function(e) {
  if ($(this).hasClass('off')) {
    $("#unmuteBtn").removeClass("off").addClass("on");
    jsSipUAInstance.mute();
  } else {
    $("#unmuteBtn").removeClass("on").addClass("off");
    jsSipUAInstance.unmute();
  }
})


// 接回客户
function stopCallWaitBtnClickUI() {
    if (typeof _phoneBar !== 'undefined') {
        var transferContent = $('#consultationModalBody table').detach();
        $('#transfer_area > td').append(transferContent);
        $('#transfer_area').hide();
        ModalUtil.hide('consultationModal');
        if (!jsSipUAInstance.getAutoAnswer()) {
          jsSipUAInstance.setAutoAnswer(true);
          _phoneBar.stopCallWaitBtnClickUI();
          setTimeout(() => {
              jsSipUAInstance.setAutoAnswer(false);
          }, 3000);
        }else{ 
          _phoneBar.stopCallWaitBtnClickUI();
        }
    }
}


function consultationBtnClickUI() {
  console.log('consultationBtnClickUI');
    if (typeof _phoneBar !== 'undefined') {
        if (!jsSipUAInstance.getAutoAnswer()) {
          jsSipUAInstance.setAutoAnswer(true);
          _phoneBar.consultationBtnClickUI();
          setTimeout(() => {
              jsSipUAInstance.setAutoAnswer(false);
          }, 3000);
        }else{ 
          _phoneBar.consultationBtnClickUI();
        }
    }
}


function transferCallWaitBtnClickUI() {
  if (typeof _phoneBar !== 'undefined') {
     // 先移回内容再关闭
     var transferContent = $('#consultationModalBody table').detach();
     $('#transfer_area > td').append(transferContent);
     $('#transfer_area').hide();
     ModalUtil.hide('consultationModal');
     
    _phoneBar.transferCallWaitBtnClickUI();
   
  }
}

function conferenceStartBtnUI() {
    if (typeof _phoneBar !== 'undefined') {
        
        if (!jsSipUAInstance.getAutoAnswer()) {
          jsSipUAInstance.setAutoAnswer(true);
          _phoneBar.conferenceStartBtnUI('');
          setTimeout(() => {
              jsSipUAInstance.setAutoAnswer(false);
          }, 3000);
        }else{ 
          _phoneBar.conferenceStartBtnUI('');
        }
    }
}

// 自动外呼初始化函数 1017
function autoCallInit() {
  console.log("开始自动外呼初始化...");
  console.log("参数:", {extnum, opnum, pass, phone});
  
  // 设置全局变量
  window.extnum = extnum;
  window.opnum = opnum;
  window.groupId = groupId;
  window.skillLevel = skillLevel;
  
  // 1112 start 通话计时器变量
  var callDurationTimer = null;
  var callStartTime = null;
  
  // 1112 end
  $('#phone-bar').html(`
    <div style="max-width: 100%; max-height: 100vh; background: linear-gradient(180deg, #C5D1EC 0%, #EFF0F3 42.79%, #FFFFFF 100%);
 padding: 0; box-sizing: border-box;">
      <div style="padding: 20px 24px;height:100vh;box-sizing:border-box;" class="auto-call-container-box;">
        <div class="auto-call-container">
          <div><audio hidden="true" id="audioHandler" controls="controls" autoplay="autoplay"></audio></div>
        <div style="text-align: center; margin-bottom: 30px;" class='auto-call-title-container'>
          <div style="font-size: 24px; color: #122C4B; font-weight: 500;">智能客服系统</div>
          <div style="display: flex;align-items: center;gap:3px;">
             <div class="auto-call-icon-container">
              <img src="images/icon/autocall.png" alt="" class="auto-call-icon">
             </div>
            <span class="auto-call-title-text">自动外呼模式</span>
          </div>
        </div>

        <div style="
          margin-top: 64px;
          margin-bottom:170px;
          "
          class="auto-call-status-container"
        >
          <img src="images/icon/connect.png" alt="" class="auto-call-status-icon">
          <div id="autoCallStatus" style="
            text-align: center;
            color: #122C4B;
            font-size: 18px;
            font-weight: 500;
          ">
          正在初始化...
          </div>

          <div id="callStatus" style="
            text-align: center;
            color:rgba(18,44,75,0.8);
            font-size: 16px;
            border-radius: 8px;
          ">准备连接...</div>
          </div>
          <div style="display: flex; justify-content: center; align-items: center;">
            <div>
              <a href="#" id="hangUpBtn" class="gj_btn">
                <img src="images/hangup.png" alt="挂机" style="
                  width: 80px; 
                  height: 80px; 
                  border-radius: 50%;
                  box-shadow: 0 6px 15px rgba(255,71,87,0.3);
                  transition: all 0.3s ease;
                  cursor: pointer;
                ">
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  `);
  
  // 开始自动签入流程
  $("#autoCallStatus").text("正在自动签入...")
  $("#callStatus").text("准备连接...")
    .css('color', 'rgba(18,44,75,0.8)');
  // ----------------------------------1112start----------------------------------
  loadLoginToken();
  loadExtPassword(pass);

  let checkCount = 0;
  const maxCheckCount = 100; // 10秒超时
  const checkInterval = setInterval(() => {
    checkCount++;
    const tokenLoaded = typeof(loginToken) !== "undefined" && loginToken;
    const passwordLoaded = typeof(_phoneEncryptPassword) !== "undefined" && _phoneEncryptPassword;
    
    if (tokenLoaded && passwordLoaded) {
      clearInterval(checkInterval);
      
      _callConfig = {
        'useDefaultUi': false,
        'loginToken': loginToken,
        'ipccServer': scriptServer + ':38701',
        'gatewayList': gatewayList,
        'gatewayEncrypted': false,
        'extPassword': _phoneEncryptPassword
      };
  // 1112 1.
      $(".auto-call-status-icon").attr("src","images/icon/connect.png")
      $("#autoCallStatus").text("签入成功，准备外呼...")
      // 1112 2.注释background、color
      $("#callStatus").text("准备外呼...")
        // .css('background', 'rgba(45,152,218,0.1)')
        // .css('color', '#2d98da');
      
      // 初始化电话条
      _phoneBar.initConfig(_callConfig);
      
      // 注册软电话
      jsSipUAInstance.register({
        extnum,
        password: pass,
        fsHost: scriptServer,
        fsPort: '38700',
        audioHandler: document.getElementById("audioHandler")
      });
      
      $("#autoCallStatus").text("正在连接服务器...")
      _phoneBar.connect();
      _phoneBar.on(ccPhoneBarSocket.eventList.ws_connected, function() {
  // 1112
      $(".auto-call-status-icon").attr("src","images/icon/connected.png")
        $("#autoCallStatus").text("连接成功，3秒后自动外呼...")
        // 1112 3.注释background、color
        $("#callStatus").text("连接就绪")
          // .css('background', 'rgba(45,152,218,0.1)')
          // .css('color', '#2d98da');
        let countdown = 3;
        const countdownTimer = setInterval(() => {
          countdown--;
  // 1112
      $(".auto-call-status-icon").attr("src","images/icon/alarm.png")
          $("#autoCallStatus").text(`准备外呼：${countdown}秒...`);
          
          if (countdown <= 0) {
            clearInterval(countdownTimer);
            if (_phoneBar.getIsConnected()) {
              // $("#autoCallStatus").text("正在外呼：" + phone)
              $("#autoCallStatus").text(phone)
  // 1112
        $('.auto-call-status-container').css("background-image","url(images/icon/calling.png)")
      $(".auto-call-status-icon").attr("src","images/icon/call.png")
      // 1112 4.注释background、color
              $("#callStatus").text("呼叫中...")
                // .css('background', 'rgba(45,152,218,0.1)')
                // .css('color', '#2d98da');
              _phoneBar.call(phone, 'audio');
            } else {
  // 1112
      $(".auto-call-status-icon").attr("src","images/icon/call.png")
              $("#autoCallStatus").text("连接未就绪，无法外呼！")
                .css('color', '#ff4757');
                // 1112 6.注释background、修改color
              $("#callStatus").text("连接失败")
                .css('color', '#E0544E');
            }
          }
        }, 1000);
      });
      
      // 监听websocket连接断开事件
      _phoneBar.on(ccPhoneBarSocket.eventList.ws_disconnected, function() {
        // $("#autoCallStatus").text("服务器连接断开！")
        //   .css('color', '#ff4757');
        // $("#callStatus").text("连接断开")
        //   .css('background', 'rgba(255,71,87,0.1)')
        //   .css('color', '#ff4757');
      });
      
    } else if (checkCount >= maxCheckCount) {
      clearInterval(checkInterval);
      $("#autoCallStatus").text("自动签入失败，超时！")
        .css('color', '#ff4757');
        // 1112 7.注释background、修改color
      $("#callStatus").text("签入超时")
        .css('color', '#E0544E');
    }
  }, 100);

  // 挂机按钮事件处理
  $('#hangUpBtn').off('click').on('click', function(e) {
    e.preventDefault();
      // 添加点击动画
      $(this).css('transform', 'scale(0.95)');
      setTimeout(() => $(this).css('transform', 'scale(1)'), 200);
      
      if (jsSipUAInstance.hangup) {
        jsSipUAInstance.hangup();
      }
      if (_phoneBar.disconnect) {
        _phoneBar.disconnect();
      }
     // 1112 修改图片 开始
     $(".auto-call-status-icon").attr("src","images/icon/finishCalling.png")
     // 结束
      $("#autoCallStatus").text("已挂机").css('color', '#122C4B');
      $("#callStatus").text("通话结束")
     // 1112 修改color、删除bgc
       // .css('background', '#E0544E')
       .css('color', '#E0544E');
     
     // 停止通话计时器
     if (callDurationTimer) {
       clearInterval(callDurationTimer);
       callDurationTimer = null;
     }
     $("#callDuration").text("00:00:00");
  });
  
  // 监听通话状态
  // 被叫接通
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_answered.code, function (msg) {
  // 1112 start 3行
      $(".auto-call-status-icon").attr("src","images/icon/nowCalling.png")
      $('.auto-call-status-container').css("min-height","300px")
   $('.auto-call-status-container').css("background-image","url(images/icon/calling.png)")
  // 1112end
  // 1112 5.注释background、修改color
    $("#callStatus").text("通话中669")
      // .css('background', 'rgba(45,152,218,0.1)')
      .css('color', '#2FC77D');
    console.log(msg, "被叫接通222");
    
    // 1112 start
    callStartTime = new Date();
    callDurationTimer = setInterval(function() {
      var now = new Date();
      var elapsed = Math.floor((now - callStartTime) / 1000);
      var hours = Math.floor(elapsed / 3600);
      var minutes = Math.floor((elapsed % 3600) / 60);
      var seconds = elapsed % 60;
      var timeStr = 
        (hours < 10 ? '0' : '') + hours + ':' +
        (minutes < 10 ? '0' : '') + minutes + ':' +
        (seconds < 10 ? '0' : '') + seconds;
      $("#callStatus").text("通话中 " + timeStr).css('color', '#2FC77D');
    }, 1000);
    // 立即显示一次
    $("#callStatus").text("通话中 00:00:00").css('color', '#2FC77D');
    //1112 end
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_answered.code);
  });

  // 主叫挂断（我方挂断）通话结束
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.caller_hangup.code, function (msg) {
  // 1112 start
      $(".auto-call-status-icon").attr("src","images/icon/finishCalling.png")
  $('.auto-call-status-container').css("background-image","url(images/icon/calling.png)")
  // 1112 end
    console.log(msg, "主叫挂断");
    // 1112 8.注释background、修改color
    $("#callStatus").text("通话结束")
      .css('color', '#E0544E');
    $("#autoCallStatus").text("")
      .css('color', '#E0544E');
    
    // 1112start
    if (callDurationTimer) {
      clearInterval(callDurationTimer);
      callDurationTimer = null;
    }
    // 1112 end
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.caller_hangup.code);
  });

  // 被叫挂断（对方挂断）
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_hangup.code, function (msg) {
    console.log(msg, "被叫挂断");
    $("#callStatus").text("通话结束")
      .css('background', 'rgba(255,71,87,0.1)')
      .css('color', '#ff4757');
    $("#autoCallStatus").text("")
      .css('color', '#ff4757');
    
    // 1112 start
    if (callDurationTimer) {
      clearInterval(callDurationTimer);
      callDurationTimer = null;
    }
    // 1112 end
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_hangup.code);
  });
  // 1112end
}

// 返回按钮点击事件
$(document).on('click', '#backBtn', function(e) {
  e.preventDefault();
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // 如果没有历史记录，可以跳转到默认页面或关闭窗口
    window.close();
  }
});

/**
 * 调用工单回访接口
 * @param {string} aiUuid - AI_UUID
 * @param {string} workTicketId - 工单主键
 */
function callWorkTicketAiRelApi(aiUuid, workTicketId) {
  if (!tokenId) {
    console.error('tokenId 未设置，无法调用工单回访接口');
    return;
  }

  const apiUrl = '/bzf-business-work-ticket/wtcWorkTicketAiRelEntity/insertRecord';
  
  const wtcWorkTicketAiRelVoData = {
    uuid: aiUuid,
    workTicketId: workTicketId
  };
  const requestData = {
    vo: wtcWorkTicketAiRelVoData
  }
  
  // 使用 jQuery 发送 POST 请求
  $.ajax({
    url: apiUrl,
    type: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'tokenId': tokenId
    },
    data: JSON.stringify(requestData),
    success: function(response) {
      console.log('工单回访接口调用成功:', response);
      if (response.code === '1') {
        console.log('工单回访记录创建成功，主键:', response.data);
      } else {
        console.warn('工单回访接口返回异常:', response.msg);
      }
    },
    error: function(xhr, status, error) {
      console.error('工单回访接口调用失败:', {
        status: xhr.status,
        statusText: xhr.statusText,
        error: error,
        response: xhr.responseText
      });
    }
  });
}

