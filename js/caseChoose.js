var unitCode;
var userInfo;
var addressData;
var addressInfoList = [];
var beginDateString,endDateString,begworktime,endworktime;
var notWorkday;
var emsWay = "1";
var minWidth = parseInt($(window).width()/3)-16;
var returnType;
var applyNo,takeTime,takeAddress,addressCode,envelopeCode,applicant,telephone,address;
var taskType = "1";
var policyBean;
var status;
var _userMobile = '';

$(function(){
	_initHtml();
	_bindEvents();
});

function _initHtml(){
	userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
	policyBean = common.getLocalStorage("policyBean",true);
	unitCode = userInfo.unitCode;
	status = util2.GetQueryString('status');
	returnType = util2.GetQueryString('returnType');
	applyNo = util2.GetQueryString('applyNo');
	applicant = util2.GetQueryString('applicant');
	telephone = util2.GetQueryString('telephone');
	address = util2.GetQueryString('address');
	
	$("#peiSong_recipient").val(applicant);
	if( telephone != "undefined" && common.isNotNull(telephone)){
		$("#peiSong_tel").val(telephone);
	}
	if( address != "undefined" && common.isNotNull(address)){
		$("#peiSong_address").val(address);
	}
	
	//获取代理点登录电话
	var loginDetail = common.getLocalStorage(Interface.ss.loginDetail,true);
	if(common.isNotNull(loginDetail.mobilePhone)){
		_userMobile = loginDetail.mobilePhone;
	}
	
	Interface.queryTimeAndPlace(unitCode,userInfo.userCode,"","","",function(result){
		if(result.resultCode == "1"){
			addressData = result.responseObject.addressInfoList;
			$.each(addressData,function(key,value){
				addressInfoList.push(value.address);
			})
			var timeInfo = result.responseObject.timeInfo;
			notWorkday = timeInfo.notWorkDay;
			begworktime = timeInfo.begworktime;
			endworktime = timeInfo.endworktime;
			//var currentDates = new Date().toLocaleDateString();
			var currentDatesStamp = new Date().getTime();
			var currentHour = new Date().getHours();
			
			if(currentHour < begworktime){
				beginHour = begworktime;
			}else if(currentHour >= endworktime - 1){
				beginHour = begworktime;
				currentDatesStamp = currentDatesStamp + 60*60*24*1000;
				//alert("currentDatesStamp2:" + currentDatesStamp);			
			}else{
				beginHour = currentHour + 1;
			}
			var beginDate = new Date(currentDatesStamp);
			var beginMonth = beginDate.getMonth() + 1;
			var endDate = new Date(currentDatesStamp + 60*60*24*10*1000);
			var endMonth = endDate.getMonth() + 1;
			beginDateString = common.formatDate(beginDate,'yyyy-MM-dd') + ' ' + beginHour + ':00';
			endDateString = common.formatDate(endDate,'yyyy-MM-dd') + ' ' +  endworktime + ':00';
			//beginDateString = common.formatDate(beginDate,'yyyy-MM-dd hh:mm');
			//endDateString = common.formatDate(endDate,'yyyy-MM-dd hh:mm');
			$("#ziTi_time").html(beginDateString);
			$("#ziTi_address").html(addressData[0].address);
			$("#ziTi_address").attr("addressCode",addressData[0].code);
		}else{
			cpic.alert(result.message);
		}
	},function(result){
		cpic.alert("网络连接失败");
	})
	

	if(returnType == "2" || returnType == "3"){
		
		envelopeCode = util2.GetQueryString('envelopeCode') || "";
		
		
		if(returnType == "2"){//自取
			takeTime = util2.GetQueryString('takeTime') || "";
			takeAddress = util2.GetQueryString('takeAddress') || "";
			addressCode = util2.GetQueryString('addressCode') || "";
			taskType = util2.GetQueryString('taskType');
			//$("#ziTi_time").html(takeTime);
			/*if(common.isNotNull(takeAddress)){
				$("#ziTi_address").html(takeAddress);
				$("#ziTi_address").attr("code",takeAddress);
			}*/
			$("#ziquBoxSize").find(".size").eq(envelopeCode-1).addClass("select-yes").removeClass("select-no").siblings(".size").addClass("select-no").removeClass("select-yes");
		}
		
		if(returnType == "3"){//配送
			taskType = util2.GetQueryString('taskType');
			$(".chooseTabBox span").eq(1).addClass("select-yes").removeClass("select-no").siblings().addClass("select-no").removeClass("select-yes");
			$(".chooseContentBox").eq(1).show().siblings(".chooseContentBox").hide();
			emsWay = "2";
			$("#peisongBoxSize").find(".size").eq(envelopeCode-1).addClass("select-yes").removeClass("select-no").siblings(".size").addClass("select-no").removeClass("select-yes");
		}
	}	
	
	Interface.getPages(userInfo.userCode,unitCode,"","",function(result){
		if(result.resultCode == "1"){
			if(common.isNotNull(result.responseObject) && common.isNotNull(result.responseObject.list) && result.responseObject.list.length>0){
				var temp="<ul class = \"letterUiId\">"
				temp+="<li   style=\"overflow:auto;color:#333333;font-size: 1em;font-weight: 500;\">信封类型：</li>";
				$.each(result.responseObject.list,function(i,item){
					temp += "<li style=\"overflow:auto;height:3em;padding: 0.7em 0 0.1em;\">";
					temp += "<span onclick=\"showImage(" + item.imgCode + ")\"  class = id"+item.imgCode+"  data-value = "+item.envelope+" id ="+ item.imgCode +" style=\"display: inline-block;float:left;height:2.5em;width:2.5em;\">";
					temp += "<img src=\"../../images/loading300.gif\" style=\"width:2.5em;height:2.5em;\">";
					temp += "</span>";
					temp += "<span style=\"display: inline-block;float:left;line-height: 2.5em;padding-left: 1.5em;\">"+item.envelope+"CM"+"</span>";
					temp += "<span class=\"size select-right select-no\" style=\"display:block;float:right;position: relative;top: 22%;\"></span>";
					var code = item.imgCode;
					Interface.getPages(userInfo.userCode,unitCode,code,"1",function(result){
						if(result.resultCode == "1"){
							if(common.isNotNull(result.responseObject) && common.isNotNull(result.responseObject.list) && result.responseObject.list.length == 1){
									//var e1= $("#"+code);
								    var e1= $("#letterId .id"+code);
								    var e2= $("#peiSongContentBox .id"+code);
									$(e1.html()).remove();
									$(e1).html("<img src="+result.responseObject.list[0].breviaryImg+" style=\"width:2.5em;height:2.5em;\">");
									$(e2.html()).remove();
									$(e2).html("<img src="+result.responseObject.list[0].breviaryImg+" style=\"width:2.5em;height:2.5em;\">");
							}
						}else{
							cpic.alert(result.message);
						}
					},function(result){
						cpic.alert("网络连接失败");
					})
				})
				temp += "</ul>";
				$("#letterId ul").append(temp);
				$("#peiSongContentBox ul").append(temp);
			}
			
			$(".size").bind('click',function(){
				var _el = $(this);
				if(_el.hasClass('select-yes')){
					_el.removeClass('select-yes').addClass('select-no');
				}else{
					$(".size").removeClass("select-yes").addClass('select-no');
					_el.removeClass("select-no").addClass('select-yes');
					
				}
			});
			
			
		}else{
			cpic.alert(result.message);
		}
	},function(result){
		cpic.alert("网络连接失败");
	})
};


function showImage(code){
	/*var args = new Array();
	var str =  "/crm-http/crm/getEnvelopSettings.do?appType=M&clientType=phone&userCode="+userInfo.userCode+"&branchCode="+unitCode+"&imgCode="+code+"&imgType=1";
	args.push(str);
	cordova.exec(success, error, "ImagePicker", "getPictures", args);*/

	
	Interface.getPages(userInfo.userCode,unitCode,code,"2",function(result){
		if(result.resultCode == "1"){
			if(common.isNotNull(result.responseObject) && common.isNotNull(result.responseObject.list) && result.responseObject.list.length == 1){
				
				var img = new Image();
				var imgUrl = result.responseObject.list[0].bigImg;
				img.src = imgUrl;
				var width;
				var height;
				if (img.complete) {
					width = img.width;
					height = img.height;
				} else {
					img.onload = function() {
						width = img.width;
						height = img.height;
					};
				}
				var top = 0;
				var left = 0;
				var windowWidth = $(window).width();
				var windowHeight = $(window).height();
				if (width > windowWidth) {
					var proportion = windowWidth / width;
					width = windowWidth;
					height = height * proportion;
				} else if (width < windowWidth) {
					left = (windowWidth - width) / 2;
				}
				if (height < windowHeight) {
					top = (windowHeight - height) / 2;
				}
				var html = '';
				html += '<div class="jumpbox2 displayN preImg panel" id="preImg" style="top:0;background:#000;width:100%;height:100%">';
				html += '<div style="position:absolute; z-index:999;top:' + top + 'px;left:' + left + 'px;overflow:hidden;">';
				html += '<img id="preImage" style="vertical-align: middle;margin:0 auto;" alt="" src="' + imgUrl + '" width="' + width + '" height="' + height + '">';
				html += '</div></div>';

				$('body').append(html);
				$('#preImg').bind('click', function() {
					$('#preImg').hide();
					$('#preImg').unbind('click');
					$('#preImg').remove();
				});
				setTimeout(function() {
					$('#preImg').show();
				}, 200);
				
			}
		}else{
			cpic.alert(result.message);
		}
	},function(result){
		cpic.alert("网络连接失败");
	})
}

function _bindEvents(){
	if(returnType == "1"){
		$(".back").bind('click',function(){
			window.location.href = '../cameraQuote/paySuccess.html?applyNo=' + applyNo + '&status=' + status;
		})
	}else if(returnType == "2"){
		$(".back").bind('click',function(){
			window.location.href = '../cameraQuote/needSince.html?applyNo=' + applyNo + '&status=' + status;
		})
	}else if(returnType == "3"){
		$(".back").bind('click',function(){
			window.location.href = '../cameraQuote/onSending.html?applyNo=' + applyNo + '&status=' + status;
		})
	} else if(returnType == "4"){
		$(".back").bind('click',function(){
			window.location.href = '../newInsV2/paySuccess.html';
		})
		$(".home").bind('click',function(e){
			e.preventDefault();
			window.location.href = '../mine/myInfo.html';
		})
	}
	
	$(".chooseTabBox span").bind('click',function(){
		var _el = $(this);
		_el.addClass('select-yes').removeClass("select-no");
		_el.siblings().removeClass("select-yes").addClass('select-no');
		var _index = _el.index();
		var _chooseContentBox = $(".chooseContentBox");
		_chooseContentBox.hide().eq(_index).show();
		emsWay = _index + 1 + "";
	});
	
	/*$("#peiSong").bind('click',function(){
		$("#peisongId").html($("#letterUiId").clone());
		$(".size").removeClass("select-yes").addClass('select-no');
		$("#peisongId").find('.size').bind('click',function(){
			var _el = $(this);
			if(_el.hasClass('select-yes')){
				_el.removeClass('select-yes').addClass('select-no');
			}else{
				$(".size").removeClass("select-yes").addClass('select-no');
				_el.removeClass("select-no").addClass('select-yes');
			}
		});
	});*/
	
	
	
	var minDate = new Date(beginDateString.replace(/-/g,"/"));
	//alert(minDate);
	var maxDate = new Date(endDateString.replace(/-/g,"/"));
	$("#ziTi_time").scroller('destroy').scroller(
		$.extend({
			preset : 'datetime',
			dateOrder : 'yymmdd',
			defaultValue: minDate,
			minDate: minDate,
			maxDate: maxDate,
			timeWheels: 'HH',
			theme : 'android-ics light',
			mode : 'scroller',
			lang : 'zh',
			minWidth : minWidth,  //用于时间控件占据屏幕整个宽度
			onSelect : function(result){
				$("#ziTi_time").html(result);
			}
		})
	);
	
	/*$('#ziTi_address').on("click",function(){
		var params = addressInfoList;
		var defaultVal = $(this).html();
		$(this).scratcher(params,defaultVal,function(result){
			$('#ziTi_address').html(result);
			$.each(addressData,function(index,element){
				if(element.address==result){
					$('#ziTi_address').attr("code",element.code);
				}
			});
		});
	});*/
	
	$("#ziTi_address").bind('singleTap',function(){
		var html = '';
		
		html += '<div class="jumpbox2 displayN vehicleList panel" id="addressList" style="bottom:0;top:0;overflow:hidden;position:absolute;height:100%;width:100%;background: white;">';
	    html += '<header style="height:8%;">';
	    html += '<a class="back" id="btnBack"></a>';
	    html += '<div class=\"title\">自取地址</div>';
	    html += '</header>';
	    html += '<div class="item-ul-box"><ul id="addressList1" style="float:left;width:100%;overflow-y:scroll;height:84%;"></ul></div></div>';
	    $('body').append(html);
		var html = '';
		
		$.each(addressData,function(key,value){
			html += '<li addressCode=\"' + value.code + '\">' + value.address + '</li>';
		})
		$("#addressList1").html(html);
			
	    // 返回按钮
	    $('#btnBack').bind('click',function(){
	    	setTimeout(function(){
	    		$('#addressList').hide();
		    	$('#btnBack').unbind('click');
		    	$('#addressList').remove();
	    	},300);
        });
	    
	    $("#addressList1 li").bind('click',function(){
	    	var address = $(this).html();
	    	var addressCode = $(this).attr("addressCode");
	    	setTimeout(function(){
	    		$('#addressList').hide();
		    	$('#addressList').remove();
		    	$('#ziTi_address').html(address);
		    	$('#ziTi_address').attr("addressCode",addressCode);
	    	},300);
	    })
	})
	
	$("#peiSong_recipient").bind('blur',function(){
		checkName(1);
	});
	
	$("#peiSong_tel").bind('blur',function(){
		checkPhone(1);
	});
	
	$("#peiSong_address").bind('blur',function(){
		checkAddress(1);
	})
	
	$("#submit").bind('click',function(){
		var taskTime = "";
		var taskAddress = "";
		var addressCode = "";
		var custName = "";
		var custMobile = "";
		var custPhone = "";
		var custAddress = "";
		var envelopeSize = "";
		var envelopeCode = "";
		var insPolicyNo = policyBean.toUpperCase();
		if(common.isNull(insPolicyNo)){
			insPolicyNo = [];
		}
		var len = 0;
		$(".size").each(function(i,item){
			if($(item).hasClass('select-yes')){
				envelopeCode = $(item).prev().prev().attr("id");
				envelopeSize = $(item).prev().prev().attr("data-value");
				len += 1;
			}
		})
		if(len == 0){
			cpic.alert("信封类型必须要选一个！");
			return false;
		}else if(len > 1){
			cpic.alert("信封类型只能选一个！");
			return false;
		}
		
		if(emsWay == '1'){
			if(common.isNull($("#ziTi_time").html())){
				cpic.alert("自提时间不能为空");
				return false;
			}
			
			//if(new Date($("#ziTi_time").html()).getDay() == 0 || new Date($("#ziTi_time").html()).getDay() == 6){
			if($.inArray($("#ziTi_time").html(),notWorkday) != -1){	
				cpic.alert("所选日期为休息日，请重新选择");
				return false;
			}
			
			if(new Date($("#ziTi_time").html()).getHours() > endworktime || new Date($("#ziTi_time").html()).getHours() < begworktime){
				cpic.alert("自取时间必须在"+begworktime+"点到"+endworktime+"点之间，请重新选择");
				return false;
			}
			
			if(common.isNull($("#ziTi_address").html())){
				cpic.alert("自提地址不能为空");
				return false;
			}
			
			taskTime = $("#ziTi_time").text();
			taskAddress = $("#ziTi_address").html();
			addressCode = $("#ziTi_address").attr("addressCode");
			/*if($("#ziquBoxSize").find(".select-yes").html() == "32.0*23.0CM"){
				envelopeSize = "大信封：" + $("#ziquBoxSize").find(".select-yes").html();
				envelopeCode = "1";
			}else{
				envelopeSize = "小信封：" + $("#ziquBoxSize").find(".select-yes").html();
				envelopeCode = "2";
			}*/
		}else if(emsWay == '2'){
			if(checkName(2) && checkPhone(2) && checkAddress(2)){
				custName = $("#peiSong_recipient").val();
				custMobile = $("#peiSong_tel").val();
				custAddress = $("#peiSong_address").val();
			}else{
				return false;
			}
			/*if($("#peisongBoxSize").find(".select-yes").html() == "32.0*23.0CM"){
				envelopeSize = "大信封：" + $("#peisongBoxSize").find(".select-yes").html();
				envelopeCode = "1";
			}else{
				envelopeSize = "小信封：" + $("#peisongBoxSize").find(".select-yes").html();
				envelopeCode = "2";
			}*/
		}
		if(returnType == "4" && common.isNull(applyNo)){//自助配送
			var bzPolicyNo = "";
			var tcPolicyNo = "";
			policyBeans = JSON.parse(policyBean);
			$.each(policyBeans,function(key,item){
        		if(item.policyType == "JQ"){
        			tcPolicyNo = item.insNo;
        		}else if(item.policyType == "SY"){
        			bzPolicyNo = item.insNo;
        		}
        	})
			
			Interface.createRequestNoToSelf(unitCode,userInfo.userCode,bzPolicyNo,tcPolicyNo,function(result){
				if(result.resultCode == '1'){
					applyNo = result.responseObject.requestNo;
				}
			})
		}
		
		cpic.ui.loading.open();
		Interface.printDistribution(unitCode,userInfo.userCode,applyNo,emsWay,taskType,'1',taskTime,taskAddress,addressCode,custName,custMobile,custPhone,custAddress,"","",insPolicyNo,"",envelopeSize,envelopeCode,_userMobile,function(result){
			cpic.ui.loading.close();
			if(result.resultCode == '1'){
				common.removeLocalStorage("policyBean");
				cpic.alert(result.responseObject.msg);
				if(returnType == "4") {
					window.location.href = '../mine/myTask.html';
				} else {
					window.location.href = '../cameraQuote/purchaseRecords.html';
				}
			}else{
				if(common.isNotNull(result.responseObject)){
					cpic.alert(result.responseObject.msg);
				}else{
					cpic.alert(result.message);
				}
			}
		},function(result){
			cpic.alert("网络连接失败");
		});
	})
};

function checkName(type){
	var sysVal = $("#peiSong_recipient").val();
	
	if(common.isNull(sysVal)){
		if(type==1)
			cpic.Prompt("收件人姓名不能为空");
		else if(type==2)
			cpic.alert("收件人姓名不能为空");
		return false;
	}
	if(sysVal.length>40){
		if(type==1)
			cpic.Prompt("收件人姓名不得超过40个字符");
		else if(type==2)
			cpic.alert("收件人姓名不得超过40个字符");
		return false;	
	}
	return true;
}

function checkPhone(type){
	var sysVal = $("#peiSong_tel").val();
	
	if(common.isNull(sysVal)){
		if(type==1)
			cpic.Prompt("联系电话不能为空");
		else if(type==2)
			cpic.alert("联系电话不能为空");
		return false;
	}
	
	if(!common.checkPhoneOrMobile(sysVal)){
		if(type==1)
			cpic.Prompt(name+"联系电话格式不正确");
		else if(type==2)
			cpic.alert(name+"联系电话格式不正确");
		return false;
	}
	
	return true;
}

//地址校验
function checkAddress(type){
	
	var sysVal = $("#peiSong_address").val();
	
	if(common.isNull(sysVal)){
		if(type==1)
			cpic.Prompt("联系地址不能为空");
		else if(type==2)
			cpic.alert("联系地址不能为空");
		return false;
	}
	if(!common.checkAddress(sysVal)){
		if(type==1)
			cpic.Prompt("联系地址格式不正确");
		else if(type==2)
			cpic.alert("联系地址格式不正确");
		return false;
	}
	return true;
}

var util2 = {
	    GetQueryString:function(name)
	    {
	         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	         var r = window.location.search.substr(1).match(reg);
	         if(r!=null) return  decodeURI(r[2]); return null;
	    }
	};
