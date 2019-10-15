var crmObj;
var taskCode;
var token;
var agentCode;//业务员号码
//var total;//前面还有多少订单
var userInfo;
var orderNumber;//订单号
var plateNo;//车牌号
var photoInsurance;//拍照报价对象

util2 = {
	    GetQueryString:function(name)
	    {
	         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	         var r = window.location.search.substr(1).match(reg);
	         if(r!=null) return  decodeURI(r[2]); return null;
	    },
	    fMoney:function(s, n)
	    {
	       n = n > 0 && n <= 20 ? n : 2;
	       s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
	       var l = s.split(".")[0].split("").reverse(),
	       r = s.split(".")[1];
	       t = "";
	       for(i = 0; i < l.length; i ++ )
	       {
	          t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
	       }
	       return t.split("").reverse().join("") + "." + r;
	    },
	    shareWeChat:function (name, action, args) {
	        cordova.exec(success, error, name, action, args);
	    },
	    sendMsg:function(taskId, agentCode, unitCode, phone, contents){
	        Interface.sendMsg2Custom("3",taskId ,agentCode, unitCode, phone, contents,
	            function(result){
	                cpic.Prompt("发送短信成功");
	            });
	    }
	};

$(function(){
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true); //获取本地存储的登陆人信息
	token = userInfo.userToken;  //token用来判断登陆是否过期
	agentCode = userInfo.userCode;
	
	orderNumber = util2.GetQueryString('orderNumber');
	plateNo = util2.GetQueryString("plateNo");//车牌号
	$("#orderNumber").html(orderNumber);
	
	$('.more').menuNav({
		showObj:'.moreList',
	});
	
	$('#backAllOrder').on("click",function(){
		window.location.href = '../AllpolicyOrder/allOrder.html';
	});
	
	/*$('#cancelOrder').on("click",function(){
		if(window.confirm('您确定要取消本次报价吗？')){
			 Interface.cancelOrder(token,orderNumber,function(data) {
				if(data&&data.resultCode=='0001'){//0001成功 	
					cpic.Prompt("取消成功");
					//setTimeout(function() {
					location.href = '../tool/tools.html';
					//}, 300);
		        }else{//1失败
		        	cpic.alert(data.resultMessage);
		        }
			});
	         return true;
	      }else{
	         return false;
	     }
	});*/
	
	
	$('#cancelOrder').on("click",function(){
		cpic.alert({message: "<div style=\"text-align: center;\">您确定要取消本次报价吗？</div>", params: {
	        autoOpen: false,
	        closeBtn: false,
	        title: null,
	        buttons: {
	            '取消': function () {
	                this.close();
	                this.destroy();
	            },
	            '确定': function () {
	          	  cpic.ui.loading.open();
	          	  this.close();
	          	  this.destroy();
		          	Interface.cancelOrder(token,orderNumber,function(data) {
		    			if(data&&data.resultCode=='0001'){//0001成功 	
		    				cpic.Prompt("取消成功");
		    				//setTimeout(function() {
		    				location.href = '../tool/tools.html';
		    				//}, 300);
		    	        }else{//1失败
		    	        	cpic.alert(data.resultMessage);
		    	        }
		    		});
	            }
	        }
	    }});
	});
	
	$('#goCarInsurance').on("click",function(){
		util.setLocalStorage('isPhoto', '1', true);
		window.location.href="../newInsV2/carInsurance.html?version=1&returnSource=selfInsurance";
	});
	
var myScroll = null;
    window.onload=function(){
        //var myScroll=new iScroll("wrapper",{onScrollEnd:objModel.save.bind(objModel)});
    };
    document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

    //objModel.init();
    setInterval(function(){
    	Interface.queryByOrderNo(token,orderNumber,function(data) {
			if(data&&data.resultCode=='0000'){//0000成功 	
				if(data&&data.resultCode == '0000'){
	            	var responseObject = data.responseObject;
	                if(responseObject.state=='40'){//(20.未接单 40.已接单 60.已报价 70.已评价 80.报价退回 )
		            	setTimeout(
		                	function(){

		                		location.href = 'reception.html?orderNumber='+orderNumber+'&creatTime='+responseObject.updateTime
		                		+'&nowTime='+data.newTime+'&receiveCode='+responseObject.orderTaskCode+'&receiveName='+responseObject.orderTaskName
		                		+'&plateNo='+responseObject.carNum+"&state="+responseObject.state;
		                		
		                	  },2000);
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

$(function() {
	photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);
	var goOrderDetailTypeFlag = photoInsurance.goOrderDetailTypeFlag;
	if(goOrderDetailTypeFlag=='0'){//0正常进入等待接单  禁止返回
		pushHistory();
		var bool = false;
		setTimeout(function() {
			bool = true;
		}, 10);
		window.addEventListener("popstate", function(e) {
			if (bool) {
				if (confirm('是否回到首页？')) {
					// wx.closeWindow();
					location.href = '../tool/tools.html';
				}
				pushHistory();
			}
		}, false);
	}
	
});

function pushHistory() {
	var state = {
		title : "title",
		url : "#"
	};
	window.history.pushState(state, "title", "#");
} 
