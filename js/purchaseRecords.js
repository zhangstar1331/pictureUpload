var _userMobile = '';
$(function(){
	initPages();
});

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

var isDebug = false;
var quoteType = "camera"; // camera  quick
var isQuickClicked = false;
var appType="M";//CRM传入车E保标识
var pageSize = 10;
var pageNo = 1;
function initPages(){
	common.removeLocalStorage("policyBean");
	userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
	loginDetail = common.getLocalStorage(Interface.ss.loginDetail,true);

	var res = localStorage.getItem('selType');
	if(common.isNull(res)){
		$("#allSta").html("报价");
	}else{
		$("#allSta").html(res);
		if(res == "保单服务配送"){
			getPrintDistributionList('01');
		}else if(res == "回收站"){
			$(".searchBox").hide();
			$(".orderdate-2").hide();
			$("#wrapper").removeClass("allOrdersTemp").addClass("allOrders");
			changeHeight();
			getRecyleList();
			clearClicked();
		}
	}
	clearClicked();
	onlyChangeToClicked('unquoteNum');
	$('header .back').singleTap(function(){
		location.href = '../tool/tools.html';
	});
	$('header .home').singleTap(function(){
		location.href = '../tool/tools.html';
	});

	$("#unquoteNum").on('click', function(){
		var _startDate = $('#_submitDate').html();
		if( $("#allSta").html() == "报价"){
			getOrderList('', '01', _startDate);
		}else if( $("#allSta").html() == "投保"){
			getOrderList('', '05', _startDate);
		}else if($("#allSta").html() == "保单服务配送"){
			getPrintDistributionList('01');
		}
		clearClicked();
		onlyChangeToClicked('unquoteNum');
	});
	$("#quoteNum").on('click', function(){
		var _startDate = $('#_submitDate').html();
		if( $("#allSta").html() == "报价"){
			getOrderList('', '02', _startDate);
		}else if( $("#allSta").html() == "投保"){
			getOrderList('', '06', _startDate);
		}else if($("#allSta").html() == "保单服务配送"){
			getPrintDistributionList('02');
		}
		clearClicked();
		onlyChangeToClicked('quoteNum');
	});
	$("#unissueNum").on('click', function(){
		isQuickClicked = true;
		var _startDate = $('#_submitDate').html();
		if( $("#allSta").html() == "报价"){
			getOrderList('', '03', _startDate);
		}else if( $("#allSta").html() == "投保"){
			getOrderList('', '07', _startDate);
		}else if($("#allSta").html() == "保单服务配送"){
			getPrintDistributionList('03');
		}
		clearClicked();
		onlyChangeToClicked('unissueNum');
	});
	$("#issueNum").on('click', function(){
		var _startDate = $('#_submitDate').html();
		if( $("#allSta").html() == "报价"){
			getOrderList('', '04', _startDate);
		}else if( $("#allSta").html() == "投保"){
			getOrderList('', '08', _startDate);
		}else if($("#allSta").html() == "保单服务配送"){
			getPrintDistributionList('04');
		}
		clearClicked();
		onlyChangeToClicked('issueNum');
	});

	$("#returnUnder").on('click', function(){
		var _startDate = $('#_submitDate').html();
		if( $("#allSta").html() == "投保"){
			getOrderList('', '09', _startDate);
		}
		clearClicked();
		onlyChangeToClicked('returnUnder');
	});

	var defaultTemp = localStorage.getItem('quoteType');
	if(defaultTemp == 'quick' ){
		$("#qoutionName").html('快速报价');
		quoteType = 'quick';
		isQuickClicked = true;
	}

	//初始化筛选条件
	$('#qoutionType').singleTap(function(){
		var params = ['拍照报价', '快速报价'];
		var defaultVal = 'camera';
		$("#qoutionStatus").scratcher(params, defaultVal, function(result){
			$("#qoutionName").html(result);

			if('拍照报价' == result){
				quoteType = 'camera';
			} else {
				quoteType = 'quick';
			}
			localStorage.setItem('quoteType',quoteType);

			clearClicked();
			if(isDebug){
				parseOrderItems(list.TaskListBeans);
			} else {
				isQuickClicked = true;
				getOrderList();
			}
		});
	});

	//全部订单的下拉选项
	$('#allStaLi').singleTap(function(){
		var params = ['未接单', '已接单','已报价','报价退回','已投保','投保退回','核保退回','待支付','已支付','保单服务配送未接单','保单服务配送已接单','已配送','保单服务配送已退回'];
		var params = ['报价', '投保', '保单服务配送','回收站'];
		var defaultVal = $("#allSta").html();
		$("#allStaLi").scratcher(params, defaultVal, function(result){
			$("#allSta").html(result);
			localStorage.setItem('selType',result);
			var _startDate = $('#_submitDate').html();
			if('回收站' == result){
				$("#wrapper").removeClass("allOrders").addClass("allOrdersTemp");
				changeHeight();
			}else{
				$("#wrapper").removeClass("allOrdersTemp").addClass("allOrders");
				changeHeight();
			}
			if('报价' == result){
				$(".searchBox").show();
				$(".orderdate-2").show();
				getOrderList('', '01', _startDate);
				clearClicked();
			} else if('投保' == result){
				$(".searchBox").show();
				$(".orderdate-2").show();
				getOrderList('', '05', _startDate);
				clearClicked();
			}else if('保单服务配送' == result){
				$(".searchBox").show();
				$(".orderdate-2").show();
				getPrintDistributionList('01');
				clearClicked();
			}else if('回收站' == result){
				$(".searchBox").hide();
				$(".orderdate-2").hide();
				getRecyleList();
				clearClicked();
			}
			onlyChangeToClicked('unquoteNum');
			/*else if('已报价' == result){
				getOrderList('', '03', _startDate);
				clearClicked();
			}else if('报价退回' == result){
				getOrderList('', '04', _startDate);
				clearClicked();
			}else if('已投保' == result){
				getOrderList('', '05', _startDate);
				clearClicked();
			}else if('投保退回' == result){
				getOrderList('', '06', _startDate);
				clearClicked();
			}else if('核保退回' == result){
				getOrderList('', '07', _startDate);
				clearClicked();
			}else if('待支付' == result){
				getOrderList('', '08', _startDate);
				clearClicked();
			}else if('已支付' == result){
				getOrderList('', '09', _startDate);
				clearClicked();
			}else if('保单服务配送未接单' == result){
				getPrintDistributionList("01");
				clearClicked();
			}else if('保单服务配送已接单' == result){
				getPrintDistributionList("02");
				clearClicked();
			}else if('已配送' == result){
				getPrintDistributionList("03");
				clearClicked();
			}else if('保单服务配送已退回' == result){
				getPrintDistributionList("04");
				clearClicked();
			}*/
		});
	});

	// 初始化筛选日期
	$("#submitDate").scroller('destroy').scroller(
		$.extend({
			preset : 'date',
			dateOrder : 'yymmdd',
			maxDate: new Date(),
			// minDate: new Date(oldPolicy.baseInfo.bzStartTime.replace(/-/g,'/')),
			theme : 'android-ics light',
			mode : 'scroller',
			lang : 'zh',
			minWidth : parseInt($(window).width()/3)-16,  //用于时间控件占据屏幕整个宽度
			onSelect : function(result){
				isQuickClicked = true;
				$("#_submitDate").html(result);
				clearClicked();
				getOrderList('', '', result);
			},
			onCancel : function(result){
				isQuickClicked = true;
				if($("#_submitDate").html() != '提交日期'){
					$("#_submitDate").html('提交日期');
					getOrderList();
					clearClicked();
				}
			}
		})
	);

	// 初始化订单item
	if(isDebug){
		parseOrderItems(list.TaskListBeans);
	} else {
		getOrderList();
	}

	// 初始化搜索按钮 单击
	$('#searchNameOrNoBtn i').singleTap(function(){
		//alert('searchOrderBtn');
		searchListByNameOrNo();
		clearClicked();
	});

	// 绑定回车
	$('#searchNameOrNo').keydown(function(){
		if(event.keyCode == "13"){
			searchListByNameOrNo();
		}

	});

	// 绑定离焦事件
	// $('#searchNameOrNo').blur(function(){
	// 	searchListByNameOrNo();
	// });

	//tab切换
	$(".tabBox a").bind('click', function(){
		$(this).addClass('active').siblings().removeClass('active');
        $('.mainInner .tabMain').hide().eq($('.tabBox a').index(this)).show();
    });
    //点击显示下拉
	$(".search-sort").bind('click', function(){
		$(this).next().toggle();
	});
	//选中样式
	$(".sortType span").bind('click', function(){
		$(this).addClass("current");
		$(this).siblings('.current').removeClass('current');

	});

	function searchListByNameOrNo(){
		var _value = $('#searchNameOrNo').val();
			if(common.isNotNull(_value)){
				getOrderList(_value, '');
			} else {
				getOrderList();
			}
	}
}

function parseOrderItems(orderlist){
	var orderitems = '';
	// 遍历订单信息填充到orderitems中

	if(orderlist.length==0){
		orderitems += '<div style="">';
		orderitems += '<div class="backgroundColor attention color-gray" style="padding: 0 1em;">暂无数据，请稍后再试.</div>';
		orderitems += '</div>';
	} else {
		$.each(orderlist, function(index, item){
			if("camera" == quoteType){
//				if(taskStatusValue[item.status]==null){
//					return true;
//				}
				/*if(item.licenseOwner==null||item.licenseOwner==''){
					item.licenseOwner = '默认名称';
				}*/
				if(item.sumPremium==null||item.sumPremium==''){
					item.sumPremium = '-';
				}
				if(item.pvehicleLicense==null||item.pvehicleLicense==''){
					item.pvehicleLicense = item.vehicleLicense;
				}
				if(item.createTime==null||item.createTime==''){
					item.createTime = common.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss');
				}
				/**
				 *  报价
				 *  e.status= 01 and e.busitype='5'  //未接单
					e.busitype='5' and (e.status=04  or e.status = 05 ore.status=14) //已接单
					e.busitype='5' and (e.status=08  or e.status=11  or e.status = 13)   //已报价
					e.busitype='5' and e.status=99     //已退回

					投保
					e.busitype='6'  and e.status= 01 //未接单（投保）
					e.busitype='6'  and (e.status=04  or e.status = 05 or (e.status=08 and (e.jq_status not in('H','3') or e.sy_status not in('H','3')) ) or e.status=14)
					e.busitype = '6' and (e.jq_status = 'H' or e.sy_status='H')   //待支付
					e.busitype = '6' and (e.jq_status = '3' or e.sy_status='3')    //已支付
					e.busitype = '6' and e.status = '99'    //退回（退保退回、核保退回）
				 */
				if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && "01" == item.status){
					_status = "01"  ;//报价未接单
				}else if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && ( "04" == item.status || "05" == item.status || "14" == item.status)){
					_status = "02" ;//报价已接单
				}else if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && ( "08" == item.status || "11" == item.status || "13" == item.status)){
					_status = "03" ;//已报价
				}else if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && (  "99" == item.status)){
					_status = "04" ;//报价退回
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && "01" == item.status){
					_status = "05"  ;//投保未接单
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && ( "04" == item.status || "05" == item.status || "14" == item.status || ( "08" == item.status && ($.inArray(item.jqStatus,['3','H']) == '-1' || $.inArray(item.syStatus,['3','H']) == '-1')))){
					_status = "06" ;//投保已接单
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && "08" == item.status && ("H" == item.jqStatus || "H" == item.syStatus) ){
					_status = "07" ;//待支付
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) &&((item.jqStatus == '3' && ( common.isNull(item.syStatus) || item.syStatus == 'have')) || (item.syStatus == '3' && ( common.isNull(item.jqStatus) || item.jqStatus == 'have')) ||  ("3" == item.jqStatus || "3" == item.syStatus)) ){
					_status = "08" ;//已支付
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && (  "99" == item.status) &&  (  "1" == item.retFlag)){
					_status = "09" ;//投保退回
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && (  "99" == item.status) &&  (  "2" == item.retFlag)){
					_status = "10" ;//核保退回
				}else{
					_status = "11" ;//其他
				}

				// 未接单,已接单(取vehicle) 已报价,已退回(取pvehicle)
				//if('01' == item.status||'04' == item.status||'05' == item.status || '99' == item.status){
				if('01' == _status||'02' == _status){
					orderitems += '	<div style="border-bottom:0.1em solid #f6f6f6;position:relative;" onclick="toPurchaseDetail(' + '\'' + item.applyNo + '\',\'' + item.vehicleLicense + '\',\'' + _status + '\',\'' + item.shortData +'\',\'' + item.zremarks.replace(/[\r\n]/g,"") + '\')">';
				} else {
					orderitems += '	<div style="border-bottom:0.1em solid #f6f6f6;position:relative;" onclick="toPurchaseDetail(' + '\'' + item.applyNo + '\',\'' + item.pvehicleLicense + '\',\'' + _status + '\',\'' + item.shortData +'\',\'' + item.zremarks.replace(/[\r\n]/g,"") + '\')">';
				}


				orderitems += '	<div class="backgroundColor" style="padding: 0 1em;">';
				orderitems += '		<span class="d_left red">拍照</span>';
				orderitems += '		<span class="d_left" style="font-size:.9em">'+ item.applyNo +'</span>';
				var allStatusName = $("#allSta").html();
//				if(allStatusName == '回收站'){
//					orderitems += '<span class="deleteOrder" onclick="javascript:recyleOreder(\''+item.applyNo+'\',\''+_status+'\',\''+event+'\')">恢复</span>';
//				}else{
					if((_status == "03" || _status == "04" || _status == "07" || _status == "09"  || _status == "10") && allStatusName != '回收站'){
						orderitems += '<span class="deleteOrder" onclick="javascript:delOreder(\''+item.applyNo+'\',\''+_status+'\',\''+event+'\')">删</span>';
					}
//				}

				if(item.isShort == "1" && _status == "08" ){
					orderitems += '<span style="font-size: 0.9em;color: #ffffff;padding: .1em 0.3em .15em;border-radius: 3px;background: #e83344;position: relative;left: 4%;">欠</span>';
				}
				orderitems += '		<span class="d_right" style="font-size:.9em">';
				orderitems += '			<a class="" style="color:#A9A9BB;">' + taskStatusValueNew[_status] + '</a>';
				orderitems += '		</span>';
				orderitems += '	</div>';
				orderitems += '	<div class="backgroundColor2-sec">';
				orderitems += '		<table width="97%" style="margin-left: 1em;">';
				orderitems += '			<tr>';

				// 未接单,已接单(取vehicle) 已报价,已退回(取pvehicle)
//				if('01' == item.status||'04' == item.status||'05' == item.status || '99' == item.status){
				if('01' == _status||'02' == _status){
					orderitems += '				<td width="50%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;">'+item.vehicleLicense+'</td>';

				} else {
					orderitems += '				<td width="50%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;">'+item.pvehicleLicense+'</td>';
				}

				orderitems += '				<td width="15%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;">'+item.licenseOwner+'</td>';

				if('-' == item.sumPremium){
					orderitems += '				<td width="28%" rowspan="2" class="color-gray" style="font-size: .9em;text-align:right;"> - 元</td>';
				} else {
					orderitems += '				<td width="28%" rowspan="2" class="color-gray" style="font-size: .9em;text-align:right;">' + (utils.fMoney(Number(item.sumPremium)+Number(item.totalAmount))) + '元</td>';
				}
				orderitems += '				<td width="7%" rowspan="2" class="floatleft_icons-sec"></td>';
				orderitems += '			</tr>';
				orderitems += '			<tr>';
				orderitems += '				<td class="color-gray" style="font-size: .8em;padding-bottom: 0.5em;">提交时间:' + /*new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')*/common.formatDate(item.createTime,'yyyy-MM-dd hh:mm:ss') + '</td>';
				orderitems += '			</tr>';
				orderitems += '		</table>';
				orderitems += '	</div>';
				orderitems += '</div>';
			} else {
				orderitems += '<div style="border-bottom:0.1em solid #f6f6f6">';
				orderitems += '	<div class="backgroundColor" style="padding: 0 1em;">';
				orderitems += '		<span class="d_left red">快速</span>';
				orderitems += '		<span class="d_left" style="font-size:.9em">'+ item.policyId +'</span>';
				orderitems += '	</div>';
				orderitems += '	<div class="backgroundColor2-sec" onclick="toPurchaseDetail(' + '\'' + item.policyId + '\')">';
				orderitems += '		<table width="97%" style="margin-left: 1em;">';
				orderitems += '			<tr>';
				orderitems += '				<td width="60%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;">'+item.registrationNumber+'</td>';
				orderitems += '				<td width="10%" rowspan="2" class="floatleft_icons-sec"></td>';
				orderitems += '			</tr>';
				orderitems += '			<tr>';
				orderitems += '				<td class="color-gray" style="font-size: .8em;padding-bottom: 0.5em;">起保日期:' + /*new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')*/common.formatDate(item.businessPolicyBeginTime,'yyyy-MM-dd hh:mm:ss') + '</td>';
				orderitems += '			</tr>';
				orderitems += '		</table>';
				orderitems += '	</div>';
				orderitems += '</div>';
			}
		});

			/*orderitems += '	<div class="backgroundColor3-sec">';
			orderitems += '		<div class="bg-f" style="padding-left:1em;font-size:.8em">';
			orderitems += '			<div class="attention color-gray border-top">注：报价结果24小时内有效，超时需要重新发起</div>';
			orderitems += '		</div>';
			orderitems += '	</div>';*/

			if(orderlist.length == pageSize){
				orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:getMore(\''+ $("#_submitDate").html() + '\',' + ++pageNo +')">点击加载更多</span></li></ul>';
			}else{
				orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:void()">没有更多数据。</span></li></ul>';
			}
	}

	$('#orderitems').html(orderitems);
	setTimeout(function(){
		if(myScroll){
			myScroll.refresh();
		}
	},800);
}

function parsePrintItems(orderlist){
	var orderitems = '';

	if(orderlist.length==0){
		orderitems += '<div style="">';
		orderitems += '<div class="backgroundColor attention color-gray" style="padding: 0 1em;">暂无数据，请稍后再试.</div>';
		orderitems += '</div>';
	} else {
		$.each(orderlist, function(index, item){
			if("camera" == quoteType){
				if(item.createTime==null||item.createTime==''){
					item.createTime = common.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss');
				}

				orderitems += '<div style="border-bottom:0.1em solid #f6f6f6" onclick="toPrintDetail(' + '\'' + item.applyNo + '\',\'' + item.status+ '\',\'' + item.emsWay + '\')">';
				orderitems += '	<div class="backgroundColor" style="padding: 0 1em;">';
				orderitems += '		<span class="d_left red">拍照</span>';
				orderitems += '		<span class="d_left" style="font-size:.9em">'+ item.applyNo +'</span>';
				orderitems += '		<span class="d_right" style="font-size:.9em">';
				if(item.status == "21" || item.status == "22" || item.status == "23" || item.status == "24"){
					orderitems += '			<a class="" style="color:#A9A9BB;">已接单</a>';
				}else if(item.status == "20"){
					orderitems += '			<a class="" style="color:#A9A9BB;">未接单</a>';
				}else if(item.status == "11"){
					orderitems += '			<a class="" style="color:#A9A9BB;">已配送</a>';
				}else if(item.status == "99"){
					orderitems += '			<a class="" style="color:#A9A9BB;">已退回</a>';
				}else{
					orderitems += '			<a class="" style="color:#A9A9BB;">' + item.statusName + '</a>';
				}
				orderitems += '		</span>';
				orderitems += '	</div>';
				orderitems += '	<div class="backgroundColor2-sec">';
				orderitems += '		<table width="97%" style="margin-left: 1em;">';
				orderitems += '				<tr><td width="60%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;"></td><td width="30%" rowspan="2" class="color-gray" style="font-size: .9em;text-align:right;"></td><td width="10%" rowspan="2" class="floatleft_icons-sec"></td></tr>';
				orderitems += '			<tr>';
				orderitems += '				<td class="color-gray" style="font-size: .8em;padding-bottom: 0.5em;">提交时间:' + /*new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')*/common.formatDate(item.createTime,'yyyy-MM-dd hh:mm:ss') + '</td>';
				orderitems += '			</tr>';
				orderitems += '		</table>';
				orderitems += '	</div>';
				orderitems += '</div>';
			}
		});

		if(orderlist.length == pageSize){
			orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:getMorePrint('+  ++pageNo +')">点击加载更多</span></li></ul>';
		}else{
			orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:void()">没有更多数据。</span></li></ul>';
		}
	}

	$('#orderitems').html(orderitems);
	setTimeout(function(){
		if(myScroll){
			myScroll.refresh();
		}
	},800);
}

function getOrderList(carinfo, status, startDate){

	pageNo = 1;
	var _carinfo = '';
	var _status = '';
	var _startDate = '';
	var _endDate = '';
//	var _userMobile = '';

	if(common.isNotNull(carinfo)){
		_carinfo = carinfo;
	}else{
		_carinfo = $("#searchNameOrNo").val();
	}
	if(common.isNotNull(status)){
		_status = status;
	}else{
		var result = $("#allSta").html();
		if('报价' == result){
			_status = '01';
		} else if('投保' == result){
			_status = '05';
		}
		/*else if('已报价' == result){
			_status = '03';
		}else if('报价退回' == result){
			_status = '04';
		}else if('已投保' == result){
			_status = '05';
		}else if('投保退回' == result){
			_status = '06';
		}else if('核保退回' == result){
			_status = '07';
		}else if('待支付' == result){
			_status = '08';
		}else if('已支付' == result){
			_status = '09';
		}*/
	}
	if(common.isNotNull(startDate)&&!('提交日期'==startDate)){
		_startDate = startDate;
		_endDate = _startDate;
	}else{
		_startDate = $("#_submitDate").html();
		_endDate = _startDate;
	}
	if(common.isNotNull(loginDetail.mobilePhone)){
		_userMobile = loginDetail.mobilePhone;
	}

	cpic.ui.loading.open();
	if("camera" == quoteType){
		if(result == '回收站'){
			Interface.queryRecyleList(userInfo.unitCode,userInfo.userCode,pageSize,pageNo,_userMobile,function(result){
				cpic.ui.loading.close();
				if('1' == result.resultCode){
					$('#unquoteNum div:first-child').html(0);
					$('#quoteNum div:first-child').html(0);
					$('#unissueNum div:first-child').html(0);
					$('#issueNum div:first-child').html(0);
					parseOrderItems(result.responseObject.taskListBeans||0);
				} else {
					cpic.ui.loading.close();
					cpic.alert(result.message);
				}
			},
			function(){
				cpic.ui.loading.close();
				parseOrderItems("");
			})
		}else{
			Interface.queryOrderList(userInfo.userCode, userInfo.unitCode, pageSize, pageNo, _startDate, _endDate, _carinfo, _status,_userMobile,
					function(result){
						cpic.ui.loading.close();
						if('1' == result.resultCode){
							if( $("#allSta").html() == "报价"){
								// 初始化订单类别  报价中状态
								$('#unquoteNum div:first-child').html(result.responseObject.unorderNum||0);
								$('#quoteNum div:first-child').html(result.responseObject.orderNum||0);
								$('#unissueNum div:first-child').html(result.responseObject.quoteNum||0);
								$('#unissueNum div:eq(1)').html('已报价');
								$('#issueNum div:first-child').html(result.responseObject.returnNum||0);
								$('#issueNum div:eq(1)').html('已退回');
								$("#divReturnUnder").hide();
								$("#divReturnUnder").removeClass('width-fin').addClass('width-25-2');
								$("#issueNumId").removeClass('width-25-2').addClass('width-fin');
								$(".width-25-2").css('width','25%');
								$(".width-fin").css('width','25%');
								parseOrderItems(result.responseObject.taskListBeans||0);
							}else if( $("#allSta").html() == "投保"){
								// 初始化订单类别  投保中状态
								$('#unquoteNum div:first-child').html(result.responseObject.unorderInsNum||0);
								$('#quoteNum div:first-child').html(result.responseObject.orderInsNum||0);
								$('#unissueNum div:first-child').html(result.responseObject.unPayNum||0);
								$('#unissueNum div:eq(1)').html('待支付');
								$('#issueNum div:first-child').html(result.responseObject.payNum||0);
								$('#issueNum div:eq(1)').html('已支付');
								$('#divReturnUnder').show();
								$('#returnUnder div:first-child').html(result.responseObject.insRetNum||0);

								$("#divReturnUnder").show();
								$("#divReturnUnder").removeClass('width-25-2').addClass('width-fin');
								$("#issueNumId").removeClass('width-fin').addClass('width-25-2');
								$(".width-25-2").css('width','20%');
								$(".width-fin").css('width','20%');

//								$('#unquoteNumId').removeClass("width-25-2").addClass("newWidth");
//								$('#quoteNumId').removeClass("width-25-2").addClass("newWidth");
//								$('#unissueNumId').removeClass("width-25-2").addClass("newWidth");
//								$('#issueNumId').removeClass("width-fin searchClic").addClass("newWidth");

//								$('#divReturnUnder').removeClass("width-25-2 searchClick").addClass("newWidth");
								parseOrderItems(result.responseObject.taskListBeans||0);
							}

						} else {
							cpic.alert(result.message);
						}
					},
					function(){
						cpic.ui.loading.close();
						parseOrderItems("");
					}
				);
		}
	} else {
		// 如果只有汉字,默认为姓名
		var _carOwner = '';
		if(/^[\u4e00-\u9fa5]+$/.test(_carinfo)){
			_carOwner = _carinfo;
			_carinfo = '';
		}
        var customFlag;//代理点登录标记
		//查询所有状态任务
		Interface.queryPolicy(_carOwner, _carinfo, '-2,-1,0,-4,2,8,1,H,3,h,M,N,g,i,J,7,k', 0, 99, 1,customFlag,appType,
			function(result){
				cpic.ui.loading.close();
					if(result.success){

						// 所有查询出的任务全为未出单,刚哥说的
						$('#unquoteNum div:first-child').html(0);
						$('#quoteNum div:first-child').html(0);
						$('#unissueNum div:first-child').html(result.count||0);
						$('#issueNum div:first-child').html(0);
						if(isQuickClicked){
							parseOrderItems(result.policys||0);
							isQuickClicked = false;
						}else{
							parseOrderItems([]);
						}
					}else{
						parseOrderItems(null);
					}
			},
			function(){
				cpic.ui.loading.close();
			});
	}

}

function getPrintDistributionList(taskStatus){
	pageNo = 1;
	var _startDate = '';
	var _endDate = '';
	if(common.isNotNull($("#_submitDate").val())&&($("#_submitDate").val() != "提交日期")){
		_startDate = $("#_submitDate").val();
		_endDate = _startDate;
	}
	cpic.ui.loading.open();
	Interface.queryPrintDistributionList(userInfo.unitCode,userInfo.userCode,"",pageSize,pageNo,_startDate,_endDate,taskStatus,_userMobile,function(result){
		cpic.ui.loading.close();
		if('1' == result.resultCode){
			// 初始化订单类别  保单服务配送状态
			$('#unquoteNum div:first-child').html(result.responseObject.unorderNum||0);
			$('#quoteNum div:first-child').html(result.responseObject.orderNum||0);
			$('#unissueNum div:first-child').html(result.responseObject.quoteNum||0);
			$('#unissueNum div:eq(1)').html('已配送');
			$('#issueNum div:first-child').html(result.responseObject.returnNum||0);
			$('#issueNum div:eq(1)').html('已退回');
			$("#divReturnUnder").hide();
			$("#divReturnUnder").removeClass('width-fin').addClass('width-25-2');
			$("#issueNumId").removeClass('width-25-2').addClass('width-fin');
			$(".width-25-2").css('width','25%');
			$(".width-fin").css('width','25%');
			parsePrintItems(result.responseObject.taskListBeans||0);
		} else {
			cpic.alert(result.message);
		}
	},
	function(){
		cpic.ui.loading.close();
		parsePrintItems("");
	})
}

//回收站功能
function getRecyleList(){
	pageNo = 1;
	var _startDate = '';
	var _endDate = '';
	if(common.isNotNull($("#_submitDate").val())&&($("#_submitDate").val() != "提交日期")){
		_startDate = $("#_submitDate").val();
		_endDate = _startDate;
	}
	cpic.ui.loading.open();
	Interface.queryRecyleList(userInfo.unitCode,userInfo.userCode,pageSize,pageNo,_userMobile,function(result){
		cpic.ui.loading.close();
		if('1' == result.resultCode){
//			$('#unquoteNum div:first-child').html(0);
//			$('#quoteNum div:first-child').html(0);
//			$('#unissueNum div:first-child').html(0);
//			$('#issueNum div:first-child').html(0);
//			$('#unissueNum div:eq(1)').html('已报价');
//			$('#issueNum div:eq(1)').html('已退回');
//			$("#divReturnUnder").hide();
//			$("#divReturnUnder").removeClass('width-fin').addClass('width-25-2');
//			$("#issueNumId").removeClass('width-25-2').addClass('width-fin');
//			$(".width-25-2").css('width','25%');
//			$(".width-fin").css('width','25%');
			parseOrderItems(result.responseObject.taskListBeans||0);
		} else {
			cpic.ui.loading.close();
			cpic.alert(result.message);
		}
	},
	function(){
		cpic.ui.loading.close();
		parseOrderItems("");
	})
}

function getMore(startDate, pageNo){
	var _carinfo = $("#searchNameOrNo").val();
	var _status = '';
	var result = $("#allSta").html();
	var arr = new Array('unquoteNum','quoteNum','unissueNum','issueNum');
	if(result == "报价"){
		if(($("#unquoteNum").children()).hasClass("font-1-2")){
			_status = '01';
		}else if(($("#quoteNum").children()).hasClass("font-1-2")){
			_status = '02';
		}else if(($("#unissueNum").children()).hasClass("font-1-2")){
			_status = '03';
		}else if(($("#issueNum").children()).hasClass("font-1-2")){
			_status = '04';
		}
	}else if (result == "投保"){
		if(($("#unquoteNum").children()).hasClass("font-1-2")){
			_status = '05';
		}else if(($("#quoteNum").children()).hasClass("font-1-2")){
			_status = '06';
		}else if(($("#unissueNum").children()).hasClass("font-1-2")){
			_status = '07';
		}else if(($("#issueNum").children()).hasClass("font-1-2")){
			_status = '08';
		}else if(($("#returnUnder").children()).hasClass("font-1-2")){
			_status = '09';
		}
	}
/*	if('未接单' == result){
		_status = '01';
	} else if('已接单' == result){
		_status = '02';
	}else if('已报价' == result){
		_status = '03';
	}else if('已退回' == result){
		_status = '04';
	}else if('已投保' == result){
		_status = '05';
	}else if('投保退回' == result){
		_status = '06';
	}else if('核保退回' == result){
		_status = '07';
	}else if('待支付' == result){
		_status = '08';
	}else if('已支付' == result){
		_status = '09';
	}*/
	var _startDate = '';
	var _endDate = '';
	if(common.isNotNull(startDate)&&(startDate != "提交日期")){
		_startDate = startDate;
		_endDate = _startDate;
	}
	//传入手机号码
	var loginDetail = common.getLocalStorage(Interface.ss.loginDetail,true);
	if(common.isNotNull(loginDetail.mobilePhone)){
		_userMobile = loginDetail.mobilePhone;
	}

	pageNo = pageNo;
	cpic.ui.loading.open();
	if(result == '回收站'){
		Interface.queryRecyleList(userInfo.unitCode,userInfo.userCode,pageSize,pageNo,_userMobile,function(result){
			cpic.ui.loading.close();
			if('1' == result.resultCode){
				moreOrderItems(result.responseObject.taskListBeans||0);
			} else {
				cpic.ui.loading.close();
				cpic.alert(result.message);
			}
		},
		function(){
			cpic.ui.loading.close();
			parseOrderItems("");
		})
	}else{
		Interface.queryOrderList(userInfo.userCode, userInfo.unitCode, pageSize, pageNo, _startDate, _endDate, _carinfo, _status,_userMobile,
				function(result){
					cpic.ui.loading.close();
					if('1' == result.resultCode){
						moreOrderItems(result.responseObject.taskListBeans||0);
					} else {
						cpic.alert(result.message);
					}
				},
				function(){
					cpic.ui.loading.close();
					parseOrderItems("");
				}
			);
	}

}

function moreOrderItems(orderlist){
	var orderitems = '';
	$("#getMore").remove();

	if(orderlist.length==0){
		orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:void()">没有更多数据。</span></li></ul>';
	} else {
		$.each(orderlist, function(index, item){
			if("camera" == quoteType){
				/*if(taskStatusValue[item.status]==null){
					return true;
				}*/
				/*if(item.licenseOwner==null||item.licenseOwner==''){
					item.licenseOwner = '默认名称';
				}*/
				if(item.sumPremium==null||item.sumPremium==''){
					item.sumPremium = '-';
				}
				if(item.pvehicleLicense==null||item.pvehicleLicense==''){
					item.pvehicleLicense = item.vehicleLicense;
				}
				if(item.createTime==null||item.createTime==''){
					item.createTime = common.formatDate(new Date(),'yyyy-MM-dd hh:mm:ss');
				}

				/*if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && "01" == item.status){
					_status = '01' ;//未接单
				}else if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && ( "04" == item.status || "05" == item.status || "14" == item.status)){
					_status = '02' ;//已接单
				}else if((common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && ( "08" == item.status || "11" == item.status || "13" == item.status)) || (common.isNotNull(item.busiType) && "6" == item.busiType && common.isNotNull(item.status) && ( "01" == item.status || "04" == item.status || "05" == item.status))){
					_status = '03' ;//已报价
				}else if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && (  "99" == item.status)){
					_status = '04' ;//报价退回
				}else if((common.isNotNull(item.busiType) && "6" == item.busiType && common.isNotNull(item.status) && $.inArray(item.status,['01','04','05','99']) == '-1') || "3" == item.busiType){
					_status = '05' ;//已投保
				}else if(common.isNotNull(item.busiType) && "6" == item.busiType && common.isNotNull(item.status) && (  "99" == item.status) && common.isNotNull(item.retFlag) && (  "1" == item.retFlag)){
					_status = '06' ;//投保退回
				}else if(common.isNotNull(item.busiType) && "6" == item.busiType && common.isNotNull(item.status) && (  "99" == item.status) && common.isNotNull(item.retFlag) && (  "2" == item.retFlag)){
					_status = '07' ;//核保退回
				}else if(common.isNotNull(item.busiType) && "6" == item.busiType && ((common.isNotNull(item.jqStatus) && (  "H" == item.jqStatus)) || (common.isNotNull(item.syStatus) && (  "H" == item.syStatus))) ){
					_status = '08' ;//待支付
				}else if(common.isNotNull(item.busiType) && "6" == item.busiType && ((common.isNotNull(item.jqStatus) && (  "3" == item.jqStatus)) || (common.isNotNull(item.syStatus) && (  "3" == item.syStatus))) ){
					_status = '09' ;//已支付
				}else{
					_status = '10' ;//其他
				}*/
				if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && "01" == item.status){
					_status = "01"  ;//报价未接单
				}else if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && ( "04" == item.status || "05" == item.status || "14" == item.status)){
					_status = "02" ;//报价已接单
				}else if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && ( "08" == item.status || "11" == item.status || "13" == item.status)){
					_status = "03" ;//已报价
				}else if(common.isNotNull(item.busiType) && "5" == item.busiType && common.isNotNull(item.status) && (  "99" == item.status)){
					_status = "04" ;//报价退回
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && "01" == item.status){
					_status = "05"  ;//投保未接单
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && ( "04" == item.status || "05" == item.status || "14" == item.status || ( "08" == item.status && ($.inArray(item.jqStatus,['3','H']) == '-1' || $.inArray(item.syStatus,['3','H']) == '-1')))){
					_status = "06" ;//投保已接单
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && "08" == item.status && ("H" == item.jqStatus || "H" == item.syStatus) ){
					_status = "07" ;//待支付
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) &&((item.jqStatus == '3' && ( common.isNull(item.syStatus) || item.syStatus == 'have')) || (item.syStatus == '3' && ( common.isNull(item.jqStatus) || item.jqStatus == 'have')) ||  ("3" == item.jqStatus || "3" == item.syStatus)) ){
					_status = "08" ;//已支付
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && (  "99" == item.status) &&  (  "1" == item.retFlag)){
					_status = "09" ;//投保退回
				}else if(common.isNotNull(item.busiType) && ("6" == item.busiType || "3" == item.busiType) && common.isNotNull(item.status) && (  "99" == item.status) &&  (  "2" == item.retFlag)){
					_status = "10" ;//核保退回
				}else{
					_status = "11" ;//其他
				}

				// 未接单,已接单(取vehicle) 已报价,已退回(取pvehicle)
				//if('01' == item.status||'04' == item.status||'05' == item.status || '99' == item.status){
				if('01' == _status||'02' == _status){
					orderitems += '	<div style="border-bottom:0.1em solid #f6f6f6;position:relative;" onclick="toPurchaseDetail(' + '\'' + item.applyNo + '\',\'' + item.vehicleLicense + '\',\'' + _status + '\',\'' + item.shortData +'\',\'' + item.zremarks.replace(/[\r\n]/g,"") + '\')">';
				} else {
					orderitems += '	<div style="border-bottom:0.1em solid #f6f6f6;position:relative;" onclick="toPurchaseDetail(' + '\'' + item.applyNo + '\',\'' + item.pvehicleLicense + '\',\'' + _status + '\',\'' + item.shortData +'\',\'' + item.zremarks.replace(/[\r\n]/g,"") + '\')">';
				}

				orderitems += '	<div class="backgroundColor" style="padding: 0 1em;">';
				orderitems += '		<span class="d_left red">拍照</span>';
				orderitems += '		<span class="d_left" style="font-size:.9em">'+ item.applyNo +'</span>';
				var allStatusName = $("#allSta").html();
//				if(allStatusName == '回收站'){
//					orderitems += '<span class="deleteOrder" onclick="javascript:recyleOreder(\''+item.applyNo+'\',\''+_status+'\',\''+event+'\')">恢复</span>';
//				}else{
					if((_status == "03" || _status == "04" || _status == "07" || _status == "09"  || _status == "10") &&  allStatusName != '回收站'){
						orderitems += '<span class="deleteOrder" onclick="javascript:delOreder(\''+item.applyNo+'\',\''+_status+'\',\''+event+'\')">删</span>';
					}
//				}

				if(item.isShort == "1" && _status == "08"){
					orderitems += '<span style="font-size: 0.9em;color: #ffffff;padding: .1em 0.3em .15em;border-radius: 3px;background: #e83344;position: relative;left: 4%;">欠</span>';
				}
				orderitems += '		<span class="d_right" style="font-size:.9em">';
				orderitems += '			<a class="" style="color:#A9A9BB;">' + taskStatusValueNew[_status] + '</a>';
				orderitems += '		</span>';
				orderitems += '	</div>';
				orderitems += '	<div class="backgroundColor2-sec">';
				orderitems += '		<table width="97%" style="margin-left: 1em;">';
				orderitems += '			<tr>';

				// 未接单,已接单(取vehicle) 已报价,已退回(取pvehicle)
//				if('01' == item.status||'04' == item.status||'05' == item.status || '99' == item.status){
				if('01' == _status||'02' == _status){
					orderitems += '				<td width="50%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;">'+item.vehicleLicense+'</td>';

				} else {
					orderitems += '				<td width="50%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;">'+item.pvehicleLicense+'</td>';
				}

				orderitems += '				<td width="15%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;">'+item.licenseOwner+'</td>';

				if('-' == item.sumPremium){
					orderitems += '				<td width="28%" rowspan="2" class="color-gray" style="font-size: .9em;text-align:right;"> - 元</td>';
				} else {
					orderitems += '				<td width="28%" rowspan="2" class="color-gray" style="font-size: .9em;text-align:right;">' + (utils.fMoney(Number(item.sumPremium)+Number(item.totalAmount))) + '元</td>';
				}
				orderitems += '				<td width="7%" rowspan="2" class="floatleft_icons-sec"></td>';
				orderitems += '			</tr>';
				orderitems += '			<tr>';
				orderitems += '				<td class="color-gray" style="font-size: .8em;padding-bottom: 0.5em;">提交时间:' + /*new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')*/common.formatDate(item.createTime,'yyyy-MM-dd hh:mm:ss') + '</td>';
				orderitems += '			</tr>';
				orderitems += '		</table>';
				orderitems += '	</div>';
				orderitems += '</div>';
			} else {
				orderitems += '<div style="border-bottom:0.1em solid #f6f6f6">';
				orderitems += '	<div class="backgroundColor" style="padding: 0 1em;">';
				orderitems += '		<span class="d_left red">快速</span>';
				orderitems += '		<span class="d_left" style="font-size:.9em">'+ item.policyId +'</span>';
				orderitems += '	</div>';
				orderitems += '	<div class="backgroundColor2-sec" onclick="toPurchaseDetail(' + '\'' + item.policyId + '\')">';
				orderitems += '		<table width="97%" style="margin-left: 1em;">';
				orderitems += '			<tr>';
				orderitems += '				<td width="60%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;">'+item.registrationNumber+'</td>';
				orderitems += '				<td width="10%" rowspan="2" class="floatleft_icons-sec"></td>';
				orderitems += '			</tr>';
				orderitems += '			<tr>';
				orderitems += '				<td class="color-gray" style="font-size: .8em;padding-bottom: 0.5em;">起保日期:' + /*new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')*/common.formatDate(item.businessPolicyBeginTime,'yyyy-MM-dd hh:mm:ss') + '</td>';
				orderitems += '			</tr>';
				orderitems += '		</table>';
				orderitems += '	</div>';
				orderitems += '</div>';
			}
		});
		if(orderlist.length == pageSize){
			orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:getMore(\''+ $("#_submitDate").html() + '\',' + ++pageNo +')">点击加载更多</span></li></ul>';
		}else{
			orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:void()">没有更多数据。</span></li></ul>';
		}
	}

	$('#orderitems').append(orderitems);
	setTimeout(function(){
		if(myScroll){
			myScroll.refresh();
		}
	},800);
}

function getMorePrint(pageNo){
	var _status = '';
	if(($("#unquoteNum").children()).hasClass("font-1-2")){
		_status = '01';
	}else if(($("#quoteNum").children()).hasClass("font-1-2")){
		_status = '02';
	}else if(($("#unissueNum").children()).hasClass("font-1-2")){
		_status = '03';
	}else if(($("#issueNum").children()).hasClass("font-1-2")){
		_status = '04';
	}
	var _startDate =  _endDate = $("#_submitDate").html();
	cpic.ui.loading.open();
	Interface.queryPrintDistributionList(userInfo.unitCode,userInfo.userCode,"",pageSize,pageNo,_startDate,_endDate,_status,_userMobile,function(result){
		cpic.ui.loading.close();
		if('1' == result.resultCode){
			morePrintItems(result.responseObject.taskListBeans||0);
		} else {
			cpic.alert(result.message);
		}
	},
	function(){
		cpic.ui.loading.close();
		parsePrintItems("");
	})
}

function morePrintItems(orderlist){
	var orderitems = '';
	$("#getMore").remove();

	if(orderlist.length==0){
		orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:void()">没有更多数据。</span></li></ul>';
	} else {
		$.each(orderlist, function(index, item){
			if("camera" == quoteType){

				orderitems += '<div style="border-bottom:0.1em solid #f6f6f6" onclick="toPrintDetail(' + '\'' + item.applyNo + '\',\'' + item.status + '\',\'' + item.emsWay + '\')">';
				orderitems += '	<div class="backgroundColor" style="padding: 0 1em;">';
				orderitems += '		<span class="d_left red">拍照</span>';
				orderitems += '		<span class="d_left" style="font-size:.9em">'+ item.applyNo +'</span>';
				orderitems += '		<span class="d_right" style="font-size:.9em">';
				if(item.status == "21" || item.status == "22" || item.status == "23" || item.status == "24"){
					orderitems += '			<a class="" style="color:#A9A9BB;">已接单</a>';
				}else if(item.status == "20"){
					orderitems += '			<a class="" style="color:#A9A9BB;">未接单</a>';
				}else if(item.status == "11"){
					orderitems += '			<a class="" style="color:#A9A9BB;">已配送</a>';
				}else if(item.status == "99"){
					orderitems += '			<a class="" style="color:#A9A9BB;">已退回</a>';
				}else{
					orderitems += '			<a class="" style="color:#A9A9BB;">' + item.statusName + '</a>';
				}
				orderitems += '		</span>';
				orderitems += '	</div>';
				orderitems += '	<div class="backgroundColor2-sec">';
				orderitems += '		<table width="97%" style="margin-left: 1em;">';
				orderitems += '			<tr><td width="60%" style="font-size: .9em;padding-top: 0.5em;padding-bottom: 0.5em;"></td><td width="30%" rowspan="2" class="color-gray" style="font-size: .9em;text-align:right;"></td><td width="10%" rowspan="2" class="floatleft_icons-sec"></td></tr>';
				orderitems += '			<tr>';
				orderitems += '				<td class="color-gray" style="font-size: .8em;padding-bottom: 0.5em;">提交时间:' + /*new Date(item.createTime).format('yyyy-MM-dd hh:mm:ss')*/common.formatDate(item.createTime,'yyyy-MM-dd hh:mm:ss') + '</td>';
				orderitems += '			</tr>';
				orderitems += '		</table>';
				orderitems += '	</div>';
				orderitems += '</div>';
			}
		});

		if(orderlist.length == pageSize){
			orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:getMorePrint('+ ++pageNo +')">点击加载更多</span></li></ul>';
		}else{
			orderitems += '<ul class="item-ul-box"><li class="clickmore" id="getMore"><span onclick="javascript:void()">没有更多数据。</span></li></ul>';
		}
	}

	$('#orderitems').append(orderitems);
	setTimeout(function(){
		if(myScroll){
			myScroll.refresh();
		}
	},800);
}

function toPurchaseDetail(applyNo, plateNo, status,shortData,zremarks){
	var _shortData = "";
	if(common.isNotNull(shortData) && shortData != "null" && shortData != "undefined"){
		_shortData = shortData;
	}
	//console.info(applyNo);
	if('camera' == quoteType){
		common.setLocalStorage("photoInsurance",true,false);
		var allStatusName = $("#allSta").html();
		if(allStatusName == '回收站'){
			var num = parseInt(status);
			var taskCode;
			if (num <= 4) {
				taskCode = 'CAR_PRICE';
			} else {
				taskCode = 'CAR_WHOLE';
			}
			cpic.alert({message: "<div style=\"text-align: center;\">请确认做恢复操作？</div>", params: {
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
		          	  Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, applyNo, 'H', '{}','', '','','','','','',taskCode,'','',
		          	            function(result){
		          	                if('1' == result.resultCode){
		          	                	cpic.ui.loading.close();
		          	                    if(result.responseObject.state == '1') {
		          	                    	cpic.alert({message: "<div style=\"text-align: center;\">恢复成功</div>", params: {
		          	                            autoOpen: false,
		          	                            closeBtn: false,
		          	                            title: null,
		          	                            buttons: {
		          	                                '确定': function () {
		          	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
		          	                                }
		          	                            }
		          	                  	}});

		          	                    }else if(result.responseObject.state == '2') {
		          	                        cpic.ui.loading.close();
		          	                        cpic.alert({message: "<div style=\"text-align: center;\">"+result.responseObject.msg+"</div>", params: {
		        	                            autoOpen: false,
		        	                            closeBtn: false,
		        	                            title: null,
		        	                            buttons: {
		        	                                '确定': function () {
		        	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
		        	                                }
		        	                            }
		        	                  	}});
		          	                    }
		          	                }else{
		          	                    cpic.ui.loading.close();
		          	                  cpic.alert({message: "<div style=\"text-align: center;\">"+result.message+"</div>", params: {
		  	                            autoOpen: false,
		  	                            closeBtn: false,
		  	                            title: null,
		  	                            buttons: {
		  	                                '确定': function () {
		  	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
		  	                                }
		  	                            }
		  	                  	}});
		          	                }
		          	        },function(result){
		          	            cpic.ui.loading.close();
		          	            cpic.alert(result.message);
		          	        });
		            }
		        }
			}})
		}else{
			if('01' == status || '05' == status ){ //未接单
				cpic.alert('该笔任务还未接单,请稍后');
				return;
			} else if('02' == status /*|| '06' == status*//*'02' == status || '05' == status*/){//投保已接单
				if(common.isNotNull(zremarks)){
					localStorage.setItem('flag' , true);
					cpic.alert({message: "<div style=\"text-align: center;\">"+zremarks+"</div>", params: {
		  		          autoOpen: false,
		  		          closeBtn: false,
		  		          title: null,
		  		          buttons: {
		  		        	'确定': function () {
		  		            	  this.close();
		  		            	  this.destroy();
		  		            	  location.href = 'reception.html?applyNo=' + applyNo + '&plateNo=' + plateNo + '&shortData=' + shortData;
		  		              },
		  		              '取消': function () {
		  		                  this.close();
		  		                  this.destroy();
		  		              }

		  		          }
		  		      }});
				}else{
					// 已接单的任务跳转至时钟页面
					localStorage.setItem('flag' , true);
					location.href = 'reception.html?applyNo=' + applyNo + '&plateNo=' + plateNo + '&shortData=' + shortData;
				}
			}else if( '06' == status){//报价已接单
				// 已接单的任务跳转至时钟页面
				cpic.ui.loading.open();
				var taskCode = 'CAR_WHOLE';
			    Interface.queryOrderDetail(userInfo.userCode, userInfo.unitCode, applyNo,taskCode,
			        function(result){
			    	cpic.ui.loading.close();
			            if('1'==result.resultCode){
			            	if(!$.isEmptyObject(result.responseObject) && common.isNotNull(result.responseObject.status) && result.responseObject.status == '08' && (result.responseObject.jqStatus == 'H' || result.responseObject.syStatus ==  'H')){
			            		location.href = 'prosalDetail.html?applyNo=' + applyNo + '&shortData=' + shortData + '&status=' + status  + '&plateNo=' + plateNo;
			            	}else{
			            		if(common.isNotNull(zremarks)){
			        				localStorage.setItem('flag' , true);
			        				cpic.alert({message: "<div style=\"text-align: center;\">"+zremarks+"</div>", params: {
			        	  		          autoOpen: false,
			        	  		          closeBtn: false,
			        	  		          title: null,
			        	  		          buttons: {
			        	  		        	'确定': function () {
			        	  		            	  this.close();
			        	  		            	  this.destroy();
			        	  		            	  location.href = 'reception.html?applyNo=' + applyNo + '&plateNo=' + plateNo + '&shortData=' + shortData;
			        	  		              },
			        	  		              '取消': function () {
			        	  		                  this.close();
			        	  		                  this.destroy();
			        	  		              }

			        	  		          }
			        	  		      }});
			        			}else{
			        				// 已接单的任务跳转至时钟页面
			        				localStorage.setItem('flag' , true);
			        				location.href = 'reception.html?applyNo=' + applyNo + '&plateNo=' + plateNo + '&shortData=' + shortData;
			        			}
//			            		localStorage.setItem('flag' , true);
//			        			location.href = 'reception.html?applyNo=' + applyNo + '&plateNo=' + plateNo + '&shortData=' + shortData;
			            	}
			            } else {
			                cpic.alert(result.message);
			            }
			        },
			        function(){
			            cpic.ui.loading.close();
			        }
			    );
			}  else if('03' == status/*'08' == status || '11' == status || '13' == status*/){//已报价
				// 已报价的跳转到报价详情页面
				location.href = 'purchaseDetail.html?applyNo=' + applyNo + '&plateNo=' + plateNo + '&shortData=' + shortData + '&status=' + status;
			} else if('04' == status /* || '10' == status*/ /*|| '06' == status || '07' == status*//*'99' == status*/){//报价退回
				// 退回的任务,调用任务详情接口获得退回原因
				cpic.ui.loading.open();
				var taskCode ;
				if('04' == status){
					taskCode = 'CAR_PRICE';
				}else if('10' == status){
					taskCode = 'CAR_WHOLE';
				}
			    Interface.queryOrderDetail(userInfo.userCode, userInfo.unitCode, applyNo,taskCode,
			        function(result){
			            cpic.ui.loading.close();
			            if('1'==result.resultCode){
//			                cpic.alert(result.responseObject.remarks[0]);
			            	var alertSta ="";
			            	if(common.isNotNull(result.responseObject) && common.isNotNull(result.responseObject.remarks) && result.responseObject.remarks.length > 0) {
			            		alertSta = result.responseObject.remarks[0];
			            	}
			            	cpic.alert({message: "<div style=\"text-align: center;\">"+alertSta+"是否重新提交报价?"+"</div>", params: {
			  		          autoOpen: false,
			  		          closeBtn: false,
			  		          title: null,
			  		          buttons: {
			  		        	'是': function () {
			  		            	  this.close();
			  		            	  this.destroy();
//			  		            	  location.href = 'purchaseDetail.html?applyNo=' + applyNo + '&plateNo=' + plateNo+ '&status=' + status + '&shortData=' + shortData;
			  		            	  var crmObj = {};
				  		              if('04' == status){
				  		            	   crmObj.returnType = 7;
				  		  			   }else if('10' == status){
				  		  				   crmObj.returnType = 8;
				  		  			  }
			  		            	  crmObj.orderStatus = status;
			  		            	  crmObj.cameraInsureStatus = "returned";
			  		            	  if(plateNo == "新车未上牌") {
			  		            		  localStorage.setItem('noplatNumClick',1);
					              		}
			  		            	  localStorage.setItem('plateNo',plateNo);
			  		            	  localStorage.setItem('requestNo',applyNo);
			  		            	  parseCoverages(result.responseObject,crmObj);
			  		            	  util.setLocalStorage("photoInsurance",true,false);
			  		            	  util.setLocalStorage(Interface.ss.crmObj, crmObj,true);
			  		            	  var linkMan = result.responseObject.linkMan||'';
			  		            	  var telPhone = result.responseObject.linkTelPhone||'';
			  		            	  window.location.href="../selfQuote/carInsurance.html?returnSource=selfInsurance&plateNo="+plateNo+"&status="+_status+"&applyNo=" + applyNo+ "&linkMan="+linkMan+ "&telPhone="+telPhone;
			  		              },
			  		              '否': function () {
			  		                  this.close();
			  		                  this.destroy();
			  		              }

			  		          }
			  		      }})
			            } else {
			                cpic.alert(result.message);
			            }
			        },
			        function(){
			            cpic.ui.loading.close();
			        }
			    );
			}else if('10' == status){//核保退回
				$("#100000Id").show();
				$("#100001Id").show();
				localStorage.setItem("_applyNo_",applyNo,true);
				localStorage.setItem("_plateNo_",plateNo,true);
				localStorage.setItem("_status_",status,true);
				localStorage.setItem("_shortData_",shortData,true);
				localStorage.setItem("_zremarks_",zremarks,true);

			}else if( '09' == status /*'99' == status*/){//投保退回
				// 退回的任务,调用任务详情接口获得退回原因
				cpic.ui.loading.open();
				var taskCode = 'CAR_WHOLE';
			    Interface.queryOrderDetail(userInfo.userCode, userInfo.unitCode, applyNo,taskCode,
			        function(result){
			            cpic.ui.loading.close();
			            if('1'==result.resultCode){
			            	location.href = 'purchaseDetail.html?applyNo=' + applyNo + '&plateNo=' + plateNo+ '&status=' + status;
//			                cpic.alert(result.responseObject.remarks[0]);
			            } else {
			                cpic.alert(result.message);
			            }
			        },
			        function(){
			            cpic.ui.loading.close();
			        }
			    );
			}else if('14' == status) {
				cpic.alert("该单处于转调度中，请稍后！");
			}else if('08' == status){//已支付
				location.href = 'paySuccess.html?applyNo=' + applyNo + '&shortData=' + shortData + '&plateNo=' + plateNo + '&status=' + status;
			}else if('07' == status){//待支付
				location.href = 'prosalDetail.html?applyNo=' + applyNo + '&shortData=' + shortData + '&status=' + status  + '&plateNo=' + plateNo;
			}else{
				cpic.alert("该状态位无效，请联系IT！");//容错处理
			}
		}
	} else {
		// 跳转至快速报价险种详情页面 此处applyNo是保单ID
		// 需要大保单对象,需要去查车E保getPolicy接口
		Interface.getPolicy(applyNo, function(result){
			if (result.success == true) {
 				common.setLocalStorage(Interface.ss.policy, result.policy, true);
 				// 如果已报过价crmObj.policyChangeFlag = false; 未报过价crmObj.policyChangeFlag = true
 				if(common.isNotNull(result.policy.baseInfo.bzPremium) || common.isNotNull(result.policy.baseInfo.tcPremium)){
 					if(common.isNotNull(localStorage.crmObj)){
 						JSON.parse(localStorage.crmObj).policyChangeFlag = false;
 					} else {
 						JSON.parse(localStorage.crmObj).policyChangeFlag = true;
 					}
 				}
 				console.info(result);
				location.href = '../selfQuote/selfQuotationScheme.html?returnType=purchaseRecords';
 			}

		},
		function(error){

		});
	}
}

//拍照验车
function validCarFun(){
	// 退回的任务,调用任务详情接口获得退回原因
	var applyNo = localStorage.getItem("_applyNo_");
	var status = localStorage.getItem("_status_");
	var taskCode = "CAR_CHECK" ;
	var taskType="1";
	window.location.href="../cameraQuote/validCar.html?taskCode="+taskCode+"&status="+status+"&applyNo=" + applyNo+ "&taskType="+taskType;
}

//拍照投保
function camProFun(){
	// 退回的任务,调用任务详情接口获得退回原因
	cpic.ui.loading.open();
	var applyNo = localStorage.getItem("_applyNo_");
	var plateNo = localStorage.getItem("_plateNo_");
	var status = localStorage.getItem("_status_");
	var shortData = localStorage.getItem("_shortData_");
	var zremarks = localStorage.getItem("_zremarks_");
	var taskCode ;
	if('04' == status){
		taskCode = 'CAR_PRICE';
	}else if('10' == status){
		taskCode = 'CAR_WHOLE';
	}
    Interface.queryOrderDetail(userInfo.userCode, userInfo.unitCode, applyNo,taskCode,
        function(result){
            cpic.ui.loading.close();
            if('1'==result.resultCode){
//                cpic.alert(result.responseObject.remarks[0]);
            	var alertSta ="";
            	$("#100000Id").hide();
            	$("#100001Id").hide();
            	if(common.isNotNull(result.responseObject) && common.isNotNull(result.responseObject.remarks) && result.responseObject.remarks.length > 0) {
            		alertSta = result.responseObject.remarks[0];
            	}
            	cpic.alert({message: "<div style=\"text-align: center;\">"+alertSta+"是否重新提交报价?"+"</div>", params: {
  		          autoOpen: false,
  		          closeBtn: false,
  		          title: null,
  		          buttons: {
  		        	'是': function () {
  		            	  this.close();
  		            	  this.destroy();
//  		            	  location.href = 'purchaseDetail.html?applyNo=' + applyNo + '&plateNo=' + plateNo+ '&status=' + status + '&shortData=' + shortData;
  		            	  var crmObj = {};
	  		              if('04' == status){
	  		            	   crmObj.returnType = 7;
	  		  			   }else if('10' == status){
	  		  				   crmObj.returnType = 8;
	  		  			  }
  		            	  crmObj.orderStatus = status;
  		            	  crmObj.cameraInsureStatus = "returned";
  		            	  if(plateNo == "新车未上牌") {
  		            		  localStorage.setItem('noplatNumClick',1);
		              		}
  		            	  localStorage.setItem('plateNo',plateNo);
  		            	  localStorage.setItem('requestNo',applyNo);
  		            	  parseCoverages(result.responseObject,crmObj);
  		            	  util.setLocalStorage("photoInsurance",true,false);
  		            	  util.setLocalStorage(Interface.ss.crmObj, crmObj,true);
  		            	  var linkMan = result.responseObject.linkMan||'';
  		            	  var telPhone = result.responseObject.linkTelPhone||'';
  		            	  window.location.href="../selfQuote/carInsurance.html?returnSource=selfInsurance&plateNo="+plateNo+"&status="+_status+"&applyNo=" + applyNo+ "&linkMan="+linkMan+ "&telPhone="+telPhone;
  		              },
  		              '否': function () {
  		                  this.close();
  		                  this.destroy();
  		              }

  		          }
  		      }})
            } else {
                cpic.alert(result.message);
            }
        },
        function(){
            cpic.ui.loading.close();
        }
    );
}

//取消按钮
function cancelFun(){
	$("#100000Id").hide();
	$("#100001Id").hide();
}

function delOreder(applyNo,status,event){
	var num = parseInt(status);
	var taskCode;
	if (num <= 4) {
		taskCode = 'CAR_PRICE';
	} else {
		taskCode = 'CAR_WHOLE';
	}
	var e = window.event || event;

	if (e.stopPropagation) { // 如果提供了事件对象，则这是一个非IE浏览器
		e.stopPropagation();
	} else {
		window.event.cancelBubble = true;
	}
	cpic.alert({message: "<div style=\"text-align: center;\">请确认做删单操作？</div>", params: {
        autoOpen: false,
        closeBtn: false,
        title: null,
        buttons: {
            '取消': function () {
                this.close();
                this.destroy();
            },
            '确定': function () {
          	  Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, applyNo, 'D', '{}','', '','','','','','',taskCode,'','',
          	            function(result){
          	                cpic.ui.loading.open();
          	                if('1' == result.resultCode){
          	                	cpic.ui.loading.close();
          	                    if(result.responseObject.state == '1') {
          	                    	cpic.alert({message: "<div style=\"text-align: center;\">删除成功</div>", params: {
          	                            autoOpen: false,
          	                            closeBtn: false,
          	                            title: null,
          	                            buttons: {
          	                                '确定': function () {
          	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
          	                                }
          	                            }
          	                  	}});

          	                    }else if(result.responseObject.state == '2') {
          	                        cpic.ui.loading.close();
          	                        cpic.alert({message: "<div style=\"text-align: center;\">"+result.responseObject.msg+"</div>", params: {
        	                            autoOpen: false,
        	                            closeBtn: false,
        	                            title: null,
        	                            buttons: {
        	                                '确定': function () {
        	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
        	                                }
        	                            }
        	                  	}});
          	                    }
          	                }else{
          	                    cpic.ui.loading.close();
          	                  cpic.alert({message: "<div style=\"text-align: center;\">"+result.message+"</div>", params: {
  	                            autoOpen: false,
  	                            closeBtn: false,
  	                            title: null,
  	                            buttons: {
  	                                '确定': function () {
  	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
  	                                }
  	                            }
  	                  	}});
          	                }
          	        },function(result){
          	            cpic.ui.loading.close();
          	            cpic.alert(result.message);
          	        });
            }
        }
	}});
}

//恢复
function recyleOreder(applyNo,status,event){
	var num = parseInt(status);
	var taskCode;
	if (num <= 4) {
		taskCode = 'CAR_PRICE';
	} else {
		taskCode = 'CAR_WHOLE';
	}
	var e = window.event || event;

	if (e.stopPropagation) { // 如果提供了事件对象，则这是一个非IE浏览器
		e.stopPropagation();
	} else {
		window.event.cancelBubble = true;
	}
	cpic.alert({message: "<div style=\"text-align: center;\">请确认做恢复操作？</div>", params: {
        autoOpen: false,
        closeBtn: false,
        title: null,
        buttons: {
            '取消': function () {
                this.close();
                this.destroy();
            },
            '确定': function () {
          	  Interface.getAmassBussMessageInfo(userInfo.userCode, userInfo.unitCode, applyNo, 'H', '{}','', '','','','','','',taskCode,'','',
          	            function(result){
          	                cpic.ui.loading.open();
          	                if('1' == result.resultCode){
          	                	cpic.ui.loading.close();
          	                    if(result.responseObject.state == '1') {
          	                    	cpic.alert({message: "<div style=\"text-align: center;\">恢复成功</div>", params: {
          	                            autoOpen: false,
          	                            closeBtn: false,
          	                            title: null,
          	                            buttons: {
          	                                '确定': function () {
          	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
          	                                }
          	                            }
          	                  	}});

          	                    }else if(result.responseObject.state == '2') {
          	                        cpic.ui.loading.close();
          	                        cpic.alert({message: "<div style=\"text-align: center;\">"+result.responseObject.msg+"</div>", params: {
        	                            autoOpen: false,
        	                            closeBtn: false,
        	                            title: null,
        	                            buttons: {
        	                                '确定': function () {
        	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
        	                                }
        	                            }
        	                  	}});
          	                    }
          	                }else{
          	                    cpic.ui.loading.close();
          	                  cpic.alert({message: "<div style=\"text-align: center;\">"+result.message+"</div>", params: {
  	                            autoOpen: false,
  	                            closeBtn: false,
  	                            title: null,
  	                            buttons: {
  	                                '确定': function () {
  	                                	window.location.href = '../cameraQuote/purchaseRecords.html';
  	                                }
  	                            }
  	                  	}});
          	                }
          	        },function(result){
          	            cpic.ui.loading.close();
          	            cpic.alert(result.message);
          	        });
            }
        }
	}});
}

function parseCoverages(coveragesList,crmObj){

	crmObj.choosenCoverage = [];
	crmObj.leftCoverage = [];
    // 绑定险种
	if(!common.isEmptyJsonObject(coveragesList.policyInfoBeans) && common.isNotNull(coveragesList.policyInfoBeans[0].productCode)){
		$.each(bzCoverage,function(key,value){
			var isChoosenCoverageFlag = false;
			$.each(coveragesList.policyInfoBeans, function(index, item){
				if(item.productCode.toUpperCase() == key.toUpperCase()){
					isChoosenCoverageFlag = true;
			        var productCode = item.productCode.toUpperCase();
			        if(bzCoverage[productCode] && bzCoverage[productCode].name != "交强险") {
			        	var coverage = bzCoverage[productCode];
			        	crmObj.choosenCoverage.push(coverage);
			        } else if(bzCoverage[productCode].name == "交强险") {
			        	crmObj.hasTcCoverage = "1";
			        }
				}
			});
			if(!isChoosenCoverageFlag && bzCoverage[key].name != "交强险"){
				crmObj.leftCoverage.push(bzCoverage[key]);
			}
		})
	}else{
		$.each(coveragesList.policyInfoBeans, function(index, item){
	        var productCode = item.productCode;
	        if(bzCoverage[productCode]) {
	        	var coverage = bzCoverage[productCode];
	        	crmObj.choosenCoverage.push(coverage);
	        }
		});
	}
    setTimeout(function(){
        if(myScroll){
            myScroll.refresh();
        }
    },800);
}

function toPrintDetail(applyNo, status, emsWay){
	if('20' == status){
		cpic.alert('该笔任务还未接单,请稍后');
		return;
	} else if('21' == status || '22' == status || '23' == status || '24' == status || '11' == status || '99' == status){
		if(emsWay == "1"){
			// 待自取
			location.href = 'needSince.html?applyNo=' + applyNo + '&status=' + status;
		}else if(emsWay == "2"){
			// 待配送
			location.href = 'onSending.html?applyNo=' + applyNo + '&status=' + status;
		}
	}/*else if('11' == status){
		//配送完成
		location.href = 'comments.html?applyNo=' + applyNo;
	} else if('99' == status){
		// 退回
		if(emsWay == "1"){
			// 待自取
			location.href = 'needSince.html?applyNo=' + applyNo + '&status=' + status;
		}else if(emsWay == "2"){
			// 待配送
			location.href = 'onSending.html?applyNo=' + applyNo + '&status=' + status;
		}
	} */else if('14' == status) {
		cpic.alert("该单处于转调度中，请稍后！");
	}
}

// 订单状态枚举值
var taskStatusObj = {
	unquoteNum:'01',
	quoteNum:'02',
	unissueNum:'03',
	issueNum:'04'
};

var taskStatusValue = {
	'01':'未接单',
	'04':'已接单',
	'05':'已接单',
	'08':'已报价',
	'11':'已报价',
	'99':'已退回',
	'13':'已报价',
	'14':'已接单',
	'18':'已支付'
}

var taskStatusValueNew = {
		'01':'未接单',
		'02':'已接单',
		'03':'已报价',
		'04':'报价退回',
		'05':'未接单',
		'06':'已接单',
		'07':'待支付',
		'08':'已支付',
		'09':'投保退回',
		'10':"核保退回",
		'11':"其他"
	}

function onlyChangeToClicked(id){

	/*for(var i = 0; i< $('#'+id).children().size(); i++){
		$($('.orderdate-2').children()[i]).children().attr('class', 'font-1-1');
	}*/
	$($('#'+id).children()).attr('class','font-1-2');
}

function clearClicked(){
	/*for(var i = 0; i< $('.orderdate-2').children().size(); i++){
		$($('.orderdate-2').children()[i]).children().attr('class', 'font-1-1');
	}*/
	$('.searchClick div div').attr('class','font-1-1');
}

var utils = {
    GetQueryString:function(name)
    {
         var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
         var r = window.location.search.substr(1).match(reg);
         if(r!=null) return  unescape(r[2]); return null;
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

// 由于接口还没有搞定,制造测试数据
var list = {
	'state':'',
	'msg' :'',
	'totalNo' :'15',
	'TaskListBeans': [{
		'applyNo':'12323423534',
		'createTime':'2016-01-28 00:00',
		'updateTime':'2016-01-28 00:00',
		'status':'01',
		'statusName':'',
		'plateNo':'LSSDFAF',
		'owner':'徐达翡',
		'quotations':'2342.24'
	},{
		'applyNo':'12323423534',
		'createTime':'2016-01-28 00:00',
		'updateTime':'2016-01-28 00:00',
		'status':'02',
		'statusName':'',
		'plateNo':'LSSDFAF2',
		'owner':'徐达翡2',
		'quotations':'2342.24'
	},{
		'applyNo':'12323423534',
		'createTime':'2016-01-28 00:00',
		'updateTime':'2016-01-28 00:00',
		'status':'03',
		'statusName':'',
		'plateNo':'LSSDFAF2',
		'owner':'徐达翡3',
		'quotations':'2342.24'
	},{
		'applyNo':'12323423534',
		'createTime':'2016-01-28 00:00',
		'updateTime':'2016-01-28 00:00',
		'status':'04',
		'statusName':'',
		'plateNo':'LSSDFAF2',
		'owner':'徐达翡3',
		'quotations':'2342.24'
	}],
	'unquoteNum' :'14',
	'quoteNum' :'12',
	'unissueNum' :'4',
	'issueNum' :'6',
	'pendingNum' :'3',
	'waitTime' :'5'
};