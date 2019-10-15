var token;
var plateNo;//车牌号
//var noplatNumClick;//新车未上牌标记
var orderNumber;//订单编号
var receiveCode;//工号
var receiveName;//接单员
//var photoInsurance;//拍照报价对象

$(function(){
	
	//cpic.ui.loading.open();
	//photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true); //获取本地存储的登陆人信息
	token = userInfo.userToken;  //token用来判断登陆是否过期
	
	plateNo = util2.GetQueryString('plateNo');
	//noplatNumClick = photoInsurance.noplatNumClick;
	orderNumber = util2.GetQueryString('orderNumber');
	receiveCode = util2.GetQueryString('receiveCode');
	receiveName = util2.GetQueryString('receiveName');
	$("#plateNo").html("车牌号："+plateNo);
	$("#orderNumber").html("订单编号："+orderNumber);
	$("#userId").html("工号："+receiveCode);
	$("#userName").html("接单员："+receiveName);
	
	
    /*定义上传对象*/
    var obj={
        "appType":"M",
        "clientType":"phone",
        "requestObject":{
        	"id":orderNumber,
            "starLevel":"0",
            "evaluate":"",
            "remark":"",
        }
    };
    /*选择评价标签*/
    var chooseComment={
        el:$(".pingjiaxingji"),
        init:function(){
            this.el.show();
            this.bindEvents();
        },
        bindEvents:function(){
            $(".pingjiaxingji>span img").on("singleTap",this.changeState);
            $(".pingjia>div").on("singleTap",this.selectComment);
            $('header .back').on('singleTap',function(){
                history.go(-1);
            });
        },
        changeState:function(){
            var $allSpan = $(".pingjiaxingji>span img");
            var $dataValue = $(this).attr('data-value');
            for(var i=0; i <= $allSpan.length;i++){
            	var j = parseInt(i) + 1;
            	if($("#start_" + j ).attr('data-value') <= $dataValue){
            		$("#start_" + j ).attr('src','../../images/commentsRed.png')
            	}else{
            		$("#start_" + j ).attr('src','../../images/commentsGray.png')
            	}
            }
            //勾选项 满意度(5~1 优~差)
            obj.requestObject.starLevel=$(this).attr("data-value");
        },
        selectComment:function(){
            if($(this).attr('class')=="f-div floatleft"){
                $(this).attr('class','f-div floatleft active');
            }
            else if($(this).attr('class')=="f-div floatright"){
                $(this).attr('class','f-div floatright active');
            }
            else if($(this).attr('class')=="f-div floatright active"){
                $(this).attr('class','f-div floatright');
            }
            else{
                $(this).attr('class','f-div floatleft');
            }
        },
    };
    /*点击“更多”按钮*/
    var chooseMore={
        el: $("#foot_left"),
        init: function(){
            this.bindEvents();
        },
        bindEvents:function(){
            $("#foot_left").on("singleTap",this.hideMore);
        },
        hideMore:function(){
            $("#yincang").toggle();
        },
    };
    /*点击其他区域，隐藏"更多"*/
    var closeMore={
        el: $(".content"),
        init: function(){
            this.bindEvents();
        },
        bindEvents:function(){
            $(".content").on("singleTap",function(){
            $("#yincang").hide();
            });
        },
    };
    /*点击“发表评论”按钮*/
    var sendComment={
        el: $("#foot_right"),
        init: function(){
            this.bindEvents();
        },
        bindEvents:function(){
            $("#foot_right").on("singleTap",this.buildComment.bind(this));
        },
        buildComment:function(){
        	cpic.ui.loading.open();
            var comment = $("#comment").val();//意见和建议
            var _evaluate = '';//评价
            $.each($('.active'),function(){
                _evaluate+=$(this).html()+'|';
            });
            obj.requestObject.evaluate = _evaluate;//评价
            obj.requestObject.remark = comment;//备注
            
            
            if(obj.requestObject.starLevel=='0'){
            	cpic.ui.loading.close();
            	cpic.Prompt("请点个星级吧！");
            	return;
            }
            
            if(_evaluate==''&&comment==''){
            	cpic.ui.loading.close();
            	cpic.Prompt("写点评价吧！");
            	return;
            }
            
            this.submit(obj);
        },
        submit:function(obj){
        	
        	Interface.updateOrderByBusiNum(token,obj,function(data) {
        		if(data.resultCode == '0000'){
                	cpic.Prompt("评价成功");
                	setTimeout(
	                	function(){
	                		location.href="../cameraQuote/orderInfo.html?orderNumber="+orderNumber+"&plateNo="+plateNo+"&state=70";
    	             },1500);
                }else{
                    cpic.alert(data.resultMessage);
                }
        	});
        	
        }
    };
    
    /*信息填充*/
    var fillInfo={
        _el:{
            "appType":"M",
            "clientType":"phone",
            "requestObject":{
                "unitCode":"",
                "requestNo":""
            }
        },
        init:function(){
            this._el.requestObject.requestNo=util2.GetQueryString("applyNo");
            this.submit();
        },
        submit:function(){
            
        	Interface.getStatusByRequestNo(token,this._el,function(data) {
                /*if(data.resultCode == '1'){
                if(data&&data.responseObject.requestStatus=="13"){
                    var _applyNo=util2.GetQueryString("applyNo");
                    var _plateNo=util2.GetQueryString("plateNo");
                    setInterval(function(){location.href="purchaseDetail.html?applyNo="+_applyNo+"&plateNo="+_plateNo;}, 2000);
                }
	            } else {
	                cpic.alert(data.message);
	            }*/
	            $("#userId").html("工号："+data.responseObject.recieverCode);
	            $("#userName").html("接单员："+data.responseObject.recieverName);
	            $("#orderNumb").html("订单编号："+util2.GetQueryString('applyNo'));
	            $("#plateNo").html("车牌号："+util2.GetQueryString('plateNo'));
        	});
        	
        },
    };
    /*运行*/
    var app = {
        init:function(){
            chooseComment.init();
            chooseMore.init();
            closeMore.init();
            sendComment.init();
            // fillInfo.init();
            if(window.screen.height<570){
                var _header="";
                _header+='<div class="padding-center">';
                _header+='<span class="left-begin"></span>';
                _header+='<span class="left-begin" id="orderNumb"></span>';
                _header+='</div>';
                _header+='<div class="padding-bottom">';
                _header+='<span class="left-begin"></span>';
                _header+='<span class="left-begin" id="plateNo"></span>';
                _header+='</div>';
                $(".wth").attr("class","wth1");
                $(".padding-bottom").html(_header);
                $(".padding-bottom").attr("class","padding-bottom04");
                fillInfo.init();
            }else{
                //fillInfo.init();
            }
        },
    };

    app.init();

});

/*"更多"*/
function goToPage(object){
    switch(object.id){
        case('smsBtn'):
            console.info('发送短信');
            util2.sendMsg(msgObj.applyNo, msgObj.agentCode, msgObj.unitCode, msgObj.phone, msgObj.contents);
            break;
        case('wechatBtn'):
            console.info('share to WeChat...');
            util2.shareWeChat('ShareWX', 'shareWX', []);
            break;
        case('purchaseAgainBtn'):
            location.href='../AllpolicyOrder/allOrder.html';//跳转回全部订单
            break;
    }
}
var msgObj = {
    'applyNo':'',
    'agentCode':'',
    'unitCode':'',
    'phone':'',
    'contents':'',
    'plateNo':''
};
var util2 = {
    GetQueryString:function(name){
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null) return  decodeURI(r[2]); return null;
    },
    fMoney:function(s, n){
       n = n > 0 && n <= 20 ? n : 2;
       s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
       var l = s.split(".")[0].split("").reverse(),
       r = s.split(".")[1];
       t = "";
       for(i = 0; i < l.length; i ++ ){
          t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
       }
       return t.split("").reverse().join("") + "." + r;
    },
    shareWeChat:function (name, action, args){
        cordova.exec(success, error, name, action, args);
    },
    sendMsg:function(taskId, agentCode, unitCode, phone, contents){
        Interface.sendMsg2Custom("3",taskId ,agentCode, unitCode, phone, contents,
        function(result){
            cpic.Prompt("发送短信成功");
        });
    }
};



