var _applyNo,_applicant="",_telephone="",_address="",_plateNo,userInfo,_status;
var policyBean;
$(function(){
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true);
	_applyNo = util2.GetQueryString('applyNo');
	var _shortData = util2.GetQueryString('shortData');
	_status = util2.GetQueryString('status');
    if(common.isNotNull(_shortData) && _shortData != "undefined"){
    	cpic.alert("您还有"+_shortData+"这些资料欠缴，请尽快提交");
    }
	cpic.ui.loading.open();
    Interface.queryOrderDetail(userInfo.userCode, userInfo.unitCode, _applyNo,'CAR_WHOLE',function(result){
    	cpic.ui.loading.close();
    	if(result.resultCode == "1"){
        	var result = result.responseObject;
        	var policyInfoBeans = result.policyInfoBeans;
        	policyBean = result.policyBean;
        	$.each(policyBean,function(key,item){
        		if(item.policyType == "JQ"){
        			$("#tcPolicyNo").val(item.insNo);
        		}else if(item.policyType == "SY"){
        			$("#bzPolicyNo").val(item.insNo);
        		}
        	})
        	_applyNo = result.applyNo;
//        	_applicant = result.applicant;
//        	if(!common.isEmptyJsonObject(result.policyInfoDetailBean)){
//        		_telephone = result.policyInfoDetailBean[0].insTelephone || "";
//            	_address = result.policyInfoDetailBean[0].insAddress || "";
//        	}
        	
        	//联系电话  联系地址 联系人
    		if( common.isNotNull(result.custPhone)){
    			_telephone = result.custPhone ;
    		}
    		if( common.isNotNull(result.custAddress)){
    			_address = result.custAddress ;
    		}
    		if( common.isNotNull(result.custName)){
    			_applicante = result.custName ;
    		}
        	
        	var bzPremium=0, tcPremium=0;
        	$.each(policyInfoBeans,function(i,element){
        		if(element.productCode == "TRAFFICCOMPULSORY2009PRODUCT"){
        			tcPremium = element.policyPremium;
        		}else{
        			bzPremium += Number(element.policyPremium);
        		}
        	})
        	_plateNo = result.plateNo;
        	$("#carNo").html(result.plateNo);
        	$("#carModel").html(result.carVin);
        	$("#name").html(result.applicant);
        	if(common.isNotNull(tcPremium)){
        		$("#jiaoqiangxian").html("￥" + new Digital(tcPremium*100/100).format(2));
        	}
        	if(common.isNotNull(bzPremium)){
        		$("#shangyexian").html("￥" + new Digital(bzPremium*100/100).format(2));
        	}
        	if(common.isNotNull(result.totalAmount)){
        		$("#chechuanshui").html("￥" + new Digital(result.totalAmount*100/100).format(2));
        	}
        	var total = Number(result.sumInsured) + Number(result.totalAmount);
        	$("#totle").html("￥" + new Digital(total*100/100).format(2));
    	}else{
    		cpic.alert(result.message);
    	}
    },function(){
    	cpic.ui.loading.close();
    	cpic.alert("网络连接失败");
    });
	
	bindEvents();
	
	setTimeout(function(){
		myScroll.refresh();
	},800);
	
});

function bindEvents(){
	$("#print").bind('click',function(){
		common.setLocalStorage("policyBean", JSON.stringify(policyBean), true);
		window.location.href = '../cameraQuote/caseChoose.html?applyNo=' + _applyNo + '&returnType=1' + '&applicant=' + _applicant + '&telephone=' + _telephone + '&address=' + _address + '&status=' + _status;
	});
	
	$("#submit").on("click",function(){
		
		//点击时候触发任务完成接口
		Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, _applyNo, '3', '{}','', _plateNo,'','','','','','CAR_WHOLE','','',
                function(result){
                    cpic.ui.loading.open();
                    if('1' == result.resultCode){
                    	cpic.ui.loading.close();
                        if(result.responseObject.state == '1') {
                        	location.href='comments.html?applyNo=' + _applyNo + "&plateNo=" + _plateNo +'&status=' + _status;
                        	/*var _obj={
                    	            "appType":"A",
                    	            "requestObject":{
                    	            "requestNo":_applyNo,
                    	            "unitCode":userInfo.unitCode
                    	            }
                    	        };
                    		$.ajax({
                                async : true,
                                type:'POST',
                                url:'/crm-http/crm/getStatusByRequestNo.do',
                                data:JSON.stringify(_obj),
                                dataType:'json',
                                success:function(result){
                                    cpic.ui.loading.close();
                                    if(result.resultCode == '1'){
                                        if(result.responseObject.requestStatus == '11'){
                                            cpic.alert("该订单已完成评价，不能重复评价");
                                        }else{
                                            location.href='comments.html?applyNo=' + _applyNo + "&plateNo=" + _plateNo +'&status=' + _status;
                                        }
                                    }else{
                                        cpic.alert(result.message);
                                    }
                                },
                                error:function(result){
                                    cpic.ui.loading.close();
                                    cpic.alert(result.message);
                                }
                            });*/
                        }else if(result.responseObject.state == '2') {
                            cpic.ui.loading.close();
                            cpic.alert(result.responseObject.msg);
                        }
                    }else{
                        cpic.ui.loading.close();
                        cpic.alert(result.message);
                    }
            },function(result){
                cpic.ui.loading.close();
                cpic.alert(result.message);
            });
	})
}

var util2 = {
    GetQueryString:function(name)
    {
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null) return  decodeURI(r[2]); return null;
    }
};