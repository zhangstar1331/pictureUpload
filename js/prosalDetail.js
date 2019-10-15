var insureConfirmObj;
var obj;
var unitDef;
var userInfo;
var unitCode;
var unitName;
var applyNo;
var _plateNo;
var totalPremium;

$(function(){
	//大保单对象
	
	//获取分公司代码
	userInfo = common.getLocalStorage(Interface.ss.userInfo, true);
    unitDef = common.getLocalStorage(Interface.ss.unitDef, true);
	unitCode = userInfo.unitCode;
	unitName = userInfo.unitName;
	applyNo = util2.GetQueryString('applyNo');
	_plateNo = util2.GetQueryString('plateNo');
	_status = util2.GetQueryString('status');
	getOrderDetail(userInfo.userCode, userInfo.unitCode, applyNo);
	
	var _shortData = util2.GetQueryString('shortData');
    if(common.isNotNull(_shortData) && _shortData != "undefined"){
    	cpic.alert("您还有"+_shortData+"这些资料欠缴，请尽快提交");
    }
    
    
    
	
	
//	if (crmObj.returnType==3) {
//		$(".home").attr("href","customerList.html");
//	}
//	else if (crmObj.returnType==4) {
//		$(".home").attr("href","../mine/myInfo.html");
//	}
//	else if (crmObj.returnType==5) {
//		$(".home").attr("href","../tool/tools.html");
//	}
	
	
	
	$("#year").html(new Date().getFullYear());
	$("#month").html(new Date().getMonth()+1);
	$("#date").html(new Date().getDate());
	
	
	$("#btn-ok").on("click",function(){
		cpic.ui.loading.open();
	    Interface.queryOrderDetail(userInfo.userCode, userInfo.unitCode, applyNo,'CAR_WHOLE',
	        function(result){
	    	cpic.ui.loading.close();
	            if('1'==result.resultCode){
	            	if(!$.isEmptyObject(result.responseObject) && common.isNotNull(result.responseObject.status)  && result.responseObject.status == '08' && (result.responseObject.jqStatus == 'H' || result.responseObject.syStatus ==  'H')){
	            		location.href = '../cameraQuote/payInsurance.html?applyNo='+applyNo+'&plateNo='+_plateNo+'&status='+_status+'&totalPremium='+totalPremium + '&name=' + result.responseObject.policyInfoDetailBean[0].applicantName||'';
	            	}else{
	            		cpic.alert("该保单正在核保中,请稍后再试!");
	            	}
	            } else {
	                cpic.alert(result.message);
	            }
	        },
	        function(){
	            cpic.ui.loading.close();
	        }
	    );
		
	})
	
	$("#retractEdit").on("click",function(){
		/*cpic.ui.loading.open();
		Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, applyNo, '2', '{}','', _plateNo,'','','','','','CAR_WHOLE','','',
                function(result){
                    if('1' == result.resultCode){
                    	cpic.ui.loading.close();
                        if(result.responseObject.state == '1') {
                        	cpic.alert({message:"<span class='font08em'>成功撤回任务</span>",params:{
                        		autoOpen: false,
                        		closeBtn: false,
                        		title: "备注信息",
                        		buttons: {
                        			'确定': function () {
                        				location.href='../cameraQuote/purchaseRecords.html';
                        			}
                        		}
                        	}});
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
		window.location.href="../cameraQuote/suppImage.html?&applyNo=" + applyNo+'&plateNo='+_plateNo;
	})
	
	$("#submit").on("click",function(){
		var _obj={
	            "appType":"A",
	            "requestObject":{
	            "requestNo":applyNo,
	            "unitCode":unitCode
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
                        location.href='comments.html?applyNo=' + applyNo + "&plateNo=" + _plateNo +'&status=' + _status;
                    }
                }else{
                    cpic.alert(result.message);
                }
            },
            error:function(result){
                cpic.ui.loading.close();
                cpic.alert(result.message);
            }
        });
	})
	
	setTimeout(function(){
		myScroll.refresh();
	},800);
	
});



function getOrderDetail(agentCode, unitCode, applyNo){
    cpic.ui.loading.open();
    Interface.queryOrderDetail(agentCode, unitCode, applyNo,'CAR_WHOLE',
        function(result){               
            cpic.ui.loading.close();
            if('1'==result.resultCode){
            	_plateNo = result.responseObject.plateNo;
            	//总保费
        		var premium = Number(result.responseObject.sumInsured);
        		var taxAmount = Number(result.responseObject.totalAmount);
        		var sumPremium = premium + taxAmount;
        		totalPremium = new Digital(sumPremium*100/100).format(2) 
            	if(!common.isEmptyJsonObject(result.responseObject.policyInfoDetailBean)){
            		
            		//投保信息
                	$("#applicant div[id=name]").html(result.responseObject.policyInfoDetailBean[0].applicantName||'');//投保人姓名
                	$("#applicant div[id=linkman]").html(result.responseObject.policyInfoDetailBean[0].applicantName||'');//联系人
                	$("#applicant div[id=tel]").html(result.responseObject.policyInfoDetailBean[0].appTelephone||'');//联系电话
                	$("#applicant div[id=certType]").html(result.responseObject.policyInfoDetailBean[0].appCertificateTypeName||'');// 证件类型   需要转换
                	$("#applicant div[id=certCode]").html(result.responseObject.policyInfoDetailBean[0].appCertificateCode||'');//证件号码
//                	$("#applicant div[id=bankcard]").html(result.responseObject.policyInfoDetailBean[0].appBankAccount||'');//银行账号
                	$("#applicant div[id=address]").html(result.responseObject.policyInfoDetailBean[0].appAddress||'');//通讯地址
                	$("#applicant div[id=postCode]").html(result.responseObject.policyInfoDetailBean[0].appPostalCode||'');//邮编
                	$("#applicant div[id=email]").html(result.responseObject.policyInfoDetailBean[0].appEmail||'');//email
                	
                	//被保险人信息
                	$("#insured div[id=name]").html(result.responseObject.policyInfoDetailBean[0].insuredPersonName||'');//投保人姓名
                	$("#insured div[id=linkman]").html(result.responseObject.policyInfoDetailBean[0].insuredPersonName||'');//联系人
                	$("#insured div[id=tel]").html(result.responseObject.policyInfoDetailBean[0].insTelephone||'');//联系电话
                	$("#insured div[id=certType]").html(result.responseObject.policyInfoDetailBean[0].insCertificateTypeName||'');//TODO  证件类型   需要转换
                	$("#insured div[id=certCode]").html(result.responseObject.policyInfoDetailBean[0].insCertificateCode||'');//证件号码
//                	$("#insured div[id=bankcard]").html(result.responseObject.policyInfoDetailBean[0].insBankAccount||'');//银行账号
                	$("#insured div[id=address]").html(result.responseObject.policyInfoDetailBean[0].insAddress||'');//通讯地址
                	$("#insured div[id=postCode]").html(result.responseObject.policyInfoDetailBean[0].insPostalCode||'');//邮编
                	$("#insured div[id=email]").html(result.responseObject.policyInfoDetailBean[0].insEmail||'');//email
                	
                	//交强险
                	$("#unitName").html(result.responseObject.policyInfoDetailBean[0].insurerBranchCode||'');//承保公司
                	$("#tcApplyNo").html(result.responseObject.policyInfoDetailBean[0].coverNo||'');//交强险保险单号
//                	$("#policyDate").html(result.responseObject.policyInfoDetailBean[0].coverDate||'');//交强险保险起期
                	
                	//车辆信息
                	$("#licenseOwner").html(result.responseObject.policyInfoDetailBean[0].carOwnerName||'');//车主
                	$("#registrationNumber").html(result.responseObject.plateNo||'');//号牌号码
                	$("#plateColorName").html(C.getMadeColor(result.responseObject.policyInfoDetailBean[0].licenseColor)||'');//底色
//                	$("#specialPlate").html(result.responseObject.policyInfoDetailBean[0].isTakePicture||'');//是否两地拍照
                	$("#plateTypeName").html(result.responseObject.policyInfoDetailBean[0].pictureType||'');//牌照类型
                	$("#modelNumber").html(result.responseObject.makerModel||'');//厂牌型号
                	$("#engineNumber").html(result.responseObject.engineNo||'');//发动机号
                	$("#frameNumber").html(result.responseObject.carVin||'');//车架号
                	$("#engineSize").html(result.responseObject.policyInfoDetailBean[0].engineCapacity||'');//排量功率
                	$("#seatCapacity").html(result.responseObject.policyInfoDetailBean[0].carryingCapacity||'');//载质量
                	$("#seat").html(result.responseObject.policyInfoDetailBean[0].seatCount||'');//载客数
//                	$("#bodyColor").html(result.responseObject.policyInfoDetailBean[0].carColor||'');//车身颜色
                	$("#purchasePrice").html(result.responseObject.policyInfoDetailBean[0].purchasePrice||'');//新车购置价  
                	$("#firstRegistrationDate").html(getYearMonthDay(result.responseObject.policyInfoDetailBean[0].registerDate)||'');//初登日期
                	$("#bizAttributeName").html(Config.getCodeName(unitCode,'BizVehicleClass2014',result.responseObject.policyInfoDetailBean[0].syVehicleUsage2)||'');//使用性质
                	$("#bizCategoryName").html(Config.getCodeName(unitCode,'BizVehicleType2014',result.responseObject.policyInfoDetailBean[0].syVehicleVariety2)||'');//机动车种类
//                	$("#bizCategoryName").val(result.responseObject.policyInfoDetailBean[0].jqVehicleVariety1||'');//本公司投保情况
                	
                	//车船税
                	$("#taxPayer").html(result.responseObject.policyInfoDetailBean[0].taxpayerId||'');//纳税人识别号
//                	$("#zhiqiId").html(result.responseObject.policyInfoDetailBean[0].jqLastEndDate||'');//需要截取  
                	$("#daishouTaxState").html(result.responseObject.policyInfoDetailBean[0].taxTypeName||'');//纳税状态
                	$("#taxCertNo").html(result.responseObject.policyInfoDetailBean[0].voucherNum||'');//凭证号
                	$("#taxOffice").html(result.responseObject.policyInfoDetailBean[0].taxDepartmentCode||'');//开具税务机
                	$("#loadCapicity").html(result.responseObject.policyInfoDetailBean[0].emptyWeight||'');//整备质量
                	$("#fullWeight").html(result.responseObject.policyInfoDetailBean[0].sumQuality||'');//总质量
                	
                	
                	$("#drivingAreaName").html(C.getRegion(result.responseObject.policyInfoDetailBean[0].driveArea)||'');//待转换  行驶区域
//                	$("#useName").html(Config.getCodeName(unitCode,'SpecialUse2014',result.responseObject.policyInfoDetailBean[0].vehiclePurpose)||'');//待转换  车辆用途
                	$("#nonClaimDiscountName").html(result.responseObject.policyInfoDetailBean[0].nonClaimDiscountRate||'');//商业险无赔款折扣
                	$("#trafficTransgressCount").html(result.responseObject.policyInfoDetailBean[0].trafficIllegalTimesLastYear||'');//上年交通违法记录
                	$("#annualMileage").html(result.responseObject.policyInfoDetailBean[0].averageMileage||'');//平均年行驶里程
                	
                	$("#sellChannel").html(getSellChannel(result.responseObject.policyInfoDetailBean[0].appId)||'');//sellChannel 业务来源
//                	$("#vehicleCountRate").html(result.responseObject.policyInfoDetailBean[0].acceptInsnum||'');//承包数量
//                	$("#businessPerson").html(result.responseObject.policyInfoDetailBean[0].businessPerson||'');//业务人员
                	$("#inputorCode").html(result.responseObject.policyInfoDetailBean[0].staffCode||'');//经办人代码
                	$("#workCode").html(result.responseObject.policyInfoDetailBean[0].uwUserName||'');//核保人代码
                	//验车情况
                	var vehicleInspection = result.responseObject.policyInfoDetailBean[0].testCar;//返回验车代码
                	if(common.isNotNull(vehicleInspection)){
                		if(vehicleInspection=="01"){//免验车
                			$("#myc").removeClass("icon_btn_tebie").addClass("icon_btn_tebie_2");
                		}else if(vehicleInspection=="02"){//已验车合格
                			$("#yyc").removeClass("icon_btn_tebie").addClass("icon_btn_tebie_2");
                		}else if(vehicleInspection=="03"){//待验车
                			$("#dyc").removeClass("icon_btn_tebie").addClass("icon_btn_tebie_2");
                		}
                	}
                	
                	//交强险和商业险的起期赋值
                	if(common.isNotNull(result.responseObject.productInfoBeans) && result.responseObject.productInfoBeans.length >0 ){
                		for(var i =0 ;i < result.responseObject.productInfoBeans.length ; i++){
                			var tempProInfoBean = result.responseObject.productInfoBeans[i];
                			//交强险
                			if(common.isNotNull(tempProInfoBean.productType) && tempProInfoBean.productType == 2){
                    			if(common.isNotNull(tempProInfoBean.startDate)){
                    				$("#tcStartTime").html(tempProInfoBean.startDate.replace(/\//g,'-'));//交强险起期
                    			}
                    		}else if(common.isNotNull(tempProInfoBean.productType) && tempProInfoBean.productType == 1){//商业险
                    			if(common.isNotNull(tempProInfoBean.startDate)){
                    				$("#bzStartTime").html(tempProInfoBean.startDate.replace(/\//g,'-'));//交强险起期
                    			}
                    		}
                		}
                	}
                	$("#tcsPremuim").html(result.responseObject.policyInfoDetailBean[0].jqPremium||'');//交强险保费
                	$("#bzsPremuim").html(result.responseObject.policyInfoDetailBean[0].syPremium||'');//商业险保费
                	$("#totalPremuim").html(totalPremium);//总保费
                	$("#dnVsltax").html(result.responseObject.policyInfoDetailBean[0].amount||'');//当年应缴车船税金额
                	$("#wnVsltax").html(result.responseObject.policyInfoDetailBean[0].backAmount||'');//往年应缴车船税金额
                	
                	
                	
                	$("#car_no").html(result.responseObject.plateNo||'');//号牌号码
                	$("#bascEngineNumber").html(result.responseObject.engineNo||'');//发动机号
                	$("#bascFrameNumber").html(result.responseObject.carVin||'');//车架号
                	
                	//NCD系数以及实际折扣率
//                	$("#ncdId").html(result.responseObject.ncd||'');//NCD
                	$("#actualRate").html(result.responseObject.syFloatRate||'');//实际折扣率
                	
                	//商业险展示
                	var itemTemp  = result.responseObject.policyInfoBeans;
                	var coverageItems = '';
                	if( $.isArray(itemTemp) && itemTemp.length > 0){
                		for(var n=0;n<itemTemp.length;n++){
                			var item = itemTemp[n];
                			if(item.productCode == "TRAFFICCOMPULSORY2009PRODUCT"){
                				continue;
                			}else{
                				item.sumInsured = item.sumInsured == "-1.0"? "": item.sumInsured;
                				coverageItems += '<tr>'
                				coverageItems += '<td style="margin-left:0px;color:#8c8c8c!important;">' + item.productName + '</td>';
                				coverageItems += '<td style="margin-left:0px;color:#8c8c8c!important;">' + item.sumInsured + '</td>';
                				coverageItems += '<td style="text-align:right;color:#8c8c8c!important;">' + util2.fMoney(item.policyPremium) + '</td>';
                				coverageItems += '</tr>'
                			}
                		}
                	}
                	$("#bzCoverages").append(coverageItems);
        			
                	
                	
                	/*if(common.isNotNull(result.responseObject.policyInfoDetailBean[0]) && result.responseObject.policyInfoDetailBean[0].epsTmInsBean){
                		$.each(result.responseObject.policyInfoDetailBean[0].epsTmInsBean,function(i,ele){
                			if(ele.productCode != 'THIRDPARTYLIABILITYCOVERAGE'){
                				
                			}
                		})
                	}*/
                	
                	
                	
                    /*for(var i=0;i<result.responseObject.productInfoBeans.length;i++){
                    	
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
                    var length = weChatCoveragesList.modifyRemarks.length;
                    var msg = weChatCoveragesList.modifyRemarks[length - 1];
                    if(!common.isEmptyJsonObject(msg)){
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
            	}
            } else {
                cpic.alert(result.message);
            }
        },
        function(){
            cpic.ui.loading.close();
        }
    );
}





//显示数据


function generateCoveragesHTML(coverages){
	var temp = "";
	$.each(final_resultKinds, function(i, k){
		var coverage = coverages[k];
		if(!coverage) return;
		var insuranceitemName = coveragesKindList[k];
		var sumInsured = coverage.sumInsured;
		if(k == "TRAFFICCOMPULSORYPRODUCT"){
			insuranceitemName = "交强险";
			sumInsured = new Digital(sumInsured).format(0);
		}else if(k == "GlassBrokenCoverage"){
			var glassType = obj.vehInfo.glassType;
			switch(glassType){
			    case '0':
			    	sumInsured = "国产";
				    break;
			    case '1':
			    	sumInsured = "进口";
				    break;
			    case '3':
			    	sumInsured = "国产(特殊材料)";
			    	break;
			    case '4':
			    	sumInsured = "进口(特殊材料)";
			    	break;
			    default:
			    	sumInsured = '-';
			}
		}else if(k == "RepairPeriodCompensationSpecialClause"){
			sumInsured = (new Digital(coverage.sumInsured).format(0) + "元*" + coverage.count+"天");
		}else if(k == "AppointedRepairFactorySpecialClause"){
			sumInsured = "-";
		}else if(k == "InCarPassengerLiabilityCoverage"){
//			sumInsured = (coverage.sumInsured + "元*" + coverage.count+"座");
			sumInsured = (new Digital(coverage.sumInsured).format(0)  + "*" + coverage.count+"座");
		}else{
			sumInsured = (coverage.sumInsured == 0) ? "-" : new Digital(coverage.sumInsured).format(0) ;
		}
		
		temp += "<tr><td class='t_left' width='30%'>" + insuranceitemName + "</td>" +
			"<td class='t_right'>" + sumInsured + "</td>" +
			"<td class='t_right'>" + new Digital(new Number(coverage.policyPremium).toFixed(2)).format(2) + "</td></tr>";
		
	});
	return temp;
}


//日期格式
function time(date){
	var year = date.substring(0,4); 
	var month = date.substring(5,7); 
	var day = date.substring(8,10); 
	return year+"年"+month+"月"+day+"日";
}

/**
 * 格式化日期字符串/日期对象
 * @param datetime
 * @param pattern
 * @returns {String}
 */
function formatterDatetime(datetime, pattern){
	var _d = new Date();
	if(typeof datetime == 'object'){
		_d = datetime;
	}else if(typeof datetime == 'string'){
		_d = parseDate(datetime);
	}
	
	var y = _d.getFullYear();
	var M = _d.getMonth() + 1;
	var d = _d.getDate();
	var h = _d.getHours();
	var m = _d.getMinutes();
	var s = _d.getSeconds();
	
	var yyyy = y;
	var MM = (M < 10 ? ('0' + M) : M);
	var dd = (d < 10 ? ('0' + d) : d);
	var HH = (h < 10 ? ('0' + h) : h);
	var mm = (m < 10 ? ('0' + m) : m);
	var ss = (s < 10 ? ('0' + s) : s);
	
	var fmt = new String(pattern).replace(/yyyy/gi, yyyy).replace(/MM/g, MM).replace(/dd/gi, dd).replace(/HH/gi, HH).replace(/mm/g, mm).replace(/ss/gi, ss);
	fmt = fmt.replace(/y/gi, y).replace(/M/g, M).replace(/d/gi, d).replace(/h/gi, h).replace(/m/g, m).replace(/s/gi, s);
	
	return fmt;
}


/**
 * 转化日期字符串
 */
function parseDate(dateStr){
	if(dateStr=='')
		return null;
	var _dateStr = new String(dateStr).replace(/\-/g, '/').replace(/\.\d+$/, '').replace(/T/, ' ');
	_dateStr = _dateStr.substring(0,19);
	var date = new Date(_dateStr);
	if(date.toString() !== 'Invalid Date'){
		return date;
	}
	return null;
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
    }
};


var getYearMonthDayHour=function(time){
	   if(common.isNull(time))return "";
	   return formatterDatetime(time, "yyyy年MM月dd日HH时mm分ss秒");
	};

var getYearMonthDay=function(time){
	   if(common.isNull(time))return "";
	   return formatterDatetime(time, "yyyy年MM月dd日");
	};
	
var getYearMonth=function(time){
	   if(common.isNull(time))return "";
	   return formatterDatetime(time, "yyyy年MM月");
	};
var getVehicleInspection=function(code){
		if(common.isNull(code))return '';
		switch(code){
		case '01':return "免验车";
		case '02':return "已验车合格";
		case '03':return "待验车";
		default :return "";
		}
	};
	

function getSellChannel(code){
	switch(code){
 	  case "11":
 		  return "公司直营门店";
 		  break;
 	 case "12":
		  return "直拓";
		  break;
 	case "21":
		  return "普通专业代理（不含车商）";
		  break;
 	case "22":
		  return "普通兼业代理（不含车商）";
		  break;
 	case "23":
		  return "个人营销";
		  break;
 	case "2":
		  return "银行代理";
		  break;
 	case "31":
		  return "普通经纪（不含车商）";
		  break;
 	case "28":
		  return "车商兼业代理";
		  break;
 	case "40":
		  return "邮局代理";
		  break;
 	case "29":
		  return "运输行业";
		  break;
 	case "39":
		  return "车商经纪";
		  break;
 	case "37":
		  return "车商专业代理";
		  break;
 	case "38":
		  return "产险营销便利店";
		  break;
 	case "32":
		  return "个代产";
		  break;
 	case "25":
		  return "银团代产";
		  break;
 	case "36":
		  return "寿险营销便利店";
		  break;
	}
}