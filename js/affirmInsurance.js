/*var policy;
var userInfo;
var token;
var insuranceParam;//用户选择的险种给后一个页面和本页面回调时用
var jsonParamsForWeb;//用户选择的险种传给后台
var photoInsurance;//拍照报价对象

$(function(){
	insuranceParam = common.getLocalStorage(Interface.ss.insuranceParam,true);
	jsonParamsForWeb = common.getLocalStorage(Interface.ss.jsonParamsForWeb,true);
	photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true); //获取本地存储的登陆人信息
	token = userInfo.userToken;  //token用来判断登陆是否过期
	photoInsurance.goSetInsuranceFlag = "1";//回退进入标记
	common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
	initPages();
	bindEvent();
});


function initPages() {
	
	//insuranceParam = localStorage.getItem('insuranceParam');
	//var jsonParam = eval( "(" + insuranceParam + ")" );//转换后的JSON对象
	
	//商业
	var business = insuranceParam.business;
	var bzStartTime = business.bzStartTime;
	var bzEndTime = business.bzEndTime;
	$("#bzStartTime").val(bzStartTime);
	$("#bzEndTime").val(bzEndTime);
	var busiObjs = business.busiObjs;
	var htmlSy = "";
	for (var i = 0; i < busiObjs.length; i++) {
		var busiObj = busiObjs[i];
		var name = busiObj.name;
		var value = busiObj.value;
		htmlSy += '<tr><th class="th-right">'+name+'</th><th class="th-right" style="padding-right:4%;">'+value+'</th><th class="th-right" style="padding-right: 3%;"></th></tr>';
	}
	$("#coverageListHtml").append(htmlSy);
	
	//交强
	var traffic = insuranceParam.traffic;
	var tcStartTime = traffic.tcStartTime;
	var tcEndTime = traffic.tcEndTime;
	$("#tcStartTime").val(tcStartTime);
	$("#tcEndTime").val(tcEndTime);
	var trafficObjs = traffic.trafficObjs;
	var htmlJt = "";
	for (var i = 0; i < trafficObjs.length; i++) {
		var trafficObj = trafficObjs[i];
		var name = trafficObj.name;
		var value = trafficObj.value;
		if(name=='纳税状态'||name=='减免类型'){
			value = getValueShow(name,value);
		}
		htmlJt += '<tr><th class="th-right">'+name+'</th><th class="th-right" style="padding-right:4%;">'+value+'</th><th class="th-right" style="padding-right: 3%;"></th></tr>';
	}
	$("#coverageListHtml").append(htmlJt);
	
	
	function getValueShow(name,value){
		var valueShow = "";
		if(name=='纳税状态'){
			if(value=="01"){
				valueShow = "正常纳税";
			}else if(value=="02"){
				valueShow = "已完税";
			}else if(value=="03"){
				valueShow = "可减免税";
			}
		}else if(name=='减免类型'){
			if(value=="01"){
				valueShow = "具备减免税证明";
			}else if(value=="02"){
				valueShow = "拖拉机";
			}else if(value=="03"){
				valueShow = "军队、军警专用车";
			}else if(value=="04"){
				valueShow = "警车";
			}else if(value=="05"){
				valueShow = "外国使领馆、国际组织及06其人员";
			}else if(value=="07"){
				valueShow = "其他";
			}else if(value=="08"){
				valueShow = "节约能源减半";
			}else if(value=="09"){
				valueShow = "新能源全免";
			}
		}
		return valueShow;
	}
}

var objModel ={
	    init:function(){
	        this.bindEvent();
	        this.save();
	    },
	    bindEvent:function(){
	        $('header .home').on('singleTap', this.home);
	        $('header .back').on('singleTap', this.back);
	    },
	    submit:function(jsonParamsForWeb){
	    	cpic.ui.loading.open();
	        $.ajax({
	            async : true,
	            url:"/cic-crm-web/cic/saveNewTemporary.do",
	            type:'POST',
	            dataType:'json',
	            timeout : '30000',
	            headers: {"token":token},
	            data:JSON.stringify(jsonParamsForWeb),
	            success:function(data){
	            	
	            	cpic.ui.loading.close();
	              var jsonStr = JSON.stringify(data);
	              console.log("sucess:"+jsonStr);
	              
	              if(data&&data.resultCode=='0000'){//0000成功 	
	            	  //var recordsTotal = data.recordsTotal;//前面还有多少单
	            	  photoInsurance.busiNum = data.orderNo;//设置订单编号
			          common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
	            	  window.location.href = 'orderDetail.html?';
	              }else{//1失败
	            	  cpic.alert(data.message);
	              }
	            },
	            error:function(data){
	            	cpic.ui.loading.close();
	            	var jsonStr = JSON.stringify(data);
	            	console.log("error:"+jsonStr);
	            },
	        });
	    },
	    save:function(jsonParamsForWeb){
	      this.submit(jsonParamsForWeb);
	    },
	    back:function(){
	        history.go(-1);
	    },
	    home:function(){
	        location.href = '../tool/tools.html';
	    }
	};


function bindEvent() {
	
	$("#updateInsurance").click(function(){
		photoInsurance.goSetInsuranceFlag = "1";//回退进入标记
		common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
		history.go(-1);
	});

	$("#submit").click(function(){
		objModel.save(jsonParamsForWeb);
	});
}
*/