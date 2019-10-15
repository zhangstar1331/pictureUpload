/*
	Read Me
 拍照报价险种选择和确认页面
 util:工具类
 policyAdjustView:险种选择页面
 policyConfirmView:险种确认页面
 vsltaxView:车船税页面弹出层
 NewEquipmentCoverageInputView:新增设备损失险弹出层
 NewEquipmentCoverageDetailInputView：新增设备损失险添加设备弹出层
 jsonModel：参与接口交互的数据模型
 app：页面启动器

 util: 工具类 提供一些与页面逻辑无关的通用方法
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
var crmObj ;
var specialTagId ='';
$(function(){
	crmObj = common.getLocalStorage('crmObj',true);
	
	/*
	 * 特殊任务配置的获取
	 */
	var userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
	Interface.getSpecialTask(userInfo.unitCode,userInfo.userCode,"CAR_WHOLE",function(result){
		if(result.resultCode=="1"){
			if(!$.isEmptyObject(result.responseObject) && !$.isEmptyObject(result.responseObject.specialInfoList) && result.responseObject.specialInfoList.length > 0){
				var tpVal =  result.responseObject.specialInfoList;
				var temp = "";
				temp += "<span id=\""+tpVal[0].specialTagId+"\" class=\"listSpan\">"+tpVal[0].specialTaskName+"</span>";
				$("#specialId").append(temp);
			}
		}else if(result.resultCode=="2"){
			cpic.Prompt("登录超时，请重新登录");
			cpic.ui.loading.close();
			return;
		}else{
			cpic.ui.loading.close();
			cpic.alert("登录超时，请重新登录");
			return;
		}
		
		$(".listSpan").on("click",function(){
			if($(this).attr("style") == "background-color:red;"){
				$(this).attr("style","");
				specialTagId = '';
			}else{
				$(this).attr("style","background-color:red;");
				specialTagId = $(".listSpan").attr("id");
			}
			
		})
	});
	
	var util = {
		getNextDay:function (inDateStr){
			var inDate = new Date(inDateStr.replace(/-/g,'/'));
			var nextDate = new Date(inDate.getTime() + 24*60*60*1000);
			return nextDate.format('yyyy-MM-dd');
		},
		getNextYear:function (inDateStr){
			var inDate = new Date(inDateStr.replace(/-/g,'/')); //将传入的字符串转换为时间类型
			var nextYear = inDate.getFullYear() + 1; //下一年
			var month = inDate.getMonth() + 1; //当前月
			if(month < 10){
				month = "0" + month;
			}
			var day = inDate.getDate();
			if(day < 10){
				day = "0" + day;
			}
			var temp_year = new Date(nextYear + "/" + month + "/" + day).format('yyyy-MM-dd');
			return temp_year;
		},
	 	//获取跳转连接中？后面的键值对信息
		GetQueryString:function(name)
		{
		     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		     var r = window.location.search.substr(1).match(reg);
		     if(r!=null)return  unescape(r[2]); return null;
		}
	};
	var policyAdjustView = {
		_el : $('#policyAdjustView'),
		index : 0,
		init:function(){
  			this._el.show();
  			$('#policyStartTime').html(util.getNextDay(new Date().format('yyyy-MM-dd')) + " 00:00");
			$('#policyEndTime').html(util.getNextYear(util.getNextDay(new Date().format('yyyy-MM-dd'))) + " 00:00");
			if(util.GetQueryString('id')=='returnedPolicys') {
				this.dearlCoverages();
				
			} else {
				this._policyHtml(seniorPolicys,'yes','seniorPolicysDiv');
				this._policyHtml(diyPolicys,'no','diyPolicysDiv');
				//准备点击加载更多时的显示元素，每6个一组
				while(allPolicys.length>0){
					var tempArr = [];
					for(var i=0;i<6&&allPolicys.length>0;i++){
						tempArr.push(allPolicys.shift());
					}
					this._policyHtml(tempArr,'no','morePolicysDiv'+this.index);
					this.index++;
				}
				this._bindEvents();
				if(util.GetQueryString('id')=='seniorPolicys'){
					this.render('showSeniorPolicys');
				}else if(util.GetQueryString('id')=='diyPolicys'){
					this.render('showDiyPolicys');
				}
			}
			
		},
		dearlCoverages:function(){
			var chosenCoverages = app.crmObj.choosenCoverage;
			var leftCoverages = app.crmObj.leftCoverage;
			
			if(chosenCoverages.length == 0) {
				this._policyHtml(diyPolicys,'no','returnedPolicysDiv');
			} else {
				this._policyHtml(chosenCoverages,'yes','returnedPolicysDiv');
			}
			
			$('#returnedPolicysDiv').show();
			if(leftCoverages.length>0){
				this._policyHtml(leftCoverages,'no','morePolicysDiv'+this.index);
				this.index++;
			}
			if(app.crmObj.hasTcCoverage) {
				$("#vehicleTaxValue").html("正常缴税"+'<span class="table-arrow-down-orange"></span>');
			}
			this._bindEvents();
		},
		_bindEvents:function(){
			var i = 0;
			$('table img').on('singleTap',this._toggleSelectedState);
			$('#moreBtn').on('singleTap',(function(){
				if($('#moreBtn').hasClass('closing')){
					this.render('showMorePolicys',i);
					i++;
				}
			}).bind(this));
			$('#policyDuration').on('singleTap',this.chooseTime);
			$('#policyAdjustView header .back').on('singleTap',this._back.bind(this));
			$('#policyAdjustView .renewal_btn_div').on('singleTap',this._next.bind(this));
			$('.adjustItems').on('singleTap',this._amountAdjust);
			$('#policyStartTime').scroller('destroy').scroller(
				$.extend({
					preset : 'date',
					minDate:new Date(),
					dateOrder : 'yymmdd',
			        theme : 'android-ics light',
			        mode : 'scroller',
			        lang : 'zh',
			        minWidth : parseInt($(window).width()/3)-16,  //用于时间控件占据屏幕整个宽度
			        onSelect : function(result){
						$("#policyStartTime").html(result+' 00:00');
						$('#policyEndTime').html(util.getNextYear(result+' 00:00')+' 00:00');
			        }
		    	})
			);
		},
		render:function(mode,i){
			this._el.show();
			//根据mode不同展示不同的模块并切换更多按钮的字段
			switch(mode){
				case('showSeniorPolicys'):
					$('#seniorPolicysDiv').show();
					$('#diyPolicysDiv').remove();
					break;
				case('showDiyPolicys'):
					$('#diyPolicysDiv').show();
					$('#seniorPolicysDiv').remove();
					break;
				case('showMorePolicys'):
					$('#morePolicysDiv'+i).show();
					if(this.index-1==i){
						$('#moreBtn').removeClass('closing');
						$('#moreBtn').html('已经全部加载');
					}
					break;
				default:
					break;
			}
			if(myScroll)
				myScroll.refresh();
		},
		//组装险种套餐的HTML
		_policyHtml:function(policys,selectedFlag,domID){
			var html = '<table id="'+domID+'" hidden="hidden"  class="renewal_table" style="border:none;">';
			$.each(policys,function(){
				html+='<tr><td width="10%"><img parent='+(this.parent?this.parent:'-1')+' parentid='+(this.parentID?this.parentID:'-1')+' src="../../images/cameraQuote/choose_'+selectedFlag+'.png" info="'+this.name+'|'+(this.amount?this.amount:'投保')+'" class="greenPic '+(selectedFlag=='yes'?'selectedPolicy':'')+'"><td width="40%"  class="color-8c itemName">'+this.name+'</td><td class="font-black font-1em adjustItems " style="visibility:'+(selectedFlag=='yes'?'visible':'hidden')+'">'+(this.amount?(this.amount+'<span class="table-arrow-down-orange"></span>'):'')+'</td>';
			});
			html+='</tr></table>';
			$('#bzPolicysDiv').append(html);
		},
		//点击勾选险种或取消选中
		_toggleSelectedState:function(){
			//先验证该险种的主险已经勾选
			if(!policyAdjustView._isParentSelected.call(this,'selecting'))
				return ;
			if($(this).attr('src')==='../../images/cameraQuote/choose_yes.png'){
				$(this).removeClass('selectedPolicy');
				$(this).attr('src','../../images/cameraQuote/choose_no.png');
				if($(this).attr("parent") == '6'){//如果是玻璃单独破碎险点击险种取消的时候需要清空区域而非隐藏modify by xxl 2016-5-10
					$(this).parent().siblings('.adjustItems').html("");
				}else{
					$(this).parent().siblings('.adjustItems').css('visibility','hidden');
				}
				//主险取消 对应的所有附加险也要取消
				if($(this).attr('parent')!='-1'){
					policyAdjustView._cancelInsurance.call(this,'firstTime');
				}
			}else{
				$(this).attr('src','../../images/cameraQuote/choose_yes.png');
				$(this).addClass('selectedPolicy');
				policyAdjustView._amountAdjust.call(this,2);
				$(this).parent().siblings('.adjustItems').css('visibility','visible');
			}
			if($(this).attr('info')==='交强险|投保'){
				policyAdjustView._toggleSelectedState.call($('#vsltaxPolicy'),null);
			}
		},
		//保额更改事件
		//mode为空表示点击保额时选择保额，mode为2表示勾选某个必须填写保额的险种时选择保额
		_amountAdjust:function(mode){
			if(mode===2){
				name = $(this).parent().siblings('.itemName').html();
				var self = $(this).parent().siblings('.adjustItems');
			}else{
				if($(this).parent().find('img').attr('src')!='../../images/cameraQuote/choose_yes.png'){
					return ;
				}
				 name = $(this).siblings('.itemName').html();
				 var self = this ;
				 if(name=='车船税'){
				 	policyAdjustView._el.hide();
				 	vsltaxView.render();
				 }
			}
			if(app.isNewCarReform){
				if(name=='第三者责任险'){
					params = ["50,000", "100,000", "150,000", "200,000", "300,000", "500,000", "1,000,000", "1,500,000", "2,000,000"];
					defaultVal = $(this).html().split('元')[0];
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result+'元<span class="table-arrow-down-orange"></span>');
					});
				}else if(name=='车上司机责任险'|name=='车上乘客责任险'){
					params = ["10,000", "20,000", "30,000", "40,000", "50,000", "80,000", "100,000", "150,000", "200,000", "300,000", "500,000", "1,000,000"];
					defaultVal = $(this).html().split('元')[0];
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						if(name=='车上司机责任险')
							$(self).html(result+'元<span class="table-arrow-down-orange"></span>');
						else
							$(self).html(result+'元/座<span class="table-arrow-down-orange"></span>');
					});
				}else if('玻璃破碎险'==name){
					params = ['国产','进口'];
					defaultVal = '国产';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '<span class="table-arrow-down-orange"></span>');

					});
				}else if('车身划痕损失险'==name){
					params = ['2,000','5,000','10,000','20,000'];
					defaultVal = '2,000';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '元<span class="table-arrow-down-orange"></span>');

					});
				}else if('新增设备损失险'==name){
					policyAdjustView._el.hide();
					NewEquipmentCoverageInputView.render();
				}
				else if('修理期间费用补偿险'==name){
					policyAdjustView._el.hide();
					RepairPeriodCompensationSpecialClauseInputView.render();
					}
			}else {
				if(name=='第三者责任险'){
					params = ["50,000", "100,000", "150,000", "200,000", "300,000", "500,000", "1,000,000", "1,500,000", "2,000,000"];
					defaultVal = $(this).html().split('元')[0];
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result+'元<span class="table-arrow-down-orange"></span>');
					});
				}else if(name=='车上人员责任险（司机）'|name=='车上人员责任险（乘客）'){
					params = ["10,000", "20,000", "30,000", "40,000", "50,000", "80,000", "100,000", "150,000", "200,000", "300,000", "500,000", "1,000,000"];
					defaultVal = $(this).html().split('元')[0];
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						if(name=='车上人员责任险（司机）')
							$(self).html(result+'元<span class="table-arrow-down-orange"></span>');
						else
							$(self).html(result+'元/座<span class="table-arrow-down-orange"></span>');
					});
				}else if('玻璃单独破碎险'==name){
					params = ['国产','进口'];
					defaultVal = '国产';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '<span class="table-arrow-down-orange"></span>');

					});
				}else if('车身油漆损伤险'==name){
					params = ['2,000','5,000','10,000','20,000'];
					defaultVal = '2,000';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '元<span class="table-arrow-down-orange"></span>');

					});
				}else if('车损免赔额特约'==name){
					params = ['300','500','1,000','2,000'];
					defaultVal = '300';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '元<span class="table-arrow-down-orange"></span>');

					});
				}else if('法律服务特约'==name){
					params = ['5,000','10,000','20,000'];
					defaultVal = '5,000';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '元<span class="table-arrow-down-orange"></span>');

					});
				}else if('精神损害抚慰金特约'==name){
					params = ['20,000','50,000'];
					defaultVal = '20,000';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '元<span class="table-arrow-down-orange"></span>');

					});
				}else if('道路污染责任险'==name){
					params = ['50,000','100,000','200,000','300,000','500,000'];
					defaultVal = '50,000';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '元<span class="table-arrow-down-orange"></span>');

					});
				}else if('指定专修厂特约'==name){
					params = ['国产  0.15','进口  0.3'];
					defaultVal = '国产  0.15';
					$(this).attr('src','../../images/cameraQuote/choose_no.png').removeClass('selectedPolicy');
					$(this).scratcher(params,defaultVal,function(result){
						$(self).parent().find("img").attr('src','../../images/cameraQuote/choose_yes.png').addClass('selectedPolicy');
						$(self).html(result + '<span class="table-arrow-down-orange"></span>');
					});
				}else if('新增设备损失险'==name){
					policyAdjustView._el.hide();
					NewEquipmentCoverageInputView.render();
				}else if('修理期间费用补偿特约'==name){
					policyAdjustView._el.hide();
					RepairPeriodCompensationSpecialClauseInputView.render();
				}
			}
		},
		//返回上一页
		_back:function(){
			this._el.hide();
			window.location.href = 'choosingTaocan.html';
		},
		//到下一页面
		_next:function(){
			this._el.hide();
			policyConfirmView.render();
		},
		//勾选险种时，判断该险种依赖的主险是否已经勾选。
		//mode有值时，表示正在进行险种选择，如果勾选非法要进行提示。
		//mode没值时，应对附加险不计免赔这种可以依赖多个险种的险种。例如，勾选了
		//玻璃破碎险和划痕险，取消划痕险的时候，判断附加险不计免赔险有没有别的可依赖险种。
		//此时还有玻璃破碎险，所以附加险不计免赔可以继续为勾选状态。
		_isParentSelected:function(mode){
			var flag = true ;
			if($(this).attr('parentid')!=-1){
				var parentid = $(this).attr('parentid').split('_');
				var that = this ;
				if(parentid.length==1){
					$.each($('.greenPic'),function(){
						if($(this).attr('parent')==parentid&&(!$(this).hasClass('selectedPolicy'))){
							if('selecting'==mode){
								cpic.alert('您需要先勾选'+$(this).parent().siblings('.itemName').html());
							}
							flag = false;
						}
					});
				}else{
					var parentArr = [];
					$.each($('.greenPic'),function(){
						for(var i = 0 ;i < parentid.length ; i ++ ){
							if($(this).attr('parent')==parentid[i])
								parentArr.push(this);
						}
					});
					flag = parentArr.some(function(item){
						return $(item).hasClass('selectedPolicy');
					});
					if((!flag)&&'selecting'==mode) cpic.alert('您需要先勾选该险种依赖的险种');
				}
			}
			 return flag;
		},
		//取消一个险种时，把所有该险种的子险也取消掉。
		//递归栈深度最大为2，第一层通过主险取消附加险，第二层通过附加险取消附加险对应的不计免赔
		_cancelInsurance:function(mode){
			var parent = $(this).attr('parent');
			$.each($('.greenPic'),function(){
				if('firstTime'==mode&&$(this).attr('parent')>5){
					policyAdjustView._cancelInsurance.call(this,'secondTime');
				}
				var parentid = $(this).attr('parentid').split('_');

				for(var i = 0;i<parentid.length;i++){
					if(parentid[i]==parent){
						if(parentid.length>0&&policyAdjustView._isParentSelected.call(this,'justCheck')){
						}else{
							$(this).removeClass('selectedPolicy');
							$(this).attr('src','../../images/cameraQuote/choose_no.png');
						}
					}
				}
			});
		}
	};
	//险种确认视图
	var policyConfirmView = {
		_el:$('#policyConfirmView'),
		init:function(){
			this._el.hide();
			this._bindEvents();
		},
		_bindEvents:function(){
			$('#policyConfirmView header .back').on('singleTap',this._back.bind(this));
			$('#policyConfirmView .renewal_btn_div').on('singleTap',this._next);
			$('#policyConfirmView header .home').on('singleTap',function(){
				location.href = '../tool/tools.html';
			});		},
		render:function(){
			this._assmblePolicys();
			this._el.show();
			myScroll2.refresh();
		},
		//组装已经选择的套餐列表
		_assmblePolicys:function(){
		//	var html = '<table class="renewal_table" style="border: none; display: table;"><tbody>';
			var html = '';
			var policySelected = [];
			if($('#seniorPolicysDiv').css('display')&&$('#seniorPolicysDiv').css('display')!=='none'){
				policySelected = policySelected.concat($('#seniorPolicysDiv .selectedPolicy'));
			}else if($('#diyPolicysDiv').css('display')&&$('#diyPolicysDiv').css('display')!=='none'){
				policySelected = policySelected.concat($('#diyPolicysDiv .selectedPolicy'));
			} else if($('#returnedPolicysDiv').css('display')&&$('#returnedPolicysDiv').css('display')!=='none') {
				policySelected = policySelected.concat($('#returnedPolicysDiv .selectedPolicy'));
			}
			for(var i=0;i<policyAdjustView.index;i++){
				policySelected = policySelected.concat($('#morePolicysDiv'+i+' .selectedPolicy'));
			}
			policySelected = policySelected.concat($('#tcPolicyDiv .selectedPolicy'));
			$.each(policySelected,function(){
				var info = $(this).attr('info').split('|');
				var temp = $(this).parent().siblings('.adjustItems').html()?$(this).parent().siblings('.adjustItems').html().split('<span')[0]:'投保';
				html+=' <div class="item-noborder"><div class="item-name policySelected">'+info[0]+'</div><div class="floatright color-333" style="margin-top: 0.4em;">'+temp+'</div></div>';
			});
			$('#policysChoosenItems').html(html);

			$('#confirmWordsLeaving').val($('#wordsLeaving').val());
		},
		_back:function(){
			this._el.hide();
			policyAdjustView.render('stayUnchanged');
		},
		_next:function(){
			jsonModel.save();
		}
	};
	var NewEquipmentCoverageInputView ={
		_el:$('#NewEquipmentCoverageInputView'),
		deviceModelArr:[],
		init:function(){
			this._el.hide();
			this._bindEvents();
		},
		_bindEvents:function(){
			$('#NewEquipmentCoverageInputView .back').on('singleTap',(function(){
				this._el.hide();
				policyAdjustView.render();
			}).bind(this));
			$('#NewEquipmentCoverageInputAdd').on('singleTap',(function(){
				this._el.hide();
				NewEquipmentCoverageDetailInputView.render();
			}).bind(this));
			$('#NewEquipmentCoverageInputConfirm').on('singleTap',(function(){
				this._el.hide();
				policyAdjustView.render();
			}).bind(this));
		},
		render:function(){
			var html = '';
			$.each(this.deviceModelArr,function(index){
				html+='<tr><td width="33%" class="deviceName">'+this.name+'</td><td width:"33%">'+this.value+'</td><td><span index='+index+' class="icon-substra1"></span></td></tr>';
			});
			$('#newEQTable').html(html);
			$('#NewEquipmentCoverageInputView .icon-substra1').on('singleTap',function(){
				$(this).parent().parent().remove();
			 	var name = $(this).parent().siblings('.deviceName').html();
			 	$.each(NewEquipmentCoverageInputView.deviceModelArr,function(index){
			 		if(name == this.name){
			 			NewEquipmentCoverageInputView.deviceModelArr.splice(index,1);
			 			return false;
			 		}
			 	});
			});
			this._el.show();
		}
	};
	var NewEquipmentCoverageDetailInputView ={
		_el:$('#NewEquipmentCoverageDetailInputView'),
		init:function(){
			this._el.hide();
			this._bindEvents();
		},
		_bindEvents:function(){
			$('#produceAreaSort').on('singleTap',function(){
				var self = this ;
				$(this).scratcher(['国产','进口'],'国产',function(result){
					$(self).val(result);
				});
			});
			$('#purchaseDate').scroller('destroy').scroller(
				$.extend({
					preset : 'date',
					maxDate: new Date(),
					dateOrder : 'yymmdd',
			        theme : 'android-ics light',
			        mode : 'scroller',
			        lang : 'zh',
			        minWidth : parseInt($(window).width()/3)-16,  //用于时间控件占据屏幕整个宽度
			        onSelect : function(result){
						$("#purchaseDate").val(result);
			        }
		    	})
			);
			$('#NewEquipmentCoverageDetailConfirm').on('singleTap',(function(){
				if(this._checkRequired()){
					var device = JSON.copy(deviceModel);
					device.name = $.trim($('#deviceName').val());
					device.origin = $.trim($('#produceAreaSort').val());
					device.brand = $.trim($('#deviceBrand').val())?$.trim($('#deviceBrand').val()):'';
					device.value = $.trim($('#purchaseAmount').val());
					device.purchaseDate = $.trim($('#purchaseDate').val());
					device.remark = $.trim($('#remark').val())?$.trim($('#remark').val()):'';
					NewEquipmentCoverageInputView.deviceModelArr.push(device);
					this._el.hide();
					NewEquipmentCoverageInputView.render();
				}
			}).bind(this));
			$('#NewEquipmentCoverageDetailInputView .back').hide();
			// $('#NewEquipmentCoverageDetailInputView .back').on('singleTap',this._back.bind(this));
		},
		render:function(){
			this._clear();
			this._el.show();
		},
		//新打开一个添加设备的页面，要把之前上一个设备的信息清空
		_clear:function(){
			$.each($('#NewEquipmentCoverageDetailInputView').find('.input-style'),function(){
				$(this).val('');
			});
			$('#NewEquipmentCoverageDetailInputView textarea').val('');
		},
		//判断是够有必填项没填
		_checkRequired:function(){
			if($.trim($('#deviceName').val())==''){
				cpic.alert('请填写设备名称');
				return ;
			}else if($.trim($('#produceAreaSort').val())==''){
				cpic.alert('请填写产地');
				return ;
			}else if($.trim($('#purchaseAmount').val())==''||(!(new RegExp("^[0-9]*$").test($.trim($('#purchaseAmount').val()))))){
				cpic.alert('请填写正确的实际价值');
				return ;
			}else if($.trim($('#produceAreaSort').val())==''){
				cpic.alert('请填写设备购买时间');
				return ;
			}else{
				return true;
			}
		},
		_back:function(){
			this._el.hide();
			NewEquipmentCoverageInputView.render();
		}
	};
	var RepairPeriodCompensationSpecialClauseInputView ={
		_el:$('#RepairPeriodCompensationSpecialClauseInputView'),
		info:{},
		init:function(){
			this._el.hide();
			this._bindEvents();
		},
		_bindEvents:function(){
			$('#RepairPeriodCompensationSpecialClauseInputView .back').hide();
			// $('#RepairPeriodCompensationSpecialClauseInputView .back').on('singleTap',this._back.bind(this));
			$('#RepairPeriodCompensationSpecialClauseInputConfirm').on('singleTap',this._confirm.bind(this));
			$('#RepairPeriodCompensationSpecialClauseJE').on('singleTap',function(){
				var params = ['100','200','300'];
				var defaultVal ='100';
				var self = this ;
				$(this).scratcher(params,defaultVal,function(result){
					$(self).val(result);
				});
			});
		},
		_confirm:function(){
			if(''==$.trim($('#RepairPeriodCompensationSpecialClauseTS'))){
				cpic.alert('请填写补偿天数');
			}else if(''==$.trim($('#RepairPeriodCompensationSpecialClauseJE'))){
				cpic.alert('请填写日补偿金额');
			}else {
				dayCount = $("#RepairPeriodCompensationSpecialClauseTS").val();
				if(!this.check_daycount(dayCount)) return ;
				this.info['补偿天数'] = $.trim($('#RepairPeriodCompensationSpecialClauseTS').val());
				this.info['日补偿金额'] =$.trim($('#RepairPeriodCompensationSpecialClauseJE').val());
				this._el.hide();
				policyAdjustView.render();
			}
		},
		//检查补偿天数必须是0-90的数字
	 	check_daycount:function(_daycount){
			if(isNaN(_daycount)){
				cpic.alert("<span class='font1em'>天数必须得是数字</span>");
			//	cpic.ui.loading.close();
				return false;
			}
			if((/^\\d+$/.test(_daycount)) || (new Number(_daycount)<1||new Number(_daycount)>90)){
				cpic.alert("<span class='font1em'>天数需介于[1,90]之间</span>");
				//$("#RepairPeriodCompensationSpecialClauseTS").val("");
			//	cpic.ui.loading.close();
				return false;
			}
			return true;
		},
		_back:function(){
			this._el.hide();
			policyAdjustView.render();
		},
		render:function(){
			this._el.show();
		}
	};
	var vsltaxView ={
		_el:$('#vsltaxView'),
		_vsltaxMode:'',  //车船税类型(标准 V3 还是分公司特殊的)
		_vsltaxStateArr:[],	//根据车船税类型保存对应字段
		vsltaxInfo:{},	//车船税页面信息，组装请求报文时用的
		init:function(){
			this._el.hide();
			//车船税起止日期
			var noplatNumClick=localStorage.noplatNumClick;
			if(noplatNumClick =="1"){
				// var _date=new Date();
				$('#tax-startDate').val(new Date().format('yyyy-MM')+"-01");
				$('#tax-endDate').val(new Date((new Date()).format("yyyy"),11,31).format("yyyy-MM-dd"));
			}else{
				$('#tax-startDate').val(new Date((new Date()).format("yyyy"),0,1).format("yyyy-MM-dd"));
				$('#tax-endDate').val(new Date((new Date()).format("yyyy"),11,31).format("yyyy-MM-dd"));
			}

			// $('#tax-startDate').val(util.getNextDay(new Date().format('yyyy-MM-dd')));
			// $('#tax-endDate').val(util.getNextYear(util.getNextDay(new Date().format('yyyy-MM-dd'))));

			if(localStorage.unitDef){
				var unitDef = JSON.parse(localStorage.unitDef);
				if(unitDef.organParams.hasTrafficPlatCountry == '1'){
					this._vsltaxMode = 'V3';
					this._vsltaxStateArr = ['正常缴税','免税','减税','已完税','拒缴'];
					$('#tax-taxState').val('正常缴税');
					$("#vsltax_taxBureauName_div").html("开具税务机关名称/<br>完税凭证税务机关名称:");
					$("#vsltax_taxBureau_div").html("开具减免税/<br>完税凭证税务机关代码:");
					$("#tax-ctrl-deductionDueCode-div").html("减免税原因代码：");
					this.vsltaxInfo['纳税状态'] = '正常缴税';
				}else if('5040100' == unitCode ||'1020100' == unitCode || '5020100' == unitCode || '3040100' == unitCode || '1010100' == unitCode || '3010100' == unitCode || '6010100' == unitCode || '7040100' == unitCode){//重庆、广西、天津、深圳、宁波、北京、上海、四川、宁夏
					this._vsltaxMode  = unitCode;
				}else if((!unitDef.organParams.hasTrafficPlatCountry)||unitDef.organParams.hasTrafficPlatCountry=='0'){
					this._vsltaxMode  = "standard";
					this._vsltaxStateArr = ['纳税','免税','减税','完税','拒缴'];
					$('#tax-taxState').val('纳税');
					this.vsltaxInfo['纳税状态'] = '纳税';
				}
			}
			this.vsltaxInfo['车船税起期'] = $('#tax-startDate').val();
			this.vsltaxInfo['车船税止期'] = $('#tax-endDate').val();
			this._checkVsltaxState();
			this._bindEvents();
		},
		_bindEvents:function(){
			$('#tax-startDate').scroller('destroy').scroller(
				$.extend({
					preset : 'date',
					// minDate:new Date(),
					dateOrder : 'yymmdd',
			        theme : 'android-ics light',
			        mode : 'scroller',
			        lang : 'zh',
			        minWidth : parseInt($(window).width()/3)-16,  //用于时间控件占据屏幕整个宽度
			        onSelect : function(result){
						$("#tax-startDate").val(result);
						// $('#tax-endDate').val(util.getNextYear(result));
			        }
		    	})
			);
			$('#tax-taxState').on('singleTap',function(){
				var self = this;
				var defaultVal = $(this).val();
				$(this).scratcher(vsltaxView._vsltaxStateArr,defaultVal,function(result){
					$(self).val(result);
					vsltaxView._checkVsltaxState();
				});
			});
			$('#btn_close_tax').on('singleTap',function(){
				var flag = true;
				$("#vehicleTaxValue").html($('#tax-taxState').val()+'<span class="table-arrow-down-orange"></span>');
				vsltaxView.vsltaxInfo = {};
				$.each($('#vsltaxView li'),function(){
					if($(this).hasClass('required')){
						if($.trim($(this).find('.input-style').val())==''){
							flag = false;
							cpic.alert('请填写'+$(this).find('.ul-li-span-left').html());
							return false;
						}
						vsltaxView.vsltaxInfo[$(this).find('.ul-li-span-left').html()]=$.trim($(this).find('.input-style').val());
					}
				});
				if(flag){
					vsltaxView._el.hide();
					policyAdjustView.render();
					console.log(JSON.stringify(vsltaxView.vsltaxInfo));
				}
			});
		},
		render:function(){
			this._el.show();
		},
		//切换纳税状态时，改变页面必录项
		_checkVsltaxState:function(){
			var vsltaxState = $('#tax-taxState').val();
			$('#vsltaxView li').hide();
			$.each($('#vsltaxView li'),function(){
				$(this).removeClass('required');
			});
			$('#tax-startDateDiv').show().addClass('required');
			$('#tax-endDateDiv').show().addClass('required');
			$('#tax-taxStateDiv').show().addClass('required');
			if('V3'==this._vsltaxMode){
				switch(vsltaxState){
					case('正常缴税'):
						// $('#tax-ctrl-taxPayer').show();
						// $('#vsltax_taxBureauNameDiv').show();
						// $('#vsltax_taxBureauDiv').show();
						// $('#vsltax_taxActualAmendPremiumDiv').show();
						// $('#vsltax_registryNumberDiv').show();
						break;
					case('免税'):
						$('#tax-payerNameDiv').show().addClass('required');
						$('#tax-ctrl-deductionDueCode').show().addClass('required');
						$('#vsltax_vsltax_taxBureauDiv').show().addClass('required');
						$('#vsltax_deductionDueTypeDiv').show().addClass('required');
						$('#vsltax_deductionDueType').val('免税').addClass('required');
				 		$('#vsltax_deductionDueType').unbind();
				 		$('#vsltax_deductionDueType .arrow-down-orange').hide();

				 		// 确认车船税减免状态时,减免类型 和 减免方案代码 是否一致
				 		$('#vsltax_deductionDueType').on('singleTap',function(){
			 				var params = ['比例减免','金额减免'];
			 				$(this).scratcher(params,'比例减免',function(result){
			 					$('#vsltax_deductionDueType').val(result);
			 					if('比例减免'==result){
			 						$('#tax-taxFreeDiv').hide().removeClass('required');
			 						$('#vsltax_deductionDueProportionDiv').show().addClass('required');
			 					}else if('金额减免'==result){
			 						$('#vsltax_deductionDueProportionDiv').hide().removeClass('required');
			 						$('#tax-taxFreeDiv').show().addClass('required');
			 					}
			 				});
			 			});
			 			$('#tax-deductionDueCode').on('singleTap',function(result){
			 				var params = ['具备减免税证明','能源减免','其他'];
			 				$(this).scratcher(params,'具备减免税证明',function(result){
			 					$('#tax-deductionDueCode').val(result);
			 				})
			 			});
				 		// $('#vsltax_taxBureauDiv').show();
				 		// $('#vsltax_taxActualAmendPremiumDiv').show();
				 		// $('#vsltax_registryNumberDiv').show();
				 		// $('#tax-taxCertNo2Div').show();
				 		break;
			 		case('减税'):
			 			$('#tax-payerNameDiv').show().addClass('required');
			 			$('#tax-ctrl-deductionDueCode').show().addClass('required');
			 			$('#vsltax_vsltax_taxBureauDiv').show().addClass('required');
			 			$('#vsltax_deductionDueTypeDiv').show().addClass('required');
			 			$('#vsltax_deductionDueType .arrow-down-orange').show();
			 			$('#vsltax_taxBureauNameDiv').show().addClass('required');
			 			$('#vsltax_deductionDueType').on('singleTap',function(){
			 				var params = ['比例减免','金额减免'];
			 				$(this).scratcher(params,'比例减免',function(result){
			 					$('#vsltax_deductionDueType').val(result);
			 					if('比例减免'==result){
			 						$('#tax-taxFreeDiv').hide().removeClass('required');
			 						$('#vsltax_deductionDueProportionDiv').show().addClass('required');
			 					}else if('金额减免'==result){
			 						$('#vsltax_deductionDueProportionDiv').hide().removeClass('required');
			 						$('#tax-taxFreeDiv').show().addClass('required');
			 					}
			 				});
			 			});
			 			$('#tax-deductionDueCode').on('singleTap',function(result){
			 				var params = ['具备减免税证明','能源减免','其他'];
			 				$(this).scratcher(params,'具备减免税证明',function(result){
			 					$('#tax-deductionDueCode').val(result);
			 				})
			 			});
			 			// $('#vsltax_deductionDueType').val('免税').attr('readonly','readonly');
			 			// $('#vsltax_taxActualAmendPremiumDiv').show();
			 			// $('#tax-taxCertNo2Div').show();
			 			break;
		 			case('已完税'):
		 				$('#tax-taxCertNoDiv').show().addClass('required');
		 				//$('#vsltax_taxBureauDiv').show().addClass('required');
		 				$('#vsltax_taxBureauNameDiv').show().addClass('required');
		 				// $('#vsltax_taxActualAmendPremiumDiv').show();
		 				// $('#tax-taxFreeDiv').show();
		 				break;
	 				case('拒缴'):
	 					break;
 					default:
 						break;
				}
			}else if('standard'==this._vsltaxMode){
				switch(vsltaxState){
					case('纳税'):
						break;
					case('免税'):
						$('#tax-taxCertNo2Div').show().addClass('required');
						$('#tax-taxFreeDiv').show().addClass('required');
						$('#tax-taxOfficeDiv').show().addClass('required');
						$('#tax-deductionDueCode').unbind().on('singleTap',function(result){
							var params = ['具备减免税证明','能源减免','其他'];
							$(this).scratcher(params,'具备减免税证明',function(result){
								$('#tax-deductionDueCode').val(result);
							});
						});
						break;
					case('减税'):
						$('#tax-taxCertNo2Div').show().addClass('required');
						$('#tax-taxFreeDiv').show().addClass('required');
						$('#tax-taxOfficeDiv').show().addClass('required');
						$('#tax-ctrl-deductionDueCode').show().addClass('required');
						$('#tax-deductionDueCode').unbind().on('singleTap',function(result){
							var params = ['具备减免税证明','能源减免','其他'];
							$(this).scratcher(params,'具备减免税证明',function(result){
								$('#tax-deductionDueCode').val(result);
							});
						});
						break;
					case('完税'):
						$('#tax-taxCertNoDiv').show().addClass('required');
						$('#tax-taxOfficeDiv').show().addClass('required');
						break;
					case('拒缴'):
						break;
					default:
						break;
				}
			}
			setTimeout(function(){myScroll3.refresh()},500);
		}
	};
	var jsonModel ={
		_el:{
 		 	"appType":"M",
  			"clientType":"phone",
  			"requestObject":{
		 		"unitCode":"",//分公司代码
     			"applyNo":"",  //任务申请号
     			"taskType":"1",//操作类型
     			"callFunction":"7",//调用后台具体方法
     			"memos":'',//险种信息
     			"remark":'', //备注
     			"vehicleLicense": '', //车牌号
     			
     			"busiCode":"",//业务来源
     			
     			"agentCode":"",//登录人员
     			
     			"agencyCode":"",//代理点代码
     			"agencyName":"",//代理点名称
     			
     			"brandCode":"",//车商代码  渠道合作代码
     			"foursName":"",	//渠道合作代码~~车商代码名称
     			
     			"businessClass":"",//业务种类  
     			"businessKindName":"",	//业务种类名称
     			
     			"unifyCode":"",//统保代码
     			"tbdmName":"",	//统保代码名称
     			
     			"assesResponsible":"",//经办人
     			"assesRname":"",//经办人(数组)
     			
     			"certificateNo":[],//销售人员(数组)
     			
     			"vehicleInspection":"",//验车情况
     			"vehicleInspectionName":"",	//验车情况对应名称
     			
     			"globalType":"",//综合类型
     			
     			"salesCode":"",//寿险营销员代码
     			"lifeAgentName":"",	//寿险营销员名称
     			
     			"lifeAgentFlag":"",//交叉渠道业务来源
     			"lifeAgentFlagName":"",	//交叉渠道业务来源名称
     			
     			"actualSalesPerson":"",//实际销售人员
     			
     			"userMobile":"",//手机号
     			"specialTagId":'',
     			"taskCode":'',
     			"telephone":'',
     			"linkman":''
  			}
		},
		init:function(){
			if(localStorage.userInfo){
				var obj = JSON.parse(localStorage.userInfo);
				this._el.requestObject.unitCode = obj.unitCode;
				this._el.requestObject.agentCode = obj.userCode;
				this._el.requestObject.applyNo = localStorage.requestNo;
				this._el.requestObject.memos ='12345';
			}
			if(common.isNotNull(crmObj) && common.isNotNull(crmObj.returnType)){
				 if('8' == crmObj.returnType){
					 this._el.requestObject.taskType = '5';
					 this._el.requestObject.taskCode = 'CAR_WHOLE';
				}else if('7' == crmObj.returnType){
					 this._el.requestObject.taskCode = 'CAR_PRICE';
				}
			}
			var businessSource = JSON.parse(localStorage.businessSource || "{}");
			if(!$.isEmptyObject(businessSource)){
				this._el.requestObject.busiCode = businessSource.baseInfo.busiCode || "";//业务来源
				
				//this._el.requestObject.agentCode = businessSource.baseInfo.psId || "";//登录用户代码
				
				this._el.requestObject.agencyCode = businessSource.baseInfo.agencyCode || "";//代理点代码
				this._el.requestObject.agencyName = businessSource.baseInfo.agencyName || "";//代理点代码
				
				this._el.requestObject.brandCode = businessSource.baseInfo.foursCode || "";//车商代码  渠道合作代码
				this._el.requestObject.foursName = businessSource.baseInfo.foursName || "";//车商代码  渠道合作代码名称
				
				this._el.requestObject.businessClass = businessSource.baseInfo.businessKind || "";//业务种类  
				this._el.requestObject.businessKindName = businessSource.baseInfo.businessKindName || "";//业务种类 名称
				
				this._el.requestObject.unifyCode = businessSource.baseInfo.tbdm || "";//统保代码
				this._el.requestObject.tbdmName = businessSource.baseInfo.tbdmName || "";//统保代码名称
				
				if(businessSource.agents && businessSource.agents.length > 0) {
					this._el.requestObject.assesResponsible = businessSource.agents[0].code || "";//经办人代码
					this._el.requestObject.assesRname = businessSource.agents[0].name || "";//经办人名称
				}
				
				if(businessSource.sales) {
					if(businessSource.sales.length > 0) {
						var sales = [];//销售人员
						for (var i = 0; i < businessSource.sales.length; i++) {
							var sale = {};
							sale.CERTIFICATECODE = businessSource.sales[i].salerName || "";
							sales.push(sale);
						}
						this._el.requestObject.certificateNo = sales;
					} else {
						this._el.requestObject.certificateNo = [];//销售人员
					} 
				} else {
					this._el.requestObject.certificateNo = [];//销售人员
				}
				//this._el.requestObject.certificateNo = "";
				
				this._el.requestObject.vehicleInspection = businessSource.vehInfo.vehicleInspection || "";//验车情况
				this._el.requestObject.vehicleInspectionName = businessSource.vehInfo.vehicleInspectionName || "";//验车情况名称
				
				this._el.requestObject.globalType = businessSource.vehInfo.globalType || "";//综合类型
				
				this._el.requestObject.salesCode = businessSource.baseInfo.lifeAgentId || "";//寿险营销员代码
				this._el.requestObject.lifeAgentName = businessSource.baseInfo.lifeAgentName || "";//寿险营销员名称
				
				this._el.requestObject.lifeAgentFlag = businessSource.baseInfo.lifeAgentFlag || "";//交叉渠道业务来源
				this._el.requestObject.lifeAgentFlagName = businessSource.baseInfo.lifeAgentFlagName || "";//交叉渠道业务来源名称
				
				this._el.requestObject.actualSalesPerson = businessSource.baseInfo.actualSalesPerson || "";//实际销售人员
			}
			if(localStorage.loginDetail){
				var pJsonStr=JSON.parse(localStorage.loginDetail);
				if(common.isNotNull(pJsonStr.mobilePhone)){
					this._el.requestObject.userMobile = pJsonStr.mobilePhone;
				}
			}
			if(app.crmObj.cameraInsureStatus == "returned") {
				this._el.requestObject.taskType = "2";
			}
			
			if(common.isNotNull(crmObj) && common.isNotNull(crmObj.returnType)){
				 this._el.requestObject.telephone = crmObj.telePhone;
				 this._el.requestObject.linkman = crmObj.linkMan;
			}
		},
		//吧页面模型复制到数据模型中并发起http请求
		save:function(){
			var $selectedPolicys = $('#policysChoosenItems .item-noborder');
			this._el.requestObject.memos='';
			var memos = {};
			var policyArr = {};
			$.each($selectedPolicys,function(){
				policyArr[$(this).find('.item-name').html()] = $(this).find('.floatright').html().replace(/,/g,'');
			});
			memos.insureType = '';
			for(var o in policyArr){
				memos.insureType+= o+':'+policyArr[o]+'|';
			}
			memos.insureType = memos.insureType.substr(0,memos.insureType.length-1);

			memos.vehicleTax  = '';
			for(var o in vsltaxView.vsltaxInfo){
				if("开具税务机关名称" == o.substr(0,8) ) {
					memos.vehicleTax += "开具税务机关名称完税凭证税务机关名称："+':'+vsltaxView.vsltaxInfo[o]+'|';
				} else {
					memos.vehicleTax += o+':'+vsltaxView.vsltaxInfo[o]+'|';
				}
				
			}
			memos.vehicleTax  = memos.vehicleTax.substr(0,memos.vehicleTax.length-1);

			memos.newDevice = '';
			$.each(NewEquipmentCoverageInputView.deviceModelArr,function(index){
				memos.newDevice += '设备名称:'+this.name+'|产地:'+this.origin+'|品牌:'+this.brand+'|价值:'+this.value+'|购买时间:'+this.purchaseDate+'|备注:'+this.remark+',';
			});
			memos.newDevice  = memos.newDevice.substr(0,memos.newDevice.length-1);

			memos.repairBC = '';
			for(var o in RepairPeriodCompensationSpecialClauseInputView.info){
				memos.repairBC+= o+':'+RepairPeriodCompensationSpecialClauseInputView.info[o]+'|';
			}
			memos.repairBC = memos.repairBC.substr(0,memos.repairBC.length-1);

			this._el.requestObject.remark = $.trim($('#confirmWordsLeaving').val());
			this._el.requestObject.memos = JSON.stringify(memos);
			this._el.requestObject.vehicleLicense = localStorage.plateNo;
			this._el.requestObject.specialTagId = specialTagId;
			cpic.ui.loading.open();
			this._submit();
		},
		_submit:function(){
			$.ajax({
				async : false,
				type:'POST',
				url:'/crm-http/crm/getAmassBussMessageInfo.do',
				data:JSON.stringify(this._el),
				success:function(data){
					cpic.ui.loading.close();
					if(data){
						if(typeof data == 'string')
							data = JSON.parse(data);
						if(data.resultCode==1){
							window.location.href='orderDetail.html';
						}else if(data.resultCode==0){
							cpic.alert(data.message);
						}else if(data.resultCode==2){
							cpic.alert('尚未登录！');
						}
					}
				}
			});
		}
	};
	//新增设备数据模型
	var deviceModel = {
		name:'',
		origin:'',
		brand:'',
		value:'',
		purchaseDate:'',
		remark:''
	};
	//diyPolicys是选择自选套餐时里面展示的险种列表，senior是选择推荐套餐时展示的险种列表
	//allPolicys包含所有可选险种
	var diyPolicys,seniorPolicys,allPolicys;
	var unitCode = '';
	var app = {
		isNewCarReform:null,
		crmObj:null,
		init:function(){
			this._prepareData();
			policyAdjustView.init();
			NewEquipmentCoverageInputView.init();
			NewEquipmentCoverageDetailInputView.init();
			vsltaxView.init();
			RepairPeriodCompensationSpecialClauseInputView.init();
			policyConfirmView.init();
			jsonModel.init();
		},
		//准备数据 初始化商改和非商改的险种信息和依赖关系
		_prepareData:function(){
			if(localStorage.userInfo){
				unitCode = JSON.parse(localStorage.userInfo).unitCode;
				this.isNewCarReform = C.isNewCarReform(unitCode);
			}
			this.crmObj = common.getLocalStorage("crmObj",true);
			if(this.isNewCarReform){
				   //parent 表示该险种被其他险种依赖。
				   //parentid 表示该险种依赖其他险种
				   //parentid为1的险种依赖parent为1的险种
				   //parentid不只一个的，表示只要任意一个parent已经勾选，该险种就能勾选。例如 附加险不计免赔

				    diyPolicys= [
						{name:'机动车损失险',parent:'1'},
						{name:'车损不计免赔率',parentID:'1'},
						{name:'第三者责任险',parent:'2'},
						{name:'三责不计免赔率',parentID:'2'},
						{name:'车上司机责任险',parent:'3'},
						{name:'车上司机责任险不计免赔',parentID:'3'},
						{name:'车上乘客责任险',parent:'4'},
						{name:'车上乘客责任险不计免赔',parentID:'4'}
					];
					seniorPolicys= [
						{name:'机动车损失险',parent:'1'},
						{name:'车损不计免赔率',parentID:'1'},
						{name:'第三者责任险',amount:'500,000元',parent:'2'},
						{name:'三责不计免赔率',parentID:'2'},
						{name:'车上司机责任险',amount:'200,000元',parent:'3'},
						{name:'车上司机责任险不计免赔',parentID:'3'},
						{name:'车上乘客责任险',amount:'100,000元/座',parent:'4'},
						{name:'车上乘客责任险不计免赔',parentID:'4'}
					];
					allPolicys = [
						{name:'全车盗抢险',parent:'5'},
						{name:'盗抢不计免赔率',parentID:'5'},
						{name:'玻璃破碎险',parentID:'1'},
						{name:'自燃损失险',parentID:'1',parent:'6'},
						{name:'自燃损失险不计免赔率',parentID:'6'},
						{name:'新增设备损失险',parentID:'1',parent:'8'},
						{name:'新增设备不计免赔率',parentID:'8'},
						{name:'车身划痕损失险',parentID:'1',parent:'7'},
						{name:'车身划痕损失险不计免赔率',parentID:'7'},
						{name:'发动机涉水损失险',parentID:'1',parent:'10'},
						{name:'发动机涉水损失险不计免赔率',parentID:'10'},
						{name:'修理期间费用补偿险',parentID:'1'},
						{name:'车上货物责任险',parentID:'1',parent:'11'},
						{name:'车上货物责任险不计免赔率',parentID:'11'},
						{name:'精神损害抚慰金责任险',parentID:'2_3_4',parent:'9'},
						{name:'精神损害抚慰金责任险不计免赔率',parentID:'9'},
						{name:'车损险无法找到第三方特约险',parentID:'1'},
						{name:'指定修理厂险',parentID:'2_3'}
					];

			}else{
			    diyPolicys= [
					{name:'机动车损失保险',parent:'1'},
					{name:'第三者责任险',parent:'2'},
					{name:'车上人员责任险（司机）',parent:'3'},
					{name:'车上人员责任险（乘客）',parent:'4'},
					{name:'车损险不计免赔',parentID:'1'},
					{name:'三责险不计免赔',parentID:'2'},
					{name:'车上人员责任不计免赔',parentID:'3_4'},
				];
				seniorPolicys= [
					{name:'机动车损失保险',parent:'1'},
					{name:'第三者责任险',amount:'500,000元',parent:'2'},
					{name:'车上人员责任险（司机）',amount:'200,000元',parent:'3'},
					{name:'车上人员责任险（乘客）',amount:'100,000元/座',parent:'4'},
					{name:'车损险不计免赔',parentID:'1'},
					{name:'三责险不计免赔',parentID:'2'},
					{name:'车上人员责任不计免赔',parentID:'3_4'}
				];
				allPolicys = [
					{name:'全车盗抢险',parent:'5'},
					{name:'玻璃单独破碎险',parentID:'1',parent:'6'},
					{name:'自燃损失险',parentID:'1',parent:'7'},
					{name:'车身油漆损伤险',parentID:'1',parent:'8'},
					{name:'发动机涉水损失险',parentID:'1',parent:'9'},
					{name:'全车盗抢险不计免赔',parentID:'5'},
					{name:'附加险不计免赔',parentID:'6_7_8_9_10_11'},
					{name:'新增设备损失险',parentID:'1'},
					{name:'指定专修厂特约',parentID:'1'},
					{name:'车损免赔额特约',parentID:'1'},
					{name:'救援费用特约',parentID:'1'},
					{name:'修理期间费用补偿特约',parentID:'1'},
					{name:'多次事故免赔',parentID:'1'},
					{name:'零部件附属设备被盗窃险',parentID:'5',parent:'10'},
					{name:'事故随附费用特约',parentID:'1'},
					{name:'更换新车特约A款',parentID:'1'},
					{name:'更换新车特约B款',parentID:'1'},
					{name:'使用安全带特约',parentID:'3_4'},
					{name:'法律服务特约',parentID:'1_2_3_4_5'},
					{name:'节假日行驶区域扩展特约',parentID:'1_2_3_4_5'},
					{name:'换件特约',parentID:'1'},
					{name:'精神损害抚慰金特约',parentID:'2_3'},
					{name:'随车携带物品责任险',parentID:'1_3_4'},
					{name:'道路污染责任险',parentID:'2'}
				];
				if('5020100'==unitCode||'5010100'==unitCode||'5010800'==unitCode){
					allPolicys.push({name:'免税车辆关税责任险'});
				}
			}
		}
	};
	app.init();
});
