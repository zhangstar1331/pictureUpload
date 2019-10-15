var userInfo;
var _applyNo;
var _plateNo;
var _status;
var _takeTime,_takeAddress,_addressCode,_envelopeCode,_taskType;
var policyBean;
var _applicant = '';
var _telephone = '';
var _address = '';
$(function(){
	_initHtml();
	_bindEvents();
});

function _initHtml(){
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true);
	_applyNo = util2.GetQueryString('applyNo');
	_status = util2.GetQueryString('status');
	if(_status == "99"){
		_taskType = "2";
		$("#comfirm").hide();
		$("#rePrint").show();
	}else if(_status == "11"){
		$(".title").html("保单服务详情");
		$(".onSendingBox").hide();
//		$("#comfirm").hide();
		$("#comfirm").show();
	}
	
	cpic.ui.loading.open();
    Interface.queryOrderDetail(userInfo.userCode, userInfo.unitCode, _applyNo,'CAR_WHOLE',function(result){
    	cpic.ui.loading.close();
    	if(result.resultCode == "1"){
    		var result = result.responseObject;
    		if(_status == "99"){
    			if(common.isNotNull(result.remarks[0])){
            		cpic.alert({message: "<div style=\"text-align: center;\">"+result.remarks[0]+"</div>", params: {
		  		         autoOpen: false,
		  		         closeBtn: false,
		  		         title: null,
		  		         buttons: {
		  		        	'确定': function () {
		  		            	  this.close();
		  		            	  this.destroy();
		  		              },
		  		              '取消': function () {
		  		                  this.close();
		  		                  this.destroy();
		  		              }
		  		              
		  		          }
		  		      }
	            	})
            	}
    		}

    		_plateNo = result.plateNo;
    		_takeTime = result.takeTime || "";
    		_takeAddress = result.takeAddress || "";
    		_addressCode = result.addressCode || "";
//    		_applicant = result.applicant || "";
//    		if(!common.isEmptyJsonObject(result.policyInfoDetailBean)){
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
        	
    		policyBean = result.policyBean;
        	$.each(policyBean,function(key,item){
        		if(item.policyType == "JQ"){
        			$("#tcPolicyNo").val(item.insNo);
        		}else if(item.policyType == "SY"){
        			$("#bzPolicyNo").val(item.insNo);
        		}
        	})
        	var bzPremium=0, tcPremium=0;
        	$.each(result.policyInfoBeans,function(i,element){
        		if(element.productCode == "TRAFFICCOMPULSORY2009PRODUCT"){
        			tcPremium = element.policyPremium;
        		}else{
        			bzPremium += Number(element.policyPremium);
        		}
        	})
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
        	
        	if(common.isNotNull(result.takeTime) && common.isNotNull(result.takeTime.time)){
        		var takeTime = new Date(result.takeTime.time);
            	$("#time").html(common.formatDate(takeTime,'yyyy-MM-dd hh') + ':00');
        	}
        	
        	$("#address").html(result.takeAddress);
    	}else{
    		cpic.alert(result.message);
    	}
    },function(){
    	cpic.ui.loading.close();
    	cpic.alert("网络连接失败");
    })
}

function _bindEvents(){
	$("#comfirm").bind('click',function(){
		window.location.href = '../cameraQuote/comments.html?applyNo=' + _applyNo + '&plateNo=' + _plateNo + '&status=' + _status;
	});
	
	$("#rePrint").bind('click',function(){
		common.setLocalStorage("policyBean", JSON.stringify(policyBean), true);
		window.location.href = '../cameraQuote/caseChoose.html?applyNo=' + _applyNo + '&status=' + _status + '&returnType=2' + '&takeTime=' + _takeTime + '&takeAddress=' + _takeAddress + '&envelopeCode=' + _envelopeCode + '&applicant=' + _applicant + '&telephone=' + _telephone + '&address=' + _address + '&taskType=' + _taskType;
	});
}

var util2 = {
    GetQueryString:function(name)
    {
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null) return  decodeURI(r[2]); return null;
    }
};