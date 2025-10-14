// 修改2:弹窗中填入签入信息包括密码，目前只有点击签入按钮才调用
var _phoneBar = new ccPhoneBarSocket();
var scriptServer = "172.16.1.111";
var extnum = '1103'; //分机号
var opnum = '1103'; //工号


var skillLevel = 9; //技能等级
var groupId = 1; // 业务组id
if (window.location.href.toString().indexOf("?") != -1) {
  console.log(ccPhoneBarSocket.utils);
  extnum = ccPhoneBarSocket.utils.getQueryParam("extNum");
  opnum = ccPhoneBarSocket.utils.getQueryParam("opNum");
  groupId = ccPhoneBarSocket.utils.getQueryParam("groupId");
  console.log("extNum=", extnum, "opNum=", opnum);
}

function resetExtNumAndOpNum (ext, op, groupId) {
  window.location.href = "?extNum=" + ext + "&opNum=" + op + "&groupId=" + groupId;
};


// 修改1:这三个现在需要签入时候调用
// 流程：需要修改的地方：
// 1.签入按钮逻辑 ✓
// 2.弹窗中填入签入信息包括密码，目前只有点击签入按钮才调用 （需要修改执行逻辑，等token都存入之后再）✓
// 3.咨询时候，客服人员没有加载出来
function loadLoginToken () {

  // 目前已经把 projectId 和 groupId合并为同一个参数;
  var getTokenUrl = "http://" + scriptServer + ":8880/call-center/create-token";
  var destUrl = getTokenUrl + "?extnum=" + extnum + "&opnum=" + opnum
    + "&groupId=" + groupId + "&skillLevel=" + skillLevel
    ;

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = destUrl;
  document.getElementsByTagName('head')[0].appendChild(script);
  console.log('异步token正在加载')
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


// 修改5:可忽略
function loadGatewayList () {
  var url = "http://" + scriptServer + ":8880/call-center/create-gateway-list";
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

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
  $("#chat-container").show();
  const { status, object } = data;
  if (status === 619 && object) {
    const { role, text, vadType } = object;
    if (vadType == 1) {
      addMessageToChat(role, text);
    }
  } else if (status === 620 || status === 621) {
    addSystemMessage("对话已结束。");
  }
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


function init () {
  console.log($('#app'));

  $('#app').html(`
  
  <form>

    <table width="1224">
      <tr>
        <td width="70%" colspan="2" height="35" style="text-indent: 20px;">
          <b>签入时间：</b> <span id="loginTime" title="" class="status4">00:00:00</span> &nbsp;&nbsp;
          <b>状态：</b> <span id="agentStatus" title="" class="status4">空闲</span> &nbsp;&nbsp;
          <b>当前排队人数：</b><span id="queueStat" title="" class="status4">0</span>

        </td>
      </tr>
      <tr>
        <td width="70%">
          <div>
            <div class="head_dial" style="padding-left: 10px; ">

              <dl class="dial">
                <dt>
                  <label for="ccphoneNumber"></label><input type="text" name="ccphoneNumber" id="ccphoneNumber"
                    placeholder="输入电话号码" class="tel_txt" />
                </dt>
                <dd>
                  <ul>
                    <li id="callStatus" title="" class="status4">没有连接</li>
                  </ul>
                  <span id="showCallLen" style="display:none"><b>00:00</b></span>
                </dd>
              </dl>

              <ul class="dial_btn">
                <li><a href="#" id="setFree" class="xz_btn off"></a><span>置闲</span></li>
                <li><a href="#" id="setBusy" class="sm_btn off"></a>
                  <select style="width: 50px;" id="setBusySubList">
                    <option value="3">置忙</option>
                    <option value="31">小休</option>
                    <option value="32">会议</option>
                    <option value="33">培训</option>
                  </select>
                </li>
                <li><a href="#" id="callBtn" class="wh_btn"></a><span>外呼</span></li>
                <li id="holdBtnLi"><a href="#" id="holdBtn" class="bc_btn off"></a><span>保 持</span></li>
                <li id="unHoldBtnLi"><a href="#" id="unHoldBtn" class="bc2_btn off"></a><span>取消保持</span></li>
                <li><a href="#" id="transferBtn" class="zjie_btn"></a><span>转接</span></li>
                <li><a href="#" id="consultationBtn" class="zixun_btn"></a><span>咨询</span></li>
                <li><a href="#" id="conferenceBtn" class="hy_btn"></a><span>会议</span></li>
                <li><a href="#" id="hangUpBtn" class="gj_btn"></a><span>挂机</span></li>
                <li><a href="#" id="resetStatus" class="qz_btn"></a><span>强置</span></li>
                <li><a href="#" id="onLineBtn" class="sx_btn on"></a><span>签入</span></li>
              </ul>
            </div>
          </div>
        </td>
        <td width="30%" style="display: none;">
          <div>
            <div style="padding-left: 10px; ">
              &nbsp; &nbsp; 外呼设置：
              <label for="videoCallBtn"> <input type="radio" value="video" name="callType"
                  id="videoCallBtn" />视频外呼</label> &nbsp;&nbsp;
              <label for="audioCallBtn"> <input type="radio" value="audio" name="callType" checked="checked"
                  id="audioCallBtn" />语音外呼</label> <br />

              &nbsp; &nbsp; 视频清晰度:
              <label for="videoLevelSelect"></label><select id="videoLevelSelect">
              </select>
              <input type="button" id="reInviteVideoBtn" title="发送视频邀请，可把音频通话转换为视频通话。"
                onclick="_phoneBar.reInviteVideoCall();" value="视频邀请" disabled="disabled">

              &nbsp;&nbsp;&nbsp;&nbsp;
              <label for="videoListSelect"></label>
              <select id="videoListSelect">
                <option value="">请选择视频</option>
                <option value="/usr/local/freeswitchvideo/share/freeswitch/sounds/bank.mp4">客服实例视频</option>
                <option value="/usr/local/freeswitchvideo/share/freeswitch/sounds/conference.mp4">多方会议视频</option>
                <option value="/usr/local/freeswitchvideo/share/freeswitch/sounds/15-seconds.mp4">15-seconds-demo
                </option>

              </select>
              <input type="button" id="sendVideoFileBtn" title="推送视频给对方，以便结束当前通话。"
                onclick="_phoneBar.sendVideoFile($('#videoListSelect').val());" value="推送视频" disabled="disabled">

            </div>
          </div>
        </td>
      </tr>

      <tr id="conference_area" style="display: none">

        <td colspan="2" style="padding-left: 130px; padding-top: 30px;">
          <div>
            <div>
              <div id="conference_start" style="display: block">
                <!-- 会议布局: &nbsp; -->
                <select id="conf_layout" name="conf_layout" style="display: none">
                  <option value="2x2">2x2</option>
                  <option value="3x3">3x3</option>
                  <option value="1up_top_left+3">一主三从</option>
                </select>
                &nbsp;
                <!-- 画布尺寸: -->
                <select id="conf_template" name="conf_template" style="display: none">
                  <option value="480p" selected="selected">480x640</option>
                  <option value="720p">720x1080</option>
                  <option value="default">default</option>
                </select>
                &nbsp;
                会议类型:
                <select id="conf_call_type2" name="conf_call_type2">
                  <!-- <option value="video">视频</option> -->
                  <option value="audio">音频</option>
                </select>
                <input type="hidden" value="audio" id="conf_call_type" name="conf_call_type" />
                &nbsp;
                <input type="button" name="startConference" id="startConference"
                  onclick="_phoneBar.conferenceStartBtnUI('')" style="width: 70px;" value="启动会议">
                &nbsp;
                <input type="button" name="endConference" id="endConference" onclick="_phoneBar.conferenceEnd()"
                  disabled="disabled" style="width: 70px;" value="结束会议">
              </div>

              <div style="width: 100%;"> &nbsp; </div>

              <div id="conference_member_list" style="display: none">
                <ul>
                  <li id="conference_header">
                    <span class="conf_name"> <input id="member_name" name="member_name" placeholder="姓名"
                        style="width: 60px;" /> </span> &nbsp;
                    <span class="conf_phone"> <input id="member_phone" name="member_phone" placeholder="手机号"
                        style="width: 110px;" /> </span> &nbsp;
                    <span class="conf_call_type">
                      <select id="member_call_type" name="member_call_type" style="display: none">
                        <option value="video">视频</option>
                        <option value="audio" selected>音频</option>
                      </select>
                    </span>
                    <span class="conf_video_level" style="display: none">
                      <select id="member_video_level" name="member_video_level">
                      </select>
                    </span>

                    <span class="conf_name">
                      <input type="button" name="addConfMember" id="addConfMember"
                        onclick="_phoneBar.conferenceAddMemberBtnUI(0)" style="width: 70px;" value="加入会议">
                    </span>
                  </li>

                  <!-- 会议成员展示模版html  -->
                  <li id="conf_member_template" style="display: none;">
                    <span class="conf_name">{member_name}</span>
                    <span class="conf_phone">{member_phone}</span>
                    <span class="conf_mute"><a href="javascript:void(0)"
                        onclick="_phoneBar.conferenceMuteMember('{member_phone}')"><img alt="禁言该成员。"
                          src="images/mute.jpg" width="15" height="17" /> </a> </span>
                    <span class="conf_vmute" style="display: none"><a href="javascript:void(0)"
                        onclick="_phoneBar.conferenceVMuteMember('{member_phone}')"><img alt="关闭该成员的视频。"
                          src="images/video.jpg" /> </a></span>
                    <span class="conf_remove"><a href="javascript:void(0)"
                        onclick="_phoneBar.conferenceRemoveMembers('{member_phone}')" title="踢除会议成员。">移除</a></span>
                    <span class="conf_re_invite"><a href="javascript:void(0)"
                        onclick="_phoneBar.conferenceAddMemberBtnUI(1, '{member_phone}', '{member_name}')"
                        title="重新呼叫。">重呼</a></span>
                    <span class="conf_status">{member_status}</span>
                  </li>


                  <li></li>
                </ul>
              </div>


            </div>
          </div>
        </td>

      </tr>

      <tr id="transfer_area" width="100%" style="display: none">

        <td colspan="2" width="100%" style="padding-left: 140px; padding-top: 30px;">
          <table width="100%">
            <tr>
              <td width="90">业务组 </td>
              <td width="90">坐席成员</td>
              <td>&nbsp; </td>
            </tr>
            <tr>
              <td>
                <select size="10" id="transfer_to_groupIds" name="transfer_to_groupIds">
                  <option value="">请选择</option>
                </select>
              </td>

              <td>
                <select size="10" id="transfer_to_member" name="transfer_to_member">
                  <option value="">请选择</option>
                </select>
              </td>
              <td valign="middle">


                &nbsp;&nbsp; <input type="text" name="externalPhoneNumber" id="externalPhoneNumber" placeholder="电话号码"
                  title="可以把当前通话转接到外线号码上。 如果该文本框留空，则忽略处理。" class="tel_txt" />
                <br /> <br />

                &nbsp;&nbsp; <input type="button" name="doTransferBtn" id="doTransferBtn"
                  onclick="_phoneBar.transferBtnClickUI()" style="width: 70px;" value="转接电话" title="把当前电话转接给他/她处理。" />
                &nbsp;

                &nbsp;&nbsp; <input type="button" name="stopCallWait" id="stopCallWait"
                  onclick="_phoneBar.stopCallWaitBtnClickUI()" style="width: 70px;" value="接回客户"
                  title="在咨询失败的情况下使用该按钮，接回处于等待中的电话。" /> &nbsp;

                &nbsp;&nbsp; <input type="button" name="transferCallWait" id="transferCallWait"
                  onclick="_phoneBar.transferCallWaitBtnClickUI()" style="width: 70px;" value="转接客户"
                  title="在咨询成功的情况下使用该按钮，把电话转接给专家坐席。" /> &nbsp;

                <input type="button" name="doConsultationBtn" id="doConsultationBtn"
                  onclick="_phoneBar.consultationBtnClickUI()" style="width: 70px;" value="拨号咨询" title="" />

              </td>
            </tr>
          </table>
        </td>

      </tr>

    </table>
  </form>

 
`)

 // <div id="chat-container">
  //   <div id="chat-messages" class="message-container"></div>
  // </div>

  // 调用函数填充视频清晰度的下拉列表
  populateVideoLevelDropdown('videoLevelSelect');
  populateVideoLevelDropdown('member_video_level');

  //工具条对象断开事件
  // _phoneBar.on(ccPhoneBarSocket.eventList.ws_disconnected, function(msg){
  // 	console.log(msg);
  // });
  //
  // //工具条对象连接成功
  // _phoneBar.on(ccPhoneBarSocket.eventList.ws_connected, function(msg){
  //     console.log(msg);
  // });
  //
  // _phoneBar.on(ccPhoneBarSocket.eventList.callee_ringing, function(msg){
  // 	console.log(msg.content, "被叫振铃事件");
  // });
  // _phoneBar.on(ccPhoneBarSocket.eventList.caller_answered, function(msg){
  // 	console.log(msg, "主叫接通" );
  // });
  // _phoneBar.on(ccPhoneBarSocket.eventList.caller_hangup, function(msg){
  //     console.log(msg, "主叫挂断");
  // });
  //
  // _phoneBar.on(ccPhoneBarSocket.eventList.callee_answered, function(msg){
  // 	console.log(msg, "被叫接通");
  // });
  // _phoneBar.on(ccPhoneBarSocket.eventList.callee_hangup, function(msg){
  // 	console.log(msg, "被叫挂断");
  // });
  //
  // _phoneBar.on(ccPhoneBarSocket.eventList.status_changed, function(msg){
  // 	console.log("座席状态改变: " ,msg);
  // });
  //
  // // 一次外呼结束;
  // _phoneBar.on(ccPhoneBarSocket.eventList.outbound_finished, function(msg){
  // 	console.log('一次外呼结束', msg);
  // });

  // websocket通信对象断开事件;
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.ws_disconnected.code, function (msg) {
    console.log(msg);
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.ws_disconnected.code);
    $("#transfer_area").hide();
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
    console.log(msg);
    $("#loginTime").text(new Date().toLocaleTimeString());
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.ws_connected.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_ringing.code, function (msg) {
    console.log(msg.content, "被叫振铃事件");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_ringing.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.caller_answered.code, function (msg) {
    console.log(msg, "主叫接通");
    $("#agentStatus").text("通话中");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.caller_answered.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.caller_hangup.code, function (msg) {
    console.log(msg, "主叫挂断");
    $("#agentStatus").text("通话结束");
    $("#reInviteVideoBtn").attr("disabled", "disabled");
    $("#sendVideoFileBtn").attr("disabled", "disabled");
    $("#transfer_area").hide();
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.caller_hangup.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_answered.code, function (msg) {
    console.log(msg, "被叫接通");
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_answered.code);
  });
  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.callee_hangup.code, function (msg) {
    console.log(msg, "被叫挂断");
    $("#transfer_area").hide();
    _phoneBar.updatePhoneBar(msg, ccPhoneBarSocket.eventListWithTextInfo.callee_hangup.code);
  });

  _phoneBar.on(ccPhoneBarSocket.eventListWithTextInfo.status_changed.code, function (msg) {
    console.log("座席状态改变: ", msg);
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

  // 添加咨询按钮点击事件
  $(document).on('click', '#consultationBtn', function(e) {
    e.preventDefault();
    
    var modalHtml = '<style>' +
      '#consultationModal .modal-content {' +
      '  border: none;' +
      '  border-radius: 12px;' +
      '  box-shadow: 0 4px 20px rgba(0,0,0,0.08);' +
      '  overflow: hidden;' +
      '}' +
      '#consultationModal .modal-header {' +
      '  background: #6b9aff;' +
      '  color: white;' +
      '  border: none;' +
      '  padding: 20px 30px;' +
      '}' +
      '#consultationModal .modal-title {' +
      '  font-size: 18px;' +
      '  font-weight: 600;' +
      '}' +
      '#consultationModal .btn-close {' +
      '  filter: brightness(0) invert(1);' +
      '  opacity: 0.8;' +
      '}' +
      '#consultationModal .btn-close:hover {' +
      '  opacity: 1;' +
      '}' +
      '#consultationModal .modal-body {' +
      '  padding: 30px;' +
      '  background: #f6f9ff;' +
      '}' +
      '#consultationModal select {' +
      '  padding: 10px 12px;' +
      '  border: 1px solid #d1dff7;' +
      '  border-radius: 6px;' +
      '  font-size: 14px;' +
      '  transition: all 0.3s ease;' +
      '  background: white;' +
      '}' +
      '#consultationModal select:focus {' +
      '  outline: none;' +
      '  border-color: #6b9aff;' +
      '  box-shadow: 0 0 0 3px rgba(107, 154, 255, 0.1);' +
      '}' +
      '#consultationModal input[type="text"] {' +
      '  padding: 10px 12px;' +
      '  border: 1px solid #d1dff7;' +
      '  border-radius: 6px;' +
      '  font-size: 14px;' +
      '  transition: all 0.3s ease;' +
      '}' +
      '#consultationModal input[type="text"]:focus {' +
      '  outline: none;' +
      '  border-color: #6b9aff;' +
      '  box-shadow: 0 0 0 3px rgba(107, 154, 255, 0.1);' +
      '}' +
      '#consultationModal input[type="button"] {' +
      '  padding: 8px 16px;' +
      '  border: none;' +
      '  border-radius: 6px;' +
      '  font-size: 13px;' +
      '  font-weight: 500;' +
      '  cursor: pointer;' +
      '  transition: all 0.2s ease;' +
      '  background: #6b9aff;' +
      '  color: white;' +
      '  margin: 5px;' +
      '  min-width: 80px;' +
      '  white-space: nowrap;' +
      '}' +
      '#consultationModal input[type="button"]:hover {' +
      '  background: #5b8def;' +
      '  box-shadow: 0 2px 8px rgba(107, 154, 255, 0.3);' +
      '}' +
      '#consultationModal input[type="button"]:active {' +
      '  transform: translateY(1px);' +
      '}' +
      '#consultationModal table {' +
      '  background: white;' +
      '  border-radius: 8px;' +
      '  padding: 20px;' +
      '  box-shadow: 0 1px 4px rgba(0,0,0,0.05);' +
      '}' +
      '#consultationModal td {' +
      '  padding: 12px 15px;' +
      '}' +
      '</style>' +
      '<div class="modal fade" id="consultationModal" tabindex="-1">' +
      '<div class="modal-dialog modal-lg">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title">咨询操作</h5>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
      '</div>' +
      '<div class="modal-body" id="consultationModalBody">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    $('#consultationModal').remove();
    
    // 添加弹窗到页面
    $('body').append(modalHtml);
    
    // 把 transfer_area 的内容移动到弹窗中（不是克隆，是移动）
    var transferContent = $('#transfer_area > td > table').detach();
    $('#consultationModalBody').append(transferContent);
    $('#transfer_area').hide();
    
    // 显示弹窗
    var modal = new bootstrap.Modal(document.getElementById('consultationModal'));
    modal.show();

    // 等弹窗显示后再初始化数据
    setTimeout(function() {
      populateGroupIdOptions();
    }, 100);
    
    // 弹窗关闭时，把内容移回原位
    $('#consultationModal').on('hidden.bs.modal', function () {
      var transferContent = $('#consultationModalBody table').detach();
      $('#transfer_area > td').append(transferContent);
      $('#consultationModal').remove();
    });
  });

  // 添加会议按钮点击事件
  $(document).on('click', '#conferenceBtn', function(e) {
    e.preventDefault();
    
    var modalHtml = '<style>' +
      '#conferenceModal .modal-content {' +
      '  border: none;' +
      '  border-radius: 12px;' +
      '  box-shadow: 0 4px 20px rgba(0,0,0,0.08);' +
      '  overflow: hidden;' +
      '}' +
      '#conferenceModal .modal-header {' +
      '  background: #6b9aff;' +
      '  color: white;' +
      '  border: none;' +
      '  padding: 20px 30px;' +
      '}' +
      '#conferenceModal .modal-title {' +
      '  font-size: 18px;' +
      '  font-weight: 600;' +
      '}' +
      '#conferenceModal .btn-close {' +
      '  filter: brightness(0) invert(1);' +
      '  opacity: 0.8;' +
      '}' +
      '#conferenceModal .btn-close:hover {' +
      '  opacity: 1;' +
      '}' +
      '#conferenceModal .modal-body {' +
      '  padding: 30px;' +
      '  background: #f6f9ff;' +
      '}' +
      '#conferenceModal select {' +
      '  padding: 10px 12px;' +
      '  border: 1px solid #d1dff7;' +
      '  border-radius: 6px;' +
      '  font-size: 14px;' +
      '  transition: all 0.3s ease;' +
      '  background: white;' +
      '}' +
      '#conferenceModal select:focus {' +
      '  outline: none;' +
      '  border-color: #6b9aff;' +
      '  box-shadow: 0 0 0 3px rgba(107, 154, 255, 0.1);' +
      '}' +
      '#conferenceModal input[type="text"], ' +
      '#conferenceModal input[name*="member"] {' +
      '  padding: 10px 12px;' +
      '  border: 1px solid #d1dff7;' +
      '  border-radius: 6px;' +
      '  font-size: 14px;' +
      '  transition: all 0.3s ease;' +
      '  background: white;' +
      '}' +
      '#conferenceModal input[type="text"]:focus, ' +
      '#conferenceModal input[name*="member"]:focus {' +
      '  outline: none;' +
      '  border-color: #6b9aff;' +
      '  box-shadow: 0 0 0 3px rgba(107, 154, 255, 0.1);' +
      '}' +
      '#conferenceModal input[type="button"], ' +
      '#conferenceModal input[name*="Conference"], ' +
      '#conferenceModal input[name*="ConfMember"] {' +
      '  padding: 8px 16px;' +
      '  border: none;' +
      '  border-radius: 6px;' +
      '  font-size: 13px;' +
      '  font-weight: 500;' +
      '  cursor: pointer;' +
      '  transition: all 0.2s ease;' +
      '  margin: 5px;' +
      '  min-width: 90px;' +
      '  white-space: nowrap;' +
      '}' +
      '#conferenceModal input[name="startConference"], ' +
      '#conferenceModal input[name="addConfMember"] {' +
      '  background: #6b9aff;' +
      '  color: white;' +
      '}' +
      '#conferenceModal input[name="startConference"]:hover, ' +
      '#conferenceModal input[name="addConfMember"]:hover {' +
      '  background: #5b8def;' +
      '  box-shadow: 0 2px 8px rgba(107, 154, 255, 0.3);' +
      '}' +
      '#conferenceModal input[name="endConference"] {' +
      '  background: #a0b3d8;' +
      '  color: white;' +
      '}' +
      '#conferenceModal input[name="endConference"]:hover {' +
      '  background: #8fa3cc;' +
      '  box-shadow: 0 2px 8px rgba(160, 179, 216, 0.3);' +
      '}' +
      '#conferenceModal input[type="button"]:disabled {' +
      '  opacity: 0.5;' +
      '  cursor: not-allowed;' +
      '}' +
      '#conferenceModal input[type="button"]:active:not(:disabled) {' +
      '  transform: translateY(1px);' +
      '}' +
      '#conferenceModal #conference_start {' +
      '  background: white;' +
      '  border-radius: 8px;' +
      '  padding: 20px;' +
      '  box-shadow: 0 1px 4px rgba(0,0,0,0.05);' +
      '  margin-bottom: 20px;' +
      '}' +
      '#conferenceModal #conference_member_list {' +
      '  background: white;' +
      '  border-radius: 8px;' +
      '  padding: 20px;' +
      '  box-shadow: 0 1px 4px rgba(0,0,0,0.05);' +
      '}' +
      '#conferenceModal #conference_member_list ul {' +
      '  list-style: none;' +
      '  padding: 0;' +
      '  margin: 0;' +
      '}' +
      '#conferenceModal #conference_member_list li {' +
      '  padding: 12px 0;' +
      '  border-bottom: 1px solid #e8eff9;' +
      '}' +
      '#conferenceModal #conference_member_list li:last-child {' +
      '  border-bottom: none;' +
      '}' +
      '#conferenceModal .conf_member_item_row {' +
      '  background: #f6f9ff;' +
      '  padding: 15px !important;' +
      '  border-radius: 6px !important;' +
      '  margin: 10px 0 !important;' +
      '  border: none !important;' +
      '}' +
      '#conferenceModal .conf_member_item_row:hover {' +
      '  background: #e8eff9;' +
      '}' +
      '#conferenceModal .conf_name, ' +
      '#conferenceModal .conf_phone, ' +
      '#conferenceModal .conf_status {' +
      '  display: inline-block;' +
      '  margin-right: 10px;' +
      '  font-size: 14px;' +
      '}' +
      '#conferenceModal .conf_remove a, ' +
      '#conferenceModal .conf_re_invite a {' +
      '  color: #6b9aff;' +
      '  text-decoration: none;' +
      '  font-weight: 500;' +
      '  padding: 5px 10px;' +
      '  border-radius: 4px;' +
      '  transition: all 0.2s ease;' +
      '}' +
      '#conferenceModal .conf_remove a:hover, ' +
      '#conferenceModal .conf_re_invite a:hover {' +
      '  background: rgba(107, 154, 255, 0.1);' +
      '}' +
      '</style>' +
      '<div class="modal fade" id="conferenceModal" tabindex="-1">' +
      '<div class="modal-dialog modal-lg">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title">会议管理</h5>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
      '</div>' +
      '<div class="modal-body" id="conferenceModalBody">' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    $('#conferenceModal').remove();
    
    // 添加弹窗到页面
    $('body').append(modalHtml);
    
    // 把 conference_area 的内容移动到弹窗中（不是克隆，是移动）
    var conferenceContent = $('#conference_area > td > div').detach();
    $('#conferenceModalBody').append(conferenceContent);
    $('#conference_area').hide();
    
    // 显示弹窗
    var modal = new bootstrap.Modal(document.getElementById('conferenceModal'));
    modal.show();
    
    // 弹窗关闭时，把内容移回原位
    $('#conferenceModal').on('hidden.bs.modal', function () {
      var conferenceContent = $('#conferenceModalBody > div').detach();
      $('#conference_area > td').append(conferenceContent);
      $('#conferenceModal').remove();
    });
  });


  // 电话工具条参数配置;
  _callConfig = {
    'useDefaultUi': true,
    // loginToken 信息是加密的字符串， 包含以下字段信息：extnum[分机号]、opnum[工号]、groupId[业务组]、skillLevel[技能等级]
    'loginToken': '',

    // 电话工具条服务器端的地址; 端口默认是1081
    'ipccServer': scriptServer + ':1081',

    // 网关列表， 默认需要加密后在在通过客户端向呼叫系统传递;
    // 注意在注册模式下，网关参数更改之后，必须重启语音服务 [docker restart freeswitch] 方可生效，不支持热更新;
    // 支持多个网关同时使用，按照优先级依次使用, 支持网关负载容错溢出 [第一条网关外呼出错后，自动使用第二条网关重试，直至外呼不出错] ;
    'gatewayList': [
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
    ],

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
    
    var signinModalHtml = '<style>' +
      '#signinModal .modal-content {' +
      '  border: none;' +
      '  border-radius: 12px;' +
      '  box-shadow: 0 4px 20px rgba(0,0,0,0.08);' +
      '  overflow: hidden;' +
      '}' +
      '#signinModal .modal-header {' +
      '  background: #6b9aff;' +
      '  color: white;' +
      '  border: none;' +
      '  padding: 20px 30px;' +
      '}' +
      '#signinModal .modal-title {' +
      '  font-size: 18px;' +
      '  font-weight: 600;' +
      '}' +
      '#signinModal .btn-close {' +
      '  filter: brightness(0) invert(1);' +
      '  opacity: 0.8;' +
      '}' +
      '#signinModal .btn-close:hover {' +
      '  opacity: 1;' +
      '}' +
      '#signinModal .modal-body {' +
      '  padding: 30px;' +
      '  background: #f6f9ff;' +
      '}' +
      '#signinModal .signin-form-group {' +
      '  margin-bottom: 20px;' +
      '  position: relative;' +
      '}' +
      '#signinModal .signin-label {' +
      '  display: block;' +
      '  font-size: 14px;' +
      '  font-weight: 500;' +
      '  color: #495057;' +
      '  margin-bottom: 8px;' +
      '}' +
      '#signinModal .signin-input {' +
      '  width: 100%;' +
      '  padding: 10px 14px;' +
      '  font-size: 14px;' +
      '  border: 1px solid #d1dff7;' +
      '  border-radius: 6px;' +
      '  transition: all 0.3s ease;' +
      '  background: white;' +
      '}' +
      '#signinModal .signin-input:focus {' +
      '  outline: none;' +
      '  border-color: #6b9aff;' +
      '  box-shadow: 0 0 0 3px rgba(107, 154, 255, 0.1);' +
      '}' +
      '#signinModal .signin-input::placeholder {' +
      '  color: #adb5bd;' +
      '}' +
      '#signinModal .modal-footer {' +
      '  border: none;' +
      '  padding: 20px 30px;' +
      '  background: #f6f9ff;' +
      '  display: flex;' +
      '  gap: 12px;' +
      '}' +
      '#signinModal .signin-btn {' +
      '  flex: 1;' +
      '  padding: 10px 20px;' +
      '  font-size: 14px;' +
      '  font-weight: 500;' +
      '  border: none;' +
      '  border-radius: 6px;' +
      '  cursor: pointer;' +
      '  transition: all 0.2s ease;' +
      '}' +
      '#signinModal .signin-btn-cancel {' +
      '  background: white;' +
      '  color: #6c757d;' +
      '  border: 1px solid #d1dff7;' +
      '}' +
      '#signinModal .signin-btn-cancel:hover {' +
      '  background: #f6f9ff;' +
      '  border-color: #a0b3d8;' +
      '}' +
      '#signinModal .signin-btn-confirm {' +
      '  background: #6b9aff;' +
      '  color: white;' +
      '}' +
      '#signinModal .signin-btn-confirm:hover {' +
      '  background: #5b8def;' +
      '  box-shadow: 0 2px 8px rgba(107, 154, 255, 0.3);' +
      '}' +
      '#signinModal .signin-btn-confirm:active {' +
      '  transform: translateY(1px);' +
      '}' +
      '</style>' +
      '<div class="modal fade" id="signinModal" tabindex="-1">' +
      '<div class="modal-dialog modal-dialog-centered">' +
      '<div class="modal-content">' +
      '<div class="modal-header">' +
      '<h5 class="modal-title">座席签入</h5>' +
      '<button type="button" class="btn-close" data-bs-dismiss="modal"></button>' +
      '</div>' +
      '<div class="modal-body">' +
      '<div class="signin-form-group">' +
      '<label class="signin-label">分机工号</label>' +
      '<input type="text" class="signin-input" id="signinOpnum" placeholder="请输入分机工号">' +
      '</div>' +
      '<div class="signin-form-group">' +
      '<label class="signin-label">座席密码</label>' +
      '<input type="password" class="signin-input" id="signinPassword" placeholder="请输入座席密码">' +
      '</div>' +
      '<div class="signin-form-group">' +
      '<label class="signin-label">分机号码</label>' +
      '<input type="text" class="signin-input" id="signinExtnum" placeholder="请输入分机号码">' +
      '</div>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button type="button" class="signin-btn signin-btn-cancel" data-bs-dismiss="modal">取消</button>' +
      '<button type="button" class="signin-btn signin-btn-confirm" id="confirmSigninBtn">确认签入</button>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    // 如果已经存在弹窗，先移除
    $('#signinModal').remove();
    
    // 添加弹窗到页面
    $('body').append(signinModalHtml);
    
    // 显示弹窗
    var modal = new bootstrap.Modal(document.getElementById('signinModal'));
    modal.show();

    // 确认签入按钮点击事件
    $(document).on('click', '#confirmSigninBtn', function() {
      var opnumValue = $('#signinOpnum').val();
      var passwordValue = $('#signinPassword').val();
      var extnumValue = $('#signinExtnum').val();
      
      if (!opnumValue || !passwordValue || !extnumValue) {
        alert('请填写完整的签入信息！');
        return;
      }
      
      // 关闭弹窗
      modal.hide();
      
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
      loadGatewayList();
      
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

          // 初始化电话工具条
          _phoneBar.initConfig(_callConfig);
          console.log('✅ 电话工具条配置初始化完成');
          
          // 建立 WebSocket 连接
          _phoneBar.connect();
          
        } else if (checkCount >= maxCheckCount) {
          // 超时处理
          clearInterval(checkInterval);
        }
      }, 100); // 每100ms检查一次
    });
  });

}