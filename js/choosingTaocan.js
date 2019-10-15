var crmObj;
var token;
var photoInsurance;//拍照报价对象
var policy = common.getLocalStorage(Interface.ss.policy,true);

function goTo(taoCanType,taoCanTypeName){
	photoInsurance.taoCanType = taoCanType;
	photoInsurance.taoCanTypeName = taoCanTypeName;
	common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
	
	var param = {"setCode":photoInsurance.taoCanType};
	policy.cvrg_list_biz = {};
  	
	Interface.getMyTaocanSet(token,param,function(data) {
		var resultCode = data.resultCode;
		nowDateTime = data.startTime; 
		
		if(resultCode=='1'){//成功
			var cicSetInfoList = data.cicSetInfoList;
			var jsonStr = JSON.stringify(cicSetInfoList);
		    console.log("接口："+jsonStr);
		    
			for (var i = 0; i < cicSetInfoList.length; i++) {
				
				var cicSetInfo = cicSetInfoList[i];//险种对象
				var c_cvrg_no = cicSetInfo.c_cvrg_no;//险种代码
				var n_amt = common.isNull(cicSetInfo.n_amt)?"":cicSetInfo.n_amt;//保额或其他默认值
				var n_amt_per = common.isNull(cicSetInfo.n_amt_per)?"":cicSetInfo.n_amt_per;//座位数量
				var n_liab_days_lmt = common.isNull(cicSetInfo.n_liab_days_lmt)?"":cicSetInfo.n_liab_days_lmt;//每座保额
				var c_glass_type = common.isNull(cicSetInfo.c_glass_type)?"":cicSetInfo.c_glass_type;// 国产玻璃 - 303011001，进口玻璃 - 303011002
				var c_specglass_mrk = common.isNull(cicSetInfo.c_specglass_mrk)?"":cicSetInfo.c_specglass_mrk;// 是否防弹标志：0 - 不防弹
				var n_compen_lim_day = common.isNull(cicSetInfo.n_compen_lim_day)?"":cicSetInfo.n_compen_lim_day;//天数
				var n_compen_day_amt = common.isNull(cicSetInfo.n_compen_day_amt)?"":cicSetInfo.n_compen_day_amt;//每日补贴额度
				var n_rate = common.isNull(cicSetInfo.n_rate)?"":cicSetInfo.n_rate;//国产0.15 进口0.3
		
				var obj =  new Object();
				obj.n_seq_no = Number(i);
				obj.n_deductible = "";
				obj.c_cvrg_no = c_cvrg_no;
				obj.n_amt = n_amt;
				obj.n_amt_per = n_amt_per;
				obj.n_liab_days_lmt = n_liab_days_lmt;
				obj.c_glass_type = c_glass_type;
				obj.c_specglass_mrk = c_specglass_mrk;
				obj.n_compen_lim_day = n_compen_lim_day;
				obj.n_compen_day_amt = n_compen_day_amt;
				obj.n_rate = n_rate;
				
				policy.cvrg_list_biz["biz_"+c_cvrg_no] = obj;
			}
			common.setLocalStorage(Interface.ss.policy,policy,true);
			
			var jsonStr = JSON.stringify(policy.cvrg_list_biz);
			console.log("转换后："+jsonStr);
			
			window.location.href ='../cameraQuote/setInsurance.html';
		}else{
			cpic.alert(data.resultMessage);
		}
	});
	
	
}


$(function(){
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true); //获取本地存储的登陆人信息
	token = userInfo.userToken;  //token用来判断登陆是否过期
	photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);
	photoInsurance.goImageTypeFlag = "1";//0正常进入照片上传  1后退进入照片上传
	photoInsurance.goSetInsuranceFlag = "0";//0正常进入险种勾选  1后退进入险种勾选
	photoInsurance.goOrderDetailTypeFlag = "0";//0正常进入等待接单  1全部订单页面进入等待接单
	common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
	/*cpic.ui.loading.open();
	$.ajax({//zhaoxiang
		async : true,
		type:'POST',
		dataType: 'json',
		timeout:5000,
		url:'/cic-crm-web/cic/getSetInfo.do',
		//data:JSON.stringify(""),
		headers: {"token":token},
		success:function(data){
			cpic.ui.loading.close();
			if(data.resultCode=="1"){
				var lists = data.cicsetinforesponsebody;
				var html = "";
				for (var i = 0; i < lists.length; i++) {
					var taoCanType = lists[i].code;
					var taoCanTypeName = lists[i].name;
					var path = lists[i].path;
					var clickFunc = "goTo('"+taoCanType+"','"+taoCanTypeName+"')";
					var classType = "";
					if(i==0){
						classType = "allPackage";
					}else if(i==1){
						classType = "cheapPackage";
					}else if(i==2){
						classType = "womenPackage";
					}else if(i==3){
						classType = "olderPackage";
					}else{
						classType = "freePackage";
					}
					
					html += '<li class="'+classType+' clearfix"><a onClick="'+clickFunc+'"><div></div><div>'+taoCanTypeName+'</div></a></li>';
				}
				$("#taoCanUlId").append(html);
			}else{
				cpic.alert(data.message);
			}
		},
		error:function(){
			cpic.ui.loading.close();
    	}
	});*/

	
	
	$("#goOrderDetailPages").bind("click",function(){
		Interface.submitPhotoOrder(token,photoInsurance,"","0",function(data) {
			if(data&&data.resultCode=='0000'){//0000成功 	
          	  //var recordsTotal = data.recordsTotal;//前面还有多少单
          	  photoInsurance.busiNum = data.orderNo;//设置订单编号
		      common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
              window.location.href = 'orderDetail.html?orderNumber='+photoInsurance.busiNum+'&plateNo='+photoInsurance.plateNo;
            }else{//1失败
          	  cpic.alert(data.resultMessage);
            }
		});
	});
	
});




