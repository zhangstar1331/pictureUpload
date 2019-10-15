var userInfo;//用户信息
var photoInsurance;//拍照报价对象
var plateNo;//车牌号
var noplatNumClick = "2";;//新车未上牌状态 	1:选中	2:未选中
var plateType;//号牌类型
var plateTypeData;//号牌类型的data-value值
var sellChannel;//业务来源
var sellChannelCode;//业务来源的data-value值
var crmObj;
var mySet;

$(function(){
	bindEvent();//事件绑定
	initPageHTML();//初始化页面数据
});

function initPageHTML(){
	
	if(common.isNull(common.getLocalStorage(Interface.ss.policy,true))){
		common.setLocalStorage(Interface.ss.policy,policyTemplate,true);
	};
	
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true); //获取本地存储的登陆人信息
	mySet = userInfo.mySet;
	photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);
	if((photoInsurance==true) || common.isNull(photoInsurance)){//不存在拍照报价对象 新进页面
		//拍照报价用到的所有
		photoInsurance = {
			"plateNo" :"",	//车牌/车架号 C_PLATE_NO
			"noplatNumClick":"2",	//新车未上牌标记	1选中  2未选中C_NEW_MRK
			"plateType" : "",	//号牌类型
			"plateTypeData" : "",	//号牌类型值 C_PLATE_TYP
			"sellChannel" : "",	//业务来源
			"sellChannelCode" : "",	//业务来源值 C_BSNS_TYP
			"agency" : "",	//代理点C_AGENCY_CDE
			"serveCode" : "",	//服务代码C_SERVICE_CODE
			"serveName" : "",	//服务代码名称
			"c_sls_nme" : "",	//业务员姓名C_SLS_NME
			"c_sls_cde" : "",	//业务员值C_SLS_CDE
			"c_opr_cde" : "",	//录单员code C_OPR_CDE
			"c_opr_nme" : "",	//录单员名称
			"busiNum" : "",	//订单编号
			"taoCanType":"",//套餐类型
			"taoCanTypeName":"",//套餐类型名称
			"photoType" : "",	//照片类型
			"photoTypeName":"",//照片类型名称
			"photoNum" : "",	//照片编号
			"tempPath" : "",	//照片临时路径
			"goSetInsuranceFlag" : "0",	//0正常进入险种勾选  1后退进入险种勾选
			"goImageTypeFlag" : "0",	//0正常进入照片上传  1后退进入照片上传
			"goOrderDetailTypeFlag" : "0",	//0正常进入等待接单  1全部订单页面进入等待接单
			"receiveCode" : "",//接单员工号
			"receiveName" : "",//接单员姓名
			"businessKindCode" : "",	//渠道类型值
			"businessKindName" : ""	//渠道类型名称
		};
		
		Interface.getBusinessSource(token,comCode,function(result){
			var result = JSON.parse(result);
			codeListType = result.crmconfifoeoList1;
			codeListBusness = result.crmconfinfoeoList;
		});
	
			//业务来源
			/*if(common.isNotNull(mySet) && mySet.businessSource){
				var businessSourceOne=mySet.businessSource
				for (var i in codeListBusness ) {
					if(businessSourceOne==codeListBusness[i].confValue) {
						//$('#businessKind').val(codeListType[i].confDesc);
						photoInsurance.sellChannel = codeListBusness[i].confDesc;
						photoInsurance.sellChannelCode =  businessSourceOne;
					}
				}
			}*/
		common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
	}else{//非新进页面
		photoInsurance.goImageTypeFlag = "0";
	}
	$(".home, .back").attr("href","../tool/tools.html");

	plateNo = photoInsurance.plateNo;
	noplatNumClick = photoInsurance.noplatNumClick;
	plateType = photoInsurance.plateType;
	plateTypeData = photoInsurance.plateTypeData;
	sellChannel = photoInsurance.sellChannel;
	sellChannelCode = photoInsurance.sellChannelCode;

	if (noplatNumClick == "1") { //选中状态
		$("#noplatNum").trigger("click");
		if (common.isNotNull(plateNo)&&(plateNo!="*-*")) {  //设置车牌所属值
			$("#plateNo").val(plateNo);
		}
	} else{ //2未选中状态
		if (common.isNotNull(plateNo)&&(plateNo!="*-*")) {  //设置车牌所属值
			$("#plateNo").val(plateNo);
		} else {
			//获取当前登录用户所在分公司地区码首位
			//$('#plateNo').val(C.getPlateNoPrefix(userInfo.comCode));
			//$('#plateNo').val("沪");
			var unitCode = userInfo.comCode;
			var plateNoFirstName = common.getProvice(unitCode.substring(0, 2)) || "";
			$("#plateNo").val(plateNoFirstName);
		}
	}
	
	if (common.isNotNull(plateType) && common.isNotNull(plateTypeData)) {//设置号牌类型
		$('#BizVehicleMadeType').val(plateType)
		$('#BizVehicleMadeType').attr('data-value',plateTypeData);
	}
	
	if(common.isNotNull(sellChannel)){//设置业务来源
		$("#busiCode").val(sellChannel);
		$('#busiCode').attr('data-value',sellChannelCode);//需要字典值
	}
	
}


function bindEvent(){

    /*车牌号验证失去焦点*/
	$('#carNum').on("blur", function() {
		var carNo = $("#carNum").val().toUpperCase().trim(); //车牌号
		if (common.isNotNull(carNo)) {
			if (/^[LS]{2}/.test(carNo)) {
				if (!/^[LS]{2}[A-Z0-9]{2,}$/.test(carNo)) {
					cpic.Prompt("车牌号码不正确");
				}
			} else if (!common.checkLicenseNo(carNo)) {
				cpic.Prompt("车牌号码不正确");
			}
		}
	});
	

	//使用号牌类型选择点击
	$('#div_BizVehicleMadeType').on("click",function(){
		 var dataList;
		 var params = [];
		 Interface.getPlateType(userInfo.userToken,function(result){
		 	dataList = result;
		 });
		 for(var i=0; i<dataList.length; i++){
		 	params.push(dataList[i].confDesc);
		 }
		 var defaultVal = params[0];
		 $("#BizVehicleMadeType").scratcher(params,defaultVal,function(data){
		 	for(i in dataList){
		 		if(dataList[i].confDesc == data){
		 			$("#BizVehicleMadeType").attr('data-value',dataList[i].confValue);
		 		}
		 	}
		 	$("#BizVehicleMadeType").val(data);
		 	photoInsurance.plateTypeData = $("#BizVehicleMadeType").val();
		 	photoInsurance.plateTypeData = $("#BizVehicleMadeType").attr("data-value");
		 });
	});

	$("#choosePlateNumber ul li").bind("click",function(){
		$("#choosePlateNumber ul li").find("a").removeClass("active");
		$(this).find("a").addClass("active");
		$("#carInsurance").show();
		$("#choosePlateNumber").hide();
		$("#plateNumber").val($(this).find("a").text());
		myScroll.refresh();
	});

	$("#choosePlateNumberBack").bind("click",function(){
		$("#carInsurance").show();
		$("#choosePlateNumber").hide();
		myScroll.refresh();
	});

	$("#noplatNum").bind("click",function(){
		if($(this).hasClass("border_icon")){
			$(this).removeClass("border_icon").addClass("border_icon_yes");
			//$("#plateNo").attr("placeholder","请输入车架号");
			$("#plateNumberDiv").hide();
			noplatNumClick = "1";//1选中
			$("#plateNo").val("");
		}else{
			$(this).removeClass("border_icon_yes").addClass("border_icon");
			//$("#plateNo").attr("placeholder","请输入车牌/车架号");
			$("#plateNumberDiv").show();
			noplatNumClick = "2";//2未选中
			var unitCode = userInfo.comCode;
			var plateNoFirstName = common.getProvice(unitCode.substring(0, 2)) || "";
			$("#plateNo").val(plateNoFirstName);
		}
	});
	
	
	/*function noplatNumClick(){
		if($(this).hasClass("border_icon")){
			$(this).removeClass("border_icon").addClass("border_icon_yes");
			$("#plateNo").attr("placeholder","请输入车架号");
			noplatNumClick = "1";//1选中
			//$("#plateNo").val("");
		}else{
			$(this).removeClass("border_icon_yes").addClass("border_icon");
			$("#plateNo").attr("placeholder","请输入车牌/车架号");
			noplatNumClick = "2";//2未选中
			//$("#plateNo").val("");
		}
	}*/
	
	//跳转页面时的保存
	$("#businessSource").bind("click",function(){
		var plateNo_ = $.trim($('#plateNo').val());//保存车架号
		if(common.isNotNull(plateNo_)){
			photoInsurance.plateNo = plateNo_;
		}
		photoInsurance.noplatNumClick = noplatNumClick;//保存新车未上牌标记
		
		
		var BizVehicleMadeType = $('#BizVehicleMadeType').val();
		var BizVehicleMadeTypeCode  =  $("#BizVehicleMadeType").attr('data-value');
		photoInsurance.plateType = BizVehicleMadeType;	//号牌类型
		photoInsurance.plateTypeData = BizVehicleMadeTypeCode;	//号牌类型值
		
		common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);//保存到缓存中
		window.location.href="../cameraQuote/businessSource.html";
	});


	$("#submit").bind("click",function(){
		plateNo = $("#plateNo").val().replace(/\s/g,"").toUpperCase();
		if(!$("#noplatNum").hasClass("border_icon_yes")){//新车未上牌 未勾选
//			if(common.isNotNull(plateNo)){
				if (plateNo.length == 17) {
					var error = common.checkVinCode(plateNo, unitCode);
					if (error != "") {
						cpic.alert(error);
						return;
					}
				} else {
					//殷利春 删除车架号校验 简单小于8位校验
					if (plateNo.length > 8 || plateNo.length == 0 ) {
						cpic.alert("请输入正确的车牌号");
						return;
					}
					
					/*if (!common.checkLicenseNo(plateNo)) {
						cpic.alert("请输入正确的车牌号");
						return;
					}*/
				}
//			}else{
//				cpic.alert("请输入车牌号");
//				return;
//			}
		}
		
		if($("#busiCode").val() == "请选择"){
			cpic.alert("请选择业务来源！");
			return;
		}
        
		var BizVehicleMadeType = $('#BizVehicleMadeType').val();
		var BizVehicleMadeTypeCode  =  $("#BizVehicleMadeType").attr('data-value');
		var sellChannel = $("#busiCode").val();
		var sellChannelCode = $("#busiCode").attr("data-value");

		// 拍照报价检查续保情况：
		// 当输入车牌号或车架号时候，检查是否存在续保单
		// 如果存在，则跳转到主流程-续保流程
		// 如果不存在，则继续拍照报价流程

		var goPhotoPath = function(){
			if(noplatNumClick=='1'){
				photoInsurance.plateNo = "*-*";	//车牌/车架号
			}else{
				photoInsurance.plateNo = plateNo;	//车牌/车架号
			}
			
			photoInsurance.noplatNumClick = noplatNumClick;	//新车未上牌标记	1选中  2未选中
			photoInsurance.plateType = BizVehicleMadeType;	//号牌类型
			photoInsurance.plateTypeData = BizVehicleMadeTypeCode;	//号牌类型值
			photoInsurance.sellChannel = sellChannel;	//业务来源
			photoInsurance.sellChannelCode = sellChannelCode;	//业务来源值
			common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
			window.location.href = 'choosingImage.html';
		}

		var xubaoFunction = function(result){
			if( result.resultCode == '0000' ){
				var policy = common.getLocalStorage(Interface.ss.policy, true);
				if( policy ){
					if( policy.vhl_info ){
						policy.vhl_info.c_new_vhl_flag = 1;
						if (plateNo.length == 17) {
							policy.vhl_info.c_frm_no = plateNo; //判断用户是否输入的是车架号
						} else {
							policy.vhl_info.c_plate_no = plateNo;
						}
						policy.vhl_info.c_plate_typ = BizVehicleMadeTypeCode;
					}
					if( policy.base_part ){
						policy.base_part.c_bsns_typ = sellChannelCode;
						policy.base_part.c_dpt_cde = userInfo.comCode;
						policy.base_part.business_kind = photoInsurance.businessKindCode;
						policy.base_part.c_sls_cde = photoInsurance.c_sls_cde;
					}
					if(policy.base_part.c_dpt_cde){
						policy.base_part.c_ply_dpt_cde = policy.base_part.c_dpt_cde.substring(0,6);
					};
					localStorage.setItem('plateNo',$.trim(plateNo));
					common.setLocalStorage(Interface.ss.unitDef,unitDef,true);
					common.setLocalStorage(Interface.ss.policy, policy, true);
					var orderInfos = {};
					/*业务来源放入订单信息中*/
					orderInfos.cBsnsTyp = policy.base_part.c_bsns_typ || "";
					/*服务代码放入订单信息中*/
					orderInfos.cServiceCode = policy.base_part.c_service_code;
					/*业务员code放入到订单信息中*/
					orderInfos.cSlsCde = policy.base_part.c_sls_cde;
					/*渠道类型放入订单信息中*/
					orderInfos.sinChannelNam = policy.base_part.business_kind;
					/*车牌号放入订单信息中*/
					orderInfos.c_PlateNo = policy.vhl_info.c_plate_no;
					temporaryId = Config.transportPolicytoBackSystem("00", "01", orderInfos, policy);
					/*塞入订单号 订单号和暂存ID是同一个*/
					orderInfos.c_OrderNo = temporaryId;
			        /*订单节点放入缓存中 存放在unitDef 中*/
			        if(orderInfos){
			        	common.setLocalStorage(Interface.ss.orderInfos,orderInfos,true);
			        };

					/*暂存ID 放入缓存中*/
					if(temporaryId){
						common.setLocalStorage("temporaryId",temporaryId,true);
					};
				}

				window.location.href = '../newInsV2/insureEquityPeople.html?version=1';
			}else{
				goPhotoPath();
			}
		}

		if( noplatNumClick != '1' ){
			if ( plateNo.length == 17 ){
				// 车架号分支
				Interface.getRePolixy(token, '', '', '3', '', plateNo, xubaoFunction);
			}else{
				// 车牌分支
				Interface.getRePolixy(token, '', '', '3', plateNo, '', xubaoFunction);
			}
			return;
		}
		goPhotoPath();
	});
}

