var userInfo;
var applyNo;
var plateNo;
var status;
var codes;
var policyEos;
var payWay;
//合作银行
var bankCooperant=""; 
var bankName = "";
var issuecode; //北京承保验证码
var payNo;//支付号
var payCheckCode;//验证码
var totalPremium;//总保费
var unitCode;

$(function(){
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true);
	unitCode=userInfo.unitCode;
	applyNo = util2.GetQueryString('applyNo');
	plateNo = util2.GetQueryString('plateNo');
	status = util2.GetQueryString('status');
	name = util2.GetQueryString('name');
	totalPremium = util2.GetQueryString('totalPremium');
	
	$("#name").html(name);
	$("#carNo").html(plateNo);
	
	initPayInfo();
	/**
	 * 分公司获取银行
	 */
	Interface.queryConfigs(userInfo.unitCode,function(result){
		console.log(result);
		codes = result.codes;
		mbtsFlag = result.organParams.mbts;
		chinapayFlag = result.organParams.chinapay||"0";
		weixinpayFlay = result.organParams.weixin||"0";
	});
	
	//var plateNo = "粤B23446";
	var currentDates = new Date();
	var startDate = common.formatDate(currentDates,'yyyy-MM-dd');
	var currentDatesStamp = new Date(currentDates).getTime();
	var endDateStamp = new Date(currentDatesStamp + 60*60*24*100*1000);
	var endDate = common.formatDate(endDateStamp,'yyyy-MM-dd');
	cpic.ui.loading.open();
    Interface.queryPolicyEo(userInfo.unitCode, plateNo, startDate, endDate,function(result){
    	cpic.ui.loading.close();
    	if(result.success){
    		policyEos = result.policyEos;
    		/*var sum = 0;
    		$.each(policyEos,function(key,item){
    			sum += Number(item.premium);
    		})
    		$("#sum").html("￥"+new Digital(sum*100/100).format(2));*/
    	}
    })
    
    bindEvent();
})

function bindEvent(){
	
	$(".back").bind('click',function(){
		location.href = 'prosalDetail.html?applyNo=' + applyNo + '&status' + status + '&plateNo' + plateNo;
	});
	
	// 银联支付
	$("#chinaPay").bind("click",function(){
		$("#payPosDiv").hide();
		$("#insurePayType").unbind();
		$("#pay").unbind();
		$("#insurePayType").bind("click",function(){
			//北京承保验证码验证
			issuecode = "";
			if(userInfo.unitCode == "1010100"){
				if(!checkIssueCode()){
				     return;
				}
				issuecode = $('#issuecode').val().replace(/\s+/g,"");
				$('#issuecodeDiv').hide();
			}
			$(".one_tabs").hide();
			$(".back").hide();
			$("#chinaPayDiv").show();
			$("#insurePayType").hide();
			$("#edit").hide();
			$("#pay").show();
			$("#deletePay").css("display","inline-block");
			myScroll.refresh();
			
			payWay = 'chinapay';
			bankCooperant=""; 
			bankName = "";
			cpic.ui.loading.open();
			Interface.submitFeeListForMobile2(JSON.stringify(policyEos),payWay,bankCooperant,issuecode,function(result){
				cpic.ui.loading.close();
				if(result.success){
					
					payNo = result.payNo;
					payCheckCode = result.checkCode
					var succAmount = result.amount;
					var payMethod = "2";
					
					var payNoStr = "";
					var l = parseInt(payNo.length/4);
					for(var i=0;i<=l;i++){
						payNoStr += payNo.substring(i*4,(i+1)*4)+"  "
					};
					
					
					$('#chinaPayNo').html(payNoStr);
					$('#chinaPayCheckCode').html(payCheckCode);
					myScroll.refresh();
					
					$("#pay").bind("click",function(){
						window.location.href = "paySuccess.html";
					});
					
					cpic.alert("已将支付链接通过短信方式发送至投保人手机，请客户在手机上点击链接，完成保费支付操作！");
					
					Interface.savePayInfo(userInfo.unitCode,userInfo.userCode,applyNo,payCheckCode,"","","","",succAmount,"","",payMethod,"",bankName,"","","",payNo,function(){
						cpic.alert(result.message);
					})
						
					
				}else{
					cpic.alert("<span class='font08em'>申请支付号失败！</span>");
				}
				cpic.ui.loading.close();
			});
		});
	});
	
	// POS交费
	$("#payPos").bind("click",function(){
		$("#payPosDiv").show();
		
		payWay = 2;
		initPayBank();
		$("#pay2Name").text("POS支付");
		myScroll.refresh();
		
		$("#insurePayType").unbind();
		$("#pay").unbind();
		$("#insurePayType").bind("click",function(){
			//北京承保验证码验证
			if(userInfo.unitCode == "1010100"){
				if(!checkIssueCode()){
				     return;
				}
				issuecode = $('#issuecode').val().replace(/\s+/g,"");
				$('#issuecodeDiv').hide();
			}
			if(common.isNull(bankCooperant) && common.isNull(bankName)){
				cpic.alert("<span class='font08em'>请选择支付银行!</span>");
				return false;
			}
			
			$("#insurePayType").hide();
			$("#edit").hide();
			$("#pay").show();
			$("#deletePay").css("display","inline-block");
			
			$(".one_tabs").hide();
			$(".back").hide();
			
			cpic.ui.loading.open();
			Interface.submitFeeListForMobile2(JSON.stringify(policyEos),payWay,bankCooperant,issuecode,function(result){
				//console.log(result);
				if(result.success){
					payNo = result.payNo;
					payCheckCode = result.checkCode;
					var payNoStr = "";
					var l = parseInt(payNo.length/4);
					for(var i=0;i<=l;i++){
						payNoStr += payNo.substring(i*4,(i+1)*4)+"  "
					};
					var succAmount = result.amount;
					var payMethod = "1";
					
					$('#posPayNo').html(payNoStr);
					$("#posPayBankName").html(bankName);
					$('#posPayCheckCode').html(payCheckCode);
					
					$("#pay").bind("click",function(){
						window.location.href = "paySuccess.html";
					});
					
					$("#posPay_1").hide();
					if(payWay == 2) { 
						$("#pay2Name").text("POS支付");
					}
					$("#posPay_2").show();
					myScroll.refresh();
					
					Interface.savePayInfo(userInfo.unitCode,userInfo.userCode,applyNo,payCheckCode,"","","","",succAmount,"","",payMethod,"",bankName,"","","",payNo,function(){
						cpic.alert(result.message);
					})
				}else{
					cpic.alert("<span class='font08em'>申请支付号失败！</span>");
				}
				cpic.ui.loading.close();
			});
		
		});
		
	});
	
	//选择支票支付
	$("#payCheck").bind('singleTap',function(){
		$("#payPosDiv").show();
		payWay = 1;
		initPayBank();
		myScroll.refresh();
		
		$("#insurePayType").unbind();
		$("#pay").unbind();
		$("#insurePayType").bind("click",function(){
			//北京承保验证码验证
			if(userInfo.unitCode == "1010100"){
				if(!checkIssueCode()){
				     return;
				}
				issuecode = $('#issuecode').val().replace(/\s+/g,"");
				$('#issuecodeDiv').hide();
			}
			if(common.isNull(bankCooperant) && common.isNull(bankName)){
				cpic.alert("<span class='font08em'>请选择支付银行!</span>");
				return false;
			}
			
			$("#insurePayType").hide();
			$("#edit").hide();
			$("#pay").show();
			$("#deletePay").css("display","inline-block");
			
			$(".one_tabs").hide();
			$(".back").hide();
			cpic.ui.loading.open();
			Interface.submitFeeListForMobile2(JSON.stringify(policyEos),payWay,bankCooperant,issuecode,function(result){
				console.log(result);
				if(result.success){
					payNo = result.payNo;
					payCheckCode = result.checkCode;
					var payNoStr = "";
					var l = parseInt(payNo.length/4);
					for(var i=0;i<=l;i++){
						payNoStr += payNo.substring(i*4,(i+1)*4)+"  "
					};
					
					$('#posPayNo').html(payNoStr);
					$("#posPayBankName").html(bankName);
					$('#posPayCheckCode').html(payCheckCode);
					
					
					$("#pay").bind("click",function(){
						window.location.href = "paySuccess.html";
					});
					
					$("#posPay_1").hide();
					if(payWay == 1) { 
						$("#pay2Name").text("支票支付");
					}
					$("#posPay_2").show();
					myScroll.refresh();
				}else{
					cpic.alert("<span class='font08em'>申请支付号失败！</span>");
				}
				cpic.ui.loading.close();
			});
		
		});
	});
	
	$("#deletePay, #deletePay2").bind("click",function(){
		//作废支付号
		Interface.cancelLationForMobile2(userInfo.unitCode,userInfo.userCode,payNo,payWay,function(result){
			if(result.success) {
				Interface.savePayInfo(userInfo.unitCode,userInfo.userCode,applyNo,"","","","","","","","","","","","","","","",function(){
					cpic.alert(result.message);
				})
				window.location.href = "payInsurance.html?applyNo="+ applyNo +"&plateNo="+ plateNo+"&totalPremium="+totalPremium + '&name=' + name;
			} else{
				cpic.Prompt("作废支付号失败！");
			}
		});
	});
}


function checkIssueCode(){
	if($('#issuecodeDiv').is(':visible')){
		var issuecode=$('#issuecode').val().replace(/\s+/g,"");
		if(common.isNull(issuecode)){
			cpic.alert("<span class='font08em'>请填写承保验证码！</span>");
			return false;
		}
	}
	return true;
}

//初始化合作银行  
function initBank() {
	//if(codes.BankCooperant.length > 0){
	var bankList = "";
	$.each(codes.BankCooperant, function(i, bank){
		var code = bank.code;
		var name = bank.codeName;
		var img = "";
		if(bank.codeName.indexOf('工商') > -1){
			img = "gongshang";
//			if(userInfo.unitCode == "5010100"){
//				if(ogName.indexOf('韶关') > -1){
//					code = "13";
//					name = "韶关工商银行-商户号";
//				}else if(ogName.indexOf('云浮') > -1){
//					code = "11";
//					name = "云浮工商银行-商户号";
//				}else if(ogName.indexOf('番禺') > -1){
//					code = "14";
//					name = "番禺工商银行-商户号";
//				}else if(ogName.indexOf('河源') > -1){
//					code = "15";
//					name = "河源工商银行-商户号";
//				}else if(ogName.indexOf('中山') > -1){
//					code = "10";
//					name = "中山工商银行-商户号";
//				}else if(ogName.indexOf('潮州') > -1){
//					code = "16";
//					name = "潮州工商银行-商户号";
//				}else if(ogName.indexOf('粤秀') > -1){
//					code = "03";
//					name = "粤秀工商银行-商户号";
//				}else if(ogName.indexOf('珠海') > -1){
//					code = "17";
//					name = "珠海工商银行-商户号";
//				}
//			}
		} if(bank.codeName.indexOf('中国银行') > -1){ //中国银行
			img = "zhongguo";
		}else if(bank.codeName.indexOf('中信') > -1){ //中信银行
			img = "zhongxin";
		}else if(bank.codeName.indexOf('交通') > -1){ //中国交通银行
			img = "jiaotong";
//			if(userInfo.unitCode == "5010100"){
//				if(ogName.indexOf('天河') > -1){
//					code = "04";
//					name = "广州天河交行";
//				}else if(ogName.indexOf('惠州') > -1){
//					code = "07";
//					name = "惠州交行";
//				}else if(ogName.indexOf('越秀') > -1){
//					code = "05";
//					name = "广州越秀交行";
//				}else{
//					code = "02";
//					name = "广州本部交行";
//				}
//			}
		}else if(bank.codeName.indexOf('建设') > -1){ //中国建设银行
			img = "jianshe";
		}else if(bank.codeName.indexOf('千引') > -1){ //银联千引支付（手机），放在银联前，优先匹配
			img = "qianyin";
		}else if(bank.codeName.indexOf('银联') > -1){ //中国银联
			img = "yinlian";
		}else if(bank.codeName.indexOf('深圳') > -1){ //深圳发展银行
			img = "shenfazhan";
		}else if(bank.codeName.indexOf('上海') > -1){ //上海银行
			img = "shanghai";
//			if(userInfo.unitCode == "3010100"){
//				if(ogName.indexOf('虹口') > -1){
//					code = "04";
//					name = "上海银行虹口";
//				}else{
//					code = "02";
//					name = "上海银行";
//				}
//			}
		}else if(bank.codeName.indexOf('农业') > -1){ //中国农业银行
			img = "nongye";
//			if(userInfo.unitCode == "5010100"){
//				if(ogName.indexOf('顺德') > -1){
//					code = "12";
//					name = "顺德农业银行-商户号";
//				}else{
//					code = "09";
//					name = "中国农业银行";
//				}
//			}
		}else if(bank.codeName.indexOf('快钱') > -1){ //快钱
			img = "kuaiqian";
		}
		
		bankList += "<li data-value = \'"+ code +"\' value = \'"+ name 
		+ "\'><span class=\' bank-select select-no\'></span><img class=\'bankImg\' src=\'../../images/icon-bank/" + img 
		+".png\'/> <span style=\'color: #333;\'>"+ name +"</span></li>"
	})
	//}
	$("#bankList").html(bankList);
	$("#bankList li .bank-select").bind("click",function(){
		if ($(this).hasClass("select-no")) {
			$(".bank-select.select-yes").removeClass("select-yes").addClass("select-no");
			
			$(this).removeClass("select-no").addClass("select-yes");
			bankCooperant = $(this).parent().attr("data-value");
			bankName = $(this).parent().attr("value");
		} else {
			$(this).removeClass("select-yes").addClass("select-no");
			bankCooperant = "";
			bankName = "";
		}
	});
	setTimeout(function(){
		myScroll.refresh();				
	},300);
}

//初始化合作银行  
function initPayBank() {
	if(codes.BankCooperant.length > 0){
		initBank();
	} else{
		cpic.ui.loading.open();
		Interface.submitFeeListForMobile2(JSON.stringify(policyEos),payWay,bankCooperant,issuecode,function(result){
			if(result.success){
				payNo = result.payNo;
				payCheckCode = result.checkCode;
				var payNoStr = "";
				var l = parseInt(payNo.length/4);
				for(var i=0;i<=l;i++){
					payNoStr += payNo.substring(i*4,(i+1)*4)+"  "
				};
				var succAmount = result.amount;
				var payMethod = "1";
				
				$('#posPayNo').html(payNoStr);
				$("#posPayBankName").html(bankName);
				$('#posPayCheckCode').html(payCheckCode);
				
				$("#pay").bind("click",function(){
					window.location.href = "paySuccess.html?applyNo=" + applyNo;
				});
				
				$("#posPay_1").hide();
				if(payWay == 1) { 
					$("#pay2Name").text("支票支付");
				}
				$("#posPay_2").show();
				$("#insurePayType").hide();
				$("#edit").hide();
				myScroll.refresh();	
				
				Interface.savePayInfo(userInfo.unitCode,userInfo.userCode,applyNo,payCheckCode,"","","","",succAmount,"","",payMethod,"",bankName,"","","",payNo,function(){
					cpic.alert(result.message);
				})
				
			}else{
				cpic.alert("<span class='font08em'>申请支付号失败！</span>");
			}
			cpic.ui.loading.close();
		});
	}
}

var util2 = {
    GetQueryString:function(name)
    {
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null) return  decodeURI(r[2]); return null;
    }
};

function initPayInfo() {
	var html = '';
    var paySsdk = '<div class=\"one_tabs__item\"><input type=\"radio\" name=\"segment-a\" id=\"paySsdk\"><button class=\"one_tabs__button\">实时代扣</button></div>';
    var chinaPay = '<div class=\"one_tabs__item\"><input type=\"radio\" name=\"segment-a\" id=\"chinaPay\"><button class=\"one_tabs__button\">银联</button></div>';
    var payPos = '<div class=\"one_tabs__item\"><input type=\"radio\" name=\"segment-a\" id=\"payPos\"><button class=\"one_tabs__button\">POS</button></div>';
    var payWeixin = '<div class=\"one_tabs__item\"><input type=\"radio\" name=\"segment-a\" id=\"payWeixin\"><button class=\"one_tabs__button\">微信</button></div>';
    var payCheck = '<div class=\"one_tabs__item\"><input type=\"radio\" name=\"segment-a\" id=\"payCheck\"><button class=\"one_tabs__button\">支票</button></div>';
    html =  chinaPay + payPos;
    $(".one_tabs").append(html);
  //北京，投保人或被保人证件类型为身份证、护照、军官证、社保证、军官退休证、台胞证
    if(unitCode=="1010100" ){
    	$('#issuecodeDiv').show();
    }
    
    Interface.queryPayInfoDetail(applyNo,"",function(result){
    	if(result.resultCode == "1"){
    		if(common.isNotNull(result.responseObject.printInterfaceEO.applyNo)){
    			$(".one_tabs").hide();
        		$(".back").hide();
        		$("#insurePayType").hide();
        		$("#edit").hide();
        		
        		var printInterfaceEO = result.responseObject.printInterfaceEO;
        		payCheckCode = printInterfaceEO.taskNo || "";
        		var clitBankdebit = printInterfaceEO.clitBankdebit || "";
        		var payMethod = printInterfaceEO.payMethod;
        		payNo = printInterfaceEO.payApplyNo;
        		var payNoStr = "";
        		var l = parseInt(payNo.length/4);
        		for(var i=0;i<=l;i++){
        			payNoStr += payNo.substring(i*4,(i+1)*4)+"  "
        		};
        		
        		var succAmount = printInterfaceEO.succAmount;
        		$("#sum").html(succAmount);
        		
        		if (payMethod == '2') {
        			payWay = "chinapay";
            		// 银联支付
        			$("#chinaPayDiv").show();
        			
        			$('#chinaPayNo').html(payNoStr);
        			$('#chinaPayCheckCode').html(payCheckCode);
            	} else if (payMethod == "1") {
            		// POS
            		payWay = "2";
            		$("#payPosDiv").show();
            		
        			$('#posPayNo').html(payNoStr);
        			$('#posPayCheckCode').html(payCheckCode);
        			
        			$("#posPay_1").hide();
        			$("#posPay_2").show();
            	}
    		}else{
    			$("#sum").html(totalPremium);
    		}
    	}else{
    		cpic.alert(result.message);
    	}
    })
}