$(function(){
	initPages();
});
var sendSmsFlag = true;
var isDebug = false;
var unitCode;
var weChatCoveragesList;
var crmObj;
var unitDef;
var userInfo;
var businessSource = {};
businessSource.baseInfo = {};
businessSource.vehInfo = {};
businessSource.inputor = {};
businessSource.agents = [];
//任务发起需要这两个参数
var linkMan ="";
var telePhone ="";


/**
 * 商改机动车险种
 * name 险种中文名
 */
var bzCoverage = {
	'DAMAGELOSSCOVERAGE' : {'name':'机动车损失保险','parent':'1'},
	"DAMAGELOSSEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'车损不计免赔率','parentID':'1'},
	'THIRDPARTYLIABILITYCOVERAGE' : {'name':'第三者责任险','parent':'2'},
	"THIRDPARTYLIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'三责不计免赔率','parentID':'2'},
	'INCARDRIVERLIABILITYCOVERAGE' : {'name':'车上司机责任险','parent':'3'},
	"INCARDRIVERLIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'车上司机责任险不计免赔率','parentID':'3'},
	'INCARPASSENGERLIABILITYCOVERAGE' : {'name':'车上乘客责任险','parent':'4'},
	"INCARPASSENGERLIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'车上乘客责任险不计免赔率','parentID':'4'},
	'THEFTCOVERAGE' : {'name':'全车盗抢险','parent':'5'},
	"THEFTCOVERAGEEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'盗抢不计免赔率','parentID':'5'},
	'GLASSBROKENCOVERAGE' : {'name':'玻璃破碎险','parentID':'1'},
	"SELFIGNITECOVERAGE" : {'name':'自燃损失险','parentID':'1','parent':'6'},
	"SELFIGNITEEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'自燃损失险不计免赔率','parentID':'6'},
	"NEWEQUIPMENTCOVERAGE": {'name':'新增设备损失险','parent':'8','parentID':'1'},
	"NEWEQUIPMENTEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'新增设备不计免赔率','parentID':'8'},
	"CARBODYPAINTCOVERAGE" : {'name':'车身划痕损失险','parent':'7','parentID':'1'},
	"CARBODYPAINTEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'车身划痕损失险不计免赔率','parentID':'7'},
	"PADDLEDAMAGECOVERAGE" : {'name':'发动机涉水损失险','parent':'10','parentID':'1'},
	"PADDLEDAMAGEEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'发动机涉水损失险不计免赔率','parentID':'10'},
	"REPAIRPERIODCOMPENSATIONSPECIALCLAUSE" : {'name':'修理期间费用补偿险','parentID':'1'},
	"CARGOINCARLIABILITYCOVERAGE" : {'name':'车上货物责任险','parent':'11','parentID':'1'},
	"CARGOINCARLIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'车上货物责任险不计免赔率','parentID':'11'},
	"SPIRITDAMAGELIABILITYCOVERAGE" : {'name':'精神损害抚慰金责任险','parent':'9','parentID':'2_3_4'},
	"SPIRITDAMAGELIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE" : {'name':'精神损害抚慰金责任险不计免赔率','parentID':'9'},
	"DAMAGELOSSCANNOTFINDTHIRDSPECIALCOVERAGE" : {'name':'车损险无法找到第三方特约险','parentID':'1'},
	"APPOINTEDREPAIRFACTORYSPECIALCLAUSE" : {'name':'指定修理厂险','parentID':'2_3'},
	'TRAFFICCOMPULSORY2009PRODUCT' : {'name':'交强险'}
}

function initPages(){
	crmObj =  common.getLocalStorage(Interface.ss.crmObj,true);
	if (common.isNull(crmObj)) {
		crmObj = {};
	}
    var _applyNo = util2.GetQueryString('applyNo');
    var _plateNo = util2.GetQueryString('plateNo');
    var _status = util2.GetQueryString('status');//获取状态
    var _shortData = util2.GetQueryString('shortData');
    if(common.isNotNull(_shortData) && _shortData != "undefined"){
    	cpic.alert("您还有"+_shortData+"这些资料欠缴，请尽快提交");
    }
    unitDef = common.getLocalStorage(Interface.ss.unitDef, true);
    userInfo = common.getLocalStorage(Interface.ss.userInfo, true);
    unitCode = userInfo.unitCode;
    msgObj.applyNo = _applyNo;
    msgObj.agentCode = userInfo.userCode;
    msgObj.unitCode = userInfo.unitCode;
    msgObj.plateNo = _plateNo;

	// 初始化返回按钮
	$('header .back').singleTap(function(){
//        history.go(-1);
		location.href = '../cameraQuote/purchaseRecords.html';
    });

    $('header .home').singleTap(function(){
        location.href = '../tool/tools.html';
    });

    getOrderDetail(userInfo.userCode, userInfo.unitCode, _applyNo);

	// 初始化更多按钮
	$('#moreBtn').singleTap(function(){
		onlyOpenTheDiv('moreHidden');
	});
	
	$('#buy').singleTap(function(){
		if($("#buyLIst").is(":hidden")) {
			$("#buyLIst").show();
		} else {
			$("#buyLIst").hide();
		}
		$("#moreHidden").hide();
	});
	
//	if( common.isNotNull(_status) && "10" == _status  ){//核保退回  核保退回
//		$("#divSubmitAndPropoal").show();
//		$("#moreId").hide();
//		$("#buyId").hide();
//		$("#confirmId").hide();
//	}
	
	if( common.isNotNull(_status) && "09" == _status  ){//跳转拍照报价页面  投保退回
		$("#sixDivReSubmit").show();
//		$("#moreId").hide();
		$("#cameraBtn").hide();
		$("#buyId").hide();
		$("#confirmId").hide();
		$("#selfBtn").hide();
	}
	
	
	if( common.isNotNull(_status) && ("04" == _status ||  "10" == _status)){//报价退回  直接调接口 报价退回
		$("#divReSubmit").show();
//		$("#moreId").hide();
		$("#cameraBtn").hide();
		$("#buyId").hide();
		$("#confirmId").hide();
	}
	
	$('#reSubmit').on("click",function(){
		var localBusinessSource = util.getLocalStorage("businessSource",true);
		if(util.isNotNull(localBusinessSource)) {
			businessSource = localBusinessSource;
		}
		businessSource.baseInfo.busiCode = weChatCoveragesList.busiCode || "";//业务来源
		
		businessSource.baseInfo.agencyCode = weChatCoveragesList.agentCode || "";//代理点代码
		businessSource.baseInfo.agencyName = weChatCoveragesList.agentName || "";//代理点名称
		
		businessSource.baseInfo.foursCode = weChatCoveragesList.brandCode || "";//车商代码  渠道合作代码
		businessSource.baseInfo.foursName = weChatCoveragesList.foursName || "";//车商代码  渠道合作代码名称
		
		businessSource.baseInfo.businessKind  = weChatCoveragesList.businessClass || "";//业务种类  
		//businessSource.baseInfo.businessKindName = weChatCoveragesList.businessKindName || "";//业务种类 名称
		
		businessSource.baseInfo.tbdm = weChatCoveragesList.unifyCode || "";//统保代码
		businessSource.baseInfo.tbdmName = weChatCoveragesList.tbdmName || "";//统保代码名称
		
		businessSource.sales = weChatCoveragesList.certificateNo || "";//销售人员
		
		businessSource.vehInfo.vehicleInspection = weChatCoveragesList.vehicleInspection || "";//验车情况
		
		businessSource.vehInfo.globalType = weChatCoveragesList.globalType || "";//综合类型
		
		businessSource.baseInfo.lifeAgentId  =  weChatCoveragesList.salesCode || "";//寿险营销员代码
		businessSource.baseInfo.lifeAgentName = weChatCoveragesList.salesName || "";//寿险营销员名称
		
		businessSource.baseInfo.lifeAgentFlag =  weChatCoveragesList.lifeAgentFlag || "";//交叉渠道业务来源
		//businessSource.baseInfo.lifeAgentFlagName = weChatCoveragesList.lifeAgentFlagName || "";//交叉渠道业务来源名称
		
		businessSource.baseInfo.actualSalesPerson =  weChatCoveragesList.actualSalesPerson || "";//实际销售人员
		
		crmObj.returnType = 7;
		crmObj.cameraInsureStatus = "returned";
		util.setLocalStorage("businessSource", businessSource,true);
		util.setLocalStorage("photoInsurance",true,false);
		util.setLocalStorage(Interface.ss.crmObj, crmObj,true);
		if(_plateNo == "新车未上牌") {
			localStorage.setItem('noplatNumClick',1);
		} 
		localStorage.setItem('plateNo',_plateNo);
		localStorage.setItem('requestNo',_applyNo);
		window.location.href="../selfQuote/carInsurance.html?returnSource=selfInsurance&plateNo="+_plateNo+"&status="+_status+"&applyNo=" + _applyNo;
	})
	
	/*$('#submitAndPropoal').on("click",function(){
		location.href = 'suppUnderWri.html?applyNo=' + _applyNo + '&plateNo=' + _plateNo;	
	})*/
	
	$('#reSubmitOne').on("click",function(){
		var _applyNo = util2.GetQueryString('applyNo');
	    var _plateNo = util2.GetQueryString('plateNo');
	    window.location.href = 'suppUnderWri.html?applyNo=' + _applyNo + '&plateNo=' + _plateNo+'&cameraBtn=cameraBtn&status=09&linkMan='+linkMan+'&telePhone='+telePhone;
	    //现在修改流程 跳至补充页面
		/*Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, _applyNo, '2', '{}','', _plateNo,'','','','','','CAR_WHOLE',
                function(result){
                    cpic.ui.loading.open();
                    if('1' == result.resultCode){
                    	cpic.ui.loading.close();
                        if(result.responseObject.state == '1') {
                        	localStorage.setItem("requestNo",_applyNo);
//                        	window.location.href='../cameraQuote/purchaseRecords.html';
//                        	cpic.alert(result.responseObject.msg);
                        	cpic.alert({message: "<div style=\"text-align: center;\">"+result.responseObject.msg+"</div>", params: {
      		  		          autoOpen: false,
      		  		          closeBtn: false,
      		  		          title: null,
      		  		          buttons: {
      		  		        	'是': function () {
      		  		            	  this.close();
      		  		            	  this.destroy();
      		  		            	  location.href = 'orderDetail.html';
      		  		              }
                        	,
      		  		              '否': function () {
      		  		                  this.close();
      		  		                  this.destroy();
      		  		              }
      		  		              
      		  		          }
      		  		      }})
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
            });*/
	})
	
	// 初始化确认评价按钮  根据任务申请号查询任务状态，若为11，则不能
	$('#confirmCommentBtn').singleTap(function(){
		//点击时候触发任务完成接口
		Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, _applyNo, '3', '{}','', _plateNo,'','','','','','CAR_PRICE','','',
                function(result){
                    cpic.ui.loading.open();
                    if('1' == result.resultCode){
                    	cpic.ui.loading.close();
                        if(result.responseObject.state == '1') {
                        	location.href='comments.html?applyNo=' + _applyNo + "&plateNo=" + _plateNo +'&status=' + _status;
                        	/*var _obj={
                                    "appType":"A",
                                    "requestObject":{
                                    "requestNo":_applyNo,
                                    "unitCode":msgObj.unitCode
                                    }
                                };
                                $.ajax({
                                    async : true,
                                    type:'POST',
                                    url:'/crm-http/crm/getStatusByRequestNo.do',
                                    data:JSON.stringify(_obj),
                                    dataType:'json',
                                    success:function(result){
                                        cpic.ui.loading.close();
                                        if(result.resultCode == '1'){
                                            if(result.responseObject.requestStatus == '11'){
                                                cpic.alert("该订单已完成评价，不能重复评价");
                                            }else{
                                                location.href='comments.html?applyNo=' + _applyNo + "&plateNo=" + _plateNo +'&status=' + _status;
                                            }
                                        }else{
                                            cpic.alert(result.message);
                                        }
                                    },
                                    error:function(result){
                                        cpic.ui.loading.close();
                                        cpic.alert(result.message);
                                    }
                                });*/
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
	});
	
	//添加品牌型号点击事件
	$("#vehicleModelLi").on("click",function(){
		window.location.href = 'vehicleModelDesc.html?applyNo=' + _applyNo + "&plateNo=" + _plateNo +'&status=' + _status;
	});

	// 再次点击时隐藏
	$('body').on('click',function(e){
		if('moreBtn' == $(e.target).attr('id') || 'confirmCommentBtn' == $(e.target).attr('id')){
			return;
		}
		closeDivs();
	});
    if(isDebug){
        parseCoverages(coveragesList);
    }
}

function getOrderDetail(agentCode, unitCode, applyNo){
    var _agentCode = '';
    var _unitCode = '';
    var _applyNo = '';
    var _status = util2.GetQueryString('status');
    if(isDebug){
        _agentCode = '170';
        _unitCode = '3080100';
        _applyNo = '08201601142323570022';
    } else {
        _agentCode = agentCode;
        _unitCode = unitCode;
        _applyNo = applyNo;
    }
    cpic.ui.loading.open();
    var _status = util2.GetQueryString('status');//获取状态
    var taskCodeTemp =  _status;
    var taskCode;
    if(taskCodeTemp == '03'){
    	taskCode = 'CAR_PRICE';
    }else if(taskCodeTemp == '09'){
    	taskCode = 'CAR_WHOLE';
    }else{
    	taskCode = 'CAR_PRICE';//此时主要是对报价已接单点进去之后的跳转    
    }
    Interface.queryOrderDetail(_agentCode, _unitCode, _applyNo,taskCode,
        function(result){
            cpic.ui.loading.close();
            weChatCoveragesList = result.responseObject
            common.setLocalStorage("policyVehicleInfo",weChatCoveragesList,true);
            common.setLocalStorage("applyNoDesc",_applyNo,true);
            if('1'==result.resultCode){
            	linkMan = result.responseObject.linkMan;
            	telePhone = result.responseObject.linkTelPhone;
            	if( common.isNotNull(_status) && "09" == _status  ){
            		if(common.isNotNull(result.responseObject) && common.isNotNull(result.responseObject.remarks) && result.responseObject.remarks.length > 0) {
            			cpic.alert( result.responseObject.remarks[0]);
            			}
            	}

                for(var i=0;i<result.responseObject.productInfoBeans.length;i++){
                    // 1商业险 2交强险
                    if('1' == result.responseObject.productInfoBeans[i].productType){
                        // 初始化保险日期
                        // 商业险起期 止期
                        $($('#bzDate span')[0]).html(new Date(result.responseObject.productInfoBeans[i].startDate).format("yyyy-MM-dd hh:mm"));
                        $($('#bzDate span')[1]).html(new Date(result.responseObject.productInfoBeans[i].endDate).format("yyyy-MM-dd hh:mm"));
                    }
                    if('2' == result.responseObject.productInfoBeans[i].productType){
                        // 交强险起期 止期
                        $($('#tcDate span')[0]).html(new Date(result.responseObject.productInfoBeans[i].startDate).format("yyyy-MM-dd hh:mm"));
                        $($('#tcDate span')[1]).html(new Date(result.responseObject.productInfoBeans[i].endDate).format("yyyy-MM-dd hh:mm"));
                    }
                }
               
                parseCoverages(result.responseObject);
                //parseCoverages(coveragesList);
                var length = weChatCoveragesList.modifyRemarks.length;
//                var msg = weChatCoveragesList.modifyRemarks[length - 1];
                if( length > 0){
                	cpic.alert({message:"<span class='font08em'>" + weChatCoveragesList.modifyRemarks[0] + "</span>",params:{
                		autoOpen: false,
                		closeBtn: false,
                		title: "备注信息",
                		buttons: {
                			'取消': function () {
                				this.close();
                				this.destroy();
                			},
                			'确定': function () {
                				this.close();
                				this.destroy();
                			}
                		}
                	}});
                }
                /*if(!common.isEmptyJsonObject(msg)){
                	cpic.alert({message:"<span class='font08em'>" + msg + "</span>",params:{
                		autoOpen: false,
                		closeBtn: false,
                		title: "备注信息",
                		buttons: {
                			'取消': function () {
                				this.close();
                				this.destroy();
                			},
                			'确定': function () {
                				this.close();
                				this.destroy();
                			}
                		}
                	}});
                }*/
            } else {
                cpic.alert(result.message);
            }
        },
        function(){
            cpic.ui.loading.close();
        }
    );
}

function parseCoverages(coveragesList){

	var coverageItems = '';
	coveragePremium.sumPremium=coveragesList.sumPremium;
    // 保单总保费
	coveragePremium.sumInsured=coveragesList.sumInsured;
	coveragePremium.vehicleTaxes=coveragesList.vehicleTaxes;
	
	crmObj.choosenCoverage = [];
	crmObj.leftCoverage = [];
    // 绑定险种
	if(!common.isEmptyJsonObject(coveragesList.policyInfoBeans) && common.isNotNull(coveragesList.policyInfoBeans[0].productCode)){
		$.each(bzCoverage,function(key,value){
			var isChoosenCoverageFlag = false;
			$.each(coveragesList.policyInfoBeans, function(index, item){
				if(item.productCode.toUpperCase() == key.toUpperCase()){
					isChoosenCoverageFlag = true;
					if('-1' == item.policyPremium||'-1.0' == item.policyPremium){
			            item.policyPremium = '';
			        }
			        if('-1' == item.sumInsured||'-1.0' == item.sumInsured){
			            item.sumInsured = '';
			        }
			        var productCode = item.productCode.toUpperCase();
			        if(bzCoverage[productCode] && bzCoverage[productCode].name != "交强险") {
			        	var coverage = bzCoverage[productCode];
			        	if(item.sumInsured) {
			        		coverage.amount = item.sumInsured + "元";
			        	}
			        	crmObj.choosenCoverage.push(coverage);
			        } else if(bzCoverage[productCode].name == "交强险") {
			        	crmObj.hasTcCoverage = "1";
			        }
			        
					coverageItems += '<tr>';
					coverageItems += '<td class="t_left color-8c">' + bzCoverage[productCode].name + '</td>';
					if('' == item.sumInsured){
						if(item.productName == "玻璃单独破碎险") {
							if(item.glassManufacturer == "1") {
								coverageItems += '<td class="t_right" style="padding-right:9%">进口</td>';
							} else if(item.glassManufacturer == "2") {
								coverageItems += '<td class="t_right" style="padding-right:9%">合资</td>';
							} else {
								coverageItems += '<td class="t_right" style="padding-right:9%">国产</td>';
							}
						} else { 
							coverageItems += '<td class="t_right" style="padding-right:9%"></td>';
						}
					} else {
						coverageItems += '<td class="t_right" style="padding-right:9%">' + util2.fMoney(item.sumInsured) + '</td>';
					}
					if(''==item.policyPremium){
						coverageItems += '<td class="t_right"></td></tr>';
					} else {
						coverageItems += '<td class="t_right">' + util2.fMoney(item.policyPremium) + '</td></tr>';
					}

			        if('机动车交通事故责任强制保险2009' != item.productName){
			            // 转成Number
			            coveragePremium.bzSumPolicyPremium += Number(item.policyPremium);
			            coveragePremium.bzSumStandardPremium += Number(item.standardPremium);
			        } else {
			            coveragePremium.tcSumPremium += Number(item.policyPremium);
			        }
				}
			});
			if(!isChoosenCoverageFlag && bzCoverage[key].name != "交强险"){
				crmObj.leftCoverage.push(bzCoverage[key]);
			}
		})
	}else{
		$.each(coveragesList.policyInfoBeans, function(index, item){
			if('-1' == item.policyPremium||'-1.0' == item.policyPremium){
	            item.policyPremium = '';
	        }
	        if('-1' == item.sumInsured||'-1.0' == item.sumInsured){
	            item.sumInsured = '';
	        }
	        
	        var productCode = item.productCode;
	        if(bzCoverage[productCode]) {
	        	var coverage = bzCoverage[productCode];
	        	if(item.sumInsured) {
	        		coverage.amount = item.sumInsured + "元";
	        	}
	        	crmObj.choosenCoverage.push(coverage);
	        }
	        
			coverageItems += '<tr>';
			coverageItems += '<td class="t_left color-8c">' + item.productName + '</td>';
			if('' == item.sumInsured){
				if(item.productName == "玻璃单独破碎险") {
					if(item.glassManufacturer == "1") {
						coverageItems += '<td class="t_right" style="padding-right:9%">进口</td>';
					} else if(item.glassManufacturer == "2") {
						coverageItems += '<td class="t_right" style="padding-right:9%">合资</td>';
					} else {
						coverageItems += '<td class="t_right" style="padding-right:9%">国产</td>';
					}
				} else { 
					coverageItems += '<td class="t_right" style="padding-right:9%"></td>';
				}
			} else {
				coverageItems += '<td class="t_right" style="padding-right:9%">' + util2.fMoney(item.sumInsured) + '</td>';
			}
			if(''==item.policyPremium){
				coverageItems += '<td class="t_right"></td></tr>';
			} else {
				coverageItems += '<td class="t_right">' + util2.fMoney(item.policyPremium) + '</td></tr>';
			}

	        if('机动车交通事故责任强制保险2009' != item.productName){
	            // 转成Number
	            coveragePremium.bzSumPolicyPremium += Number(item.policyPremium);
	            coveragePremium.bzSumStandardPremium += Number(item.standardPremium);
	        } else {
	            coveragePremium.tcSumPremium += Number(item.policyPremium);
	        }
		});
	}
	

	$('#coverageTable').append(coverageItems);
    // 总保费
    $('#sumPremium').html('￥' + util2.fMoney(Number(coveragePremium.sumInsured)+Number(coveragesList.totalAmount)));
    // 商业险保费
    $('#bzSumPremium').html('￥' + util2.fMoney(coveragePremium.bzSumPolicyPremium));
    //折扣率区分新单还是老单
    if(common.isNotNull(coveragesList.syFloatRate)){
    	coveragePremium.bzDiscount = coveragesList.syFloatRate;
    }
//    else{
//    	coveragePremium.bzDiscount = (coveragePremium.bzSumPolicyPremium / coveragePremium.bzSumStandardPremium * 10).toFixed(1);
//    }
    //coveragePremium.bzDiscount = coveragePremium.bzSumPremium % coveragePremium.sumPremium;
    if(common.isNotNull(coveragesList.syFloatRate)){
    	if(coveragePremium.bzDiscount > 1.00){
        	$('#bzDiscount').html("折扣率" + coveragePremium.bzDiscount + "倍");
        }else{
        	$('#bzDiscount').html("折扣率" + coveragePremium.bzDiscount);
        }
    }
    //交强险折扣显示
    if(common.isNotNull(coveragesList.jqFloatRate)){
    	coveragePremium.tcDiscount = coveragesList.jqFloatRate;
    }
    if(common.isNotNull(coveragesList.jqFloatRate)){
    	if(coveragePremium.tcDiscount > 1.00){
        	$('#tcDiscount').html("折扣率" + coveragePremium.tcDiscount + "倍");
        }else{
        	$('#tcDiscount').html("折扣率" + coveragePremium.tcDiscount);
        }
    }
    
    // 交强险保费
    $('#TcSumPremium').html('￥' + util2.fMoney(coveragePremium.tcSumPremium));
    console.info(coveragePremium.tcSumPremium);
    // 车船税
    $('#vltSumPremium').html('￥' + util2.fMoney(coveragesList.totalAmount.trim() == '' ? 0 : coveragesList.totalAmount.trim()));
    console.info(coveragesList.totalAmount);
    setTimeout(function(){
        if(myScroll){
            myScroll.refresh();
        }
    },800);
}

function onlyOpenTheDiv(id){
	if('block' == $('#'+id).css('display')){
		$('#'+id).hide();
		return;
	}
	$('#moreHidden').hide();
	$('#confirmCommentHidden').hide();
	$("#buyLIst").hide();
	$('#'+id).show();
}

function closeDivs(){
	$('#moreHidden').hide();
	$('#confirmCommentHidden').hide();
}

function selfInsurance (){
	cpic.ui.loading.open();
	$("#buyLIst").hide();
	Interface.queryQuotation(unitCode, weChatCoveragesList.priceNo, weChatCoveragesList.enterUcode, function(data){
	//Interface.queryQuotation("5020100","QSHZY14A16P000000290","1412",function(data){
		cpic.ui.loading.close();
		
		if(data.success) {
			var policy = data.policy;
			var quotationForService = data.result.quotationForService;
			if(!$.isEmptyObject(quotationForService)) {
				var insuredVehicle = quotationForService.autoComprenhensiveInsuranceProduct.insuredVehicle;//车辆信息
				policy.baseInfo.sellChannel = quotationForService.autoComprenhensiveInsuranceProduct.sellingChannel || "12";//业务来源
				policy.baseInfo.businessKind = quotationForService.autoComprenhensiveInsuranceProduct.businessVariety || "11";//业务种类
				//代理点
				if(common.isNotNull(quotationForService.autoComprenhensiveInsuranceProduct.agent) && quotationForService.autoComprenhensiveInsuranceProduct.agent.length > 0) {
					policy.baseInfo.agencyCode = quotationForService.autoComprenhensiveInsuranceProduct.agent[0].staffCode;
					policy.baseInfo.agencyName = quotationForService.autoComprenhensiveInsuranceProduct.agent[0].name;
				}
				
				policy.vehInfo.frameNumber = insuredVehicle.vin || "";//车架号
				policy.vehInfo.engineNumber = insuredVehicle.engineNo || "";//发动机号
				policy.vehInfo.registrationNumber = insuredVehicle.vehicleLicense || "";//车架号
				policy.vehInfo.plateType = insuredVehicle.licenseType || "02";//号牌类型
				var registerDate = insuredVehicle.registerDate || "";//初登日期;
				registerDate.month += 1;
				policy.vehInfo.firstRegistrationDate = registerDate.year + '-' + registerDate.month + '-' + registerDate.dayOfMonth|| "";
				
				policy.vehInfo.licenseOwner = insuredVehicle.licenseOwner || "";//车主
				policy.vehInfo.modelNumber = insuredVehicle.moldName || "";//品牌型号
				policy.vehStore.vehtypeno = insuredVehicle.moldCharacterCode || "";//车型特征编码
				
				if(!$.isEmptyObject(quotationForService.trafficCompulsoryProduct) && !$.isEmptyObject(quotationForService.trafficCompulsoryProduct.vehicleLicenseOwner)) {
					policy.vehInfo.licenseOwner = quotationForService.trafficCompulsoryProduct.vehicleLicenseOwner.name;
					policy.vehInfo.licenseOwnerCertCode = quotationForService.trafficCompulsoryProduct.vehicleLicenseOwner.certificateCode;//车主证件号码
					policy.vehInfo.licenseOwnerCertType = quotationForService.trafficCompulsoryProduct.vehicleLicenseOwner.certificateType;//车主证件类型
				}
				if(!$.isEmptyObject(policy.tcCoverages)) {
					if(common.isNull(policy.tcCoverages.TRAFFICCOMPULSORYPRODUCT.sumInsured) || policy.tcCoverages.TRAFFICCOMPULSORYPRODUCT.sumInsured == 0) {
						policy.tcCoverages.TRAFFICCOMPULSORYPRODUCT.sumInsured = 122000;
					}
				}
				if(common.isNull(policy.baseInfo.tbdm)) {
					policy.baseInfo.tbdm = "00000";
					policy.baseInfo.tbdmName = "一般业务";
				}
				if(common.isNull(policy.baseInfo.tbdmName) && common.isNotNull(policy.baseInfo.tbdm)) {
					for(var i=0;i<unitDef.tbdms.length;i++) {
						if(unitDef.tbdms[i].code == policy.baseInfo.tbdm) {
							policy.baseInfo.tbdmName = unitDef.tbdms[i].name;
							break;
						}
					}
				}
				
				for(var i=0;i<weChatCoveragesList.productInfoBeans.length;i++){
                    // 1商业险 2交强险
                    if('1' == weChatCoveragesList.productInfoBeans[i].productType){
                        // 初始化保险日期
                        // 商业险起期 止期
                    	policy.baseInfo.bzStartTime = new Date(weChatCoveragesList.productInfoBeans[i].startDate).format("yyyy-MM-dd hh:mm:ss");
                        policy.baseInfo.bzEndTime = new Date(weChatCoveragesList.productInfoBeans[i].endDate).format("yyyy-MM-dd hh:mm:ss");
                    }
                    if('2' == weChatCoveragesList.productInfoBeans[i].productType){
                        // 交强险起期 止期
                    	policy.baseInfo.tcStartTime = new Date(weChatCoveragesList.productInfoBeans[i].startDate).format("yyyy-MM-dd hh:mm:ss");
                        policy.baseInfo.tcEndTime = new Date(weChatCoveragesList.productInfoBeans[i].endDate).format("yyyy-MM-dd hh:mm:ss");
                    }
                }
				
				if(common.isNotNull(policy.bzCoverages)) {
					if(common.isNotNull(policy.bzCoverages.ThirdPartyLiabilityCoverage)) {
						policy.bzCoverages.ThirdPartyLiabilityCoverage.sumInsured = quotationForService.autoComprenhensiveInsuranceProduct.thirdPartyLiabilityCoverage.premiumInvolved.sumInsured || 500000;           
					}
					
					if(common.isNotNull(policy.bzCoverages.InCarDriverLiabilityCoverage)) {
						policy.bzCoverages.InCarDriverLiabilityCoverage.sumInsured = quotationForService.autoComprenhensiveInsuranceProduct.inCarDriverLiabilityCoverage.premiumInvolved.sumInsured || 10000;                
					}
					
					if(common.isNotNull(policy.bzCoverages.InCarPassengerLiabilityCoverage)) {
						policy.bzCoverages.InCarPassengerLiabilityCoverage.sumInsured = quotationForService.autoComprenhensiveInsuranceProduct.inCarPassengerLiabilityCoverage.premiumInvolved.sumInsured || 10000;            
					}
					
					if(common.isNotNull(policy.bzCoverages.CarBodyPaintCoverage)) {
						policy.bzCoverages.CarBodyPaintCoverage.sumInsured = quotationForService.autoComprenhensiveInsuranceProduct.carBodyPaintCoverage.premiumInvolved.sumInsured || 5000;          
					}
					
					if(common.isNotNull(policy.bzCoverages.SpiritDamageLiabilityCoverage)) {
						policy.bzCoverages.SpiritDamageLiabilityCoverage.sumInsured = quotationForService.autoComprenhensiveInsuranceProduct.spiritDamageLiabilityCoverage.premiumInvolved.sumInsured || 50000;          
					}
					
					if(common.isNotNull(policy.bzCoverages.RepairPeriodCompensationSpecialClause)) {
						policy.bzCoverages.RepairPeriodCompensationSpecialClause.sumInsured = quotationForService.autoComprenhensiveInsuranceProduct.repairPeriodCompensationSpecialClause.premiumInvolved.sumInsured || 100;          
					}
					
					if(common.isNotNull(policy.bzCoverages.GlassBrokenCoverage)) {
						if(quotationForService.autoComprenhensiveInsuranceProduct.insuredVehicle.glassManufacturer == "1") {
							policy.vehInfo.glassType = 1;
						} else {
							policy.vehInfo.glassType = 0;
						}
					}
					
				}
				//policy.applicant.tel =   quotationForService.trafficCompulsoryProduct.applicant.telephone ||'';//投保人电话号
				//policy.applicant.email =   quotationForService.trafficCompulsoryProduct.applicant.email ||'';//投保人邮箱
				//policy.applicant.address =   quotationForService.trafficCompulsoryProduct.applicant.address ||'';//投保人邮箱
				
				if(policy.vehInfo.registrationNumber.substring(0,2) == "LS") {
					common.setLocalStorage("noplatNumClick",1);
					crmObj.myTaskNoPlateNo = 1;
					common.removeLocalStorage("plateNo");
				} else {
					common.removeLocalStorage("noplatNumClick");
					crmObj.myTaskNoPlateNo = "";
					common.setLocalStorage("plateNo",policy.vehInfo.registrationNumber.toUpperCase());
				}
	
				crmObj.policyChangeFlag = false;//从我的任务进去 默认都是计算过保费的 直接初始化保费页面  xxl  0623
				crmObj.efficInitPre  = true;
				crmObj.returnType = 5;
				crmObj.noQueryPolicy = 1;
				crmObj.isChangeEndTime = true;
				common.setLocalStorage("cameraToSelf", 1, true);
			    common.setLocalStorage(Interface.ss.crmObj,crmObj,true);//CRM对象
			    common.setLocalStorage(Interface.ss.policy, policy, true);
			    common.removeLocalStorage("photoInsurance");
			    window.location.href="../newInsV2/carInsurance.html?returnSource=selfInsurance";
			    return;
		    } else {
		    	cpic.alert("P09查询报价单失败！");
		    }
		} else {
			cpic.alert("P09查询报价单失败！");
		}
		
	})
}

function goToPage(object){
	var _applyNo = util2.GetQueryString('applyNo');
    var _plateNo = util2.GetQueryString('plateNo');
    var _status = util2.GetQueryString('status');//获取状态
    userInfo = common.getLocalStorage(Interface.ss.userInfo, true);
	switch(object.id){
		case('selfBtn'):
			//点击时候触发任务完成接口
			// up by yulei at 20161208 start for 任务完成bug修复，taskCode应该传CAR_PRICE
			cpic.ui.loading.open();
			Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, _applyNo, '3', '{}','', _plateNo,'','','','','','CAR_PRICE','','',
			//Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, _applyNo, '3', '{}','', _plateNo,'','','','','','CAR_WHOLE',
	        // up by yulei at 20161208 end for 任务完成bug修复，taskCode应该传CAR_PRICE
					function(result){
	                    cpic.ui.loading.close();
	                    if('1' == result.resultCode){
	                    	cpic.ui.loading.close();
	                        if(result.responseObject.state == '1') {
	                        	selfInsurance();
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
			break;
	    case('msgBtn'):
	        var Messenges = weChatCoveragesList.modifyRemarks;
	    	if(!common.isEmptyJsonObject(Messenges)){
	    		var html = "";
	    		for(var i in Messenges.reverse()){
			    	var msg = weChatCoveragesList.modifyRemarks[i];
		        	html += "<div class='font08em'>" + msg + "</div>";
		        }
	    		cpic.alert({message:html,params:{
		    		autoOpen: false,
		    		closeBtn: false,
		    		title: "备注信息",
		    		buttons: {
		    			'取消': function () {
		    				this.close();
		    				this.destroy();
		    			},
		    			'确定': function () {
		    				this.close();
		    				this.destroy();
		    			}
		    		}
		    	}});
	    	}else{
	    		cpic.alert("该订单无备注信息!");
	    	}
	    	break;
	    	
        case('smsBtn'):
        	if(sendSmsFlag!=true){
    			cpic.alert("1分钟内不能重复发送短信");
    			return;
    		}
        	var defaultTel = (weChatCoveragesList.telephone.split(",")[1] == "null")?"":weChatCoveragesList.telephone.split(",")[1];
        	cpic.alert({message: '<input type=\"phone\" value=\"'+ defaultTel +'\" placeholder="请输入手机号" maxlength=\"11\" style="width: 60%;display: block;margin: 15px auto 0;padding: 5px 15px;text-align: center;" id="phoneNum"/>', params: {
        	//cpic.alert({message: '<input type=\"phone\" placeholder="请输入手机号" maxlength=\"11\" style="width: 60%;display: block;margin: 15px auto 0;padding: 5px 15px;text-align: center;" id="phoneNum"/>', params: {
        	  autoOpen: false,
	          closeBtn: false,
	          title: null,
	          buttons: {
	              '取消': function () {
	                  this.close();
	                  this.destroy();
	              },
	              '确定': function () {
	            	  var mobile =$("#phoneNum").val();
		          		if(common.isNotNull(mobile)){
		          			if(common.checkMobile(mobile)) {
		          				//var defaultTel = (weChatCoveragesList.telephone.split(",")[1] == "null")?"":weChatCoveragesList.telephone.split(",")[1];
		          				//weChatCoveragesList.telephone = weChatCoveragesList.telephone.replace(defaultTel,mobile);
		          				var hideTel = mobile.substring(0,3)+"*****" + mobile.substring(8,11);
		          				cpic.alert({message: "<div style=\"text-align: center;\">确认发送短信:"+hideTel+"</div>", params: {
		          		            autoOpen: false,
		          		            closeBtn: false,
		          		            title: null,
		          		            buttons: {
		          		                '取消': function () {
		          		                    this.close();
		          		                    this.destroy();
		          		                },
		          		                '确定': function () {
		          		                	setTimeout(function(){
		          		                		sendSmsFlag = true;
		          		                	},60000);
		          		                		
		          		                	sendSmsFlag = false;
		          		                	//Interface.getCrmMsgDifInfo(unitCode,function(result){
			          		                	var crmDifInfoList = util.getLocalStorage(Interface.ss.crmDifInfoList,true);
			          		                	var difContent = "";
				          		      			if(util.isNotNull(crmDifInfoList)){
				          		      				for(i in crmDifInfoList){
				          		      					if(crmDifInfoList[i].difCode == 'UNITDIF0004'){
				          		      						difContent = crmDifInfoList[i].difContent;
				          		      						break;
				          		      					}
				          		      				}
				          		      			}
				          		      			if(common.isNull(difContent)) {
				          		      				difContent = 'MSG001';
				          		      			}
		          		                		var registrationNumber = msgObj.plateNo;  //车牌号码
				          		      			var bzPremium = util2.fMoney(coveragePremium.bzSumPolicyPremium); //商业险
				          		      			var tcPremium = util2.fMoney(coveragePremium.tcSumPremium); //交强险
					          		      		if(common.isNotNull(weChatCoveragesList.totalAmount)){
					        	    				var vsltax = util2.fMoney(weChatCoveragesList.totalAmount.trim() == '' ? 0 : weChatCoveragesList.totalAmount.trim()); //车船税
					        	    				var total = util2.fMoney(Number(coveragePremium.sumInsured)+Number(weChatCoveragesList.totalAmount)); //共计
					        	    			}else{
					        	    				var vsltax = "0"; //车船税
					        	    				var total = util2.fMoney(Number(coveragePremium.sumInsured)); //共计
					        	    			}
				          		      			var userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
		          		                		if(difContent == "MSG001"){
		          		                			// 旧模板分享话术
					          		      			var hasThirdParty = false;
					          		      			var thirdPartyLiabilityCoverageSumInsured = 0;
					          		      			$.each(weChatCoveragesList.policyInfoBeans, function(index, item){
					          		      				if ('第三者商业责任险' == item.productName) {
					          		      					thirdPartyLiabilityCoverageSumInsured = item.policyPremium; //三者险保额
					          		      					hasThirdParty = true;
					          		      				}
					          		      			});
			
					          		      			var note = "尊敬的客户，公司名2产险为您的爱车"+ registrationNumber +"报价：";
					          		      			// 数组中最多有一个商业或交强险
					          		      			for(var i=0;i<weChatCoveragesList.productInfoBeans.length;i++){
					          		      				if('2' == weChatCoveragesList.productInfoBeans[i].productType) {
					          		      					note += "交强险"+ tcPremium +"元，";
					          		      				}
					          		      				if('1' == weChatCoveragesList.productInfoBeans[i].productType) {
					          		      					note += "商业险"+ bzPremium +"元";
					          		      					if (hasThirdParty) {
					          		      						note += "（其中三者险"+ thirdPartyLiabilityCoverageSumInsured +"元），";
					          		      					} else {
					          		      						note += "，";
					          		      					}
					          		      				}
					          		      			}
			
					          		      			note += "总计"+ total +"元";
			
					          		      			if(common.isNotNull(vsltax)) {
					          		      				note += "，车船税"+ vsltax +"元";
					          		      			}
					          		      			note += "。供参考，最终价格以出单为准。";
		          		                		}else if(difContent == "MSG002"){
		          		                			//深圳新短信模板
		          		                			var bzPolicyPremium = 0;//商业险保单保费
					          		      			var bzStandardPremium = 0; //商业险标准保费
					          		      			var bzFloatRatio = 0;//商业险折扣率
					          		      			var note = "[公司名2保险]尊敬的客户您好，公司名2产险为您的爱车"+ registrationNumber +"报价：";
					          		      			if(common.isNotNull(weChatCoveragesList.policyInfoBeans[0].productCode)){
						          		      			$.each(bzCoverage,function(key,value){
						          		      				if(key.toUpperCase() != 'TRAFFICCOMPULSORY2009PRODUCT'){
							          		      				$.each(weChatCoveragesList.policyInfoBeans, function(index, item){
					          		                				if(item.productCode.toUpperCase() == key.toUpperCase()){
					          		                					note += item.productName;
					          		                					if(item.productName == "车上责任险（驾驶员）" || item.productName == "车上责任险（乘客）" || item.productName == "第三者商业责任险"){
										      		          				if(common.isNotNull(item.sumInsured) && item.sumInsured != 0){
											          							note += "限额" + item.sumInsured/10000 + "万、";
											          						}
										  		          				}else {
							          		          						if(common.isNotNull(item.sumInsured) && item.sumInsured != 0){
							          		          							note += "保额" + item.sumInsured/10000 + "万、";
							          		          						}
						          		          						}
						          		                				if(common.isNotNull(item.policyPremium) && item.policyPremium != 0){
						          		          							note += "保费" + util2.fMoney(item.policyPremium) + "元，";
						          		          						}
					          		                		            // 转成Number
					          		                					bzPolicyPremium += Number(item.policyPremium);
					          		                					bzStandardPremium += Number(item.standardPremium);
					          		                		        }
								          		      			})
						          		      				}
						          		      			})
					          		      			}else{
						          		      			$.each(weChatCoveragesList.policyInfoBeans, function(index, item){
		          		                					note += item.productName;
		          		                					if(item.productName == "车上责任险（驾驶员）" || item.productName == "车上责任险（乘客）" || item.productName == "第三者商业责任险"){
							      		          				if(common.isNotNull(item.sumInsured) && item.sumInsured != 0){
								          							note += "限额" + item.sumInsured/10000 + "万、";
								          						}
							  		          				}else {
				          		          						if(common.isNotNull(item.sumInsured) && item.sumInsured != 0){
				          		          							note += "保额" + item.sumInsured/10000 + "万、";
				          		          						}
			          		          						}
			          		                				if(common.isNotNull(item.policyPremium) && item.policyPremium != 0){
			          		          							note += "保费" + util2.fMoney(item.policyPremium) + "元，";
			          		          						}
		          		                		            // 转成Number
		          		                					bzPolicyPremium += Number(item.policyPremium);
		          		                					bzStandardPremium += Number(item.standardPremium);
						          		      			})
					          		      			}
					          		      			
					          		      			bzFloatRatio = (bzPolicyPremium / bzStandardPremium * 10).toFixed(1);
		          		                			
		          		                			// 数组中最多有一个商业或交强险
					          		      			for(var i=0;i<weChatCoveragesList.productInfoBeans.length;i++){
					          		      				if('2' == weChatCoveragesList.productInfoBeans[i].productType) {
					          		      					note += "交强险"+ tcPremium +"元，";
					          		      				}
					          		      				if('1' == weChatCoveragesList.productInfoBeans[i].productType) {
					          		      					note += "商业险"+ bzPremium +"元";
						          		      				/*if(common.isNotNull(bzFloatRatio) && bzFloatRatio != 1.00){
								          		          		note += "(" + bzFloatRatio + "折)";
								          		          	}*/
						          		      				note += "，";
					          		      				}
					          		      			}
					          		      			if(weChatCoveragesList.productInfoBeans.length == 2){
					          		      				var policyPremiumTotal = 0;
					          		      				var bzSumPolicyPremium = Number(coveragePremium.bzSumPolicyPremium);
					          		      				var tcSumPolicyPremium = Number(coveragePremium.tcSumPremium);
					          		      				policyPremiumTotal = util2.fMoney(bzSumPolicyPremium + tcSumPolicyPremium);
					          		      				note += "保费合计"+ policyPremiumTotal +"元，";
					          		      			}
		          		                			if(common.isNotNull(vsltax) && vsltax != 0) {
					          		      				note += "车船税"+ vsltax +"元，";
					          		      			}
		          		                			note += "总计"+ total +"元。以上价格仅供参考，最终价格以出单为准。";
						          		          	note += "专属客户经理：" + userInfo.personInfo.psName+"。";
						          		          	if(common.isNotNull(userInfo.personInfo.psMobilphone)){
						        		          		note += "联系电话：" + userInfo.personInfo.psMobilphone + "。";
						        		          	}else if(common.isNotNull(userInfo.personInfo.psOfficephone)){
						        		          		note += "联系电话：" + userInfo.personInfo.psOfficephone + "。";
						        		          	}else if(common.isNotNull(userInfo.personInfo.psHomephone)){
						        		          		note += "联系电话：" + userInfo.personInfo.psHomephone + "。";
						        		          	}
		          		                		}
		          		                		Interface.sendMsg2Custom("2","",userInfo.userCode,userInfo.unitCode,mobile,note,function(result){
			          		                		cpic.Prompt("发送短信成功");
			          		                		
			          		                	},function(result){
			          		                		
			          		                	});
//		          		                	})
		          		                	
		          		                    this.close();
		          		                    this.destroy();
		          		                }
		          		            }
		          		        }});
		          			} else {
		          				cpic.Prompt("输入的电话号码不正确！");
		          			}
		          		} else {
		          			cpic.Prompt("请输入电话号码！");
		          		}
	                  this.close();
	                  this.destroy();
	              }
	          }
	      }})
            //util2.sendMsg(msgObj.applyNo, msgObj.agentCode, msgObj.unitCode, msgObj.phone, msgObj.contents);
			break;
		case('wechatBtn'):
            console.info('share to WeChat...');
		
			//Interface.getCrmMsgDifInfo(unitCode,function(result){
				var crmDifInfoList = util.getLocalStorage(Interface.ss.crmDifInfoList,true);
				var difContent = "";
      			if(util.isNotNull(crmDifInfoList)){
      				for(i in crmDifInfoList){
      					if(crmDifInfoList[i].difCode == 'UNITDIF0004'){
      						difContent = crmDifInfoList[i].difContent;
      						break;
      					}
      				}
      			}
      			if(common.isNull(difContent)) {
      				difContent = 'MSG001';
      			}
	      		var registrationNumber = msgObj.plateNo;  //车牌号码
	    			var bzPremium = util2.fMoney(coveragePremium.bzSumPolicyPremium); //商业险
	    			var tcPremium = util2.fMoney(coveragePremium.tcSumPremium); //交强险
	    			if(common.isNotNull(weChatCoveragesList.totalAmount)){
	    				var vsltax = util2.fMoney(weChatCoveragesList.totalAmount.trim() == '' ? 0 : weChatCoveragesList.totalAmount.trim()); //车船税
	    				var total = util2.fMoney(Number(coveragePremium.sumInsured)+Number(weChatCoveragesList.totalAmount)); //共计
	    			}else{
	    				var vsltax = "0"; //车船税
	    				var total = util2.fMoney(Number(coveragePremium.sumInsured)); //共计
	    			}
	    			var userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
	      		if(difContent == "MSG001"){
	      			// 旧模板分享话术
		      			var hasThirdParty = false;
		      			var thirdPartyLiabilityCoverageSumInsured = 0;
		      			$.each(weChatCoveragesList.policyInfoBeans, function(index, item){
		      				if ('第三者商业责任险' == item.productName) {
		      					thirdPartyLiabilityCoverageSumInsured = item.policyPremium; //三者险保额
		      					hasThirdParty = true;
		      				}
		      			});
	
		      			var note = "尊敬的客户，公司名2产险为您的爱车"+ registrationNumber +"报价：";
		      			// 数组中最多有一个商业或交强险
		      			for(var i=0;i<weChatCoveragesList.productInfoBeans.length;i++){
		      				if('2' == weChatCoveragesList.productInfoBeans[i].productType) {
		      					note += "交强险"+ tcPremium +"元，";
		      				}
		      				if('1' == weChatCoveragesList.productInfoBeans[i].productType) {
		      					note += "商业险"+ bzPremium +"元";
		      					if (hasThirdParty) {
		      						note += "（其中三者险"+ thirdPartyLiabilityCoverageSumInsured +"元），";
		      					} else {
		      						note += "，";
		      					}
		      				}
		      			}
	
		      			note += "总计"+ total +"元";
	
		      			if(common.isNotNull(vsltax)) {
		      				note += "，车船税"+ vsltax +"元";
		      			}
		      			note += "。供参考，最终价格以出单为准。";
	      		}else if(difContent == "MSG002"){
	      			//深圳新模板
	      			var bzPolicyPremium = 0;//商业险保单保费
		      			var bzStandardPremium = 0; //商业险标准保费
		      			var bzFloatRatio = 0;//商业险折扣率
		      			var note = "[公司名2保险]尊敬的客户您好，公司名2产险为您的爱车"+ registrationNumber +"报价：";
		      			if(weChatCoveragesList.policyInfoBeans.length != 0 && weChatCoveragesList.policyInfoBeans[0].productCode){
		      				if(common.isNotNull(weChatCoveragesList.policyInfoBeans[0].productCode)){
	      		      			$.each(bzCoverage,function(key,value){
	      		      				if(key.toUpperCase() != 'TRAFFICCOMPULSORY2009PRODUCT'){
	          		      				$.each(weChatCoveragesList.policyInfoBeans, function(index, item){
	  		                				if(item.productCode.toUpperCase() == key.toUpperCase()){
	  		                					note += item.productName;
	  		                					if(item.productName == "车上责任险（驾驶员）" || item.productName == "车上责任险（乘客）" || item.productName == "第三者商业责任险"){
				      		          				if(common.isNotNull(item.sumInsured) && item.sumInsured != 0){
					          							note += "限额" + item.sumInsured/10000 + "万、";
					          						}
				  		          				}else {
	          		          						if(common.isNotNull(item.sumInsured) && item.sumInsured != 0){
	          		          							note += "保额" + item.sumInsured/10000 + "万、";
	          		          						}
	      		          						}
	      		                				if(common.isNotNull(item.policyPremium) && item.policyPremium != 0){
	      		          							note += "保费" + util2.fMoney(item.policyPremium) + "元，";
	      		          						}
	  		                		            // 转成Number
	  		                					bzPolicyPremium += Number(item.policyPremium);
	  		                					bzStandardPremium += Number(item.standardPremium);
	  		                		        }
		          		      			})
	      		      				}
	      		      			})
			      			}
		      			}
  		      		}else if(difContent == "MSG003"){
  		      				var note = "";
      		      			$.each(weChatCoveragesList.policyInfoBeans, function(index, item){
              					note += item.productName;
              					if(item.productName == "车上责任险（驾驶员）" || item.productName == "车上责任险（乘客）" || item.productName == "第三者商业责任险"){
      		          				if(common.isNotNull(item.sumInsured) && item.sumInsured != 0){
	          							note += "限额" + item.sumInsured/10000 + "万、";
	          						}
  		          				}else {
		          						if(common.isNotNull(item.sumInsured) && item.sumInsured != 0){
		          							note += "保额" + item.sumInsured/10000 + "万、";
		          						}
	          						}
	                				if(common.isNotNull(item.policyPremium) && item.policyPremium != 0){
	          							note += "保费" + util2.fMoney(item.policyPremium) + "元，";
	          						}
              		            // 转成Number
              					bzPolicyPremium += Number(item.policyPremium);
              					bzStandardPremium += Number(item.standardPremium);
      		      			})
  		      			}
		      			bzFloatRatio = (bzPolicyPremium / bzStandardPremium * 10).toFixed(1);
	      			
		      			// 数组中最多有一个商业或交强险
		      			for(var i=0;i<weChatCoveragesList.productInfoBeans.length;i++){
		      				if('2' == weChatCoveragesList.productInfoBeans[i].productType) {
		      					note += "交强险"+ tcPremium +"元，";
		      				}
		      				if('1' == weChatCoveragesList.productInfoBeans[i].productType) {
		      					note += "商业险"+ bzPremium +"元";
			      				/*if(common.isNotNull(bzFloatRatio) && bzFloatRatio != 1.00){
		      		          		note += "(" + bzFloatRatio + "折)";
		      		          	}*/
			      				note += "，";
		      				}
		      			}
		      			
		      			if(weChatCoveragesList.productInfoBeans.length == 2){
  		      				var policyPremiumTotal = 0;
  		      				var bzSumPolicyPremium = Number(coveragePremium.bzSumPolicyPremium);
  		      				var tcSumPolicyPremium = Number(coveragePremium.tcSumPremium);
  		      				policyPremiumTotal = util2.fMoney(bzSumPolicyPremium + tcSumPolicyPremium);
  		      				note += "保费合计"+ policyPremiumTotal +"元，";
  		      			}
		      			
		      			if(common.isNotNull(vsltax) && vsltax != 0) {
		      				note += "车船税"+ vsltax +"元，";
		      			}
		      			note += "总计"+ total +"元。以上价格仅供参考，最终价格以出单为准。";
			          	note += "专属客户经理：" + userInfo.personInfo.psName;
			          	if(common.isNotNull(userInfo.personInfo.psMobilphone)){
	  		          		note += "联系电话：" + userInfo.personInfo.psMobilphone + "。";
	  		          	}else if(common.isNotNull(userInfo.personInfo.psOfficephone)){
	  		          		note += "联系电话：" + userInfo.personInfo.psOfficephone + "。";
	  		          	}else if(common.isNotNull(userInfo.personInfo.psHomephone)){
	  		          		note += "联系电话：" + userInfo.personInfo.psHomephone + "。";
	  		          	}
	      		util2.shareWeChat('ShareWX', 'shareWX', [note]);
//	      	})

			// 分享话术
			/*var registrationNumber = msgObj.plateNo;  //车牌号码
			var bzPremium = util2.fMoney(coveragePremium.bzSumPolicyPremium); //商业险
			var tcPremium = util2.fMoney(coveragePremium.tcSumPremium); //交强险
			var vsltax = util2.fMoney(common.isNull(coveragePremium.vehicleTaxes.trim())?0:coveragePremium.vehicleTaxes); //车船税
			var total = util2.fMoney(coveragePremium.sumInsured); //共计
			var hasThirdParty = false;
			var thirdPartyLiabilityCoverageSumInsured = 0;
			$.each(weChatCoveragesList.policyInfoBeans, function(index, item){
				if ('第三者商业责任险' == item.productName) {
					thirdPartyLiabilityCoverageSumInsured = item.policyPremium; //三者险保额
					hasThirdParty = true;
				}
			});

			var note = "尊敬的客户，公司名2产险为您的爱车"+ registrationNumber +"报价：";
			// 数组中最多有一个商业或交强险
			for(var i=0;i<weChatCoveragesList.productInfoBeans.length;i++){
				if('2' == weChatCoveragesList.productInfoBeans[i].productType) {
					note += "交强险"+ tcPremium +"元，";
				}
				if('1' == weChatCoveragesList.productInfoBeans[i].productType) {
					note += "商业险"+ bzPremium +"元";
					if (hasThirdParty) {
						note += "（其中三者险"+ thirdPartyLiabilityCoverageSumInsured +"元），";
					} else {
						note += "，";
					}
				}
			}

			note += "总计"+ total +"元";

			if(common.isNotNull(vsltax)) {
				note += "，车船税"+ vsltax +"元";
			}
			note += "。供参考，最终价格以出单为准。";*/
			break;
		case('picShareBtn'):
			 var _status = util2.GetQueryString('status');
			window.location.href = '../weiXinPicShare.html?applyNo=' + _applyNo + "&unitCode=" + userInfo.unitCode + "&userCode=" + userInfo.userCode + "&status=" +_status;
			//exec("ShareWX", "shareWX", [dataUrl]);
			//util2.shareWeChat("ShareWX", "shareWX", [dataUrl]);
//			var userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
//			window.location.href = '../weiXinPicShare.html?applyNo=' + _applyNo + "&unitCode=" + userInfo.unitCode + "&userCode=" + userInfo.userCode;
			/*setTimeout(function(){
				var height = $('.iscroll').height();
				var wrapperHeigth = $("#wrapper").height();
				$("#wrapper").height(height);
				$("#jietu").css('background','white');
				myScroll.scrollTo(0,100,100);
				setTimeout(function(){
					html2canvas(document.getElementById("jietu"), {
			            allowTaint : true,
			            taintTest : false,
			            onrendered : function(canvas) {
			                canvas.id = "mycanvas";
			                var dataUrl = canvas.toDataURL();
							util2.shareWeChat("ShareWX", "shareWX", [dataUrl]);
			            }
			        });
				},400);
				setTimeout(function(){
					$("#wrapper").height(wrapperHeigth);
					$("#jietu").css('background','rgb(246,246,246)');
				},800);
			},500);*/
			break;
		case('toP09Btn'):
			alert(object.id);
			location.href='#';
			break;
		case('purchaseAgainBtn'):
			//alert(object.id);
//			if(C.isNewCarReform(unitCode)){
//				location.href='../newInsV2/carInsurance.html';		
//			}else{
				location.href='../selfQuote/carInsurance.html';
//			}
			break;
		case('cameraBtn'):
			//点击时候触发任务完成接口
			 cpic.ui.loading.open();
			Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, _applyNo, '3', '{}','', _plateNo,'','','','','','CAR_PRICE','','',
	                function(result){
	                    cpic.ui.loading.close();
	                    if('1' == result.resultCode){
	                    	cpic.ui.loading.close();
	                        if(result.responseObject.state == '1') {
	                        	var _applyNo = util2.GetQueryString('applyNo');
	                		    var _plateNo = util2.GetQueryString('plateNo');
	                		    window.location.href = 'suppUnderWri.html?applyNo=' + _applyNo + '&plateNo=' + _plateNo+'&cameraBtn=cameraBtn&linkMan='+linkMan+'&telePhone='+telePhone;
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
		break;
//			Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, _applyNo, '4', '{}','', _plateNo,'','','','',
//	                function(result){
//	                    cpic.ui.loading.open();
//	                    if('1' == result.resultCode){
//	                        if(result.responseObject.state == '1') {
//	                        	window.location.href = 'suppUnderWri.html?applyNo=' + _applyNo + '&plateNo=' + _plateNo;
//	                        }else if(result.responseObject.state == '2') {
//	                            cpic.ui.loading.close();
//	                            cpic.alert(result.responseObject.msg);
//	                        }
//	                    }else{
//	                        cpic.ui.loading.close();
//	                        cpic.alert(result.message);
//	                    }
//	            },function(result){
//	                cpic.ui.loading.close();
//	                cpic.alert(result.message);
//	            });
////			break;
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

var coveragePremium = {
        // 标准总保费
        'sumPremium' : 0,
        // 保单总保费
        'sumInsured' : 0,
        // 商业险保单保费
        'bzSumPolicyPremium' : 0,
        // 商业险标准保费
        'bzSumStandardPremium' : 0,
        'sumPremium' : 0,
        'tcSumPremium' : 0,
        'vltSumPremium' : 0,
        'bzDiscount' : 0,
        'tcDiscount' : 0
};

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

// 测试数据
var coveragesList = {
    'state':true,
    'msg':'',
    "totalAmount":"100",
    'sumPremium':'6342.2',
    'sumInsured':'6342.2',
        "policyInfoBeans": [
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "4348.31",
                                "productCode": "DAMAGELOSSCOVERAGE",
                                "productName": "车辆损失险",
                                "standardPremium": "4348.31",
                                "startDate": "",
                                "sumInsured": "240000.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "765",
                                "productCode": "THIRDPARTYLIABILITYCOVERAGE",
                                "productName": "第三者商业责任险",
                                "standardPremium": "765",
                                "startDate": "",
                                "sumInsured": "50000.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "0.42",
                                "productCode": "INCARDRIVERLIABILITYCOVERAGE",
                                "productName": "车上责任险（驾驶员）",
                                "standardPremium": "0.42",
                                "startDate": "",
                                "sumInsured": "200.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "0.4",
                                "productCode": "INCARPASSENGERLIABILITYCOVERAGE",
                                "productName": "车上责任险（乘客）",
                                "standardPremium": "0.4",
                                "startDate": "",
                                "sumInsured": "100.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "1368",
                                "productCode": "THEFTCOVERAGE",
                                "productName": "全车盗抢损失险",
                                "standardPremium": "1368",
                                "startDate": "",
                                "sumInsured": "240000.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "0",
                                "policyPremium": "480",
                                "productCode": "GLASSBROKENCOVERAGE",
                                "productName": "玻璃单独破碎险",
                                "standardPremium": "480",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "288",
                                "productCode": "SELFIGNITECOVERAGE",
                                "productName": "自燃损失险",
                                "standardPremium": "288",
                                "startDate": "",
                                "sumInsured": "240000.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "226.47",
                                "productCode": "PADDLEDAMAGECOVERAGE",
                                "productName": "涉水损失险",
                                "standardPremium": "226.47",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "570",
                                "productCode": "CARBODYPAINTCOVERAGE",
                                "productName": "车身油漆单独损伤险",
                                "standardPremium": "570",
                                "startDate": "",
                                "sumInsured": "5000.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "188.73",
                                "productCode": "NEWEQUIPMENTCOVERAGE",
                                "productName": "新增设备损失险",
                                "standardPremium": "188.73",
                                "startDate": "",
                                "sumInsured": "10000.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "20",
                                "productCode": "REPAIRPERIODCOMPENSATIONSPECIALCLAUSE",
                                "productName": "修理期间补偿费用特约条款",
                                "standardPremium": "20",
                                "startDate": "",
                                "sumInsured": "100.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "80",
                                "productCode": "SPIRITDAMAGELIABILITYCOVERAGE",
                                "productName": "精神损害抚慰金责任险",
                                "standardPremium": "80",
                                "startDate": "",
                                "sumInsured": "10000.0",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "543.54",
                                "productCode": "APPOINTEDREPAIRFACTORYSPECIALCLAUSE",
                                "productName": "指定专修厂特约条款",
                                "standardPremium": "543.54",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "113.24",
                                "productCode": "DAMAGELOSSCANNOTFINDTHIRDSPECIALCOVERAGE",
                                "productName": "机动车损失保险无法找到第三方特约险",
                                "standardPremium": "113.24",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "679.42",
                                "productCode": "DAMAGELOSSEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "车损险不计免赔条款",
                                "standardPremium": "679.42",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "114.75",
                                "productCode": "THIRDPARTYLIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "三责险不计免赔条款",
                                "standardPremium": "114.75",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "0.06",
                                "productCode": "INCARDRIVERLIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "车上人员责任险司机不计免赔",
                                "standardPremium": "0.06",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "0.06",
                                "productCode": "INCARPASSENGERLIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "车上人员责任险乘客不计免赔",
                                "standardPremium": "0.06",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "273.6",
                                "productCode": "THEFTCOVERAGEEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "盗抢不计免赔条款",
                                "standardPremium": "273.6",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "28.31",
                                "productCode": "NEWEQUIPMENTEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "新增设备损失险不计免赔特约条款",
                                "standardPremium": "28.31",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "85.5",
                                "productCode": "CARBODYPAINTEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "车身油漆单独损伤险不计免赔特约条款",
                                "standardPremium": "85.5",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "57.6",
                                "productCode": "SELFIGNITEEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "自燃损失险不计免赔特约条款",
                                "standardPremium": "57.6",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "16",
                                "productCode": "SPIRITDAMAGELIABILITYEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "精神损害抚慰金责任险不计免赔特约条款",
                                "standardPremium": "16",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "33.97",
                                "productCode": "PADDLEDAMAGEEXEMPTDEDUCTIBLESPECIALCLAUSE",
                                "productName": "涉水损失险不计免赔特约条款",
                                "standardPremium": "33.97",
                                "startDate": "",
                                "sumInsured": "",
                                "taskStatus": ""
                            },
                            {
                                "endDate": "",
                                "floatingRate": "",
                                "glassManufacturer": "",
                                "policyPremium": "950",
                                "productCode": "TRAFFICCOMPULSORY2009PRODUCT",
                                "productName": "机动车交通事故责任强制保险2009",
                                "standardPremium": "950",
                                "startDate": "",
                                "sumInsured": "122000.0",
                                "taskStatus": ""
                            }
                        ]
};
var success = function(data) {
	//cpic.alert("success" + data);
};
var error = function(message) {
	//cpic.alert("error" + message);
};
