var userInfo;
var _applyNo;
var _plateNo;
var _status;
var _envelopeCode,_taskType;
var _address = '';
var _telephone = '';
var _applicant = '';
var policyBean;

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
		// edit by yulei at 20170110 start for 配送订单为已配送才显示评价按钮
		//$("#comfirm").hide();
		$("#comfirm").show();
		// edit by yulei at 20170110 end for 配送订单为已配送才显示评价按钮
	}
	
	cpic.ui.loading.open();
    Interface.queryOrderDetail(userInfo.userCode, userInfo.unitCode, _applyNo,'CAR_WHOLE',function(result){
    	cpic.ui.loading.close();
    	if(result.resultCode == "1"){
    		var result = result.responseObject;
    		if(_status == "99"){
    			if( common.isNotNull(result.remarks) && result.remarks.length >0 ){
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
//    		_applicant = result.applicant || "";
//    		if( common.isNotNull(result.policyInfoDetailBean) && result.policyInfoDetailBean.length >0 ){
//    			_telephone = result.policyInfoDetailBean[0].insTelephone ;
//    			_address = result.policyInfoDetailBean[0].insAddress;
//    		}
    		//联系电话  联系地址 联系人
    		if( common.isNotNull(result.custPhone)){
    			_telephone = result.custPhone ;
    		}
    		if( common.isNotNull(result.custAddress)){
    			_address = result.custAddress ;
    		}
    		if( common.isNotNull(result.custName)){
    			_applicant = result.custName ;
    		}
        	
        	policyBean = result.policyBean;
        	$.each(policyBean,function(key,item){
        		if(item.policyType == "JQ"){
        			$("#tcPolicyNo").val(item.insNo);
        		}else if(item.policyType == "SY"){
        			$("#bzPolicyNo").val(item.insNo);
        		}
        	})
    		$("#expressCompanyName").html(result.expName);
        	$("#expressListNumber").html(result.emsNo);
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
		window.location.href = '../cameraQuote/caseChoose.html?applyNo=' + _applyNo + '&status=' + _status + '&returnType=3' + '&envelopeCode=' + _envelopeCode + '&applicant=' + _applicant + '&telephone=' + _telephone + '&address=' + _address + '&taskType=' + _taskType;
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