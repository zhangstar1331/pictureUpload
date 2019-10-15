var token;
var orderNumber;//订单编号
var plateNo;//车牌号
//var noplatNumClick;//新车未上牌标记
var receiveCode;//工号
var receiveName;//接单员
var creatTime;//创建时间
var nowTime;//当前时间

//显示等待时间
function waitTime(updatedTime,nowTime){
	var nowTime_ = Number(nowTime);
 	setInterval(function(){
 		nowTime_ += 1000;
 		waitTimeSetTnt(updatedTime,nowTime_);
 	},1000);
}

function waitTimeSetTnt(createdTime ,nowTime){
	var begin = nowTime - createdTime;
    $id = document.getElementById("waitTime");

    if(begin < 0){
    	begin = 0;
    }
    var _day = parseInt(begin/1000/60/60/24),
    	_hour = parseInt((begin-_day*24*60*60*1000)/1000/60/60),
    	_minutes = parseInt((begin-_day*24*60*60*1000-_hour*60*60*1000)/1000/60),
    	_seconds = parseInt((begin-_day*24*60*60*1000-_hour*60*60*1000-_minutes*1000*60)/1000);
    if(_hour < 10){
    	_hour = "0" + _hour;
    }
    if(_minutes < 10){
    	_minutes = "0" + _minutes;
    }
    if(_seconds < 10){
    	_seconds = "0" + _seconds;
    }
    if(_day == 0){
    	$id.innerHTML = (_hour + ":" + _minutes + ":" + _seconds);
    }else{
    	$id.innerHTML = (_day + "天" + _hour + ":" + _minutes + ":" + _seconds);
    }
}

//获取URL中传送的值
var util2 = {
    GetQueryString:function(name){
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null) return  decodeURI(r[2]); return null;
    }
};


$(function(){
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true); //获取本地存储的登陆人信息
	token = userInfo.userToken;  //token用来判断登陆是否过期
	orderNumber = util2.GetQueryString("orderNumber");//订单号
	plateNo = util2.GetQueryString("plateNo");;//车牌号
	//noplatNumClick = util2.GetQueryString("noplatNumClick");;//新车未上牌标记
	receiveCode = util2.GetQueryString("receiveCode");;//工号
	receiveName = util2.GetQueryString("receiveName");;//接单员
	creatTime = util2.GetQueryString("creatTime");//创建时间
	nowTime = util2.GetQueryString("nowTime");//当前时间
	
	$("#carNumb").html("车牌号："+plateNo);
	$("#orderNumber").html("订单编号："+orderNumber);
	$("#userId").html("工号："+receiveCode);
	$("#userName").html("接单员："+receiveName);
	waitTime(creatTime,nowTime);
	
	$('.foot_right').on("click",function(){
		util.setLocalStorage('isPhoto', '1', true);
		window.location.href="../newInsV2/carInsurance.html?version=1&returnSource=selfInsurance";
	});

	setTimeout(
			function(){
				
				common.removeLocalStorage("isPhoto");

				window.location.href="../AllpolicyOrder/allOrder.html?version=1&returnSource=selfInsurance";
				
	  },1800000);
	
	
	/*var _shortData = util2.GetQueryString('shortData') || "";
	if(common.isNotNull(_shortData) && _shortData != "undefined"){
		cpic.alert("您还有"+_shortData+"这些资料欠缴，请尽快提交");
	}*/
	
	/*var param ={
        "id":orderNumber
    };
	
    var objModel ={
        submitTimer:0,
        init:function(){
          this.submit();
          submitTimer = setInterval(function(){
        	  objModel.submit();
          },10000);
        },
        submit:function(){
            $.ajax({
                async : true,
                type:'POST',
                url:'/cic-crm-web/cic/queryByOrderNo.do',
                data:JSON.stringify(param),
                dataType:'json',
                headers: {"token":token},
                success:function(data){
                	var jsonStr = JSON.stringify(data);
		            console.log("sucess:"+jsonStr);
                    if(data&&data.resultCode == '0000'){
                        //拍照报价集中作业录单完成后页面跳转
                    	var responseObject = data.responseObject;
                        if(responseObject.state=="60"){//20.未接单 40.已接单 60.已报价 80.报价退回
                        	setTimeout(
	    	                	function(){
	    	                		window.location.href = "orderInfo.html?plateNo="+plateNo+"&orderNumber="+orderNumber
	    	                			+"&receiveCode="+receiveCode+"&receiveName="+receiveName;
	    	                	  },2000);
                        }
                    }
                },
                error:function(){
                },
            });
        },
    };*/

    var app = {
        init:function(){
            if(!localStorage.getItem('flag')){
                $('header .back').hide();
            }else{
                localStorage.removeItem('flag');
                $('header .back').on('singleTap',function(){
                    history.go(-1);
                });
            }
            if(window.screen.height<570){
                var _header="";
                _header+='<div class="padding-center">';
                _header+='<span class="left-begin"></span>';
                _header+='<span class="left-begin" id="orderNumber"></span>';
                _header+='</div>';
                _header+='<div class="padding-bottom">';
                _header+='<span class="left-begin"></span>';
                _header+='<span class="left-begin" id="carNumb"></span>';
                _header+='</div>';
                $(".wth").attr("class","wth1");
                $(".padding-bottom").html(_header);
                $(".padding-bottom").attr("class","padding-bottom04");
                $(".lineOneR span").attr("class","left13");
                $(".lineTwoR .left").attr("class","left13");
                objModel.init();
                $("#orderNumber").html("订单编号：" + orderNumber);
                $("#carNumb").html("车牌号：" + plateNo);
            }else{
                //objModel.init();
                $("#orderNumber").html("订单编号：" + orderNumber);
                $("#carNumb").html("车牌号：" + plateNo);
            }
        },
    };
    app.init();
    
    
    //objModel.init();
    
 var  cameraIte =    setInterval(function(){
    	Interface.queryByOrderNo(token,orderNumber,function(data) {
			if(data&&data.resultCode=='0000'){//0000成功 	
				if(data&&data.resultCode == '0000'){
	            	var responseObject = data.responseObject;
	                if(responseObject.state=='60'){//(20.未接单 40.已接单 60.已报价 70.已评价 80.报价退回 )
		            	setTimeout(
		                	function(){
		        				common.removeLocalStorage("isPhoto");
		                		location.href = 'orderInfo.html?orderNumber='+orderNumber
		                		+'&plateNo='+responseObject.carNum+"&state="+responseObject.state;
		                		
		                	  },2000);
		                }else if(responseObject.state=='80'){
		                	
		                	$('.workIng').hide();
		                	
		                	$('.returnReason').show();
		                	
		                	$('#returnReason').text(responseObject.errorMessage);
		                	
		                	clearInterval(cameraIte) 
		                }
	              } else {
	                 console.log(data.resultMassgae);
	              }
            }else{//1失败
            	var jsonStr = JSON.stringify(data);
	            console.log(jsonStr);
            	console.log("定时调用异常");
            }
		});
    },10000);

});
