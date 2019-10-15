/*
imageChoosingView:选择照片种类视图
idPartView:身份证，驾驶证视图
policyPartView:保单上年保单视图
camera:相机相关功能实现
 app：页面启动器

jsonModel：本页面有两个jsonMoel的实体对象， createRequrestNo 和 uploadPhotos。
			createRequrestNo用来创建任务号，uploadPhotos用来上传图片

 view：1.每个view对应其页面的逻辑，都有_el变量和init,_bindEvnets,render三个方法。
 		_el即为其代表的DOM节点，_bindEvents为绑定事件。
	   2.view对外只暴漏 init()和render()两个方法，init为该页面最
	     初的初始化，render为该页面的渲染和显示。
       3.除init和render，别的方法(下划线开头的方法)只能view内部调用。
       4.除_el外，如果有其他变量，即用来作标识位或
       	 记录该页面信息(新增设备，车船税)。
jsonModel：1._el即为发送报文的基本模型
 		   2.对外暴漏init和save方法，init表示数据初始化，save为
			  复制页面信息到数据模型中并发起http请求。
app：1.页面基本的初始化。
 */
var requestNo = "";
var token;
var photoInsurance;//拍照报价对象
var ua = navigator.userAgent.toLowerCase();	
var android = /android/.test(ua);
var compressRate = 0.8;//压缩率
var maxWidths = 1200;
var maxHeights = 1800;

$(function() {
	var util = {
		//获取跳转连接中问号后面的键值对信息
		GetQueryString: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return null;
		}
	};
	
	//alert("compressRate="+compressRate+",maxWidths="+maxWidths+",maxHeights="+maxHeights);
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true); //获取本地存储的登陆人信息
	token = userInfo.userToken;  //token用来判断登陆是否过期
	
	photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);
	
	var photoType = util.GetQueryString('type');
	if(photoType=='idAndDriverLicensePics'){
		photoTypeName = "行驶证/合格证+身份证";
	}else if(photoType=='policyLastYearPics'){
		photoTypeName = "旧保单";
	}else if(photoType=='policyPics'){
		photoTypeName = "投保单";
	}
	photoInsurance.photoType = photoType;//照片类型
	photoInsurance.photoTypeName = photoTypeName;//照片类型名称
	
	
	var idPartView = {
		_el: $('#idPartView'),
		init: function() {
			this._el.hide();
			this._bindEvents();
		},
		render: function() {
			this._el.show();
			if (myScroll2)
				myScroll2.refresh();
		},
		_bindEvents: function() {
			$('#idPartView .hidden-input').on('change', camera.openCamera.bind(camera));
			//$('#idPartView .addPhoto').on('click', camera.openCamera.bind(camera));
			$('#idPartView .renewal_btn_div').on('click', this._confirm);
			$('#idPartView header .back').on('click', this._back.bind(this));
			$('header .home').on('click', function() {
				window.location.href = '../tool/tools.html';
			});
		},
		_confirm: function() {
			uploadPhotos.save();
		},
		_back: function() {
			this._el.hide();
			window.location.href = 'choosingImage.html';
		}
	};
	
	 
	
	var policyPartView = {
		_el: $('#policyPartView'),
		init: function() {
			this._el.hide();
			this._bindEvents();
		},
		render: function(txt, type) {
			this._el.show();
			$('#oldPolicys').html(txt);
			if ('old' == type) {
				$($('#oldPolicys').parent().children()[1]).attr('class', 'onePicLimit lastYearPolicy');
			} else {
				$($('#oldPolicys').parent().children()[1]).attr('class', 'onePicLimit thisYearPolicy');
			}
			if (myScroll3) {
				myScroll3.refresh();
			}
		},
		_bindEvents: function() {
			$('#policyPartView .hidden-input').on('change', camera.openCamera.bind(camera));
			$('#policyPartView .renewal_btn_div').on('click', this._confirm);
			$('#policyPartView header .back').on('click', this._back.bind(this));
			$('header .home').on('click', function() {
				window.location.href = '../tool/tools.html';
			});
		},
		_back: function() {
			this._el.hide();
			window.location.href = 'choosingImage.html';
		},
		_confirm: function() {
			uploadPhotos.save();
		}
	};
	
	
	
	
	var camera = {
		picID: null,
		imageData: [],
		init: function() {},
		//拍照或从相册中选择
		openCamera: function(e) {
			this.picID = $(e.target).parent();
			try {
				
				var data = new Object();
				data.name = "";
				var Orientation = null;
				var file = e.target.files[0];
				
				var oldBase64Size = file.size;
				
					//http://blog.csdn.net/linlzk/article/details/48654835
					var oReader = new FileReader();  
			        oReader.onload = function(e) {
			        	
			        	if (oldBase64Size>10*1024*1024) {
			    			cpic.alert("图片不能超过10M");
			    			return;
			    		}
			        	
			        	/*var rFilter = /^(image\/jpg|image\/jpeg|image\/png|image\/bmp)$/i; // 检查图片格式
			    		if (!rFilter.test(file.type)) {
			    			cpic.alert("请选择jpg、jpeg、png、bmp格式的图片");
			    			return;
			    		}*/
			    		//获取照片方向角属性，用户旋转控制
			    		EXIF.getData(file, function() {
			    		    EXIF.getAllTags(this); 
			    		    Orientation = EXIF.getTag(this, 'Orientation');
			    		});
			    		if(oldBase64Size>500*1024){//大于500K时进行压缩	
			    			var image = new Image();
							image.src = e.target.result;
							image.onload = function() {
								var expectWidth = this.naturalWidth;
								var expectHeight = this.naturalHeight;
								if (this.naturalWidth > this.naturalHeight && this.naturalWidth > maxWidths) {
									expectWidth = maxWidths;
									expectHeight = expectWidth * this.naturalHeight / this.naturalWidth;
								} else if (this.naturalHeight > this.naturalWidth && this.naturalHeight > maxHeights) {
									expectHeight = maxHeights;
									expectWidth = expectHeight * this.naturalWidth / this.naturalHeight;
								}
								var canvas = document.createElement("canvas");
								var ctx = canvas.getContext("2d");
								canvas.width = expectWidth;
								canvas.height = expectHeight;
								ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
								var base64 = null;
								var mpImg = new MegaPixImage(image);
									mpImg.render(canvas, {
										maxWidth: maxWidths,
										maxHeight: maxHeights,
										quality: compressRate,
										orientation: Orientation
									});
								base64 = canvas.toDataURL("image/jpeg", compressRate);
								  
								if (navigator.userAgent.match(/iphone/i)) {//修复ios
									var mpImg = new MegaPixImage(image);
									mpImg.render(canvas, {
										maxWidth: maxWidths,
										maxHeight: maxHeights,
										quality: compressRate,
										orientation: Orientation
									});
									base64 = canvas.toDataURL("image/jpeg", compressRate);
								}else if (navigator.userAgent.match(/Android/i)) {// 修复android
									var encoder = new JPEGEncoder();
									base64 = encoder.encode(ctx.getImageData(0, 0, expectWidth, expectHeight), 80);
								}else{
									var mpImg = new MegaPixImage(image);
									mpImg.render(canvas, {
										maxWidth: maxWidths,
										maxHeight: maxHeights,
										quality: compressRate,
										orientation: Orientation
									});
									
									base64 = canvas.toDataURL("image/jpeg", compressRate);
								}
							    //alert('压缩前：' +  Math.round(oldBase64Size/1024) +'kb,压缩后：' + Math.round(base64.length/1024)+'kb,压缩率：' + ~~(100 * (oldBase64Size - base64.length) / oldBase64Size) + "%");
								data.base64 = base64;
					            camera._onPhotoURISuccess(data);
							};
			    		}else{
			    			data.base64 = e.target.result;
				            camera._onPhotoURISuccess(data);
			    		}
			    		
						
					};  
			        oReader.readAsDataURL(file);
				
				
				
			} catch (e) {
				cpic.ui.loading.close();
				//cpic.alert("--启动相机或相册error-->"+e.name + "  " + e.message);
			}
		},
		//拍照成功后的回调
		_onPhotoURISuccess: function(data) {
			if (typeof data == 'string') {
				data = JSON.parse(data);
			}
			//console.log('拍照返回信息:' + data);
			try {
				var imageData = camera.imageData;
				imageData.push(data);
				var num = imageData.length;
				var html = '<span class="addPhoto" id="addPhoto_' + num + '" style="height: 71px;"><i class="select-no deletePhoto" id="deletePhoto_' + num + '"></i><img class="smallImage" id="smallImage_' + num + '" alt="" src="" uri="" index=' + num + ' width="100%" height="100%"></span>';
				camera.picID.before(html);
				
				var parentDiv = camera.picID.parent();
				var smallImage = parentDiv.find('.smallImage');
				var smallImageLen = smallImage.length;
				if (camera.picID.parent().hasClass('onePicLimit')) {
					if(smallImageLen>=2){
						parentDiv.find('.onePhoto').hide();
					}
				}else{
					if(smallImageLen>=10){
						parentDiv.find('.onePhoto').hide();
					}
				}
				
				$('#smallImage_' + num).attr('src', data.base64);
				$('#smallImage_' + num).attr('uri', data.fileName);
				
				/*$('#deletePhoto_' + num).on("click", function(e) {
					$('#addPhoto_' + num).parent().find('.onePhoto').show();
					$('#addPhoto_' + num).remove();
					e.stopPropagation();
				});*/
				camera._deletePhoto(num);
				
				camera.onLoadPhoto("#addPhoto_" + num, data.base64);
				myScroll2.refresh();
				myScroll3.refresh();
				cpic.ui.loading.close();
			} catch (e) {
				cpic.ui.loading.close();
				alert(e.name + '  ' + e.message);
			}
		},
		//删除图片
		_deletePhoto: function(num) {
			$('#deletePhoto_' + num).on("click", function(e) {
				$('#addPhoto_' + num).parent().find('.onePhoto').show();
				$('#addPhoto_' + num).remove();
				e.stopPropagation();
			});
		},
		//拍照失败回调
		_onFail: function(msg) {
			//cpic.alert("拍照出错信息：" + JSON.stringify(msg));
		},
		//点击图片时加载大图
		onLoadPhoto: function(iconPicture, imgUrl) {
			$(iconPicture).on('click', function() {
				try {
					var img = new Image();
					img.src = imgUrl;
					var width;
					var height;
					if (img.complete) {
						width = img.width;
						height = img.height;
					} else {
						img.onload = function() {
							width = img.width;
							height = img.height;
						};
					}
					var top = 0;
					var left = 0;
					var windowWidth = $(window).width();
					var windowHeight = $(window).height();
					if (width > windowWidth) {
						var proportion = windowWidth / width;
						width = windowWidth;
						height = height * proportion;
					} else if (width < windowWidth) {
						left = (windowWidth - width) / 2;
					}
					if (height < windowHeight) {
						top = (windowHeight - height) / 2;
					}
					var html = '';
					html += '<div class="jumpbox2 displayN preImg panel" id="preImg" style="top:0;background:#000;width:100%;height:100%">';
					html += '<div style="position:absolute; z-index:999;top:' + top + 'px;left:' + left + 'px;overflow:hidden;">';
					html += '<img id="preImage" style="vertical-align: middle;margin:0 auto;" alt="" src="' + imgUrl + '" width="' + width + '" height="' + height + '">';
					html += '</div></div>';

					$('body').append(html);
					$('#preImg').bind('click', function() {
						$('#preImg').hide();
						$('#preImg').unbind('click');
						$('#preImg').remove();
					});
					setTimeout(function() {
						$('#preImg').show();
					}, 200);
				} catch (e) {
					alert(e.name + '  ' + e.message);
				}
			});
		}
	};

	var uploadPhotos = {
		_el: {
			"requestObject": {
				"plateNo": photoInsurance.plateNo,
				"sysSource":"A"
			}
		},
		
		init: function() {
		},
		save: function() {
			var failFlag = true;
			var imageData = $('.smallImage');
			var uploadImgSize = imageData.length;
			if (app.mode == 'back' || app.mode == "returned") {
				if (uploadImgSize === 0) {
					location.href = 'choosingTaocan.html?type=' + app.type;
				}
			} else {
				if (uploadImgSize === 0) {
					cpic.ui.loading.close();
					cpic.alert("请先选择需要上传的文件！");
					return;
				} else if (app.type == 'idAndDriverLicensePics') {
					if ($('.driveInfo .smallImage').length == 0 || $('.idInfo .smallImage').length == 0) {
					//if ($('.driveInfo .smallImage').length == 0) {
						cpic.ui.loading.close();
						cpic.alert("请上传行驶证/合格证或身份证图片！");
						return;
					}
				} else if (app.type == 'policyLastYearPics') {
					if ($('.lastYearPolicy .smallImage').length == 0) {
						//if ($('.driveInfo .smallImage').length == 0) {
						cpic.ui.loading.close();
						cpic.alert("请上传旧保单图片！");
						return;
					}
				}else if (app.type == 'policyPics') {
					if ($('.thisYearPolicy .smallImage').length == 0) {
						//if ($('.driveInfo .smallImage').length == 0) {
						cpic.ui.loading.close();
						cpic.alert("请上传投保单图片！");
						return;
					}
				}
			}
			try {
				uploadPhotos._el.requestObject.dataList = [];
				$.each(imageData, function(index) {
					var data = {};
					data.data = $(this).attr('src').split('base64,')[1];
					if ($(this).parent().parent().hasClass('driveInfo')) {
						data.type = '2';
					} else if ($(this).parent().parent().hasClass('idInfo')) {
						data.type = '1';
					} else if ($(this).parent().parent().hasClass('lastYearPolicy')) {
						data.type = '3';
					} else if ($(this).parent().parent().hasClass('thisYearPolicy')) {
						data.type = '4';
					} else {
						data.type = '99';
					}
					uploadPhotos._el.requestObject.dataList.push(data);
				});
				uploadPhotos._submit();
			} catch (e) {
				alert(e.name + ' ' + e.message);
			}
		},
		
		_submit: function() {
			Interface.upload2Ftp(token,this._el,function(data) {
				if (data.resultCode == '0000') {
					photoInsurance.photoNum = data.busiNum;
					photoInsurance.tempPath = data.tempPath;
					common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
					var jsonStr = JSON.stringify(data);
		            //console.log("sucess:"+jsonStr);
					location.href = 'choosingTaocan.html?type=' + app.type;
				} else{
					cpic.ui.loading.close();
					cpic.alert(data.resultMessage);
				} 
			});
		}
	};
	
	var downloadPhotos = {
		_el: {
			"appType": "M",
			"clientType": "phone",
			"requestObject": {
				"agentCode": "",
				"agentName": "",
				"unitCode": "",
				"unitName": "",
				"branchCode": "",
				"busiNum": "",
				"tempPath": ""
			}
		},
		init: function() {
			this._el.requestObject.busiNum = photoInsurance.photoNum;
			this._el.requestObject.tempPath = photoInsurance.tempPath;
		},
		save: function() {
			//alert(this._el.requestObject.requestNo);
			var container = $(".addPhoto").children();
			if(container == null){
				cpic.alert("请先选择需要上传的文件！");
				return;
			}
			cpic.ui.loading.open();
			this._submit();
		},
		_submit: function() {
			Interface.queryByBusiNum(token,this._el,function(data) {
				var jsonStr = JSON.stringify(data);
	            //console.log("sucess:"+jsonStr);
				cpic.ui.loading.close();
				if (typeof data == 'string')
					data = JSON.parse(data);
				if (data.resultCode == "0000") {
					//$('#idPartView  .addPhoto').unbind('click');
					var a = 0;//第一行照片
					var b = 0;//第一行照片
					var c = 0;//补充资料照片
					try {
						var nHtml = '';
						var _type = util.GetQueryString('type');
						if (_type === "idAndDriverLicensePics") {
							var count = data.responseObject.length;
							for (var j = count-1; j >= 0 ; j--) {
								var num = data.responseObject[j].imgType;
								if (data.responseObject[j].imgType == 1) {//身份证
									var html = '';
									var base64 = "data:image/jpeg;base64,"+data.responseObject[j].imgBase64Data;
									html += '<span class="addPhoto" id="addPhoto_' + j + '" style="height: 71px;">';
									html += '<i class="select-no deletePhoto" id="deletePhoto_' + j + '"></i>';
									html += '<img class="smallImage" id="smallImage_' + j + '" alt="" src="'+ base64 +'" uri="" index=' + j + ' width="100%" height="100%">';
									html += '</span>';
									$(".idInfo").prepend(html);
									
									var imageData = camera.imageData;
									imageData.push(data);
									camera.onLoadPhoto("#addPhoto_" + j, base64);//显示大图的点击事件
									camera._deletePhoto(j);//删除按钮的点击事件
						            a++;
								}else if (data.responseObject[j].imgType == 2) {//行驶证
									var html = '';
									var base64 = "data:image/jpeg;base64,"+data.responseObject[j].imgBase64Data;
									html += '<span class="addPhoto" id="addPhoto_' + j + '" style="height: 71px;">';
									html += '<i class="select-no deletePhoto" id="deletePhoto_' + j + '"></i>';
									html += '<img class="smallImage" id="smallImage_' + j + '" alt="" src="'+ base64 +'" uri="" index=' + j + ' width="100%" height="100%">';
									html += '</span>';
									$(".driveInfo").prepend(html);
									
									var imageData = camera.imageData;
									imageData.push(data);
									camera.onLoadPhoto("#addPhoto_" + j, base64);//显示大图的点击事件
									camera._deletePhoto(j);//删除按钮的点击事件
						            b++;
								} else if (data.responseObject[j].imgType == 99) {
									var html = '';
									var base64 = "data:image/jpeg;base64,"+data.responseObject[j].imgBase64Data;
									html += '<span class="addPhoto" id="addPhoto_' + j + '" style="height: 71px;">';
									html += '<i class="select-no deletePhoto" id="deletePhoto_' + j + '"></i>';
									html += '<img class="smallImage" id="smallImage_' + j + '" alt="" src="'+ base64 +'" uri="" index=' + j + ' width="100%" height="100%">';
									html += '</span>';
									$(".noPicLimit1").prepend(html);
									
									var imageData = camera.imageData;
									imageData.push(data);
									camera.onLoadPhoto("#addPhoto_" + j, base64);//显示大图的点击事件
									camera._deletePhoto(j);//删除按钮的点击事件
									c++;
								}
								if(a==2){//2张图片隐藏上传按钮
									$(".idInfo").find('.onePhoto').hide();
								}
								if(b==2){//2张图片隐藏上传按钮
									$(".driveInfo").find('.onePhoto').hide();
								}
								if(c==9){//9张图片隐藏上传按钮
									$(".noPicLimit2").find('.onePhoto').hide();
								}
							}
						} else if (_type === "policyLastYearPics") {
							var count = data.responseObject.length;
							for (var j = count-1; j >= 0 ; j--) {
								var num = data.responseObject[j].imgType;
								if (data.responseObject[j].imgType == 3) {
									var html = '';
									var base64 = "data:image/jpeg;base64,"+data.responseObject[j].imgBase64Data;
									html += '<span class="addPhoto" id="addPhoto_' + j + '" style="height: 71px;">';
									html += '<i class="select-no deletePhoto" id="deletePhoto_' + j + '"></i>';
									html += '<img class="smallImage" id="smallImage_' + j + '" alt="" src="'+ base64 +'" uri="" index=' + j + ' width="100%" height="100%">';
									html += '</span>';
									$(".lastYearPolicy").prepend(html);
									
									var imageData = camera.imageData;
									imageData.push(data);
									camera.onLoadPhoto("#addPhoto_" + j, base64);//显示大图的点击事件
									camera._deletePhoto(j);//删除按钮的点击事件
						            a++;
								} else if (data.responseObject[j].imgType == 99) {
									var html = '';
									var base64 = "data:image/jpeg;base64,"+data.responseObject[j].imgBase64Data;
									html += '<span class="addPhoto" id="addPhoto_' + j + '" style="height: 71px;">';
									html += '<i class="select-no deletePhoto" id="deletePhoto_' + j + '"></i>';
									html += '<img class="smallImage" id="smallImage_' + j + '" alt="" src="'+ base64 +'" uri="" index=' + j + ' width="100%" height="100%">';
									html += '</span>';
									$(".noPicLimit2").prepend(html);
									
									var imageData = camera.imageData;
									imageData.push(data);
									camera.onLoadPhoto("#addPhoto_" + j, base64);//显示大图的点击事件
									camera._deletePhoto(j);//删除按钮的点击事件
									c++;
								}
								if(a==2){//2张图片隐藏上传按钮
									$(".lastYearPolicy").find('.onePhoto').hide();
								}
								if(c==9){//9张图片隐藏上传按钮
									$(".noPicLimit2").find('.onePhoto').hide();
								}
							}
						} else if (_type === "policyPics") {
							var count = data.responseObject.length;
							for (var j = count-1; j >= 0 ; j--) {
								var num = data.responseObject[j].imgType;
								if (data.responseObject[j].imgType == 4) {
									var html = '';
									var base64 = "data:image/jpeg;base64,"+data.responseObject[j].imgBase64Data;
									html += '<span class="addPhoto" id="addPhoto_' + j + '" style="height: 71px;">';
									html += '<i class="select-no deletePhoto" id="deletePhoto_' + j + '"></i>';
									html += '<img class="smallImage" id="smallImage_' + j + '" alt="" src="'+ base64 +'" uri="" index=' + j + ' width="100%" height="100%">';
									html += '</span>';
									$(".thisYearPolicy").prepend(html);
									
									var imageData = camera.imageData;
									imageData.push(data);
									camera.onLoadPhoto("#addPhoto_" + j, base64);//显示大图的点击事件
									camera._deletePhoto(j);//删除按钮的点击事件
						            a++;
								} else if (data.responseObject[j].imgType == 99) {
									var html = '';
									var base64 = "data:image/jpeg;base64,"+data.responseObject[j].imgBase64Data;
									html += '<span class="addPhoto" id="addPhoto_' + j + '" style="height: 71px;">';
									html += '<i class="select-no deletePhoto" id="deletePhoto_' + j + '"></i>';
									html += '<img class="smallImage" id="smallImage_' + j + '" alt="" src="'+ base64 +'" uri="" index=' + j + ' width="100%" height="100%">';
									html += '</span>';
									$(".noPicLimit2").prepend(html);
									
									var imageData = camera.imageData;
									imageData.push(data);
									camera.onLoadPhoto("#addPhoto_" + j, base64);//显示大图的点击事件
									camera._deletePhoto(j);//删除按钮的点击事件
									c++;
								}
								if(a==2){//2张图片隐藏上传按钮
									$(".thisYearPolicy").find('.onePhoto').hide();
								}
								if(c==9){//9张图片隐藏上传按钮
									$(".noPicLimit2").find('.onePhoto').hide();
								}
							}
							
						}
						
						cpic.ui.loading.close();
					} catch (e) {
						cpic.alert(e.name+'  '+e.message);
					}
					if (myScroll2)
						myScroll2.refresh();
					if (myScroll3)
						myScroll3.refresh();
				} else {
					cpic.alert("失败");
				}
			
			});
			
			
			
		}
	};
	
	var app = {
		type: '',
		mode: '',
		init: function() {
			camera.init();
			idPartView.init();
			policyPartView.init();
			//createRequestNo.init();
			uploadPhotos.init();
			this.type = util.GetQueryString('type');
			this.mode = util.GetQueryString('mode');
			if (this.type == 'idAndDriverLicensePics') {
				idPartView.render();
			} else if (this.type == 'policyLastYearPics') {
				policyPartView.render('请拍旧保单照片（必填）', 'old');
			} else if (this.type == 'policyPics') {
				policyPartView.render('请拍投保单照片（必填）');
			} else{
				window.location.href = "../tool/tools.html";
			}
			var crmObj = common.getLocalStorage("crmObj",true);
			if(crmObj.cameraInsureStatus == "returned") {
				this.mode = "returned";
			}
			if (photoInsurance.goImageTypeFlag=='1') {//1后退进入照片上传
				downloadPhotos.init();
				downloadPhotos.save();
			}
		}
	};
	app.init();
});
