var policyVehicleInfo ;
var applyNoDesc;
var status;
$(function(){
	/**
	 * 初始化页面数据
	 */
	initPageHTML();
	/**
	 * 绑定事件
	 */
	bindEvent();
	
});


function initPageHTML(){
	policyInfo =  common.getLocalStorage("policyVehicleInfo",true);
	applyNo = common.getLocalStorage("applyNoDesc",true);
	status = util2.GetQueryString('status') || "";//获取状态
	if(common.isNotNull(policyInfo)){
		$("#carNum").val(policyInfo.plateNo);
		$("#frameNum").val(policyInfo.carVin);
		$("#engineNum").val(policyInfo.engineNo);
	}
}


function bindEvent(){
	$("#submit").on("click",function(){
		location.href = 'purchaseDetail.html?applyNo=' + applyNo + '&plateNo=' + policyInfo.plateNo + "&status=" + status;
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