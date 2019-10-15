var photoInsurance;//拍照报价对象

$(function(){
	photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);
	photoInsurance.goImageTypeFlag = "0";//0正常进入照片上传  1后退进入照片上传
	common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
	
	var imageChoosingView = {
		_el: $('#photoTypeView'),
		init: function(){
			this.render();
			this._bindEvents();
		},
		_bindEvents:function(){
			$('#idAndDriverLicensePics').on('click',function(){
				window.location.href = 'imageType.html?type=idAndDriverLicensePics';
			});
			$('#policyLastYearPics').on('click',function(){
				window.location.href = 'imageType.html?type=policyLastYearPics';
			});
			$('#policyPics').on('click',function(){
				window.location.href = 'imageType.html?type=policyPics';
			});
			$('#photoTypeView header .back').on('click',function(){
				util.setLocalStorage('isPhoto', '1', true);
				window.location.href='../newInsV2/carInsurance.html?version=1&returnSource=selfInsurance';
			});
			$('header .home').on('click',function(){
				window.location.href = '../tool/tools.html';
			});
		},
		render:function(){
			this._el.show();
			if(myScroll){
				myScroll.refresh();
			}
		}
	};
	var app = {
		init:function(){
			imageChoosingView.init();
		}
	};
	app.init();
});
