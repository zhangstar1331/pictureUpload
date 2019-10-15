var imgId;
var windowHeight= $(window).height();
var windowWidth= $(window).width();
var uploadImgSize=0;
var failFlag=true;
var width;
var _applyNo;
var obj;
var _status = '';
var _taskType = '';
var _taskCode = '';

$(function(){
	//获取大保单信息
//	policy = common.getLocalStorage(Interface.ss.policy, true);
	
	/**  
 	* 控制图像上传的容器高度
 	**/
 	var obj = $('.imageBox>span');
 	width = obj.width() - 4;
 	obj.css({'height':width + 'px'});
    
    initPages();

    bindEvent();

});

function initPages() {
	var userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
	_status = util2.GetQueryString('status');//获取状态
	_applyNo = util2.GetQueryString('applyNo');//任务号
	_taskType = util2.GetQueryString('taskType');//任务类型
	_taskCode = util2.GetQueryString('taskCode');
	obj = JSON.parse(localStorage.userInfo);
	
	
	var param = {
			"appType": "M",
			"clientType": "phone",
			"requestObject": {
				"agentCode": obj.userCode,
				"agentName": obj.userName,
				"unitCode": obj.unitCode,
				"unitName": obj.unitName,
				"branchCode": obj.unitCode,
				"requestNo": _applyNo
			}
	};
	loadPhotos(param);
	
}


function bindEvent() {
	
 	
	// 图片上传
    $("#uploadPhoto").bind("click",function(){
    	
    	cpic.ui.loading.open();
		
		failFlag=true;
		
		var images = $(".select-no").parent().find("img[id^='smallImage']");
		uploadImgSize=images.length;
		var remark = $("#remarkId").val();
	
		try{
			uploadPhotos.init();
			uploadPhotos.save(remark);
		}catch(e){
			cpic.ui.loading.close();
			if(failFlag){
	 			failFlag=false;
	 			cpic.alert("上传失败！系统异常1，请稍后再试！");
			}
		}
		
    });
    
	
	
    $("#imageBox").on("click","span",function(){
    	imgId = $(this).attr("id");
    	var lastId = $("#imageBox span").last().attr("id");
 		var id = lastId.substr(9,lastId.length);
 		if($('#'+imgId).html() == ""){
 			$("#"+imgId).unbind('singleTap');
 			exec("MCamera","takePicture",[]);
 		}
 		var html = '';
 		if(id < 9 && !$(this).find('img').hasClass('nSmallImage')){
 			var nextId = parseInt(id) + 1;
 			html += '<span id="addPhoto_'+ nextId +'" style="height: 71px;"></span>';
 			$("#imageBox").append(html);
 		}
 	});
}


function loadPhotos(param){
	cpic.ui.loading.open();
	$("span[id^='addPhoto_']").each(function(){
		$(this).html("");
	});
	
	//照片回显
	$.ajax({
		async: true,
		type: 'POST',
		url: '/crm-http/crm/getPhotosByRequestNo.do',
		data: JSON.stringify(param),
		dataType: 'json',
		success: function(data) {
//			var num = 0 ;
			if (typeof data == 'string')
				data = JSON.parse(data);
			if (data.resultCode == 1) {
				try {
					var nHtml = '';
					var html = '';
						for (var j = 0; j < data.responseObject.length; j++) {
							if(common.isNotNull(data.responseObject[j].imgBase64Data)){
								if(j > 0 && j < 9){
									html = '<span id="addPhoto_'+ j +'" style="height: 71px;"></span>';
								}
								$("#imageBox").append(html);
								nHtml = '<img  id="addPhoto_' + j + '" class="nSmallImage"  alt="" src="data:image/jpeg;base64,' + data.responseObject[j].imgBase64Data + '" uri=""  width="100%" height="100%">';
								$("#addPhoto_"+j).html(nHtml);
							}
						}
						if(data.responseObject.length < 9){
							var mhtml = '';
							mhtml += '<span id="addPhoto_'+ data.responseObject.length +'" style="height: 71px;"></span>';
							$("#imageBox").append(mhtml);
						}
						 
					cpic.ui.loading.close();
				} catch (e) {
					
				}
			} else {
				cpic.ui.loading.close();
				cpic.alert("获取影像失败！");
			}
		},
		error: function(a, b, c) {
		},
	});
	
}


function loadPhoto(imgPath,imgIndex){
	
	var html ='<i class="select-yes" id="deletePhoto_'+ imgIndex +'"></i><img id="smallImage_'+ imgIndex +'" alt="" src="'+imgPath+'" uri="" index='+imgIndex+' width="100%" height="100%">';
	$('#addPhoto_'+imgIndex).html(html);
	
	
	onLoadPhoto("#addPhoto_"+imgIndex,imgPath);
}



function deleteTempImg(fileName){
	CPICCaSign.deleteTempImg(null,null,[fileName]);
}


function exec(name, action, args) {
	cordova.exec(success, error, name, action, args);
}


var success = function(data){
	if('string' == typeof(data)){
		data = JSON.parse(data);
	}
	
	onPhotoURISuccess(data);
};

var error = function(message){
};

function onPhotoURISuccess(data) {
	cpic.ui.loading.open();
	
//	cpic.debugPrint("图片信息：" + data);
	var num = imgId.substr(imgId.indexOf("_")+1)
	
	var html ='<i class="select-no" id="deletePhoto_'+ num +'"></i><img id="smallImage_'+ num +'" alt="" src="" uri="" index='+num+' width="100%" height="100%">';
	$('#'+imgId).html(html);
	
	var smallImage=document.getElementById("smallImage_" + num);
	smallImage.src="data:image/jpeg;base64," + data.base64;
	smallImage.uri=data.fileName;
	
	var spanList = $("#imageBox").find("span");
	var hasEmptySpan = false;
	
	$.each(spanList,function(index,element){
		if(common.isNull($(element).html())){
			hasEmptySpan = true;
		}
	});
	
	if(!hasEmptySpan&&$("#imageBox").find("span").length<=9){
		$("#imageBox").append("<span id=\"addPhoto_"+(spanList.length)+"\" style=\"height:"+width+"px\"></span>");
		// 添加图片
		$("span[id='addPhoto_"+(spanList.length)+"']").bind("click",function(){
	 		imgId = $(this).attr("id");
	 		if($('#'+imgId).html() == ""){
	 			$("#"+imgId).unbind('singleTap');
	 			exec("MCamera","takePicture",[]);
	 		}
	 	});
	}
	
	$("#deletePhoto_" + num).bind("click",function(e){
		$('#addPhoto_' + num).html("");
		e.stopPropagation();
	});
	
	onLoadPhoto("#"+imgId,smallImage.src);
	
	myScroll.refresh();
	
	cpic.ui.loading.close();
}




function fail(error) {
	cpic.debugPrint("上传系统异常：" + error);
	 cpic.ui.loading.close();
	 
	 try{
		 if(failFlag){
 			failFlag=false;
 			cpic.ui.alert("上传失败！网络异常2，请稍后再试！");
		 }
	 }catch(e){
		 if(failFlag){
 			failFlag=false;
 			cpic.ui.alert("上传失败！系统异常3，请稍后再试！");
		 }
	 }
}



var util2 = {
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




function onLoadPhoto(iconPicture,imgUrl) {
	 $(iconPicture).bind('singleTap',function(){
		 	cpic.ui.loading.open();
		 	
		 	var img = new Image();
			img.src=imgUrl;
			var width;
			var height;
			
			if (img.complete) {
				width=img.width;
				height=img.height;
			} else {
				img.onload = function () {
					width=img.width;
					height=img.height;
				};
			}	
			
			var top=0;
			var left=0;
			if(width>windowWidth){
				var proportion=windowWidth/width;
				width=windowWidth;
				height=height*proportion;
			}else if(width<windowWidth){
				left=(windowWidth-width)/2;	
			}
			if(height<windowHeight){
				top=(windowHeight-height)/2;
			}

			var html = '';
			
			html += '<div class="jumpbox2 displayN preImg panel" id="preImg" style="top:0;background:#000;width:100%;height:100%;position:absolute;">';
			html += '<div style="position:absolute; z-index:999;top:'+top+'px;left:'+left+'px;overflow:hidden;">';
			html += '<img id="preImage" style="vertical-align: middle;margin:0 auto;" alt="" src="'+imgUrl+'" width="'+width+'" height="'+height+'">';
			
		    html += '</div></div>';
		    
		    $('.iscroll').append(html);
		    
		    $('#preImg').bind('click',function(){
		    	$('#preImg').hide();
		    	$('#preImg').unbind('click');
		    	$('#preImg').remove();
	        });
		    
		    setTimeout(function(){
		    	$('#preImg').show();
		    	cpic.ui.loading.close();
			},200);
		});
}



var uploadPhotos = {
		_el: {
			"appType": "M",
			"clientType": "phone",
			"requestObject": {
				"requestNo": "",
				"agentCode": "",
				"agentName": "",
				"unitCode": "",
				"unitName": "",
				"dataList": []
			}
		},
		init: function() {
			var obj = JSON.parse(localStorage.userInfo);
			this._el.requestObject.unitCode = obj.unitCode;
			this._el.requestObject.agentCode = obj.userCode;
			this._el.requestObject.unitName = obj.unitName;
			this._el.requestObject.agentName = obj.userName;
			this._el.requestObject.requestNo = _applyNo;
		},
		save: function(remark) {
			var failFlag = true;
			var imageData = $(".select-no").parent().find("img[id^='smallImage']");
			uploadImgSize=imageData.length;
			try {
				uploadPhotos._el.requestObject.dataList = [];
				$.each(imageData, function(index) {
					var data = {};
					data.data = $(this).attr('src').split('base64,')[1];
					data.type = '99';
					uploadPhotos._el.requestObject.dataList.push(data);
				});
				if(uploadImgSize === 0){
					uploadPhotos.noImageSubmit(remark);
				}else{
					uploadPhotos._submit(remark);
				}
			} catch (e) {
				alert(e.name + ' ' + e.message);
			}
		},
		noImageSubmit: function(remark) {
			cpic.ui.loading.open();
			Interface.getCheckCar(obj.userCode, obj.unitCode, _taskCode, _taskType, _applyNo,remark,
	                function(result){
	                    if('1' == result.resultCode){
	                        if(result.responseObject.state == '1') {
//	                        	localStorage.setItem("requestNo",_applyNo);
	                        	cpic.ui.loading.close();
	                        	cpic.alert({message:"<span class='font08em'>" + result.responseObject.msg + "</span>",params:{
	                        		autoOpen: false,
	                        		closeBtn: false,
	                        		title: "提示信息",
	                        		buttons: {
	                        			'确定': function () {
	                        				this.close();
	                        				this.destroy();
	                        				window.location.href='../cameraQuote/purchaseRecords.html';
	                        			}
	                        		}
	                        	}});
//	                        	window.location.href='../cameraQuote/purchaseRecords.html';
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
		},
		
		
		_submit: function(remark) {
			$.ajax({
				async: true,
				type: 'POST',
				timeout:90000, //超时时间设置90秒
				url: '/crm-http/crm/uploadSource.do',
				data: JSON.stringify(this._el),
				dataType: 'json',
				success: function(data) {
					if (data) {
						if (data.resultCode == 1) {
							cpic.ui.loading.open();
							Interface.getCheckCar(obj.userCode, obj.unitCode, _taskCode, _taskType, _applyNo,remark,
					                function(result){
					                    if('1' == result.resultCode){
					                        if(result.responseObject.state == '1') {
					                        	localStorage.setItem("requestNo",_applyNo);
					                        	cpic.ui.loading.close();
					                        	cpic.alert({message:"<span class='font08em'>" + result.responseObject.msg + "</span>",params:{
					                        		autoOpen: false,
					                        		closeBtn: false,
					                        		title: "提示信息",
					                        		buttons: {
					                        			/*'取消': function () {
					                        				this.close();
					                        				this.destroy();
					                        			},*/
					                        			'确定': function () {
					                        				this.close();
					                        				this.destroy();
					                        				window.location.href='../cameraQuote/purchaseRecords.html';
					                        			}
					                        		}
					                        	}});
//					                        	window.location.href='../cameraQuote/purchaseRecords.html';
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
						} else if (data.resultCode == 0) {
							cpic.ui.loading.close();
							cpic.alert(data.message);
						} else if (data.resultCode == 2) {
							cpic.ui.loading.close();
							cpic.alert('未登陆');
						}
					}
				},
				error: function(XMLHttpRequest,textStatus,errorThrown) {
					cpic.ui.loading.close();
					if(textStatus == 'timeout'){
						cpic.alert('上传超时,请检查网络信号！');
						return false ;
					}

				},
			});
		},
	};