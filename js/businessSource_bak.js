var policy;
var userInfo;
var unitCode;
var crmObj;
var unitDef;
var multiHandler;
var customFlag ;//交叉销售登录手机号
var partnerCodeFlag = false;//合作伙伴标志
var businessSourcePackage; //业务来源套餐
var businessSource = {};
var comCode;
businessSource.baseInfo = {};
businessSource.vehInfo = {};
businessSource.inputor = {};
businessSource.agents = [];
var codeListType;//渠道类型
var codeListBusness;//业务来源
var agentcode;//代理点
var checkNum;
var agentCode;
var loginDetail = common.getLocalStorage(Interface.ss.loginDetail,true);
var businessSourceTwo=[];
userInfo = util.getLocalStorage(Interface.ss.userInfo,true);
//渠道类型初始值
var codeListTypefirst;
var photoInsurance;//拍照报价对象

$(function(){
	photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);
	policy = common.getLocalStorage(Interface.ss.policy,true);

	/**
	 * 初始化页面数据
	 */
	initPageHTML();
	/**
	 * 绑定事件
	 */
	bindEvent();
});




// console.log(userName,userCode);
function initPageHTML(){
	
	
	
	if(photoInsurance.sellChannelCode!=''){
		$("#businessKind").val(photoInsurance.businessKindName);	//渠道类型ok
		$("#businessKind").attr("data-value",photoInsurance.businessKindCode);	//渠道类型值ok
		$("#sellChannel").val(photoInsurance.sellChannel);	//业务来源ok
		$("#sellChannel").attr("data-value",photoInsurance.sellChannelCode);	//业务来源值ok
		$('#agency').val(photoInsurance.agency);//代理点
		$("#serveCode").attr('data-value',photoInsurance.serveCode);	//服务代码ok
		$("#serveCode").val(photoInsurance.serveName);
		$("#agentsPerson").val(photoInsurance.c_sls_nme);	//业务员ok
		$("#agentsPerson").attr("data-value",photoInsurance.c_sls_cde);	//业务员值ok
		
		
		if($("#sellChannel").val().indexOf("直销")){
			$('#agencyLi').show();
		}else {
			$('#agencyLi').hide();      //业务来源是公司直营门店，或直拓时,直接隐藏
		};
		
	}

	codeListTypefirst = $("#businessKind").val();


	/*业务员信息 从之前的页面获取*/

	userName= userInfo.userName;
	userCode = userInfo.userCode;
	token=userInfo.userToken;
	comCode=userInfo.comCode;
	userCode = userInfo.userCode;
	teamCode = userInfo.teamCode;
	mySet = userInfo.mySet;
//	//获取分公司差异化数据
	unitDef = common.getLocalStorage(Interface.ss.unitDef,true);
	// unitCode = "5020100";

//渠道类型

	Interface.getBusinessSource(token,comCode,function(result){
		var result = JSON.parse(result);
		codeListType = result.crmconfifoeoList1;
		codeListBusness = result.crmconfinfoeoList;
	});
	if (mySet!=''&&mySet!=undefined) {
		//渠道类型
		var channelType=mySet.channelType;
		if(channelType){
			for (var i in codeListType ) {
				if(channelType==codeListType[i].confValue) {
					$('#businessKind').val(codeListType[i].confDesc);
					$('#businessKind').attr("data-value",channelType);
				};
			};
		};
		
		//业务来源
		if(mySet.businessSource){
			var businessSourceOne=mySet.businessSource
			for (var i in codeListBusness ) {
				if(businessSourceOne==codeListBusness[i].confValue) {
					//$('#businessKind').val(codeListType[i].confDesc);
					$('#sellChannel').val(codeListBusness[i].confDesc);
					$('#sellChannel').attr("data-value",businessSourceOne);
				}
			}
		}
		
		//服务代码
		if(mySet.serviceCode){
			$('#serveCode').val(mySet.serviceCodeName);
			$('#serveCode').attr("data-value",mySet.serviceCode);
			//$('#serveCode').attr("data-id",mySet.serviceNo)
		}
		//录单员
		/*if(mySet.operator){
			$('#inputer').val(mySet.operator);
			$('#inputer').attr("data-id",mySet.operatorCode)
		}*/

	}
	crmObj = common.getLocalStorage(Interface.ss.crmObj,true);
	businessSourceLocal = common.getLocalStorage(Interface.ss.businessSource,true);
	
	$("#businessKindLi").show();
	var threeCode = common.getLocalStorage("threeCode",true);
	
	var businessSource = common.getLocalStorage("businessSource",true);
	
	/*由于业务员是从tools页面带来，所以取localstorage中的值初始化业务员*/
	$("#agentsPerson").val(userName);
	$("#agentsPerson").attr("data-value",userCode);

}

function bindEvent(){
	//业务来源点击事件
	$("#sellChannelLi").on("click",function(){
		if ($("#businessKind").val() == "请选择" ) {
			cpic.Prompt("请先选择渠道类型");
			return;
		};
		/*返回页面回值时，由于渠道类型已经回值，用户不用点击渠道类型，这样业务来源接口会返回空值*/
		var businessKindCode = $("#businessKind").attr("data-value");
		if (businessKindCode && $.isEmptyObject(businessSourceTwo)) {
			for (var i in codeListBusness) {
				if (codeListBusness[i].confValue.trim().indexOf(businessKindCode.trim()) > -1) {
					businessSourceTwo.push(codeListBusness[i]);
				};
			};
		};
		var params = [];
		for (var i = 0; i < businessSourceTwo.length; i++) {
			params.push(businessSourceTwo[i].confDesc);
		}

		var defaultVal = params[0];
		$("#sellChannel").scratcher(params, defaultVal, function(result){
			for (var i = 0; i < businessSourceTwo.length; i++) {
				if (businessSourceTwo[i].confDesc == result) {
					$("#sellChannel").attr("data-value",businessSourceTwo[i].confValue);
					console.log(businessSourceTwo[i].confValue);
					break;
				};
			};

			$('#sellChannel').val(result);

			if($("#sellChannel").val().indexOf("直销")){
				$('#agency').attr('placeholder','必填');
				$('#agencyLi').show();
				$('#agency').val('');
				$('#agency').attr('data-value', '');
			}else {
				$('#agency').attr('placeholder','');
				$('#agencyLi').hide();      //业务来源是公司直营门店，或直拓时,直接隐藏
				$('#agency').val('');
				$('#agency').attr('data-value', '');
			};
			/*if(dataCode != '11' && dataCode != '12'){
				// 业务来源是公司直营门店，或直拓时，不允许设置代理点。
				$('#agency').attr('placeholder','必填');
				$('#agencyLi').show();
				$('#agency').val('');
				$('#agency').attr('data-value', '');
			}else{
				$('#agency').attr('placeholder','');
				$('#agencyLi').hide();//业务来源是公司直营门店，或直拓时,直接隐藏
				$('#agency').val('');
				$('#agency').attr('data-value', '');
			}*/
			/*if(dataCode == '25' || dataCode == '32'|| dataCode == '36'){
				//个代产、团代产、寿险营销便利店  则需录入代理点交叉渠道业务来源 寿险营销员
				$("#lifePersonLi").show();
				$("#crossChannelLi").show();
				$("#agencyLi").show();
				if(common.isNull(policy.baseInfo.agencyCode)){
					if(unitCode=="5020100"){
						$("#agency").val("中国公司名2人寿保险股份有限公司深圳分公司");
						$('#agency').attr('data-value','921');
						$("#agency").attr("name", "中国公司名2人寿保险股份有限公司深圳分公司");
					}
				}//交叉销售渠道默认01
				$("#crossChannel").val("传统交叉");
				$('#crossChannel').attr('data-value', '01');
			}else{
				$("#lifePersonLi").hide();
				$("#crossChannelLi").hide();
				$('#crossChannel').attr('data-value', '');
				$("#lifeAgent").attr('data-value','');
				$("#lifeAgent").val();
			}*/
		});
	});
	
	// if ($("#agency").attr("display") != "none") {
	$('#agencyLi').on('click', function() {
		/*if (common.isNotNull(userInfo.personInfo.agencyCode) && common.isNotNull(loginDetail.mobilePhone) || common.isNotNull(carInsureParam.agencyCode)) {
			return false;
		}*/
		var sellChannel = $('#sellChannel').attr('data-value');
		if (sellChannel == '11' || sellChannel == '12') {
			// 业务来源是公司直营门店，或直拓时，不允许设置代理点。
			cpic.alert("<span class='font08em'>业务来源是公司直营门店，或直拓时，不允许设置代理点！</span>");
			return;
		}

		var html = '<div id="codeListDiv"  class="jumpbox" style="bottom:0;top:0;overflow:auto; display:none;">';
		html += '</div>';
		$('body').append(html);

		$.ajax({
			async: true,
			url: 'agency.html',
			type: 'GET',
			dataType: 'html',
			timeout: '30000',
			success: function(result) {
				$('#codeListDiv').html(result);
				$('#codeListDiv').show();
				$(".main").css("height", ($(window).height() / 16 - 5.7) + "em");

				loaded();
				changeHeight();
				// myScroll2.refresh();
			},
			error: function(result) {
				if (error && (error instanceof Function)) {
					error.call(window, result);
				} else {
					cpic.ui.loading.close();
					cpic.Prompt("网络连接失败");
				}
			}
		});

	});
	// }

	/*业务种类点击事件  渠道类型*/
	$('#businessKindLi').on("click",function(){
		businessSourceTwo=[];
		/*修改于 2017年2月28日20:35:40 zhou*/

		var params = [];

		for(var i = 0; i<codeListType.length; i++){
			params.push(codeListType[i].confDesc);
		};
		var defaultVal = params[0];
		$("#businessKindLi").scratcher(params,defaultVal,function(result){
			 
			//var dataCode = {};
			//dataCode.confValue = result;
			for (var i = 0; i < codeListType.length; i++) {
				if (codeListType[i].confDesc == result) {
					$("#businessKind").attr("data-value",codeListType[i].confValue);
					//break;
				}
			}
			var dataStart=$("#businessKind").attr('data-value');
				console.log(dataStart);
			for(var i in codeListBusness){
				if(codeListBusness[i].confValue.trim().indexOf(dataStart.trim())>-1){
					businessSourceTwo.push(codeListBusness[i]);
					console.log(codeListBusness[i].confValue)
				}
			}
			console.log(businessSourceTwo);
			$("#businessKind").val(result);
			if($("#businessKind").val() != codeListTypefirst ) {
				$('#sellChannel').val('请选择');
				$('#sellChannel').attr('data-value','');
				$('#serveCode').val('请选择');
				$('#serveCode').attr('data-value','');

			}
			//$('#businessKind').attr('data-value',dataCode.confValue);
		});
	});

	//渠道合作代码
	//$('#cooperationLi').bind('click',function(){
	//	var defaultVal = "招标业务";
	//	var params = ["普通业务","招标业务","电子商务业务(B2B业务)","全国统保业务","产寿联动业务","私车团购业务","车改车业务","4S店业务","新车共保业务","银保业务","电销业务","4S渠道业务","B2B(4S渠道业务)"];
	//	$("#cooperationLi").scratcher(params,defaultVal,function(result){
	//		$('#cooperation').val(result);
	//	});
	//});
    //
    /*新增服务代码于2017年2月24日13:50:34*/

    $('#serveCodeLi').bind('click',function(){

    	if ($("#businessKind").val() == "请选择" || $("#sellChannel").val() == "请选择") {
			cpic.Prompt("请先选择渠道类型和业务来源");
			return;
		};
		if ($("#agency").is(':visible')) {
			if($("#agency").val() == '') {
				cpic.Prompt('请选择代理点');
				return;
			} else {
			  var	agentCode =$("#agency").attr('data-value');
			}
		};
    	var params = [];																		
    	var codeList = [];
		var channelType=$('#businessKind').attr('data-value').trim();
		var businessSource=$('#sellChannel').attr('data-value').trim();
		 
		Interface.serviceCodeOne(token, userCode, comCode, agentCode, channelType, businessSource, function(result) {
			if (result) {
				if (result.return1 && result.return1.servicecodeList ) {
					codeList = result.return1.servicecodeList;
					for (var i = 0; i < codeList.length; i++) {
						params.push(codeList[i].serviceName);
					};
				};
			};
		});
    	
    	var defaultVal = params[0];
    	$('#serveCode').scratcher(params,defaultVal,function(result){
			// var serviceNo;
			for (var i = 0; i < codeList.length; i++) {
				if (codeList[i].serviceName == result) {
					$('#serveCode').attr('data-value',codeList[i].serviceNo); 
					break;
				};
			};
			$("#serveCode").val(result);
    	});
    });
    
	//录单员
	/*$('#inputerLi').bind('click',function(){
		var html = '<div id="codeListDiv"  class="jumpbox" style="bottom:0;top:0; display:none;">';
		html += '</div>';
		$('body').append(html);

		$.ajax({
			async : true,
			url : 'inputer.html',
			type : 'GET',
			dataType : 'html',
			timeout : '30000',
			success : function(result) {
				$('#codeListDiv').html(result);
				$('#inputer').val(result);
				$('#codeListDiv').show();
				loaded();
				changeHeight();
				myScroll2.refresh();
			},
			error : function(result) {
				if (error && (error instanceof Function)) {
					error.call(window, result);
				}else{
					cpic.ui.loading.close();
					cpic.Prompt("网络连接失败");
				}
			}
		});

	});*/

	$('#deleteBusinessSource').bind('click',function(){
		updateBusinessSource(0,0);//删除业务来源
	});
	
	//function checkInput(){
	//	if($('#sellChannel').val()=="请选择"&&$('#serveCode').val() == ''&&$('#serveCode').val() == ''&&$('#inputer').val()=="请选择"){
	//		return checkNum = 0;
	//	} else {
	//		return  checkNum = 1;
	//	}
	//}
	function checkInput(){
		if($('#businessKind').val()=="请选择"&&$('#sellChannel').val()=="请选择"&&$('#serveCode').val() == ''&&$('#serveCode').val() == ''){
			checkNum = 0;
		} else {
			checkNum = 1;
		}
	}
	//点击确认保存缓存
	$("#submit").bind("click",function(){
		checkInput();
		//渠道类型
		if($('#businessKind').val()=="请选择"){
			var businessKind='';//渠道类型
			var channelTypeName='';
			cpic.alert("请选择渠道类型");
			return;

		} else {
			var businessKind=$('#businessKind').attr('data-value');//渠道类型
			var channelTypeName=$('#businessKind').val();
		}
		//业务来源
		if($('#sellChannel').val()=="请选择"){
			var sellChanne='';//业务来源
			var businessSourceName = '';
			cpic.alert("请选择业务来源");
			return;
		} else {
			var sellChanne = $('#sellChannel').attr('data-value');//业务来源
			var businessSourceName = $('#sellChannel').val();
		}
		
		if ($("#agency").is(':visible')) {
			if($("#agency").val() == '') {
				cpic.alert('请选择代理点');
				cpic.ui.loading.close();
				return;
			} else {
				var	agentCode =$("#agency").attr('data-value');
			}
		};
		
		//服务代码
		if ( $.trim($('#serveCode').val()) == ''||$('#serveCode').val() == "请选择") {
			var serveCode='';//服务代码
			var serviceName = '';
			cpic.alert("请选择服务代码");
			return;
		} else {
			var serveCode=$('#serveCode').attr('data-value');//服务代码
			var serviceName=$('#serveCode').val();//服务代码
		}
		//录单员
		//录单员代码
		/*if($('#inputer').val()=="请选择"){
			var inputer='';//录单员
			var operatorCode='';//录单员代码
		} else {
			var inputer=$('#inputer').val();//录单员
			var operatorCode=$('#inputer').attr('data-id');//录单员代码
		}*/
		//代理点
		if($('#agency').val()==""){
			var agency='';//录单员
			var agencycode='';//录单员代码
		} else {
			var agency=$('#agency').val();//录单员
			var agencycode=$('#agency').attr('data-value');//录单员代码
		}
		 cpic.ui.loading.open();
		var param={

			"userCode":userCode,//用户代码
			"channelType":businessKind,//渠道类型
			"channelTypeName":channelTypeName,//渠道类型名称
			"businessSource":sellChanne,//业务来源
			"businessSourceName":businessSourceName,//业务来源名称
			"serviceCode":serveCode,//服务代码
			"serviceCodeName":serviceName,
			//"operator":inputer,//录单员
			"operatorCode":"",//录单员代码
			'agentCode':"",//或者为2015A42051
		};
		console.log(JSON.stringify(param));
		cpic.ui.loading.close();
			
			//var inputer = $("#inputer").val();
			//inputer = (inputer=="必填"?inputer:"");
			
			photoInsurance.businessKindName = $("#businessKind").val();	//渠道类型ok
			photoInsurance.businessKindCode = $("#businessKind").attr("data-value");	//渠道类型值ok
			photoInsurance.sellChannel = $("#sellChannel").val();	//业务来源ok
			photoInsurance.sellChannelCode = $("#sellChannel").attr("data-value");	//业务来源值ok
			photoInsurance.agency = $('#agency').val();//代理点
			photoInsurance.serveCode = $("#serveCode").attr('data-value');	//服务代码ok
			photoInsurance.serveName = $("#serveCode").val();
			photoInsurance.c_sls_nme = $("#agentsPerson").val();	//业务员ok
			photoInsurance.c_sls_cde = $("#agentsPerson").attr("data-value");	//业务员值ok
//			photoInsurance.c_opr_cde = $('#inputer').attr("data-id");	//录单员代码
//			photoInsurance.c_opr_nme = $('#inputer').val();	//录单员
			
			common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
			
			window.location.href="../cameraQuote/carInsurance.html";
		
			//window.history.go(-1);
			//window.location.reload();
		//把 业务来源busiCode、业务种类businessKind、渠道合作代码（车商代码）brandCode、经办人assesResponsible 写入locaStorage
//			var threeCode={
//				"busiCode":"",
//				"brandCode":"",
//				"assesResponsible":"",
//				"businessKindCode":""
//			};
 	

		/*新增渠道类型到policy中于2017年2月27日16:19:20 渠道类型  新增的*/
		var  v= $("#businessKind").attr("data-value");

 		/*业务来源 修改于2017年2月27日16:22:20*/
 			var sellChannel = $("#sellChannel").val();
 			var sellChannelCode = $("#sellChannel").attr("data-value");


	});

	//选择验车情况
	var vehicleInspection = [{"code":"01","codeName":"免验车"},{"code":"02","codeName":"已验车合格"},{"code":"03","codeName":"待验车"}];
	$('#vehicleInspection').bind('click', function() {
		 Config.common_click(vehicleInspection,'',function(data) {
			  if (data.code) {
				  $('#trans_vehicleInspection').val(data.codeName);
				  $('#trans_vehicleInspection').attr('data-value', data.code);
			  }
		  },false);
	});
	//选择综合情况
	var globalTypeCodes = [
	           	        {"code":"A","codeName":"A"},
	           	        {"code":"B","codeName":"B"},
	           	        {"code":"C","codeName":"C"},
	           	        {"code":"D","codeName":"D"},
	           	        {"code":"E","codeName":"E"},
	           	        {"code":"F","codeName":"F"},
	           	        {"code":"G","codeName":"G"},
	           	        {"code":"H","codeName":"H"},
	           	        {"code":"I","codeName":"I"},
	           	        {"code":"J","codeName":"J"}];
	$('#search_globalType').bind('click', function() {
	  Config.common_click(globalTypeCodes,'',function(data) {
		  if (data.code) {
			  $('#vehInfo_globalType').val(data.codeName);
			  $('#vehInfo_globalType').attr('data-value', data.code);
		  }
	  },false);
	});
}

