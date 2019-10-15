var standardVehicleTax = ["	1050100","7010100","3020400","2020100","3050100","3020100","3110100","3100100","3020300","3070100","7030100","1030100","2010100","3030100","7020100","2030100","3030400","3060100","4010100","2040100","3080100"];
var policy = common.getLocalStorage(Interface.ss.policy,true);
var userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
var unitCode = userInfo.unitCode;
//var unit;
var unitDef = common.getLocalStorage(Interface.ss.unitDef,true);
var oldPolicy;
var minWidth = parseInt($(window).width()/3)-16;
var crmObj = common.getLocalStorage(Interface.ss.crmObj,true);
var rebuildPolicyCoverageFlag = true;
var customFlag ;//交叉销售登录手机号
var today = new Date();
var maxDateTemp = new Date(today.getFullYear()+3,today.getMonth(),today.getDate()+1);
var token = userInfo.userToken;
var addJudgeFlag = true;
var yuHebaoJQFlag = false;  //交强预核保标
var yuHebaoSYFlag = false;  //商业预核保标识
var yuHeBaoHtml = "";  //预核保接口返回信息

var photoInsurance = common.getLocalStorage(Interface.ss.photoInsurance,true);//拍照报价对象

// 暂时只做 正常纳税和补税情况，后续需要完善纳税类型和车船税标志
var tax_vs_tax_mrk_key = {"N": "纳税", "B": "补税", "W": "完税"},
	tax_vs_tax_mrk = ['纳税', '补税'],
	tax_vs_tax_mrk_default = "正常缴税",
	c_paytax_typ = {"T": "正常缴税", "P": "完税"};
var tax_taxpayer_cert_typ_key = {
	"01": "身份证",
	"02": "军官证",
	"03": "归侨证",
	"04": "护照",
	"05": "警官证",
	"08": "台胞证",
	"09": "士兵证",
	"10": "往来内地通行证",
	"20": "组织机构代码",
	"21": "工商注册号码",
	"99": "其他"
}

var discount_shangGai = {
	 "101":{"01":"0.006","02":"0.009"},
	 "201":{"01":"0.006","02":"0.009","03":"0.009","04":"0.009","05":"0.011","07":"0.009"},
	 "202":{"01":"0.006","02":"0.009","03":"0.009","04":"0.009","05":"0.011","07":"0.009"},
	 "301":{"01":"0.006","02":"0.009","03":"0.009","04":"0.009","05":"0.011","07":"0.009"},
	 "402":{"01":"0.011","02":"0.011","03":"0.011","04":"0.011","05":"0.014","07":"0.011"},
	 "501":{"01":"0.009","02":"0.009","03":"0.011","04":"0.011","05":"0.014","07":"0.009"},
	 "502":{"01":"0.009","02":"0.009","03":"0.011","04":"0.011","05":"0.014","07":"0.009"},
	 "601":{"01":"0.009","02":"0.009","03":"0.011","04":"0.011","05":"0.014","07":"0.009"},
	 "401":{"01":"0.011","02":"0.011","03":"0.011","04":"0.011","05":"0.014","07":"0.011"},
	 "701":{"06":"0.011","07":"0.009"},
	 "702":{"06":"0.011","07":"0.009"}
};

/*if(unitDef.organParams.hasTrafficPlatCountry == '1'){
	unit = 'V3';
}else if((!unitDef.organParams.hasTrafficPlatCountry)||unitDef.organParams.hasTrafficPlatCountry=='0'){
	unit = "standard";
}

if('5040100' == unitCode || '3090100' == unitCode || '1020100' == unitCode || '3040100' == unitCode || '1010100' == unitCode || '3010100' == unitCode ||
		'6010100' == unitCode || '7040100' == unitCode || '4020100' == unitCode){//重庆、山东、广西、天津、深圳、宁波、北京、上海、四川、宁夏、湖北
	unit = unitCode;
}*/

var specialcarFlag;
//车辆使用性质
var bizAttribute;
//车辆种类
var bizCategory;

//获取数据
var obj = localStorage.getItem(Interface.ss.policy) || "";

obj = JSON.parse(obj)
//实际车价
//var currentValue = obj.vehInfo.currentValue;
//新车购置车价
//var purchasePrice = obj.vehInfo.purchasePrice;

var c = new config();

//有商业险
var hasBiz = false;
//交强险
var hasTc = false;

var newEquipments = policy.newEquipments;
var crmObj;

var calTrue = true;

//无赔优浮动原因
var claimAdjustReasonJson ={
	"B13" : "无赔款优待-连续3年没有发生赔款",
	"B12" : "无赔款优待-连续2年没有发生赔款",
	"B11" : "无赔款优待-上年没有发生赔款",
	"B31" : "无赔款优待-新保或上年发生1次赔款",
	"B32" : "无赔款优待-上年发生2次赔款",
	"B33" : "无赔款优待-上年发生3次赔款",
	"B34" : "无赔款优待-上年发生4次赔款",
	"B35" : "无赔款优待-上年发生5次及以上赔款"
};
//无赔优不浮动原因代码
var noClaimAdjustReasonJson ={
	"01" : "过户车，不浮动",
	"02" : "脱保6个月以上，不浮动",
	"03" : "本次投保为短期单，不下浮",
	"04" : "没有上年度保单，不浮动",
	"05" : "上张保单为短期单，不下浮",
	"06" : "上张保单做过批改过户，不浮动",
	"07" : "上年和本年不在同一公司投保，不浮动",
	"08" : "脱保3个月至6个月（含），不下浮",
	"09" : "车贷投保多年，不下浮",
	"10" : "对历史保单（上平台前的保单）的批改，不重新计算客户忠诚度和无赔优系数",
	"11" : "新车,不下浮	示范条款承保的保单使用"
};

var poudage;//手续费
var businessfee;//业务费
var performance;//绩效
var actualdiscuteRate;//实际折扣率

/**
 * 商改机动车险种
 * name 险种中文名
 * entry 保额类型  0文本输入框 1下拉选择 2无保额 3特殊录入  4有保额不可修改
 * defaultSumInsured 默认保额，默认保额为空 有可能就是空，或者在后续的代码中会重新赋值
 * showFlag 是否在可选保障中默认显示
 * importFlag 是否时主险
 */

var bzCoverage = {
	'biz_036001' : {'name':'车辆损失险' , 'entry':'0', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'true','child_id':'DamageCarDeductibles','child_name':'车损绝对免赔额','child_defaultSumInsured':'300','child_entry':'3'},
	'biz_036006' : {'name':'玻璃单碎险' , 'entry':'1', 'defaultSumInsured':'国产玻璃', 'showFlag':'false', 'importFlag':'false'},
	"biz_036007" : {'name':'自燃损失险' , 'entry':'0', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"biz_036008" : {'name':'新增设备险' , 'entry':'3', 'defaultSumInsured':'0', 'showFlag':'false', 'importFlag':'false'},
	"biz_036009" : {'name':'修理补偿险' , 'entry':'3', 'defaultSumInsured':'100', 'showFlag':'false', 'importFlag':'false'},
	"biz_036012" : {'name':'涉水损失险' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"biz_036013" : {'name':'车身划痕险（元）' , 'entry':'1', 'defaultSumInsured':'2,000', 'showFlag':'false', 'importFlag':'false'},

	"biz_036014" : {'name':'车辆损失险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'false'},



	"biz_036038" : {'name':'法定假日三者险' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false' },
	"biz_036019" : {'name':'自燃损失险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"biz_036033" : {'name':'新增设备险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"biz_036022" : {'name':'指定修理险' , 'entry':'3', 'defaultSumInsured':'0', 'showFlag':'false', 'importFlag':'false'},
	"biz_036023" : {'name':'车身划痕险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"biz_036024" : {'name':'无法找到第三方险' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"biz_036025" : {'name':'涉水损失险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"biz_036034" : {'name':'钥匙丢失险（元）' , 'entry':'1', 'defaultSumInsured':'1,000', 'showFlag':'false', 'importFlag':'false'},
	// "biz_036037" : {'name':'机动车油污责任险' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},


	'biz_036002' : {'name':'三者责任险（元）' , 'entry':'1', 'defaultSumInsured':'50,000', 'showFlag':'true', 'importFlag':'true'},
	"biz_036015" : {'name':'三者责任险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'false'},

	// "biz_036010" : {'name':'车上货物责任险' , 'entry':'0', 'defaultSumInsured':'0', 'showFlag':'false', 'importFlag':'false'},
	"biz_036011" : {'name':'精神损害险（元）' , 'entry':'1', 'defaultSumInsured':'10,000', 'showFlag':'false', 'importFlag':'false'},
	"biz_036020" : {'name':'精神损害险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	// "biz_036021" : {'name':'(车上货物责任险)不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	// "biz_036035" : {'name':'机动车第三者责任可选自负额特约险' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},


	'biz_036003' : {'name':'司机责任险（元）' , 'entry':'1', 'defaultSumInsured':'10,000', 'showFlag':'true', 'importFlag':'true'},
	"biz_036016" : {'name':'司机责任险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},


	'biz_036004' : {'name':'乘客责任险（元）' , 'entry':'3', 'defaultSumInsured':'10,000', 'showFlag':'true', 'importFlag':'true'},
	"biz_036017" : {'name':'乘客责任险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},


	'biz_036005' : {'name':'全车盗抢险' , 'entry':'0', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'true'},
	"biz_036018" : {'name':'全车盗抢险不计免赔' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'false'},
}

/**
 * 商改特种车险种
 */
var specialcarBzCoverage = {
	'spe_036001' : {'name':'特种车损失险' , 'entry':'0', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'true','child_id':'SpecialCarDamageCarDeductibles','child_name':'车损绝对免赔额','child_defaultSumInsured':'300','child_entry':'1'},
	"spe_036014" : {'name':'车损不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'false'},
	"spe_036024" : {'name':'车损险无法找到第三方特约险' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	'spe_036002' : {'name':'第三者责任险' , 'entry':'1', 'defaultSumInsured':'50,000', 'showFlag':'true', 'importFlag':'true'},
	"spe_036015" : {'name':'三责不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'false'},
	'spe_036003' : {'name':'车上司机责任险' , 'entry':'1', 'defaultSumInsured':'50,000', 'showFlag':'true', 'importFlag':'true'},
	"spe_036016" : {'name':'车上司机责任险不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'false'},
	'spe_036004' : {'name':'车上乘客责任险' , 'entry':'3', 'defaultSumInsured':'10,000', 'showFlag':'true', 'importFlag':'true'},
	"spe_036017" : {'name':'车上乘客责任险不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'false'},
	'spe_036005' : {'name':'全车盗抢险' , 'entry':'0', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'true'},
	"spe_036018" : {'name':'盗抢不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'true', 'importFlag':'false'},
	'spe_036006' : {'name':'玻璃破碎险' , 'entry':'1', 'defaultSumInsured':'国产', 'showFlag':'false', 'importFlag':'false'},
	"spe_036007" : {'name':'自燃损失险' , 'entry':'0', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"spe_036019" : {'name':'自燃损失险不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"spe_036008" : {'name':'新增设备损失险' , 'entry':'3', 'defaultSumInsured':'0', 'showFlag':'false', 'importFlag':'false'},
	"spe_036033" : {'name':'新增设备险不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"spe_036009" : {'name':'修理期间费用补偿险' , 'entry':'3', 'defaultSumInsured':'100', 'showFlag':'false', 'importFlag':'false'},
	"spe_036010" : {'name':'车上货物责任险' , 'entry':'0', 'defaultSumInsured':'0', 'showFlag':'false', 'importFlag':'false'},
	"spe_036021" : {'name':'车上货物责任险不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"spe_036011" : {'name':'精神损害抚慰金责任险' , 'entry':'1', 'defaultSumInsured':'10,000', 'showFlag':'false', 'importFlag':'false'},
	"spe_036020" : {'name':'精神损害抚慰金责任险不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"spe_036022" : {'name':'指定修理厂险' , 'entry':'3', 'defaultSumInsured':'0', 'showFlag':'false', 'importFlag':'false'},
	"spe_036026" : {'name':'起重、装卸、挖掘车辆损失扩展条款' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	"spe_036027" : {'name':'特种车辆固定设备、仪器损坏扩展条款' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'}
}

/**
 * 商改险种下拉选
 */
var selectList = {
	"biz_036001_tr":["0","300","500","1000","2000"],
	"spe_036001_tr":["0","300","500","1000","2000"],
	//三者责任险:shanzx20170905
	"biz_036002_tr":["5万","10万","15万","20万","30万","50万","100万","150万","200万"],//2016-01-05 商改版第三方责任险增加300万，500万
	"spe_036002_tr":["50,000","100,000","150,000","200,000","300,000","500,000","1,000,000","1,500,000","2,000,000"],//2016-01-05 商改版第三方责任险增加300万，500万
	"biz_036003_tr":["5千","1万","2万","3万","4万","5万","8万","10万","15万","20万","30万","40万","50万","100万"],
	//司机责任险:shanzx20170911
	"biz_036004_tr":["5千","1万","2万","3万","4万","5万","8万","10万","15万","20万","30万","40万","50万","100万"],
	"spe_036003_tr":["10,000","20,000","30,000","40,000","50,000","100,000","150,000","200,000","300,000","500,000","100,0000"],
	"spe_036004_tr":["10,000","20,000","30,000","40,000","50,000","100,000","150,000","200,000","300,000","500,000","100,0000"],
	"biz_036006_tr":["国产玻璃","进口玻璃"],
	"spe_036006_tr":["国产","进口","国产特殊材质","进口特殊材质"],
	"biz_036013_tr":["2千","5千","1万","2万"],
	"biz_036009_tr":["100","200","300"],
	"spe_036009_tr":["100","200","300"],
	//精神损害险:shanzx20170911
	"biz_036011_tr":["1万","2万","3万","4万","5万","10万"],
	"spe_036011_tr":["10,000","20,000","30,000","40,000","50,000"],
	"biz_036022_tr":["国产","进口"],
	"spe_036022_tr":["国产","进口"],
	"biz_036034_tr":["1千","2千","3千","5千"],
}

var getCertType = function(certType){
	var codeList = {
		464001: '01', // 居民身份证
		464007: '99', // 居民户口薄
		464008: '99', // 驾驶证
		464009: '02', // 军官证
		464010: '09', // 士兵证
		464011: '99', // 军官离退休证
		464002: '04', // 护照
		464012: '01', // 临时身份证
		464013: '99', // 往来港澳通行证
		464014: '99', // 台湾通行证
		464017: '99', // 回乡证
		464018: '99', // 旅行证
		464019: '99', // 居留证件
		464004: '20', // 组织机构代码证
		464020: '99', // 税务登记证
		464021: '21', // 营业执照
		464003: '99' // 其他证件
	}
	return codeList[certType];
}




function check_tax_info(){
	policy.tax_info = new Object();

	var tax_paytax_typ = $('#tax-paytax-typ').attr('data-value'),
		tax_vs_tax_mrk = $('#tax-vs-tax-mrk').attr('data-value'),
		tax_taxpayer_nme = $('#tax-taxpayer-nme').val(),
		tax_taxpayer_cert_typ = $('#tax-taxpayer-cert-typ').attr('data-value'),
		tax_taxpayer_cert_no = $('#tax-taxpayer-cert-no').val(),
		tax_taxpayer_id = $('#tax-taxpayer-id').val(),
		tax_taxpayer_addr = $('#tax-taxpayer-addr').val(),
		tax_t_bill_date = $('#tax-t-bill-date').val(),
		tax_tax_payment_recpt_no = $('#tax-tax-payment-recpt-no').val(),
		tax_tax_authorities = $('#tax-tax-authorities').val();

	if(!checkIdNo('tax-taxpayer-cert-no', 2)){
		return false;
	}

	if( !tax_paytax_typ ){
		cpic.alert($('#tax-paytax-typ').attr('prompt'));
		return false;
	}else{
		policy.tax_info.c_paytax_typ = tax_paytax_typ;
	}

	if( !tax_vs_tax_mrk ){
		cpic.alert($('#tax-vs-tax-mrk').attr('prompt'));
		return false;
	}else{
		policy.tax_info.c_vs_tax_mrk = tax_vs_tax_mrk;
	}

	if( !tax_taxpayer_nme ){
		cpic.alert($('#tax-taxpayer-nme').attr('prompt'));
		return false;
	}else{
		policy.tax_info.c_taxpayer_nme = tax_taxpayer_nme;
	}

	if( !tax_taxpayer_cert_typ ){
		cpic.alert($('#tax-taxpayer-cert-typ').attr('prompt'));
		return false;
	}else{
		policy.tax_info.c_taxpayer_cert_typ = tax_taxpayer_cert_typ
	}

	if( !tax_taxpayer_cert_no ){
		cpic.alert($('#tax-taxpayer-cert-no').attr('prompt'));
		return false;
	}else{
		policy.tax_info.c_taxpayer_cert_no = tax_taxpayer_cert_no;
	}

	if( !tax_taxpayer_id ){
		cpic.alert($('#tax-taxpayer-id').attr('prompt'));
		return false;
	}else{
		policy.tax_info.c_taxpayer_id = tax_taxpayer_id;
	}

	if( !tax_taxpayer_addr ){
		cpic.alert($('#tax-taxpayer-addr').attr('prompt'));
		return false;
	}else{
		policy.tax_info.c_taxpayer_addr = tax_taxpayer_addr;
	}

	if( !tax_t_bill_date ){
		cpic.alert($('#tax-t-bill-date').attr('prompt'));
		return false;
	}else{
		policy.tax_info.t_bill_date = tax_t_bill_date;
	}

	if( "P" == tax_paytax_typ ){
		if( !tax_tax_payment_recpt_no ){
			cpic.alert($('#tax-tax-payment-recpt-no').attr('prompt'));
			return false;
		}else{
			policy.tax_info.c_tax_payment_recpt_no = tax_tax_payment_recpt_no;
		}

		if( !tax_tax_authorities ){
			cpic.alert($('#tax-tax-authorities').attr('prompt'));
			return false;
		}else{
			policy.tax_info.c_com_tax_org = tax_tax_authorities;
		}
	}
	return true;
}


//因为要动态的加载js，所以要等js加载完成后才能进行整个险种的初始化
//$.get("../../js/pages/vehicleTax/vehicleTax_" + unit +".js",function(result){
	$(function(){
//		$('body').append('<script>'+result+'</script>');
		/**
		 * 初始化页面数据
		 */
		initPageHTML();
		/**
		 * 绑定事件
		 */

	// 福建机构不显示指定修理险	shanzx20170828
	//
	if(common.isNotNull(policy.base_part.c_dpt_cde)){
		if (/^35/.test(policy.base_part.c_dpt_cde)){

			$("#biz_036022_tr").css("display","none");
		}}

		bindEvent();

		photoInsurance.goOrderDetailTypeFlag = "0";//0正常进入等待接单  1全部订单页面进入等待接单
		common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);


		/*var LDPolicy = common.getLocalStorage('policyTempAfterPremium', true);
		if( '' == LDPolicy ){
			$('#premiumCal').trigger('click');
		}else{
			initPremiumNumber(LDPolicy);
		}*/
	});
//},function(result){},"script");//动态导入js

	/**
	 * 验证指定修理厂险  费率  保额
	 * producePlaceType  产地
	 * Apcnum  费率
	 */
	function checkAppointedRepairFactorySpecialClauseInputFL(producePlaceType,Apcnum){
		if(common.isNull(Apcnum)){
			cpic.alert("<span class='font08em'>指定修理厂险配置费率不能为空</span>");
			cpic.ui.loading.close();
			return false;
		}

		if(isNaN(Apcnum)){
			cpic.alert("<span class='font08em'>指定修理厂险配置费率必须为数字</span>");
			cpic.ui.loading.close();
			return false;
		}
		if(producePlaceType=='0'){
			if(Apcnum<0.1||Apcnum>0.3) {
				cpic.alert("<span class='font08em'>指定修理厂险配置费率范围必须在[0.1,0.3]</span>");
				cpic.ui.loading.close();
				return false;
			}
		} else {
			if(Apcnum<0.15||Apcnum>0.6) {
				cpic.alert("<span class='font08em'>指定修理厂险配置费率范围必须在[0.15,0.6]</span>");
				cpic.ui.loading.close();
				return false;
			}
		}
		return true;
	}


/**
 * 校验证件号码
 * @param id
 * @param type
 * @return
 */
function checkIdNo(id,type){
	var sysVal = $("#"+id).val().trim();
	if(common.isNull(sysVal)){
		if(type==1)
			cpic.Prompt("纳税人证件号码不能为空");
		else if(type==2)
			cpic.alert("纳税人证件号码不能为空");
		return false;
	}

	/**
	 * 只有在选择身份证的时候才校验
	 */
	if("01"==$("#tax-taxpayer-cert-typ").attr("data-value")){
		if(sysVal.substring(8,12) == "****" && (sysVal.length == 18 || sysVal.length == 15)) {
			if(id=="appntIdNo"){
				sysVal = policy.applicant.certCode;
			}else if(id=="insuredIdNo"){
				sysVal = policy.insured.certCode;
			}else if(id=="claimIdNo"){
				sysVal = policy.claimant.certCode;
			}
		}
		var error = common.checkIdcard(sysVal);
		if(error==true){
			$("#"+id).val(sysVal.toUpperCase());
			return true;
		}else{
			if(type==1)
				cpic.Prompt("纳税人证件号码格式不正确");
			else if(type==2)
				cpic.alert("纳税人证件号码格式不正确");
			return false;
		}
	}
	if(unitCode=="1010100"){
		if("10"==$("#"+id).parent().parent().prev().find("input").attr("data-value")
				||"6"==$("#"+id).parent().parent().prev().find("input").attr("data-value")
				||"9"==$("#"+id).parent().parent().prev().find("input").attr("data-value")){
			if(sysVal.length==9){
				error = /^[0-9a-zA-Z]*$/g.test(sysVal);
				if (!error){
					cpic.alert(name+"证件号码格式不正确");
					return false;
				}
			}else{
				var error = common.checkOrganizationCode(sysVal);
				if(error==true){
					return true;
				}else{
					cpic.alert(name+"证件号码格式不正确");
					return false;
				}
			}
		}else  if("11"==$("#"+id).parent().parent().prev().find("input").attr("data-value")
				||"8"==$("#"+id).parent().parent().prev().find("input").attr("data-value")
				||"14"==$("#"+id).parent().parent().prev().find("input").attr("data-value")){
			if(sysVal.length==18){
				error = /^[0-9a-zA-Z]*$/g.test(sysVal);
				if (!error){
					cpic.alert(name+"证件号码格式不正确");
					return false;
				}
			}else{
				cpic.alert(name+"证件号码格式不正确");
				return false;
			}
		}
	}
	return true;
}

/**
 * 初始化页面html
 * @return
 */
function initPageHTML(){
	/**
	 *费率计算-实际折扣率 校验
	*/

	policy = common.getLocalStorage(Interface.ss.policy,true);
	userInfo = common.getLocalStorage(Interface.ss.userInfo,true);
//	unitCode = userInfo.unitCode;
	unitCode = "5020100";
	oldPolicy = common.getLocalStorage(Interface.ss.oldPolicy,true);
	var loginDetail = common.getLocalStorage(Interface.ss.loginDetail,true);
//	if(common.isNotNull(userInfo.personInfo.uniqueId)){//登录手机号放入大保单
//		customFlag = userInfo.personInfo.uniqueId;
//	}

	//客户详情任务列表来源
	if(crmObj.returnType == '3'){
		$(".home").attr("href","../customer/customerList.html");
	}
	//我的任务中任务列表来源
	if(crmObj.returnType == '4'){
		$(".home").attr("href","../mine/myInfo.html");
		$(".back").attr("href","../newInsV2/autoInsurance.html");
	}

	if(crmObj.returnType == '5'){
		$(".back").attr("href","../newInsV2/autoInsurance.html");
		$(".home").attr("href","../tool/tools.html");
	}

	if (crmObj.returnType=='6') {
		$(".back").attr("href","../newInsV2/autoInsurance.html");
		$(".home").attr("href","../tool/tools.html");
	}

	if(crmObj.returnType=='purchaseRecords'){
		$(".back").attr('href','../newInsV2/autoInsurance.html');
		$(".home").attr("href","../tool/tools.html");
	}

	if (crmObj.isRenewPolicy == 1 && (crmObj.returnType ==2 || crmObj.returnType == 3 || crmObj.returnType == 4)) {
		policy.baseInfo.renewalTaskStatus = 7;
		policy.baseInfo.renewalTaskId = crmObj.taskId || "";
	}

	//动态显示险种，根据车辆使用性质来显示特种车和普通车险种
	initCoverageHtml();
}

function checkIdCard(idTypeInputElement,idNumInputElement,prompt){
	var idNumInput=$(idNumInputElement).val();
	if($.trim(idNumInput)==""){
		return true;
	}

	if("1"==$(idTypeInputElement).attr('data-value')){
		var error = common.checkIdcard(idNumInput);
		if(error==true){
			$(idNumInputElement).val(idNumInput.toUpperCase());
			return true;
		}else{
			cpic.alert("<span class='font08em'>"+prompt+"</span>");
			return false;
		}
	}
	return true;
}

//联系电话校验
function checkPhone(phoneNum,prompt){
	if($.trim(phoneNum)==""){
		return true;
	}
	if(!common.checkPhoneOrMobile(phoneNum)){
		cpic.alert("<span class='font08em'>"+prompt+"</span>");
		return false;
	}
	return true;
}

//电子邮件校验
function checkEmail(EmailAddress,prompt){
	if($.trim(EmailAddress)==""){
		return true;
	}
	if(!common.checkEmail(EmailAddress)){
		cpic.alert("<span class='font08em'>"+prompt+"</span>");
		return false;
	}
	return true;
}

//地址校验
function checkAddress(Address,prompt){
	if($.trim(Address)==""){
		return true;
	}
	if(!common.checkAddress(Address)){
		cpic.alert("<span class='font08em'>"+prompt+"</span>");
		return false;
	}
	return true;
}

//邮编校验
function checkPostCode(PostCode,prompt){
	if($.trim(PostCode)==""){
		return true;
	}
	if(!common.checkPostCode(PostCode)){
		cpic.alert("<span class='font08em'>"+prompt+"</span>");
		return false;
	}
	return true;
}
/**
 * 验证全车盗抢险的录入保额
 * @param TheftCoverage_sumInsured
 */
function checkTheftCoverage_sumInsured(){
	return;
	var TheftCoverage_sumInsured_val = $("#biz_036005_sumInsured").val().replace(/\,/g,'');
	// 保额不得高于实际价值且不得低于新车购置价的20%
	if (TheftCoverage_sumInsured_val > currentValue  ) {
		if(specialcarFlag){
			$("#spe_036005_sumInsured").val(new Digital(currentValue).format());
		}else{
			$("#biz_036005_sumInsured").val(new Digital(currentValue).format());
		}
		cpic.alert("<span class='font08em'>全车盗抢险的保额不得高于实际价值且不得低于新车购置价的20%</span>");
		cpic.ui.loading.close();
		return false;
	}else if(TheftCoverage_sumInsured_val < purchasePrice*0.2){
		if(specialcarFlag){
			$("#spe_036005_sumInsured").val(new Digital(purchasePrice*0.2).format());
		}else{
			$("#biz_036005_sumInsured").val(new Digital(purchasePrice*0.2).format());
		}
		cpic.alert("<span class='font08em'>全车盗抢险的保额不得高于实际价值且不得低于新车购置价的20%</span>");
		cpic.ui.loading.close();
		return false;
	}
	return true;
}

/**
 * 验证自然损失险的录入保额
 */
function checkSelfIgniteCoverage_sumInsured(){
	var SelfIgniteCoverage_sumInsured_val = $("#biz_036007_sumInsured").val().replace(/\,/g,'');
	// 保额不得高于实际价值且不得低于新车购置价的20%
	if (SelfIgniteCoverage_sumInsured_val > currentValue ) {
		if(specialcarFlag){
			$("#spe_036007_sumInsured").val(new Digital(currentValue).format());
		}else{
			$("#biz_036007_sumInsured").val(new Digital(currentValue).format());
		}

		cpic.alert("<span class='font08em'>自燃损失险的保额不得高于实际价值且不得低于新车购置价的20%</span>");
		cpic.ui.loading.close();
		return false;
	}else if(SelfIgniteCoverage_sumInsured_val < purchasePrice*0.2){
		if(specialcarFlag){
			$("#spe_036007_sumInsured").val(new Digital(purchasePrice*0.2).format());
		}else{
			$("#biz_036007_sumInsured").val(new Digital(purchasePrice*0.2).format());
		}

		cpic.alert("<span class='font08em'>自燃损失险的保额不得高于实际价值且不得低于新车购置价的20%</span>");
		cpic.ui.loading.close();
		return false;
	}
	return true;
}

function bindEvent(){
	// 纳税类型
	$('#tax-paytax-typ-li').bind('click', function(){
		var key = {
			"正常缴税": "T",
			"完税": "P"
		}
		var defaultVal = $('#tax-paytax-typ').val();
		$('#tax-paytax-typ').scratcher(['正常缴税', '完税'], defaultVal, function(result){
			$('#tax-paytax-typ').val(result);
			$('#tax-paytax-typ').attr('data-value', key[result]);
			if( '正常缴税' === result ){
				tax_vs_tax_mrk = ['纳税', '补税'];
				tax_vs_tax_mrk_default = "正常缴税";
				$('#tax-vs-tax-mrk').val('纳税');
				$('#tax-vs-tax-mrk').attr('data-value', 'N');
				$('#tax-tax-payment-recpt-no-li, #tax-tax-authorities-li').hide().val('');
			}else{
				tax_vs_tax_mrk = ['完税'];
				tax_vs_tax_mrk_default = "完税";
				$('#tax-vs-tax-mrk').val('完税');
				$('#tax-vs-tax-mrk').attr('data-value', 'W');
				$('#tax-tax-payment-recpt-no-li, #tax-tax-authorities-li').show().val('');
			}
		});
	});
	// 车船税标志
	$('#tax-vs-tax-mrk-li').bind('click', function(){
		var defaultVal = $('#tax-vs-tax-mrk').val();
		$('#tax-vs-tax-mrk').scratcher(tax_vs_tax_mrk, defaultVal, function(result){
			$('#tax-vs-tax-mrk').val(result);
			for(var s in tax_vs_tax_mrk_key){
				if( tax_vs_tax_mrk_key[s] == result ){
					$('#tax-vs-tax-mrk').attr('data-value', s);
					break;
				}
			}
		});
	});
	// 纳税人证件类型
	$('#tax-taxpayer-cert-typ-li').bind('click', function(event) {
	    var defaultVal = $('#tax-taxpayer-cert-typ').val();
	    var params = [];
	    for(i in tax_taxpayer_cert_typ_key){
	    	params.push(tax_taxpayer_cert_typ_key[i]);
	    }
	    $("#tax-taxpayer-cert-typ").scratcher(params, defaultVal, function(result) {
			$("#tax-taxpayer-cert-typ").val(result);
			for(var i in tax_taxpayer_cert_typ_key){
				if( tax_taxpayer_cert_typ_key[i] == result ){
					$("#tax-taxpayer-cert-typ").attr('data-value', i);
					break;
				}
			}
		});
	});
	$("#tax-t-bill-date").scroller('destroy').scroller(
		$.extend({
			preset : 'date',
			dateOrder : 'yymmdd',
			maxDate: new Date(),
			theme : 'android-ics light',
			mode : 'scroller',
			lang : 'zh',
			minWidth : minWidth,  //用于时间控件占据屏幕整个宽度
			onSelect : function(result){
				$(this).val(result);
			}
		})
	);

	/**
	 * 保费展开
	 */
	var _checktotle = 1;
	$("#checktotle").bind("click",function(){
		if(_checktotle == 1){
			$("#heji").removeClass("hidden").addClass("show");
			//添加交强险折扣率字段显示   ----lt 2016-05-19
			if($("#tcCoverage td img:visible").attr("id") == "tcChooseN"){
				$("#foot").addClass("height11");
				$("#tcCount").parent().hide();
			}else if($("#tcCoverage td img:visible").attr("id") == "tcChooseY"){
				$("#foot").addClass("height11_add");
				$("#tcCount").parent().show();
				if(common.isNull(policy.cvrg_list_tpf) || policy.cvrg_list_tpf.tpf_033201.n_cost_ratio == 1.00){
					$("#tcCount").html("交强险未打折");
				} else {
					if(policy.cvrg_list_tpf.floatingRate > 1){
						$("#tcCount").html("交强险折扣率"+ (policy.cvrg_list_tpf.tpf_033201.n_cost_ratio || "") + "倍");
					}else{
						$("#tcCount").html("交强险折扣率"+ (policy.cvrg_list_tpf.tpf_033201.n_cost_ratio || ""));
					}
				}
			}

			/*$("#tcPremium").html(new Digital(policy.cvrg_list_tpf.tpf_033201.n_prm).format(2));
			$("#vsltax").html(new Digital(policy.tax_info.n_agg_tax).format(2));*/

			$(this).removeClass("floattop_icons").addClass("floatbottom_icons")
			_checktotle = 0;
			setTimeout(function(){
				myScroll.refresh();
			},300);
		}else if(_checktotle == 0){
			$("#heji").removeClass("show").addClass("hidden");
			$("#foot").removeClass("height11");
			$("#foot").removeClass("height11_add");
			$(this).removeClass("floatbottom_icons").addClass("floattop_icons")
			_checktotle = 1;
			setTimeout(function(){
				myScroll.refresh();
			},300);
		}
	});
	/**
	 * 推荐列表点击样式更改
	 */
	$(".tuijian-span").bind("click",function(){
		var selectImg = $(this).find("span").eq(0);
		if(selectImg.hasClass("select-no")){
			selectImg.removeClass("select-no").addClass("select-yes");
		}else{
			selectImg.removeClass("select-yes").addClass("select-no");
		}
	});

	/**
	 * 不投保按钮样式更改
	 */
	$(".noinsurancespan").bind("click",function(){
		var btn = $(this).find(".noinsurance-btn");
		if(btn.hasClass("select-no2")){
			btn.removeClass("select-no2").addClass("select-yes2");
		}else{
			btn.removeClass("select-yes2").addClass("select-no2");
		}
	});

	$("#moreGurantee").click(function(){
		var selectImg = $('.moreGurantee').find('span').eq(0);
		$("#moreInfoHtml").attr("data-steps", 1).find("tr").each(function(index, element){
			if(index > 5){
				$(element).hide();
			}
		})
		if(selectImg.hasClass("span-jiantou-down")){
			$(".tuijian-div").show("slow");
			$(this).hide();
			selectImg.removeClass("span-jiantou-down").addClass("span-jiantou-up");
			setTimeout(function(){
				myScroll.refresh();
			},300);
		}else{
			$(".tuijian-div").hide("slow");
			selectImg.removeClass("span-jiantou-up").addClass("span-jiantou-down");
			setTimeout(function(){
				myScroll.refresh();
			},300);
		}
	});

	$("#getMore").click(function(e){
		var inforTr = $("#moreInfoHtml").find("tr:hidden");
		inforTr.each(function(index){
			if(index < 10){
				$(this).show();
			}
		});


			// 福建机构不显示指定修理险	shanzx20170828
	//
	if(common.isNotNull(policy.base_part.c_dpt_cde)){
		if (/^35/.test(policy.base_part.c_dpt_cde)){

			$("#biz_036022_tr").css("display","none");
		}}

		if( $("#moreInfoHtml").find("tr:hidden").length == 0 ){
			$("#getMore").hide();
		}
		myScroll.refresh();
	});

	/**
	 * 根据传入的时间
	 *
	 * return 传入时间加一年
	 * 如：传入时间为2014-10-16  则返回2015-10-16
	 */
	function getNextYear(inDateStr){
		var inDate = new Date(inDateStr.replace(/-/g, '/')); // 将传入的字符串转换为时间类型
		var y1 = inDate.getFullYear() + 1;
		var retDate = new Date(inDate.setFullYear(y1));
		return new Date(retDate.setSeconds(retDate.getSeconds() - 1));

		/*var inDate = new Date(inDateStr.replace(/-/g,'/')); //将传入的字符串转换为时间类型
		var nextYear = inDate.getFullYear() + 1; //下一年
		var month = inDate.getMonth() + 1; //当前月
		if(month < 10){
			month = "0" + month;
		}
		var day = inDate.getDate();
		if(day < 10){
			day = "0" + day;
		}

		var hour = inDate.getHours();
		if(hour < 10){
			hour = "0" + hour;
		}

		var min = inDate.getMinutes();
		if(min < 10){
			min = "0" + min;
		}

		var retVal=nextYear + "-" + month + "-" + day + " " + hour + ":" + min;
		return retVal;*/
	}

	//modify by xxl 2016-05-12 即时投保影响商业险投保止期
	function getNextYearByBz(inDateStr){
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

		var hour = inDate.getHours();
		if(hour < 10){
			hour = "0" + hour;
		}

		var min = inDate.getMinutes();
		if(min < 10){
			min = "0" + min;
		}

		var retVal=nextYear + "-" + month + "-" + day + " " + hour + ":" + min;
		//如果是即时起保的话 则止期需要改变 update by 2016-05-12  在保险方案修改页面也需要进行更新
		if( hour != "00" ||  min != "00" ){
			retVal = getNextDay(retVal);
			retVal = retVal + " " + "00" + ":" + "00";
		}

		return retVal;
	}

	/**
	 * 根据传入的时间
	 *
	 * return 传入的时间加一天
	 */
	function getNextDay(inDateStr){
		var inDate = new Date(inDateStr.replace(/-/g,'/'));
		var nextDate = new Date(inDate.getTime() + 24*60*60*1000);
		return common.formatDate(nextDate,'yyyy-MM-dd');
	}

	//计算日期之间的月份
	function dateDiff(startDate, endDate){

		var _startDate = common.parseDate(startDate);
		var _endDate = common.parseDate(endDate);

		if(_startDate > _endDate){
			return 0;
		}

		var _start_year = _startDate.getFullYear();
		var _start_month = _startDate.getMonth();
		var _start_Date = _startDate.getDate();

		var _end_year = _endDate.getFullYear();
		var _end_month = _endDate.getMonth();
		var _end_Date = _endDate.getDate();

		var _diff_year = _end_year - _start_year;
		var _diff_month = _end_month - _start_month;

		var diffMonth = _diff_year * 12 + _diff_month;
		_startDate.setFullYear(_start_year, _start_month + diffMonth, _start_Date);
		if(_startDate > _endDate){
			diffMonth--;
		}

		return diffMonth >= 0 ? diffMonth : 0;
	}
	/**
	 *
	 * 商改计算车辆的实际价值
	 */
	function calcRealPrice_shangGai() {
		var vehicleClass = policy.vehInfo.bizAttribute;//使用性质
		var firstRegistrationDate = policy.vehInfo.firstRegistrationDate;//初登日期
		var bzStartTime = $("#bzStartTime").val();//商业险起保日期
		var use = policy.vehInfo.use;//车辆用途
		var purchasePrice = policy.vehInfo.purchasePrice;
		var realPrice = 0;
		if(!isNaN(purchasePrice)){
			if (common.isNotNull(firstRegistrationDate) && common.isNotNull(bzStartTime)) {
				var month = dateDiff(firstRegistrationDate, bzStartTime);
				var discount = discount_shangGai[vehicleClass];
				if(common.isNotNull(discount)){
					discount = discount[use];
				}
				if(common.isNotNull(discount)){
					realPrice = purchasePrice - purchasePrice * month * discount;
				}
				//折旧不超过80%
				if (Math.round(realPrice) > Math.round(purchasePrice * 0.2)) {
					realPrice = Math.round(realPrice).toFixed(0);
				} else {
					realPrice = Math.round(purchasePrice * 0.2).toFixed(0);
				}

			}
		}
		return realPrice;
	}


	function getNextYearByTc(inDateStr){
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

		var hour = inDate.getHours();
		if(hour < 10){
			hour = "0" + hour;
		}

		var min = inDate.getMinutes();
		if(min < 10){
			min = "0" + min;
		}

		var retVal=nextYear + "-" + month + "-" + day + " " + hour + ":" + min;
		return retVal;
	}



	function getNextDayByBz(inDateStr){
		var inDate = new Date(inDateStr.replace(/-/g,'/')); //将传入的字符串转换为时间类型
		var nextYear = inDate.getFullYear(); //下一年
		var month = inDate.getMonth() + 1; //当前月
		if(month < 10){
			month = "0" + month;
		}
		var day = inDate.getDate();
		if(day < 10){
			day = "0" + day;
		}

		var hour = inDate.getHours();
		if(hour < 10){
			hour = "0" + hour;
		}

		var min = inDate.getMinutes();
		if(min < 10){
			min = "0" + min;
		}

		var retVal=nextYear + "-" + month + "-" + day + " " + hour + ":" + min;
		//如果是即时起保的话 则止期需要改变 update by 2016-05-12  在保险方案修改页面也需要进行更新
		if( hour != "00" ||  min != "00" ){
			retVal = getNextDay(retVal);
			retVal = retVal + " " + "00" + ":" + "00";
		}

		return retVal;
	}

	var defaultdate = new Date();
	var newdefaultdate = new Date(defaultdate.setDate(defaultdate.getDate()+1));

	//if (crmObj.returnType == '5' || crmObj.+returnType == '6' || crmObj.isNewPolicy || crmObj.returnType == 'purchaseRecords') {

		$("#bzStartTime").scroller('destroy').scroller(
				$.extend({
					preset : 'datetime',
					dateOrder : 'yymmdd',
					minDate: newdefaultdate,
					theme : 'android-ics light',
					mode : 'scroller',
					lang : 'zh',
					minWidth : minWidth,  //用于时间控件占据屏幕整个宽度
					onSelect : function(result){
						var startTime = result.split(' ')[0],
							endTime = common.formatDate(getNextYear(startTime), "yyyy-MM-dd");

						$("#bzStartTime").val(startTime + ' 00:00:00');
						$("#bzEndTime").val(endTime + ' 23:59:59');
						policy.base_part.t_insrnc_bgn_tm_biz = $("#bzStartTime").val();
						policy.base_part.t_insrnc_end_tm_biz = $("#bzEndTime").val();


						$("#tcStartTime").val(startTime + ' 00:00:00');
						$("#tcEndTime").val(endTime + ' 23:59:59');
						policy.base_part.t_insrnc_bgn_tm_tpf = $("#tcStartTime").val();
						policy.base_part.t_insrnc_end_tm_tpf = $("#tcEndTime").val();

						return;


						/*var tempDateTime = result + ':00';
						$("#bzStartTime").val(getNextDayByBz(tempDateTime));
						$('#bzEndTime').val(getNextYearByBz(tempDateTime));
						policy.base_part.t_insrnc_bgn_tm_biz = getNextDayByBz(tempDateTime);
						policy.base_part.t_insrnc_end_tm_biz = getNextYearByBz(tempDateTime);
						cpic.ui.loading.open();

						rebuildPolicyCoverage();*/
					}
				})
		);

		$("#tcStartTime").scroller('destroy').scroller(
				$.extend({
					preset : 'date',
					dateOrder : 'yymmdd',
					minDate: newdefaultdate,
					theme : 'android-ics light',
					mode : 'scroller',
					lang : 'zh',
					minWidth : minWidth,  //用于时间控件占据屏幕整个宽度
					onSelect : function(result){
						var startTime = result.split(' ')[0],
							endTime = common.formatDate(getNextYear(startTime), "yyyy-MM-dd");
						$("#tcStartTime").val(startTime + ' 00:00:00');
						$("#tcEndTime").val(endTime + ' 23:59:59');

						policy.base_part.t_insrnc_bgn_tm_tpf = $("#tcStartTime").val();
						policy.base_part.t_insrnc_end_tm_tpf = $("#tcEndTime").val();

						/*$("#bzStartTime").val(startTime + ' 00:00:00');
						$("#bzEndTime").val(endTime + ' 23:59:59');
						policy.base_part.t_insrnc_bgn_tm_biz = $("#bzStartTime").val();
						policy.base_part.t_insrnc_end_tm_biz = $("#bzEndTime").val();*/

						return;

						var tempDate =  result +" 00:00:00";
						$("#tcStartTime").val(tempDate);
						$('#tcEndTime').val(getNextYearByTc(tempDate));
						policy.base_part.t_insrnc_bgn_tm_tpf = tempDate;
						policy.base_part.t_insrnc_end_tm_tpf = getNextYearByTc(tempDate);
//						$("#tcStartTime").val(result);
//						$('#tcEndTime').val(getNextYear($('#tcStartTime').val()));
//
//						policy.baseInfo.tcStartTime = result + ":00";
//						policy.baseInfo.tcEndTime = $('#tcEndTime').val() + ":00";
					}
				})
		);
	//}else{
//		$("#bzStartTime").scroller('destroy').scroller(
//				$.extend({
//					preset : 'datetime',
//					dateOrder : 'yymmdd',
//					minDate: new Date(oldPolicy.baseInfo.bzStartTime.replace(/-/g,'/')),
//			        theme : 'android-ics light',
//			        mode : 'scroller',
//			        lang : 'zh',
//			        minWidth : minWidth,  //用于时间控件占据屏幕整个宽度
//			        onSelect : function(result){
//						$("#bzStartTime").val(result);
//						$('#bzEndTime').val(getNextYearByBz($('#bzStartTime').val()));
//						$("#tcStartTime").val(result);
//						$('#tcEndTime').val(getNextYear($('#tcStartTime').val()));
//
//						var kindPrice = calcRealPrice_shangGai();//修改过后的行业实际价值
//						var currentValue = policy.vehInfo.currentValue;//车辆协商价值
//
//						policy.vehStore.currentValue = kindPrice;
//
//						policy.baseInfo.bzStartTime = result + ":00";
//						policy.baseInfo.bzEndTime = $('#bzEndTime').val() + ":00";
//						policy.baseInfo.tcStartTime = result + ":00";
//						policy.baseInfo.tcEndTime = $('#tcEndTime').val() + ":00";
//
//						$("#tcStartTime").scroller('destroy').scroller(
//								$.extend({
//									preset : 'datetime',
//									dateOrder : 'yymmdd',
//									minDate: new Date(oldPolicy.baseInfo.tcStartTime.replace(/-/g,'/')),
//							        theme : 'android-ics light',
//							        mode : 'scroller',
//							        lang : 'zh',
//							        minWidth : minWidth,  //用于时间控件占据屏幕整个宽度
//							        onSelect : function(result){
//										$("#tcStartTime").val(result);
//										$('#tcEndTime').val(getNextYear($('#tcStartTime').val()));
//
//										policy.baseInfo.tcStartTime = result + ":00";
//										policy.baseInfo.tcEndTime = $('#tcEndTime').val() + ":00";
//							        }
//							    })
//						);
//						rebuildPolicyCoverage();
//			        }
//			    })
//		);
//
//		$("#tcStartTime").scroller('destroy').scroller(
//				$.extend({
//					preset : 'datetime',
//					dateOrder : 'yymmdd',
//					minDate: new Date(oldPolicy.baseInfo.tcStartTime.replace(/-/g,'/')),
//			        theme : 'android-ics light',
//			        mode : 'scroller',
//			        lang : 'zh',
//			        minWidth : minWidth,  //用于时间控件占据屏幕整个宽度
//			        onSelect : function(result){
//						$("#tcStartTime").val(result);
//						$('#tcEndTime').val(getNextYear($('#tcStartTime').val()));
//
//						policy.baseInfo.tcStartTime = result + ":00";
//						policy.baseInfo.tcEndTime = $('#tcEndTime').val() + ":00";
//			        }
//			    })
//		);
//	}

	//添加交强险可修改险种0722

	/**
	 * 指定修理厂险
	 * */
	$('#domestic').on('blur',function(){  //国产[0.1,0.3]
		checkAppointedRepairFactorySpecialClauseInputFL('0',$(this).val());
	});
	$('#entrance').on('blur',function(){  //国产[0.1,0.3]
		checkAppointedRepairFactorySpecialClauseInputFL('1',$(this).val());
	});

	/**
	 * 全车盗抢险的鼠标离开保额校验
	 */
	var TheftCoverage_sumInsured = specialcarFlag ? $("#spe_036005_sumInsured") : $("#biz_036005_sumInsured");
		TheftCoverage_sumInsured.bind('blur',function(){
			var TheftCoverage_sumInsured_val = $(this).val().replace(/\,/g,''); //全车盗抢险
			if(checkTheftCoverage_sumInsured()){
				TheftCoverage_sumInsured.val(new Digital(TheftCoverage_sumInsured_val).format());
			}
		});

		//自燃损失险鼠标离开保额校验
	var	SelfIgniteCoverage_sumInsured = specialcarFlag ? $("#spe_036007_sumInsured") : $("#biz_036007_sumInsured");
		SelfIgniteCoverage_sumInsured.on('blur',function(){
			var SelfIgniteCoverage_sumInsured_val = $(this).val().replace(/\,/g,''); //自燃损失险
			if(checkSelfIgniteCoverage_sumInsured()){
				SelfIgniteCoverage_sumInsured.val(new Digital(SelfIgniteCoverage_sumInsured_val).format());
			}
		});
	/* *
	 *车船税校验
	 */
	//身份证号验证
	$('#tax-certCode').on('blur',function(){
		checkIdCard('#tax-certType','#tax-certCode','身份证号有误');
	});

	//邮编验证
	$('#tax-postCode').on('blur',function(){
		checkPostCode($('#tax-postCode').val(),"请输入正确的邮政编码");
	});

	//地址验证
	$('#tax-regAddr').on('blur',function(){
		checkAddress($('#tax-regAddr').val(),"请输入正确的联系地址");
	});
	$('#tax-taxpayer-cert-no').on('blur',function(){
		var appntIdTypeCode = $("#tax-taxpayer-cert-typ").attr("data-value");
		if (appntIdTypeCode && appntIdTypeCode == "01") {
			checkIdNo('tax-taxpayer-cert-no', 1);
		};
	});
	$('#tax-taxpayer-id').on('blur',function(){
		var appntIdTypeCode = $("#tax-taxpayer-cert-typ").attr("data-value");
		if (appntIdTypeCode && appntIdTypeCode == "01") {
			checkIdNo('tax-taxpayer-id', 1);
		};
	});

	//提交
	$('#btn_close_tax').bind('click', function(){
		var flag = check_tax_info();
		if(flag){
			$('#panel_tax').hide();
			$('#main').show();
		}
	});




	/**
	 * 更多保障点击样式更改
	 */
	$('.tuijian-div>ul>li').click(function(){
		var selectImg = $(this).find('span').eq(1);
		//console.log(selectImg);
		if(selectImg.hasClass('select-no')){
			selectImg.removeClass('select-no').addClass('select-yes');
		}else{
			selectImg.removeClass('select-yes').addClass('select-no');
		}
	});

	/**
	 * 提交险种修改，保存大保单对象
	 */
	$("#submit").bind("click",function(){

		// 商业险
		cvrg_list_biz_cache = {};
		var moreInfoTrList = $("#moreInfoHtml").find("tr");
		var coverageList = $('#coverageListHtml').find("tr");
		coverageList.each(getSelectedBiz);
		moreInfoTrList.each(getSelectedBiz);
		policy.cvrg_list_biz = cvrg_list_biz_cache;
		policy.biz_c_prod_no = '0360';

		if( !$('#bzStartTime').val() || !$('#bzEndTime').val() ){
			cpic.alert('请填写商业险起止日期');
			return;
		}
		if( !$('#tcStartTime').val() || !$('#tcEndTime').val() ){
			cpic.alert('请填写交强险起止日期');
			return;
		}
		policy.base_part.t_insrnc_bgn_tm_tpf = $('#tcStartTime').val();
		policy.base_part.t_insrnc_end_tm_tpf = $('#tcEndTime').val();
		policy.base_part.t_insrnc_bgn_tm_biz = $('#bzStartTime').val();
		policy.base_part.t_insrnc_end_tm_biz = $('#bzEndTime').val();

		// 交强险
		if( $('#tcChooseY').is(':visible') ){
			policy.tpf_c_prod_no = '0332';
			policy.cvrg_list_tpf = {
				tpf_033201: {
					"n_seq_no": 1,
					"n_deductible": "",
					"c_cvrg_no": "033201",
					"n_amt": "122000"
				}
			}
			/*var flag = check_tax_info();//检查车船税
			if(!flag){
				$('#panel_tax').show();
				$('#main').hide();
				return;
			}*/
		}else if( $('#tcChooseN').is(':visible') ){
			policy.tpf_c_prod_no = '';
			policy.cvrg_list_tpf = {
				//tpf_033201: {}
			}
		}

		/**	判断附加险的主险是否勾选 */
		var cvrg_list_biz = policy.cvrg_list_biz;//商业险
		var codeObjs = [];
		$.each(cvrg_list_biz,function(name,value) {
			codeObjs.push(name);
		});

		for (var i = 0; i < codeObjs.length; i++) {
			var isHasMainCode = '';//-1 主险未勾选
			var code = codeObjs[i];//已勾选的
			var mainName ;//主险名称
			if(code=='biz_036025'){
				isHasMainCode = codeObjs.indexOf("biz_036012");
				mainName =  eval('bzCoverage.biz_036012.name');
			}else if(code=='biz_036014'){
				isHasMainCode = codeObjs.indexOf("biz_036001");
				mainName =  eval('bzCoverage.biz_036001.name');
			}else if(code=='biz_036033'){
				isHasMainCode = codeObjs.indexOf("biz_036008");
				mainName =  eval('bzCoverage.biz_036008.name');
			}else if(code=='biz_036019'){
				isHasMainCode = codeObjs.indexOf("biz_036007");
				mainName =  eval('bzCoverage.biz_036007.name');
			}else if(code=='biz_036023'){
				isHasMainCode = codeObjs.indexOf("biz_036013");
				mainName =  eval('bzCoverage.biz_036013.name');
			}else if(code=='biz_036015'){
				isHasMainCode = codeObjs.indexOf("biz_036002");
				mainName =  eval('bzCoverage.biz_036002.name');
			}else if(code=='biz_036020'){
				isHasMainCode = codeObjs.indexOf("biz_036011");
				mainName =  eval('bzCoverage.biz_036011.name');
			}else if(code=='biz_036016'){
				isHasMainCode = codeObjs.indexOf("biz_036003");
				mainName =  eval('bzCoverage.biz_036003.name');
			}else if(code=='biz_036017'){
				isHasMainCode = codeObjs.indexOf("biz_036004");
				mainName =  eval('bzCoverage.biz_036004.name');
			}else if(code=='biz_036018'){
				isHasMainCode = codeObjs.indexOf("biz_036005");
				mainName =  eval('bzCoverage.biz_036005.name');
			}
			if(isHasMainCode=='-1' && '{}' == JSON.stringify(policy.cvrg_list_tpf)){
				cpic.alert("请选择"+mainName+"主险");
				return;
			}
		}

		if('{}' == JSON.stringify(policy.cvrg_list_biz) && '{}' == JSON.stringify(policy.cvrg_list_tpf)){
			cpic.alert('请至少选择一种险种');
			return;
		}

		common.setLocalStorage(Interface.ss.policy,policy,true);
		Interface.submitPhotoOrder(token,photoInsurance,policy.base_part,"1",function(data) {
			if(data&&data.resultCode=='0000'){//0000成功
          	  //var recordsTotal = data.recordsTotal;//前面还有多少单
          	  photoInsurance.busiNum = data.orderNo;//设置订单编号
		      common.setLocalStorage(Interface.ss.photoInsurance,photoInsurance,true);
          	  window.location.href = 'orderDetail.html?orderNumber='+data.orderNo+'&plateNo='+photoInsurance.plateNo;
            }else if(data.resultCode=='2'){
            	cpic.alert(data.message);
            }else{
            	cpic.alert(data.resultMessage);
            }
		});

	});


	/**
	 * 下拉控件初始化
	 */
	var selected_obj=$(".table-arrow-down-orange").add($(".table-arrow-free-orange"));

	$(selected_obj).each(function(index, element) {
		var id=$(element).parent().parent().parent().attr('id');
		if(id == "coverageListHtml"){
			return true;
		}else{
			var entry = $(element).parent().parent().parent();
			var obj_choose = $(element);

			var tempCoverage;
			if(C.isNewCarReform(unitCode)){
				if(specialcarFlag){
					tempCoverage = specialcarBzCoverage;
				}else{
					tempCoverage = bzCoverage;
				}
			}else{
				tempCoverage = noShanggai_BzCoverage;
			}

			var data_list = entry.attr('data-list');
			var coverageKind = eval('('+data_list+')').kind;	//险种key值
			var coverageEntry = eval('('+data_list+')').entry;	//险种录入方式  0文本输入框 1下拉选择  2无保额  3特殊录入取保额需要特殊处理4有保额但不可修改
			var insured = tempCoverage[coverageKind].defaultSumInsured;
			if(coverageKind=="biz_036001"||coverageKind=="spe_036001"
				||coverageKind=="biz_036005"||coverageKind=="spe_036005"
				||coverageKind=="biz_036007"||coverageKind=="spe_036007"){
				//insured = new Digital(policy.vehInfo.currentValue).format();
			}

			var params;//参数列表
			var defaultVal;//默认值

			// 未选中，则不投保，选中，则显示保额下拉框
			entry.find("img").bind("click",function(){
				rebuildPolicyCoverageFlag = false;
				if (entry.find("img").eq(0).css("display") == "block") {
					deleteCoverage([id]);
					deletejudgeCoverageRule(id);
				} else {
					// addjudgeCoverageRule(id);
					$(obj_choose).trigger("singleTap");
					if(!addJudgeFlag){
						return;
					};
					choosejudgeCoverageRule(id);
				}
			});

			$(obj_choose).on("singleTap",function(){
				rebuildPolicyCoverageFlag = false;
				//添加险种规则判断
				if(!addjudgeCoverageRule(id)){
					addJudgeFlag = false;
					return;
				}else {
					addJudgeFlag = true;
				};

				//点击指定修理厂险时弹出指定修理厂录入页面
				if(coverageKind == "biz_036022" || coverageKind == "spe_036022"){
					initAppointedRepairFactorySpecialClause();
					return;
				};

				//点击机动车损失险弹出车损绝对免赔额选项
				if(coverageKind == "DamageLossCoverage"){
					initDamageLossCoverageClause();
					if(common.isNotNull(policy.bzCoverages.DamageLossCoverage)){
						if(common.isNotNull(policy.bzCoverages.DamageLossCoverage.damageCardeductibles)){
							$("#damageCardeductibles").html(policy.bzCoverages.DamageLossCoverage.damageCardeductibles);
							policy.bzCoverages.DamageLossCoverage.damageCardeductibles = parseInt($("#damageCardeductibles").html().replace(/,/g,''));
							common.setLocalStorage(Interface.ss.policy,policy,true);
						}
					}else{
						policy.bzCoverages.DamageLossCoverage={};
						policy.bzCoverages.DamageLossCoverage.damageCardeductibles = parseInt($("#damageCardeductibles").html().replace(/,/g,''));
						common.setLocalStorage(Interface.ss.policy,policy,true);
					}
				}

				//点击修理期间补偿费用时弹出修理期间补偿费用录入页面
				if(coverageKind == "biz_036009" || coverageKind == "spe_036009"){
					if (!chooseCoverage('biz_036001_tr')) {
						cpic.alert("请先选择机动车损失险。");
						return false;
					}
					initRepairPeriodCompensationSpecialClause();
					return;
				}
				//点击新增设备损失险时弹出新增设备页面
				if(coverageKind == "biz_036008" || coverageKind == "spe_036008"){
					initNewEquipmentCoverage();
					return;
				}
				if(coverageEntry == 0){
					// 显示保额
					$(obj_choose).parent().show();
					$(obj_choose).parent().parent().next().find("span").show();
					$(obj_choose).parent().parent().parent().find("img").eq(0).show();
					$(obj_choose).parent().parent().parent().find("img").eq(1).hide();

					entry.find('.table-arrow-down-orange').hide();
					entry.find('.insuredNum').removeAttr("data-value");

					var value;
					if(insured=='purchasePrice')
						value = new Digital(policy.vehInfo.purchasePrice).format();
					else if(insured=='currentValue')
						value = new Digital(policy.vehInfo.currentValue).format();
					else if(common.isNotNull(insured))
						value = insured;
					else
						value = '';

					if(coverageKind == "biz_036001"){
						//value = new Digital(parseInt(policy.vhl_info.n_discus_useval)).format();
						entry.find('.selectContent').html("<input id=\""+coverageKind+"_sumInsured\"  class=\"input-style money-input\" disabled=\"disabled\" style=\"width: 55px; font-family: Microsoft YaHei, Arial,Helvetica,sans-serif;background:none;\" type=\"text\" data-max-value=\""+value+"\" value=\""+value+"\">");
					}else{
						//value = new Digital(parseInt(policy.vhl_info.n_discus_useval)).format();
						entry.find('.selectContent').html("<input id=\""+coverageKind+"_sumInsured\"  class=\"input-style money-input\" style=\"width: 55px; font-family: Microsoft YaHei, Arial,Helvetica,sans-serif;\" type=\"text\" data-max-value=\""+value+"\" value=\""+value+"\">");
					}
					entry.find('input').unbind();

					/**
					 * 使用安全带特约不能保费计算
					 */
//					if(coverageKind!="UseLifeBeltSpecialClause"&&coverageKind!="GoodsAccompaniedLiabilityCoverage"){
//					}
					bindMoneyInput();
					delete selectList[id];

//					if(coverageKind=="UseLifeBeltSpecialClause"||coverageKind=="GoodsAccompaniedLiabilityCoverage"){
//						entry.find('input').focus();
//					}
					return;
				}else if(coverageEntry == 1){
					defaultVal = entry.find('.selectContent').text();
					params = selectList[id];
				}else if(coverageEntry == 2){
					//无保额的险种无需处理
					$(obj_choose).parent().hide();
					$(obj_choose).parent().parent().next().find("span").show();
					$(obj_choose).parent().parent().parent().find("img").eq(0).show();
					$(obj_choose).parent().parent().parent().find("img").eq(1).hide();

					entry.find('.selectContent').html("");
					entry.find('.insuredNum').removeAttr("data-value");

					return;

				}else if(coverageEntry == 3){
					if(coverageKind == 'biz_036004'){
						//InCarPassengerLiabilityCoverage  机动车车上人员责任保险（乘客）

						//勾选或者勾选后修改 机动车车上人员责任保险(乘客)
						defaultVal = entry.find('.selectContent').text().replace("每座",'');
						params = selectList[id];
					} else {
						defaultVal = entry.find('.selectContent').text();
						params = selectList[id];
					}
				}else if(coverageEntry == 4){
					//显示保额
					$(obj_choose).parent().show();
					$(obj_choose).parent().parent().next().find("span").show();
					$(obj_choose).parent().parent().parent().find("img").eq(0).show();
					$(obj_choose).parent().parent().parent().find("img").eq(1).hide();
					//TODO 目前4就全车盗抢险一种情况
					entry.find('.selectContent').html(policy.vehInfo.currentValue);
					entry.find('.selectContent').css("color","#8c8c8c");
					entry.find('.insuredNum').removeAttr("data-value");

					entry.find('.table-arrow-down-orange').hide();

					return;
				}

				$(this).scratcher(params,defaultVal,function(result){
					$(obj_choose).parent().show();
					$(obj_choose).parent().parent().next().find("span").show();
					$(obj_choose).parent().parent().parent().find("img").eq(0).show();
					$(obj_choose).parent().parent().parent().find("img").eq(1).hide();
					if(coverageEntry == 0){
						entry.find('.selectContent').html("<input id=\""+coverageKind+"_sumInsured\" placeholder=\"请输入\" class=\"input-style money-input\" type=\"text\" value=\""+result+"\">");
						entry.find('input').unbind();
						bindMoneyInput();
						entry.find('.insuredNum').removeAttr("data-value");
						entry.find('.moneyNum').removeClass('line-through');
						delete selectList[id];
					}else if(coverageEntry == 1){
						entry.find('.selectContent').html(result);
						entry.find('.insuredNum').removeAttr("data-value");
						entry.find('.moneyNum').removeClass('line-through');
						if("GlassBrokenCoverage" == coverageKind){
							entry.find('.insuredNum').attr("data-value",c.cartype[result]);
						}
					}else if(coverageEntry == 2){
						//无保额的险种无需处理
						entry.find('.selectContent').html(result);
							entry.find('.insuredNum').removeAttr("data-value");
							entry.find('.moneyNum').removeClass('line-through');
					}else if(coverageEntry == 3){

						//弹出下拉选项后的点击 机动车车上人员责任保险(乘客)
						if(coverageKind == 'biz_036004'||coverageKind == 'spe_036004' ){
							entry.find('.selectContent').html(result/*+"每座"*/);
							entry.find('.insuredNum').removeAttr("data-value");
							entry.find('.moneyNum').removeClass('line-through');
						}
						if(coverageKind == 'spe_036003' || coverageKind == 'spe_036001'){
							entry.find('.selectContent').html(result);
							entry.find('.insuredNum').removeAttr("data-value");
							entry.find('.moneyNum').removeClass('line-through');
						}

					}else if(coverageEntry == 4){
						entry.find('.selectContent').html(result);
						entry.find('.insuredNum').removeAttr("data-value");
						entry.find('.moneyNum').removeClass('line-through');
					}
				},function(){
					if(coverageKind == 'biz_036002'){
						deleteCoverage(['biz_036015_tr']);
					}
					if(coverageKind == 'biz_036003'){
						deleteCoverage(['biz_036016_tr']);
					}
					if(coverageKind == 'biz_036004'){
						deleteCoverage(['biz_036017_tr']);
					}
					if(coverageKind == 'biz_036013'){
						deleteCoverage(['biz_036023_tr']);
					}
					//殷利春	20170409 点击取消的时候也删除不计免赔
					if(coverageKind == 'biz_036011'){
						deleteCoverage(['biz_036020_tr']);
					}
				});
			});
		}
	});

	/**
	 * 交强险投保与不投保
	 */
	$("#tcChooseN").bind("click",function(){
		rebuildPolicyCoverageFlag = false;
		$(this).siblings().removeClass("displaynone").addClass("displayblock");
		$(this).removeClass("displayblock").addClass("displaynone");
		$('#tcCoverage').find('.selectContent').html("122,000");
		$('#tcCoverage').find('.insuredNum').attr("data-value","0").show();

		// $("#TaxStatus").parent().show();
//		$('#tcCoverage').find('.moneyNum').show();
//		$('#vehicleTax').find('.moneyNum').show();
//		cpic.alert("您选择了投保交强险，请核对车船税信息");
//		$('#panel_tax').show();
//		$('#main').hide();
	});
	// 不投保
	$("#tcChooseY").bind("click",function(){
		rebuildPolicyCoverageFlag = false;
		$(this).siblings().removeClass("displaynone").addClass("displayblock");
		$(this).removeClass("displayblock").addClass("displaynone");
		$('#tcCoverage').find('.insuredNum').attr("data-value","-1").hide();

		$("#TaxStatus").parent().hide();
		$('#tcCoverage').find('.moneyNum').hide();
		$('#vehicleTax').find('.moneyNum').hide();
	});

	/** 点车船税的小箭头 */
	$('#btn_open_tax').parent().on('singleTap', function(){
		if($("#tcCoverage").find(".insuredNum").attr("data-value")=="-1")
			return;
		openTax();
		$("#floatBtn").hide();
		$("#preUnderWrite").hide();
		myScroll1.refresh();
	});

	//费率页面绑定
	$('#floatBtn').on('singleTap', function () {
		$('#feilv').show();
		$('#main').hide();
		$('#floatBtn').hide();
		$('#preUnderWrite').hide();
		//费率页面赋值
		initFloatItem();
		myScroll2.refresh();
	});

	$("#rateBtn").on("click",function(){
		cpic.ui.loading.open();

		if(!setRateForObj()){
			cpic.ui.loading.close();
			return false;
		}

		$('#feilv').hide();
		$('#main').show();
		$('#floatBtn').show();
		$('#preUnderWrite').show();

		rebuildPolicyCoverage();
		myScroll.refresh();
	});

  //预核保绑定事件
	$('#preUnderWrite').bind('click', function(){

		cpic.ui.loading.open();
        /*获取落地大保单 LDPolicy*/
		var yuHebaoPolicy = common.getLDPolicy(policy);

        /*请求预核保接口*/
		Interface.autoUnderwriting(yuHebaoPolicy,function(result){
			cpic.ui.loading.close();
			var isBuyJQ,isBuySY;
			/*获取商业险和交强险标识 0360 0332*/
			if(yuHebaoPolicy.biz_c_prod_no){
				isBuySY = yuHebaoPolicy.biz_c_prod_no === "0360"?true:false;
			};
			if(yuHebaoPolicy.tpf_c_prod_no){
				// if(JSON.parse(common.getLocalStorage('policyTemplate')).vhl_info.c_usage_cde == '309008'||JSON.parse(common.getLocalStorage('policyTemplate')).vhl_info.c_usage_cde == '309009'){
				// 	isBuyJQ = yuHebaoPolicy.tpf_c_prod_no === "0334"?true:false;
				// }else{
					isBuyJQ = yuHebaoPolicy.tpf_c_prod_no === "0332"?true:false;
				// }
			}

            /*判断返回信息*/
            if(result.resultCodeSY === "09001"){
            	cpic.alert("服务异常");
            	return;
            };
			if(result && !$.isEmptyObject(result.resultCode)){
			    //判断如果返回有值，就是本接口异常信息
				cpic.alert(result.message);
				return;
			}else {
				if (isBuySY && !isBuyJQ) { //只买了商业保险
					if(common.isNull(result.messageSY)){
						//商业险没有违规信息 既请求成功
						yuhebaoSYFlag = true;
						alert("<span class='font08em'>预核保通过</span>");
					}else {

						cpic.alert(showYuHeBaoMessage(result.messageSY));
						return;
					}
				}else if(!isBuySY && isBuyJQ){  //只买了交强保险
					if(common.isNull(result.messageJQ)){
						//交强险没有违规信息 既请求成功
						yuhebaoJQFlag = true;
						alert("<li class='font08em'>预核保通过</li>");
					}else {

						cpic.alert(showYuHeBaoMessage(result.messageJQ));
						return;
					};
				}else if(isBuySY && isBuyJQ){  //交强和商业都买的情况
					if(common.isNull(result.messageJQ) && common.isNull(result.messageSY)){
						//商业险和交强险没有违规信息 既请求成功
						yuHebaoJQFlag = true;
						yuhebaoSYFlag = true;
						alert("<span class='font08em'>预核保通过</span>");
					}else if(common.isNull(result.messageJQ) && !common.isNull(result.messageSY)){
						// 如果交强险返回违规信息为空 商业险返回信息不为空
						html += "<span class='font08em'>交强险预核保通过,商业险预核保不通过</span>";

						cpic.alert(showYuHeBaoMessage(result.messageSY));
						return;
					}else if(!common.isNull(result.messageJQ) && common.isNull(result.messageSY)){
						// 如果交强险返回违规信息为空 商业险返回信息不为空
						html += "<span class='font08em'>商业险预核保通过,交强险预核保不通过</span>";

						cpic.alert(showYuHeBaoMessage(result.messageJQ));
						return;
					}else if(!common.isNull(result.messageJQ) && !common.isNull(result.messageSY)){
						//商业险和交强险有违规信息 既请求失败

						showYuHeBaoMessage(result.messageSY);
						showYuHeBaoMessage(result.messageJQ);
						cpic.alert("<span class='font08em'>预核保不通过</span>");
					}
				};
			};
		});
	});

	/*
	  整理预核保接口返回的违规信息
	  2017年3月27日16:25:19
	 */
	function showYuHeBaoMessage(obj){  //接收返回数组信息和险种
		var obj = obj || [];
		for(var i in obj){
			yuHeBaoHtml += "<li>"+obj[i].ruleId+obj[i].ruleInfo+"</li>";
		};
		return yuHeBaoHtml;
	};


	$('.back').bind('click',function(){
		if(!$.isEmptyObject(policy.bzCoverages)){
			common.setLocalStorage(Interface.ss.policy,policy,true);
		}
	});

	var cvrg_list_biz_cache = {}, hasError = false, index = 0;
	var getSelectedBiz = function(){
		if($(this).find('img:first').is(':visible')){
			var bizKind = JSON.parse($(this).data('list').replace(/'/g,'"'));
			var n_amt = '', bizName = $(this).find('td:nth-child(2)').html();
			var bizKindObject = {
				n_seq_no: (++index),
				n_deductible: '',
				c_cvrg_no: bizKind.kind.split('_')[1],
				n_amt: ''
			}
			switch( bizKind.kind ){
				case 'biz_036002':
				case 'biz_036008':
				case 'biz_036013':
					// 下拉框内容转纯数字
					bizKindObject.n_amt = $(this).find('.selectContent').text().replace(/,/g, '');
					break;
				case 'biz_036003':
					var val =  $(this).find('.selectContent').text();
				if(val == "1万"){
					bizKindObject.n_amt = 10000;
					bizKindObject.n_amt_per = 10000;
				}else if(val == "2万"){
					bizKindObject.n_amt = 20000;
					bizKindObject.n_amt_per = 20000;
				}else if(val == "5千"){
					bizKindObject.n_amt = 5000;
					bizKindObject.n_amt_per = 5000;
				}else if(val == "3万"){
					bizKindObject.n_amt = 30000;
					bizKindObject.n_amt_per = 30000;
				}else if(val == "4万"){
					bizKindObject.n_amt = 40000;
					bizKindObject.n_amt_per = 40000;
				}else if(val == "5万"){
					bizKindObject.n_amt = 50000;
					bizKindObject.n_amt_per = 50000;
				}else if(val  == "8万"){
					bizKindObject.n_amt = 80000;
					bizKindObject.n_amt_per = 80000;
				}else if(val == "10万"){
					bizKindObject.n_amt = 100000;
					bizKindObject.n_amt_per = 100000;
				}else if(val == "15万"){
					bizKindObject.n_amt = 150000;
					bizKindObject.n_amt_per = 150000;
				}else if(val == "20万"){
					bizKindObject.n_amt = 200000;
					bizKindObject.n_amt_per = 200000;
				}else if(val == "25万"){
					bizKindObject.n_amt = 250000;
					bizKindObject.n_amt_per = 250000;
				}else if(val  == "30万"){
					bizKindObject.n_amt = 300000;
					bizKindObject.n_amt_per = 300000;
				}else if(val == "40万"){
					bizKindObject.n_amt = 400000;
					bizKindObject.n_amt_per = 400000;
				}else if(val == "50万"){
					bizKindObject.n_amt = 500000;
					bizKindObject.n_amt_per = 500000;
				}else if(val == "100万"){
					bizKindObject.n_amt = 1000000;
					bizKindObject.n_amt_per = 1000000;
				}
				// "biz_036003_tr":["1万","2万","3万","4万","5万","8万","10万","15万","20万","30万","40万","50万","100万"],
					// bizKindObject.n_amt = $(this).find('.selectContent').text().replace(/,/g, '');
					// bizKindObject.n_amt_per = $(this).find('.selectContent').text().replace(/,/g, '');
					bizKindObject.n_liab_days_lmt = '1';

					break;


					// bizKindObject.n_amt = $(this).find('.selectContent').text().replace(/,/g, '');
					// bizKindObject.n_amt_per = $(this).find('.selectContent').text().replace(/,/g, '');
					// bizKindObject.n_liab_days_lmt = '1';
					// break;
				case 'biz_036006':
					// 下拉框有特殊字符&汉字，需要特殊定义的
					// 玻璃险: 国产玻璃 - 303011001，进口玻璃 - 303011002
					if( '进口玻璃' === $(this).find('.selectContent').text() ){
						bizKindObject.c_glass_type = '303011002';
					}else{
						bizKindObject.c_glass_type = '303011001';
					}
					bizKindObject.c_specglass_mrk = '0';	// 是否防弹标志：0 - 不防弹
					break;
			//钥匙丢失险shanzx20170928
				case 'biz_036034':
				var val =  $(this).find('.selectContent').text();
				if(val == "1千"){
						bizKindObject.n_amt = 1000;
				}else if(val == "2千"){
						bizKindObject.n_amt = 2000;
				}else if(val == "3千"){
						bizKindObject.n_amt = 3000;
				}else if(val == "5千"){
						bizKindObject.n_amt = 5000;
				}
				break;
				//车身划痕险不计免赔shanzx20170928
					case 'biz_036013':
				var val =  $(this).find('.selectContent').text();
				if(val == "2千"){
						bizKindObject.n_amt = 2000;
				}else if(val == "5千"){
						bizKindObject.n_amt = 5000;
				}else if(val == "1万"){
						bizKindObject.n_amt = 10000;
				}else if(val == "2万"){
						bizKindObject.n_amt = 20000;
				}
				break;
				case 'biz_036004':
					// 机动车车上人员责任保险(乘客)shanzx20170928
					var val = $(this).find('.selectContent').text();
				    if( val ){
				    	val = val.split('*');
						bizKindObject.n_amt_per = val[0];
			if(bizKindObject.n_amt_per == "1万"){

					bizKindObject.n_amt_per = 10000;
				}else if(bizKindObject.n_amt_per == "5千"){

					bizKindObject.n_amt_per = 5000;
				}else if(bizKindObject.n_amt_per == "2万"){

					bizKindObject.n_amt_per = 20000;
				}else if(bizKindObject.n_amt_per == "3万"){

					bizKindObject.n_amt_per = 30000;
				}else if(bizKindObject.n_amt_per == "4万"){

					bizKindObject.n_amt_per = 40000;
				}else if(bizKindObject.n_amt_per == "5万"){

					bizKindObject.n_amt_per = 50000;
				}else if(bizKindObject.n_amt_per  == "8万"){

					bizKindObject.n_amt_per = 80000;
				}else if(bizKindObject.n_amt_per == "10万"){

					bizKindObject.n_amt_per = 100000;
				}else if(bizKindObject.n_amt_per == "15万"){

					bizKindObject.n_amt_per = 150000;
				}else if(bizKindObject.n_amt_per == "20万"){

					bizKindObject.n_amt_per = 200000;
				}else if(bizKindObject.n_amt_per == "25万"){

					bizKindObject.n_amt_per = 250000;
				}else if(bizKindObject.n_amt_per  == "30万"){

					bizKindObject.n_amt_per = 300000;
				}else if(bizKindObject.n_amt_per == "40万"){

					bizKindObject.n_amt_per = 400000;
				}else if(bizKindObject.n_amt_per == "50万"){

					bizKindObject.n_amt_per = 500000;
				}else if(bizKindObject.n_amt_per == "100万"){

					bizKindObject.n_amt_per = 1000000;
				}
						//bizKindObject.n_liab_days_lmt = val[1].match(/\d+/g) ? val[1].match(/\d+/g)[0] : '';
						bizKindObject.n_amt = bizKindObject.n_amt_per * 4;
					}
					break;
				case 'biz_036009':
				    //修理期间费用补偿险
				    var val = $(this).find('.selectContent').text();
				    if( val ){
				    	val = val.split('x');
				    	bizKindObject.n_compen_lim_day = val[0].match(/\d+/g)[0];
						bizKindObject.n_compen_day_amt = val[1].match(/\d+/g)[0];
				    }
				    break;
				    case 'biz_036002':
				//三者责任险:shanzx20170905
				var val =  $(this).find('.selectContent').text();
				if(val == "5万"){
					bizKindObject.n_amt = 50000;
				}else if(val == "10万"){
					bizKindObject.n_amt = 100000;
				}else if(val == "15万"){
					bizKindObject.n_amt = 150000;
				}else if(val == "20万"){
					bizKindObject.n_amt = 200000;
				}else if(val == "25万"){
					bizKindObject.n_amt = 250000;
				}else if(val  == "30万"){
					bizKindObject.n_amt = 300000;
				}else if(val == "50万"){
					bizKindObject.n_amt = 500000;
				}else if(val == "100万"){
					bizKindObject.n_amt = 1000000;
				}else if(val == "150万"){
					bizKindObject.n_amt = 1500000;
				}else if(val == "200万"){
					bizKindObject.n_amt = 2000000;
				}
				break;
				// 精神损害险shanzx20170911
				case 'biz_036011':
				var val = $(this).find('.selectContent').text();
				if(val == "1万"){
						bizKindObject.n_amt = 10000;
				}else if(val == "2万"){
						bizKindObject.n_amt = 20000;
				}else if(val == "3万"){
						bizKindObject.n_amt = 30000;
				}else if(val == "4万"){
						bizKindObject.n_amt = 40000;
				}else if(val == "5万"){
						bizKindObject.n_amt = 50000;
				}else if(val == "10万"){
						bizKindObject.n_amt = 100000;
				}
				break;
				case 'biz_036022':
					//指定修理厂险
					bizKindObject.n_rate = $(this).find('.selectContent').text();
					break;
				default:
					// 输入框
					if( $('#' + bizKind.kind + '_sumInsured').length ){
						/*if( $('#' + bizKind.kind + '_sumInsured').val() <= 0 ){
							cpic.alert("请输入" + bizName + "保额");
							hasError = true;
							return;
						}else{
							bizKindObject.n_amt = $('#' + bizKind.kind + '_sumInsured').val().replace(/,/g,'');
						}*/
						bizKindObject.n_amt = $('#' + bizKind.kind + '_sumInsured').val().replace(/,/g,'');
					}
					break;
			}
			cvrg_list_biz_cache[ bizKind.kind ] = bizKindObject
		}
	}

	//保费计算按钮  xxl  0620
	$('#premiumCal').bind('click', function(){
		// rebuildPolicyCoverage();
		cvrg_list_biz_cache = {};
		hasError = false;
		index = 0;
		// 商业险
		var moreInfoTrList = $("#moreInfoHtml").find("tr");
		var coverageList = $('#coverageListHtml').find("tr");
		coverageList.each(getSelectedBiz);
		moreInfoTrList.each(getSelectedBiz);

		// 交强险
		if( $('#tcChooseY').is(':visible') ){
			policy.tpf_c_prod_no = '0332';
			policy.cvrg_list_tpf = {
				tpf_033201: {
					"n_seq_no": 1,
					"n_deductible": "",
					"c_cvrg_no": "033201",
					"n_amt": "122000"
				}
			}
		}else if( $('#tcChooseN').is(':visible') ){
			policy.tpf_c_prod_no = '';
			policy.cvrg_list_tpf = {
				tpf_033201: {}
			}
		}

		if( hasError ){
			return;
		}else{
			if( !$('#bzStartTime').val() || !$('#bzEndTime').val() ){
				cpic.alert('请填写商业险起止日期');
				return;
			}
			if( !$('#tcStartTime').val() || !$('#tcEndTime').val() ){
				cpic.alert('请填写交强险起止日期');
				return;
			}
			policy.base_part.t_insrnc_bgn_tm_tpf = $('#tcStartTime').val();
			policy.base_part.t_insrnc_end_tm_tpf = $('#tcEndTime').val();
			policy.base_part.t_insrnc_bgn_tm_biz = $('#bzStartTime').val();
			policy.base_part.t_insrnc_end_tm_biz = $('#bzEndTime').val();

			// 获取上次报价单号，如果存在则复写报价单号
			var last_offer_no = common.getLocalStorage('last_offer_no', true);
			if( last_offer_no.c_offer_no_tpf ){
				policy.base_part.c_offer_no_tpf = last_offer_no.c_offer_no_tpf;
			}
			if( last_offer_no.c_offer_no_biz ){
				policy.base_part.c_offer_no_biz = last_offer_no.c_offer_no_biz;
			}

			if( '{}' === JSON.stringify(cvrg_list_biz_cache) ){
				policy.cvrg_list_biz = {};
				policy.biz_c_prod_no = '';
			}else{
				policy.cvrg_list_biz = cvrg_list_biz_cache;
				policy.biz_c_prod_no = '0360';
			}

			// 注释掉车船税相关初始化并移动到autoInsurance.js
			// 现上一页面默认选中交强险
			// modify By CYB
			/*var tax_info = {
				c_paytax_typ: 'T',	// 临时使用T，没有录入地方
				c_tax_sign: '',
				c_tax_item_cde: '', // 临时默认
				c_taxpayer_nme: policy.policyholder.c_insured_nme,
				c_taxpayer_cert_no: policy.policyholder.c_certf_cde,
				c_taxpayer_id: policy.policyholder.c_certf_cde,
				c_abate_mrk: '002',	// 临时默认
				c_abate_rsn: '',
				c_free_type: '',
				c_tax_relief_cert_no: '',
				c_tax_payment_recpt_no: '',
				n_curb_wt: policy.vhl_info.n_po_weight,
				c_last_tax_year: '',
				c_last_sali_end_date: common.formatDate(new Date(),'yyyy-MM-dd'),	// 取今天
				t_decleare_date: '',
				c_vs_tax_mrk: 'N',			// 车船税标志
				t_certificate_date: '',
				n_charge_prop: '0.05',
				n_taxable_months: '',
				c_taxpayer_addr: policy.policyholder.c_clnt_addr,
				c_taxpayer_cert_typ: getCertType(policy.policyholder.c_certf_cls),
				n_exhaust_capacity: policy.vhl_info.n_displacement,
				n_last_year_taxable_months: '',
				t_tax_eff_bgn_tm: '',
				t_tax_eff_end_tm: '',
				n_abate_amt: '',
				n_abate_prop: '',
				n_overdue_days: '',
				c_drawback_opr: '',
				n_overdue_amt: '',
				c_com_tax_org: '',
				c_tax_belong_tm: '',
				c_tax_vch_no: '',
				c_tax_vch_typ: '',
				c_transfer_car_mrk: '',
				t_transfer_date: '',
				c_pay_tax_mrk: '0',
				c_brand_name: policy.vhl_info.c_vehicle_brand,
				c_model_code: policy.vhl_info.c_model_cde,
				c_taxitem_cde: '',
				c_pay_id: '',
				c_tax_org_nolocal: '',
				c_pay_tax_flag: '0'
			}
			if( '1' == policy.vhl_info.c_new_mrk ){
				tax_info.t_bill_date = policy.vhl_info.t_fst_reg_ym;
			}
			policy.tax_info = tax_info;

			// console.log(policy);
			// return;
			cpic.ui.loading.open();
			Interface.updatePremium(token,policy, function(result_policy){
				cpic.ui.loading.close();
				if( !result_policy.responseObject ){
					cpic.alert(result_policy.message);
					return;
				}
				calTrue = true;
				rebuildPolicyCoverageFlag = true;
				initPremiumNumber(result_policy.responseObject);
			});*/
		}
	});
}

/**
 * 初始化费率页面的字段
 */
function initFloatItem(){

	//根据后台配置判断是否可以修改费率
	var permitFloat = common.setDefaultValue(userInfo.permitFloat,'Y');
	if('N' == permitFloat){
		$("#permitFloatTable").hide();//隐藏变动费用率，手续费，业务费，绩效
		$("#permitFloat_spearte_bg").hide();
	}
	//变动费用率
	$("#bdfyl").html(policy.baseInfo.changeableFeeRate ? new Number((policy.baseInfo.changeableFeeRate) *100).toFixed(2) + '%':'0.00%');

	//手续费
	$("#shouxufei").val(policy.baseInfo.poudage ? new Number((policy.baseInfo.poudage)*100).toFixed(2):'0.00');
	if(common.isNotNull(policy.baseInfo.poudage)){
		poudage = new Number((policy.baseInfo.poudage)*100).toFixed(2);
	}else{
		poudage = 0;
	}

	//业务费
	$("#yewufei").val(policy.baseInfo.businessfee ? new Number((policy.baseInfo.businessfee)*100).toFixed(2):'0.00');
	if(common.isNotNull(policy.baseInfo.businessfee)){
		businessfee = new Number((policy.baseInfo.businessfee)*100).toFixed(2);
	}else{
		businessfee=0;
	}

	//绩效
	$("#jixiao").val(policy.baseInfo.performance ? new Number((policy.baseInfo.performance)*100).toFixed(2):'0.00');
	if(common.isNotNull(policy.baseInfo.performance)){
		performance = new Number((policy.baseInfo.performance)*100).toFixed(2);
	}else{
		performance =0;
	}
	//参考折扣区间(参考保费区间)
	$("#advicePremium").html((policy.baseInfo.advicePremiumMin ? new Number(policy.baseInfo.advicePremiumMin).toFixed(2) + "元" : "") + " - " + (policy.baseInfo.advicePremiumMax ? new Number(policy.baseInfo.advicePremiumMax).toFixed(2) + "元" : ""));//四舍五入  保留2位

	//参考折扣率调整区间
	$("#cankzkl").html((policy.baseInfo.adviceDiscuteMinRate ? new Number((policy.baseInfo.adviceDiscuteMinRate)).toFixed(4):'') + " - " + (policy.baseInfo.adviceDiscuteMaxRate ? new Number((policy.baseInfo.adviceDiscuteMaxRate)).toFixed(4):''));

	//实际折扣率(6位小数)
	$("#shijzkl").val(policy.baseInfo.actualdiscuteRate ? new Number(policy.baseInfo.actualdiscuteRate).toFixed(6):'');
	actualdiscuteRate = new Number(policy.baseInfo.actualdiscuteRate).toFixed(6);
	//预期赔付率
	$("#yuqipfl").html(policy.baseInfo.ecompensationRate ? new Number((policy.baseInfo.ecompensationRate) *100).toFixed(2) + '%':'');

	//交通违法系数
	if(common.isNotNull(policy.floatItems.TrafficTransgressRate) && common.isNotNull(policy.floatItems.TrafficTransgressRate.value)){
		$("#jiaotwfxs").html(new Number(policy.floatItems.TrafficTransgressRate.value).toFixed(4));
	}else{
		$("#jiaotwfxs").html('');
	}
	//NCD系数
	if(common.isNotNull(policy.floatItems.NonClaimDiscountRate) && common.isNotNull(policy.floatItems.NonClaimDiscountRate.value)){
		$("#ncdxs").html(new Number(policy.floatItems.NonClaimDiscountRate.value).toFixed(4));
	}else{
		$("#ncdxs").html('1');
	}
	//无赔优浮动原因claimAdjustReasonJson
	var claimAdjustReasonCode = policy.baseInfo.claimAdjustReason;
	var claimAdjustReasonName = '';
	if(common.isNotNull(claimAdjustReasonCode)){
		claimAdjustReasonName = claimAdjustReasonJson[claimAdjustReasonCode];
	}
	$("#claimAdjustReason").html(common.setDefaultValue(claimAdjustReasonName,''));
	//无赔优不浮动原因
	var noClaimAdjustReasonCode = policy.baseInfo.noClaimAdjustReason;
	var noClaimAdjustReasonName = '';
	if(common.isNotNull(noClaimAdjustReasonCode)){
		noClaimAdjustReasonName = noClaimAdjustReasonJson[noClaimAdjustReasonCode];
	}
	$("#noClaimAdjustReason").html(common.setDefaultValue(noClaimAdjustReasonName,''));
	//渠道系数(6位小数)
	if(common.isNotNull(policy.floatItems.ChannelRate) && common.isNotNull(policy.floatItems.ChannelRate.value)){
		$("#qudaoxs").html(new Number(policy.floatItems.ChannelRate.value).toFixed(6));
	}else{
		$("#qudaoxs").html('');
	}
	//自主核保系数(6位小数)
	if(common.isNotNull(policy.floatItems.UnderwritingRate) && common.isNotNull(policy.floatItems.UnderwritingRate.value)){
		$("#zizhbxs").html(new Number(policy.floatItems.UnderwritingRate.value).toFixed(6));
	}else{
		$("#zizhbxs").html('');
	}
	//商业险标准保费
	$("#bzbiaozbf").html(policy.baseInfo.bzsPremium ? new Number(policy.baseInfo.bzsPremium).toFixed(2) + "元":'');

	//商业险折后保费
	$("#bzzhekbf").html(policy.baseInfo.bzPremium ? new Number(policy.baseInfo.bzPremium).toFixed(2) + "元":'');

	//上年保单保费
	$("#lastbaodanbf").html(policy.baseInfo.lastYearPolicyPremium ? new Number(policy.baseInfo.lastYearPolicyPremium).toFixed(2) + "元":'0.00元');
}

/**
 * 根据html重新构建大保单对象险种		感觉没有作用
 * @return
 */
function rebuildPolicyCoverage(){/*
	if(!checkAllInput())
		return;
	cpic.ui.loading.open();
	policy = common.getLocalStorage(Interface.ss.policy,true);
	var coverageTrList = $("#coverageListHtml").find("tr");
	var moreInfoTrList = $("#moreInfoHtml").find("tr");
//	policy.newEquipments = [];	//清空新增设备险内容，如果添加了新增设备险，会在下面的代码中加入
	var coverages = {};
	//清空商业险
	policy.cvrg_list_tpf = coverages;

	// 处理交强险
	if(!($("#tcCoverage").find(".insuredNum").attr("data-value")=='-1'||$("#tcCoverage").attr("id")=='vehicleTax')){
//		var tc_info = policy.cvrg_list_tpf.tpf_033201;
		var tc_info;
		if(typeof(tc_info)!="undefined"){
			//保单有数据，不作处理
		}else{
			//新增交强险
			tc_info = {
				"tpf_033201" : {
					"n_seq_no" : "1",
					"n_deductible" : "0",
					"c_cvrg_no" : "033201",
					"n_amt" : "122000"
				}
			};
			policy.cvrg_list_tpf = tc_info;
			//policy = C.initVsltax(policy);
		}
	} else {
		policy.cvrg_list_tpf = {};
	}

	//common.setLocalStorage(Interface.ss.policy,true);

	$.each(coverageTrList,function(index){
		var element = coverageTrList[index];
		if($(element).attr("id") == "biz_036001_tr"){
			//policy.bzCoverages.DamageLossCoverage.damageCardeductibles = parseInt($("#damageCardeductibles").html().replace(/,/g,''));
			//common.setLocalStorage(Interface.ss.policy,policy,true);
			return true;
		}else{
			if($(element).find(".insuredNum").attr("data-value")=='-1'||$(element).attr("id")=='vehicleTax'){
				return;
			}
				var data_list = $(element).attr('data-list');
				var coverageKind = eval('('+data_list+')').kind;	//险种key值
				var coverageEntry = eval('('+data_list+')').entry;	//险种录入方式  0文本输入框 1下拉选择  2无保额  3特殊录入取保额需要特殊处理4有保额但不可修改
				var sumInsured = 0;	//保额
				var count = 1;
				if(coverageEntry == 0){
					sumInsured = $(element).find('input').val().replace(/\,/g,'');
				}else if(coverageEntry == 1){
					if(coverageKind == 'biz_036006' || coverageKind == 'spe_036006'){
						//GlassBrokenCoverage 玻璃单独破碎险
						//policy.vehInfo.glassType = c.cartype[$(element).find('.insuredNum').text()];
					}else{
						sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
					}
				}else if(coverageEntry == 2){
					//无保额的险种无需处理
				}else if(coverageEntry == 3){
					if("biz_036001" == coverageKind || "spe_036001" == coverageKind){//车损绝对免赔额不是一个单独险种
						sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
					}else if(coverageKind == 'biz_036004'||coverageKind == 'spe_036004'){
						//InCarPassengerLiabilityCoverage  机动车车上人员责任保险（乘客）
						sumInsured = $(element).find('.insuredNum').text().replace("*4座",'').replace(/\,/g,'');
						count = policy.vhl_info.n_limit_load_person - 1;
					}else if(coverageKind == 'biz_036009' || coverageKind == 'spe_036009'){
						//RepairPeriodCompensationSpecialClause  修理期间费用补偿险
						sumInsured = $(element).find('.insuredNum').attr('dayCost');
						count = $(element).find('.insuredNum').attr('dayCount');
					}else if(coverageKind == 'biz_036022' || coverageKind == 'spe_036022'){
						//AppointedRepairFactorySpecialClause  指定修理厂险
						sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
						//policy.vehInfo.producePlaceType = $(element).find('.insuredNum').attr('data-value');
					}else if(coverageKind == 'biz_036008' || coverageKind == 'spe_036008'){
						//NewEquipmentCoverage 新增设备损失险
						sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
						//向保单对象添加新增设备信息
						policy.newEquipments = newEquipments;
					}
				}else if(coverageEntry == 4){
					sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
				}

				var coverage={};
				coverage.kind=coverageKind;//险种类别
				coverage.select=true;//是否选择
				coverage.sumInsured=sumInsured;//保额
				coverage.count=count;//数量
				coverage.premiumRate=0;//费率
				coverage.standardPremium=0;//标准保费
				coverage.policyPremium=0;//保单保费
				//车损绝对免赔额
				if("biz_036001" == coverageKind || "spe_036001" == coverageKind){
					coverage.nodeductiblesstandardPremium = '';//xubiao(特种车增加这个字段)
					coverage.deviationpureriskpremium = '';//xubiao(特种车增加这个字段)
					if(common.isNotNull($(element).find('.insuredNum').attr("data-value"))&&$(element).find('.insuredNum').attr("data-value")!="undefined"){
						if($(element).find('.insuredNum').attr("data-value")=="无")
							coverage.damageCardeductibles = "0";
						else
							coverage.damageCardeductibles = $(element).find('.insuredNum').attr("data-value").replace(/\,/g,'');
					}else{
						coverage.damageCardeductibles = "0";
					}
				}
				policy.cvrg_list_biz[coverageKind] = coverage;
		}
	});

	$.each(moreInfoTrList,function(index){
		var element = moreInfoTrList[index];
		if($(element).attr("id") == "biz_036001_tr"){
			return true;
		}else{
			var hasCoverage = false;
			if($(element).find(".insuredNum").attr("data-value")=='-1'||$(element).attr("id")=='vehicleTax'){
				return;
			}
				var data_list = $(element).attr('data-list');
				var coverageKind = eval('('+data_list+')').kind;	//险种key值
				var coverageEntry = eval('('+data_list+')').entry;	//险种录入方式  0文本输入框 1下拉选择  2无保额  3特殊录入取保额需要特殊处理4有保额但不可修改
				var sumInsured = 0;	//保额
				var count = 1;
				if(coverageEntry == 0){
					sumInsured = $(element).find('input').val().replace(/\,/g,'');
				}else if(coverageEntry == 1){
					if(coverageKind == 'biz_036006' || coverageKind == 'spe_036006'){
						//GlassBrokenCoverage 玻璃单独破碎险
						policy.vehInfo.glassType = c.cartype[$(element).find('.insuredNum').text()];
					}else{
						sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
					}
				}else if(coverageEntry == 2){
					//无保额的险种无需处理
				}else if(coverageEntry == 3){
					if("biz_036001" == coverageKind || "spe_036001" == coverageKind){//车损绝对免赔额不是一个单独险种
						sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
					}else if(coverageKind == 'biz_036004'||coverageKind == 'spe_036004'){
						//InCarPassengerLiabilityCoverage  机动车车上人员责任保险（乘客）
						sumInsured = $(element).find('.insuredNum').text().replace("*"+(policy.vehInfo.seatCapacity-1)+"座",'').replace(/\,/g,'');
						count = policy.vehInfo.seatCapacity - 1;
					}else if(coverageKind == 'biz_036009' || coverageKind == 'spe_036009'){
						//RepairPeriodCompensationSpecialClause  修理期间费用补偿险
						sumInsured = $(element).find('.insuredNum').attr('dayCost');
						count = $(element).find('.insuredNum').attr('dayCount');
					}else if(coverageKind == 'biz_036022' || coverageKind == 'spe_036022'){
						//AppointedRepairFactorySpecialClause  指定修理厂险
						sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
						policy.vehInfo.producePlaceType = $(element).find('.insuredNum').attr('data-value');
					}else if(coverageKind == 'biz_036008' || coverageKind == 'spe_036008'){
						//NewEquipmentCoverage 新增设备损失险
						sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
						//向保单对象添加新增设备信息
						policy.newEquipments = newEquipments;
					}
				}else if(coverageEntry == 4){
					sumInsured = $(element).find('.insuredNum').text().replace(/\,/g,'');
				}

				var coverage={};
				coverage.kind=coverageKind;//险种类别
				coverage.select=true;//是否选择
				coverage.sumInsured=sumInsured;//保额
				coverage.count=count;//数量
				coverage.premiumRate=0;//费率
				coverage.standardPremium=0;//标准保费
				coverage.policyPremium=0;//保单保费
				//车损绝对免赔额
				if("biz_036001" == coverageKind || "spe_036001" == coverageKind){
					coverage.nodeductiblesstandardPremium = '';//xubiao(特种车增加这个字段)
					coverage.deviationpureriskpremium = '';//xubiao(特种车增加这个字段)
					if(common.isNotNull($(element).find('.insuredNum').attr("data-value"))){
						if($(element).find('.insuredNum').attr("data-value")=="无")
							coverage.damageCardeductibles = "0";
						else
							coverage.damageCardeductibles = $(element).find('.insuredNum').attr("data-value").replace(/\,/g,'');
					}else{
						coverage.damageCardeductibles = "0";
					}
				}
				policy.cvrg_list_biz[coverageKind] = coverage;
		}
	});

	common.setLocalStorage(Interface.ss.policy,policy,true);

	if($.isEmptyObject(policy.cvrg_list_biz))
		hasBiz = false;
	else
		hasBiz = true;

	if($.isEmptyObject(policy.cvrg_list_tpf))
		hasTc = false;
	else
		hasTc = true;

	//判断是否显示商业险时间
	if(hasBiz)
		$("#bzTime_up").show();
	else
		$("#bzTime_up").hide();
	//判断是否显示交强险时间
	if(hasTc)
		$("#tcTime_up").show();
	else
		$("#tcTime_up").hide();

	if (hasBiz || hasTc) {
		setTimeout(function(){
			calculatePremium();
		},100);//为了使cpic.ui.loading.open()显示出来
	} else {

		calTrue = true;

		$("#updatePremium").html("0.00");
		$("#bzzhekbf").html("0.00");
		$("#bzbiaozbf").html("0.00");
		$("#tcPremium").html("0.00");
		$("#vsltax").html("0.00");

		cpic.ui.loading.close();
	}
	rebuildPolicyCoverageFlag = true;
*/}


//叶子
function initCoverageHtml(){

	//交强险起始时间
	$("#tcStartTime").val(common.formatDate(policy.base_part.t_insrnc_bgn_tm_tpf,'yyyy-MM-dd HH:mm:ss'));
	$("#tcEndTime").val(common.formatDate(policy.base_part.t_insrnc_end_tm_tpf,'yyyy-MM-dd HH:mm:ss'));
	//商业险起始时间
	$("#bzStartTime").val(common.formatDate(policy.base_part.t_insrnc_bgn_tm_biz,'yyyy-MM-dd HH:mm:ss'));
	$("#bzEndTime").val(common.formatDate(policy.base_part.t_insrnc_end_tm_biz,'yyyy-MM-dd HH:mm:ss'));

	$("#coverageListHtml").html("");

	var coverageListHtml = "";//已选险种
	var moreInfoHtml = "";//更多险种

	var jsonStr = JSON.stringify(policy.cvrg_list_biz);
	//console.log("接口获取的:"+jsonStr);

	//初始化商改商业险数据
	$.each(bzCoverage,function(index,element){

		var kindId = index;
		var insured = 0;//保额
		var kindName = element.name;//险种名
		var entry = element.entry; //保额类型  0文本输入框 1下拉选择 2无保额 3特殊录入 4有保额但不可修改

		if(!$.isEmptyObject(policy.cvrg_list_biz) && common.isNotNull(policy.cvrg_list_biz[kindId])){
			hasBiz = true;

			if($.isEmptyObject(policy.cvrg_list_biz[kindId])){
				return;
			};

			insured = parseInt(policy.cvrg_list_biz[kindId].n_amt);
			insured = new Digital(insured).format();		//保额

			//三者责任险:shanzx20170905
			if(kindId == "biz_036002"){
				if(policy.cvrg_list_biz[kindId].n_amt == "50000"){
					insured = "5万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "100000"){
					insured = "10万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "150000"){
					insured = "15万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "200000"){
					insured = "20万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "300000"){
					insured = "30万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "500000"){
					insured = "50万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "1000000"){
					insured = "100万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "1500000"){
					insured = "150万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "2000000"){
					insured = "200万";
				}
			}

				if(kindId == "biz_036003"){
				if(policy.cvrg_list_biz[kindId].n_amt == "10000"){
					insured = "1万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "20000"){
					insured = "2万";

				}else if(policy.cvrg_list_biz[kindId].n_amt == "5000"){
					insured = "5千";

				}else if(policy.cvrg_list_biz[kindId].n_amt == "30000"){
					insured = "3万";

				}else if(policy.cvrg_list_biz[kindId].n_amt == "40000"){
					insured = "4万";

				}else if(policy.cvrg_list_biz[kindId].n_amt == "50000"){
					insured = "5万";

				}else if(policy.cvrg_list_biz[kindId].n_amt == "80000"){
					insured = "8万";

				}else if(policy.cvrg_list_biz[kindId].n_amt == "100000"){
					insured = "10万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "150000"){
					insured = "15万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "300000"){
					insured = "30万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "400000"){
					insured = "40万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "500000"){
					insured = "50万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "1000000"){
					insured = "100万";
				}
			}

		//精神损害险:shanzx20170911
			if(kindId == "biz_036011"){
				if(policy.cvrg_list_biz[kindId].n_amt == "10000"){
					insured = "1万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "20000"){
					insured = "2万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "30000"){
					insured = "3万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "40000"){
					insured = "4万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "50000"){
					insured = "5万";
				}else if(policy.cvrg_list_biz[kindId].n_amt == "100000"){
					insured = "10万";
				}
			}


			// 乘客责任险shanzx20170928
		if(kindId == "biz_036004" ){
				if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "10000.00"){
					insured = "1万";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "20000.00"){
					insured = "2万";

				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "5000.00"){
					insured = "5千";

				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "30000.00"){
					insured = "3万";

				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "40000.00"){
					insured = "4万";

				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "50000.00"){
					insured = "5万";

				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "80000.00"){
					insured = "8万";

				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "100000.00"){
					insured = "10万";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "150000.00"){
					insured = "15万";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "300000.00"){
					insured = "30万";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "400000.00"){
					insured = "40万";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "500000.00"){
					insured = "50万";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt_per).toFixed(2) == "1000000.00"){
					insured = "100万";
				}
			}


			//钥匙丢失险:shanzx20170928
			if(kindId == "biz_036034"){
				if(Number(policy.cvrg_list_biz[kindId].n_amt).toFixed(2) == "1000.00"){
					insured = "1千";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt).toFixed(2) == "2000.00"){
					insured = "2千";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt).toFixed(2) == "3000.00"){
					insured = "3千";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt).toFixed(2) == "5000.00"){
					insured = "5千";
				}
			}

						//车身划痕险:shanzx20170928
			if(kindId == "biz_036013"){
				if(Number(policy.cvrg_list_biz[kindId].n_amt).toFixed(2) == "2000.00"){
					insured = "2千";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt).toFixed(2) == "5000.00"){
					insured = "5千";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt).toFixed(2) == "10000.00"){
					insured = "1万";
				}else if(Number(policy.cvrg_list_biz[kindId].n_amt).toFixed(2) == "20000.00"){
					insured = "2万";
				}
			}



			/*if( kindId=="biz_036001" ){
				insured = parseInt(policy.vhl_info.n_discus_useval);
				insured = new Digital(insured).format();
			}	*/
			var premium = new Digital(policy.cvrg_list_biz[kindId].n_prm).format(2);	//打折后的保费
			coverageListHtml += "<tr id=\""+kindId+"_tr\"  data-list=\"{'kind':'"+kindId+"','entry':"+entry+"}\">";
			coverageListHtml += "<td width='10%'><img src='../../images/cameraQuote/choose_yes.png' class='displayblock wid75 padding03'><img src='../../images/cameraQuote/choose_no.png' class='displaynone wid75 padding03'></td>";
			coverageListHtml += "<td width='30%' class='t_left color-8c middle'>" + kindName + "</td>"
			if(entry=="0"){	//文本输入框
				//coverageListHtml += "<td width='30%' class=\"td-right middle\"><span class=\"insuredNum\"><span class=\"selectContent\"><input id=\""+ kindId+"_sumInsured\" class=\"input-style money-input font09\" style=\"width: 55px; font-family: Microsoft YaHei, Arial,Helvetica,sans-serif;\" type=\"text\" value=\""+insured+"\"></span><span id=\""+kindId+"_arrow\" class=\"table-arrow-down-orange\" style='background:none;display:none;'></span></span></td>";
				coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum\"><span class=\"selectContent\"><input id=\""+ kindId+"_sumInsured\" class=\"input-style money-input font09\" style=\"width: 55px; font-family: Microsoft YaHei, Arial,Helvetica,sans-serif;\" type=\"text\" value=\"\"></span><span id=\""+kindId+"_arrow\" class=\"table-arrow-down-orange\" style='background:none;display:none;'></span></span></td>";
			}else if(entry=="1"){	//下拉选择
				if(kindId=="biz_036002"){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";


				}else if(kindId=="biz_036003"){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";


				}else if(kindId=="biz_036011"){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";


				}else if(kindId=="biz_036034"){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";


				}else if(kindId=="biz_036013"){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";


				}else if(kindId=="biz_036006"){
					if(policy.cvrg_list_biz.biz_036006){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09 \" data-value=\""+/*policy.vehInfo.glassType+*/"\"><span class=\"selectContent\">" + ( '303011002' == policy.cvrg_list_biz.biz_036006.c_glass_type ? '进口玻璃' : '国产玻璃')  + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}else{
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09 \" data-value=\""+/*policy.vehInfo.glassType+*/"\"><span class=\"selectContent\">" + /*c.default_optionsSg['GlassBrokenCoverage'][policy.vehInfo.glassType] +*/ "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}
				}else if(kindId=="spe_036006"){
					coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\" data-value=\""+/*policy.vehInfo.glassType+*/"\"><span class=\"selectContent\">" + /*c.cartypeText[policy.vehInfo.glassType] +*/ "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
				}else{

					if( policy.cvrg_list_biz[kindId] ){
						if(policy.cvrg_list_biz[kindId].n_amt==''||policy.cvrg_list_biz[kindId].n_amt==null){
							coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\"></span><span class=\"table-arrow-down-orange\"></span></span></td>";
						}else{
							coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\">" + parseInt(policy.cvrg_list_biz[kindId].n_amt) + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
						}
					}else{
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}
				}
			}else if(entry=="2"){	//无保额
				coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\" style='display:none;'><span class=\"selectContent\"></span><span id=\"" + kindId + "_arrow\" class=\"table-arrow-down-orange\"></span></span></td>"
			}else if(entry=="3"){	//特殊录入
				if(kindId=="biz_036001"||kindId=="spe_036001" ){		//车损险
					if(policy.cvrg_list_biz.biz_036001){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span data-value=\""+/*(policy.bzCoverages[kindId].damageCardeductibles==0?"无":policy.bzCoverages[kindId].damageCardeductibles)*/+"\" class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}else{
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span data-value=\""+/*(policy.bzCoverages[kindId].damageCardeductibles==0?"无":policy.bzCoverages[kindId].damageCardeductibles)*/+"\" class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}
				}else if(kindId=="biz_036004" || kindId=="spe_036004"){	//车上乘客责任险
					// n_amt_per			每座保额
					// n_liab_days_lmt		座位数量
					if(policy.cvrg_list_biz.biz_036004){
						if(policy.cvrg_list_biz.biz_036004.n_amt_per==null || policy.cvrg_list_biz.biz_036004.n_amt_per==''){
							coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\"></span><span class=\"table-arrow-down-orange\"></span></span></td>";
						}else{
							coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\">" + insured /*+ "元 * "+ policy.cvrg_list_biz.biz_036004.n_liab_days_lmt*/ + "</span>每座<span class=\"table-arrow-down-orange\"></span></span></td>";
						}
					}else{
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\"><span class=\"selectContent\"></span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}
				}else if(kindId=="biz_036009"||kindId=="spe_036009"){	//修理期间费用补偿险
					// n_compen_day_amt		每日补贴额度
					// n_compen_lim_day		天数
					if(policy.cvrg_list_biz.biz_036009){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\" dayCount='"+/*policy.bzCoverages[kindId].count*/+"' dayCost='"+insured+"' ><span class=\"selectContent\">" + policy.cvrg_list_biz.biz_036009.n_compen_lim_day + "天 x "+ policy.cvrg_list_biz.biz_036009.n_compen_day_amt + "元</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}else{
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\" dayCount='"+/*policy.bzCoverages[kindId].count*/+"' dayCost='"+insured+"' ><span class=\"selectContent\"> 0 x 0 天</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}
				}else if(kindId=="biz_036022"||kindId=="spe_036022"){	//指定修理厂险 0--国产，否则进口
					if( policy.cvrg_list_biz.biz_036022 ){
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\" data-value='"+/*policy.vehInfo.producePlaceType*/"'><span class=\"selectContent\">" + policy.cvrg_list_biz.biz_036022.n_rate + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}else{
						coverageListHtml += "<td width='40%' class=\"td-right middle\"><span class=\"insuredNum font09\" data-value='"+/*policy.vehInfo.producePlaceType*/"'><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
					}
				}else if(kindId=="biz_036008"||kindId=="spe_036008"){	//新增设备损失险
					if( policy.cvrg_list_biz.biz_036008 ){
						coverageListHtml += "<td width='30%' class=\"td-right middle\"><span class=\"insuredNum font09\" data-value='0'><span class=\"selectContent\">"+Number(policy.cvrg_list_biz.biz_036008.n_amt).toFixed(2)+"</span></span></td>";
					}else{
						coverageListHtml += "<td width='30%' class=\"td-right middle\"><span class=\"insuredNum font09\" data-value='0'><span class=\"selectContent\">"+insured+"</span></span></td>";
					}
				}else{
					//coverageListHtml += "<td width='30%' class=\"td-right middle\"><span data-value=\""+(policy.bzCoverages[kindId].damageCardeductibles==0?"无":policy.bzCoverages[kindId].damageCardeductibles)+"\" class=\"insuredNum font09\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
				}
			}else if(entry=="4"){
				coverageListHtml += "<td id=\""+kindId+"_insured\" class=\"td-right\"><span class=\"insuredNum\"><span class=\"selectContent\">" + insured + "</span><span class=\"table-arrow-down-orange\"></span></span></td>";
			}
			//coverageListHtml += "<td class=\"td-right\"><span class=\"moneyNum\">" + premium + "</span></td>";
			coverageListHtml += "</tr>";
		}else{
			moreInfoHtml += "<tr id=\""+kindId+"_tr\"  data-list=\"{'kind':'"+kindId+"','entry':"+entry+"}\" style=\"" + ('true' == element.showFlag ? "" : "display:none;") + "\">";
			moreInfoHtml += "<td width='10%'><img src='../../images/cameraQuote/choose_yes.png' class='displaynone  padding03' style='width:80%'><img src='../../images/cameraQuote/choose_no.png' class='displayblock  padding03' style='width:80%'></td>";
			moreInfoHtml += "<td width='50%' class='t_left color-8c middle'>"+kindName+"</td>";
			moreInfoHtml += "<td width='40%' class=\"td-right middle\"><span  style='display:none;'data-value=\"-1\" class=\"insuredNum font09\"><span class=\"selectContent\"></span><span id=\""+kindId+"_arrow\" class=\"table-arrow-down-orange\"></span></span></td>";
			//moreInfoHtml += "<td width='20%' class=\"t_right color-333 middle\" ><span  style='display:none;' class=\"moneyNum\">0.00</span></td>";
			moreInfoHtml += "</tr>";
		}
	});

	var tcCoverageListHtml = "";
	//初始化交强险数据
	if(!$.isEmptyObject(policy.cvrg_list_tpf)){
		hasTc = true;
		var policyPremium = 0.0;
		if(policy.cvrg_list_tpf.tpf_033201.n_prm)
			policyPremium = new Digital(policy.cvrg_list_tpf.tpf_033201.n_prm).format(2);

		//车船税保费
		var taxTotal = 0.0;
		if(policy.tax_info && policy.tax_info.n_agg_tax)
			taxTotal=new Digital(policy.tax_info.n_agg_tax).format(2);

		tcCoverageListHtml += "<tr id=\"tcCoverage\">";
		tcCoverageListHtml += "<td width='10%'><img src='../../images/cameraQuote/choose_yes.png' id='tcChooseY' class='displayblock wid75 padding03'><img src='../../images/cameraQuote/choose_no.png' id='tcChooseN' class='displaynone wid75 padding03'></td>";
		tcCoverageListHtml += "<td  width='50%' class='t_left color-8c middle'>交强险</td>";
		tcCoverageListHtml += "<td width=\"40%\" class=\"t_right color-8c middle\"><span class=\"insuredNum\" data-value=\"0\"><span class=\"selectContent\">"+new Digital(policy.cvrg_list_tpf.tpf_033201.n_amt || 122000).format(0)+"</span><span style='background:none;' class='table-arrow-down-orange2'></span></span></td>";
		/*tcCoverageListHtml += "<td width=\"25%\" class=\"t_right color-8c middle\"><span class=\"moneyNum\">"+policyPremium+"</span></td>";*/
		tcCoverageListHtml += "</tr>";

		//纳税类型代码
		//var tmp_code = policy.tax_info.c_paytax_typ;
//		var tmp_code = "T";//临时增加
		//纳税类型汉字
//		var tmp_name = "";
//		tcCoverageListHtml += "<tr id=\"vehicleTax\" onclick=\"$('#main').hide();$('#panel_tax').show();\"><td></td>";
//		tcCoverageListHtml += "<td class=\"t_left color-8c middle\">车船税</td>";
//		tcCoverageListHtml += "<td class=\"t_right color-8c middle\"><span class=\"insuredNum\"></span></td>";
//		/*tcCoverageListHtml += "<td class=\"t_right color-8c middle\"><span class=\"moneyNum\">"+taxTotal+"</span></td>";*/
//		tcCoverageListHtml += "</tr>";
	}else{
		if(unitDef.organParams.hasTrafficPlatCountry=="1"){
			setV3TaxStatus();
		}else{
			setTaxStatus();
		}

		//纳税类型代码
//		var tmp_code = policy.tax_info.c_paytax_typ;
		var tmp_code = "T";//临时增加
		//纳税类型汉字

		tcCoverageListHtml += "<tr id=\"tcCoverage\" class='tcCoverage downCoverage'>";
		tcCoverageListHtml += " <td width='10%'><img src='../../images/cameraQuote/choose_yes.png' id='tcChooseY' class='displaynone wid75 padding03'><img src='../../images/cameraQuote/choose_no.png' id='tcChooseN' class='displayblock wid75 padding03'></td>";
		tcCoverageListHtml += "<td  width='50%' class='t_left color-8c middle'>交强险</td>";
		tcCoverageListHtml += "<td width=\"40%\" class=\"t_right color-8c middle\"><span class=\"insuredNum\" data-value=\"-1\"><span class=\"selectContent\"></span><span style='background:none;' class='table-arrow-down-orange2'></span></span></td>";
		/*tcCoverageListHtml += "<td width=\"25%\" class=\"t_right color-8c middle\"><span  class=\"moneyNum\" style='display:none;'>0.00</span></td>";*/
		tcCoverageListHtml += "</tr>";

//		tcCoverageListHtml += "<tr id=\"vehicleTax\" class='tcCoverage downCoverage'><td></td>";
//		tcCoverageListHtml += "<td class=\"t_left color-8c middle\">车船税</td>";
//		tcCoverageListHtml += "<td class=\"t_right color-8c middle\"><span class=\"insuredNum\" style='display:none;'><span id=\"TaxStatus\" class=\"selectContent\">"+tmp_name+"</span><span id=\"btn_open_tax\" class='table-arrow-down-orange2'></span></span></td>";
//		/*tcCoverageListHtml += "<td class=\"t_right color-8c middle\"><span class=\"moneyNum\" style='display:none;'>0.00</span></td>";*/
//		tcCoverageListHtml += "</tr>";
	}
	$('#coverageListHtml').html(coverageListHtml);
	$('#tcCoverageListHtml').html(tcCoverageListHtml);
	$('#moreInfoHtml').html(moreInfoHtml);
	if(hasBiz)
		$('#bzTime_up').show();//商业险时间显示
	if(hasTc)
		$('#tcTime_up').show();//交强险时间显示

	/**
	 * 给所有的输入数字的money-input样式赋予点击事件
	 */
	bindMoneyInput();
	if(C.isNewCarReform(unitCode)){
		$("#biz_036001_sumInsured").attr("disabled","disabled").css("background","none");
		$("#spe_036001_sumInsured").attr("readonly","readonly");
	};

	// 初始化车船税页面字段内容
	/*if( policy.tax_info ){
		$('#tax-paytax-typ').val(c_paytax_typ[policy.tax_info.c_paytax_typ]).attr('data-value', policy.tax_info.c_paytax_typ);
		$('#tax-vs-tax-mrk').val(tax_vs_tax_mrk_key[policy.tax_info.c_vs_tax_mrk]).attr('data-value', policy.tax_info.c_vs_tax_mrk);
		$('#tax-taxpayer-nme').val(policy.tax_info.c_taxpayer_nme);
		$('#tax-taxpayer-cert-no').val(policy.tax_info.c_taxpayer_cert_no);
		$('#tax-taxpayer-id').val(policy.tax_info.c_taxpayer_id);
		$('#tax-taxpayer-addr').val(policy.tax_info.c_taxpayer_addr);
		$('#tax-taxpayer-cert-typ').val(tax_taxpayer_cert_typ_key[policy.tax_info.c_taxpayer_cert_typ]).attr('data-value', policy.tax_info.c_taxpayer_cert_typ);
		$('#tax-t-bill-date').val(policy.tax_info.t_bill_date);
		$('#tax-tax-payment-recpt-no').val(policy.tax_info.c_tax_payment_recpt_no);
		$('#tax-tax-authorities').val(policy.tax_info.c_com_tax_org);
	}*/

	setTimeout(function(){
		myScroll.refresh();
	},500);
}

/**
 * 根据分公司设置纳税类型代码
 * @return
 */
function setTaxStatus(){
	//山西,广西,深圳,海南,四川,湖北,宁波,宁夏,贵州
	if(unitCode=='1040100'||unitCode=='5040100'||unitCode=='5020100'||unitCode=='5030100'||unitCode=='6010100'||unitCode=='4020100'||unitCode=='3040100'||unitCode=='7040100'){
		policy.vsltax["taxState"]="T";//正常缴税
	} else if(unitCode=='5010800'||unitCode=='5010100'){
		policy.vsltax["taxState"]="5";//缓缴
	}else if(unitCode=='3010100'){
		policy.vsltax["taxState"]="N";//纳税
	}else{
		policy.vsltax["taxState"]="3";//纳税
	}
}

/**
 * V3车船税
 * @return
 */
function setV3TaxStatus(){
//	policy.vsltax["taxState"]="T";//正常缴税
}

/**
 * 计算保费并更新页面
 * @return
 */
function calculatePremium(){
	var policy = common.getLocalStorage(Interface.ss.policy,true);
	finalCalculateTrafficPremium(policy,function(result){
	});
}

/**
 * 将所有已选险种的保费回写到页面
 * @return
 */
function initPremiumNumber(policy){
	/*setTimeout(function(){
		//回写车船税
		// initialTax();
	},500);*/

	if( policy ){
		common.setLocalStorage('policyTempAfterPremium', policy, true);
	}

	//计算完成后给已选择的商业险显示保费
	var bzCoverages = policy.cvrg_list_biz;
	if(!$.isEmptyObject(bzCoverages)){
		var bzPremium = policy.base_part_biz.n_prm - 0; //商业险总保费
		for(x in bzCoverages){
			var _policyPremium = bzCoverages[x]["n_prm"] ? bzCoverages[x]["n_prm"] : 0;
			var policyPremium = new Digital(_policyPremium).format(2);//保费
			if(new Number(bzPremium) != 0){
				$("#" + x + "_tr").find('.moneyNum').html(policyPremium);
			}
		}
	}

	var policyPremium=0.0;
	var taxTotal='0.00';
	//交强险&车船税
	if (!$.isEmptyObject(policy.cvrg_list_tpf)) {
		//交强险保费
		if(policy.cvrg_list_tpf.tpf_033201.n_prm)
			policyPremium=new Digital(policy.cvrg_list_tpf.tpf_033201.n_prm).format(2);

		//车船税保费
		if(policy.tax_info && policy.tax_info.n_agg_tax)
			taxTotal=new Digital(policy.tax_info.n_agg_tax).format(2);

		if(new Number(policyPremium) != 0){
			$('#tcCoverage').find('.moneyNum').html(policyPremium);
		}
		$('#vehicleTax').find('.moneyNum').html(taxTotal);

	}

	var bizPrice = 0, tpfPrice = 0, taxPrice = 0, last_offer_no = {};
	if(common.isNotNull(policy.base_part_biz)){
		bizPrice = policy.base_part_biz.n_prm - 0;
		last_offer_no.c_offer_no_biz = policy.base_part_biz.c_offer_no;
		$('#bzzhekbf').html(bizPrice);
	}else{
		bizPrice = 0;
	}
	if(common.isNotNull(policy.base_part_tpf)){
		tpfPrice = policy.base_part_tpf.n_prm - 0;
		last_offer_no.c_offer_no_tpf = policy.base_part_tpf.c_offer_no;
		$('#tcPremium').html(tpfPrice);
	}else{
		tpfPrice = 0;
		$('#tcPremium').html('0.00');
	}
	if(common.isNotNull(policy.tax_info)){
		taxPrice = policy.tax_info.n_agg_tax - 0;
	}else{
		taxPrice = 0;
		$('#vsltax').html('0.00');
	}


	$('#vsltax').html(taxTotal);
	var total = (bizPrice + tpfPrice + taxPrice)* 100;
	//总保费
	$("#totalPremium").html(new Digital(total/100).format(2));
	$("#updatePremium").html(new Digital(total/100).format(2));
	// 记录保费计算返回的报价单号备用
	common.setLocalStorage('last_offer_no', last_offer_no, true);

	// 折扣信息
	if(policy.base_part_biz && policy.base_part_biz.n_total_coef){
		$("#zkl_biz").find("span").html(Number(policy.base_part_biz.n_total_coef).toFixed(2));
	};
	if(policy.base_part_tpf && policy.base_part_tpf.n_total_coef){
		$("#zkl_tpf").find("span").html(Number(policy.base_part_tpf.n_total_coef).toFixed(2));
	};


	// if( !policy.base_part_tpf ){
	// 	$('#tcChooseY').trigger('click');
	// }

	setTimeout(function(){
		myScroll.refresh();
	},500);

	cpic.ui.loading.close();
}

/**
 * 计算商业险保费
 * @param policy
 * @param callback
 * @return
 */
function finalCalculateBussinessPremium(policy,callback){
	var copyPolicy=JSON.copy(policy);
//	copyPolicy.cvrg_list_tpf = {};// 只计算商业险
	Interface.updatePremium(token,copyPolicy,function(result_policy) {
		if(result_policy.resultCode == "1"){
			cpic.ui.loading.close();
			common.setLocalStorage(Interface.ss.policy,result_policy.responseObject,true);
			initCoverageHtml();
		}else{
			cpic.ui.loading.close();
			cpic.alert(result_policy.message);
		}
	});
}

/**
 * 只有交强险的情况下，计算之前清除所有费率
 * @param policy
 */
function clearRate(policy) {
	var floatItems = policy.floatItems;
	//变动费用率
	policy.baseInfo.changeableFeeRate = "";
	//手续费
	policy.baseInfo.poudage = "";
	//业务费
	policy.baseInfo.businessfee = "";
	//绩效
	policy.baseInfo.performance = "";
	//参考折扣区间
	policy.baseInfo.advicePremiumMin = "";
	policy.baseInfo.advicePremiumMax = "";
	//参考折扣率调整区间
	policy.baseInfo.adviceDiscuteMinRate = "";
	policy.baseInfo.adviceDiscuteMaxRate = "";
	//实际折扣率
	policy.baseInfo.actualdiscuteRate = "";
	//预期赔付率
	policy.baseInfo.ecompensationRate = "";
	//无赔优浮动原因
	policy.baseInfo.claimAdjustReason = '';
	//无赔优不浮动原因
	policy.baseInfo.noClaimAdjustReason = '';
	//交通违法系数
	if(floatItems.TrafficTransgressRate) {
		floatItems.TrafficTransgressRate.value = "";
	}
	//NCD系数
	if(floatItems.NcdAdjustRate) {
		floatItems.NcdAdjustRate.value = "";
	}
	//渠道系数
	if(floatItems.ChannelRate) {
		floatItems.ChannelRate.value = "";
	}
	//自主核保系数
	if(floatItems.UnderwritingRate) {
		floatItems.UnderwritingRate.value = "";
	}
}

/**
 * 计算交强险保费
 * @param policy
 * @param callback
 * @return
 */
function finalCalculateTrafficPremium(policy,callback){
//	policy.bzCoverages = {};// 只计算交强险
	Interface.updatePremium(token,policy,function(result_policy) {
		if(result_policy.resultCode == "1"){
			cpic.ui.loading.close();
			common.setLocalStorage(Interface.ss.policy,result_policy.responseObject,true);
			initCoverageHtml();
		}else{
			cpic.ui.loading.close();
			cpic.alert(result_policy.message);
		}
	});
}

/**
 * 新增险种规则判断
 * @return
 */
function addjudgeCoverageRule(id){
	if(id=='biz_036001_tr'){

	}else if(id=='biz_036014_tr'){
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id=='biz_036002_tr'){

	}else if(id=='biz_036015_tr'){
		if(!chooseCoverage('biz_036002_tr')){
			alertLoseCoverage("biz_036002");
			return false;
		}
	}else if(id=='biz_036003_tr'){
		if(!checkInCarDriverLiabilityCoverage()){
			return false;
		}
	}else if(id=='biz_036016_tr'){
		if(!chooseCoverage('biz_036003_tr')){
			alertLoseCoverage("biz_036003");
			return false;
		}
	}else if(id=='biz_036004_tr'){
		if(!checkInCarPassengerLiabilityCoverage())
			return false;
	}else if(id=='biz_036017_tr'){
		if(!chooseCoverage('biz_036004_tr')){
			alertLoseCoverage("biz_036004");
			return false;
		}
	}else if(id=='biz_036005_tr'){
	}else if(id=='biz_036018_tr'){
		if(!chooseCoverage('biz_036005_tr')){
			alertLoseCoverage("biz_036005");
			return false;
		}
	}else if(id=='biz_036006_tr'){
		if(!checkGlassBrokenCoverage())
			return false;
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id=='biz_036007_tr'){
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id=='biz_036019_tr'){
		if(!chooseCoverage('biz_036001_tr')&&!chooseCoverage('biz_036007_tr')){
			cpic.alert("请先选择机动车损失险和自燃损失险。");
			return false;
		}
		if(!chooseCoverage('biz_036001_tr')){
			cpic.alert("请先选择机动车损失险。");
			return false;
		}
		if(!chooseCoverage('biz_036007_tr')){
			cpic.alert("请先选择自燃损失险。");
			return false;
		}
	}else if(id=='biz_036008_tr'){
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id=='biz_036033_tr'){
		if(!chooseCoverage('biz_036001_tr')&&!chooseCoverage('biz_036008_tr')){
			cpic.alert("请先选择机动车损失险和新增设备损失险。");
			return false;
		}
		if(!chooseCoverage('biz_036001_tr')){
			cpic.alert("请先选择机动车损失险。");
			return false;
		}
		if(!chooseCoverage('biz_036008_tr')){
			cpic.alert("请先选择新增设备损失险。");
			return false;
		}
	}else if(id=='biz_036013_tr'){
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id=='biz_036023_tr'){
		if(!chooseCoverage('biz_036001_tr')&&!chooseCoverage('biz_036013_tr')){
			cpic.alert("请先选择机动车损失险和车身划痕损失险。");
			return false;
		}
		if(!chooseCoverage('biz_036001_tr')){
			cpic.alert("请先选择机动车损失险。");
			return false;
		}
		if(!chooseCoverage('biz_036013_tr')){
			cpic.alert("请先选择车身划痕损失险。");
			return false;
		}
	}else if(id=='biz_036012_tr'){
		/* 发动机涉水损失险
		  验证车辆信息出错 policy.vehInfo无此字段
		  修改于2017年3月17日10:59:17
		  */
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		};
		return true;
		// if(policy.vehInfo.bizAttribute!='101'&&policy.vehInfo.bizAttribute!='201'&&
		// 		policy.vehInfo.bizAttribute!='202'&&policy.vehInfo.bizAttribute!='301'){
		// 	cpic.alert("<span class='font08em'>非家庭自用汽车/党政机关、事业团体用车/企业非营业用车不能投保涉水损失险</span>");
		// 	return false;
		// }

		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id=='biz_036025_tr'){
		if(!chooseCoverage('biz_036001_tr')&&!chooseCoverage('biz_036012_tr')){
			cpic.alert("请先选择机动车损失险和发动机涉水损失险。");
			return false;
		}
		if(!chooseCoverage('biz_036001_tr')){
			cpic.alert("请先选择机动车损失险。");
			return false;
		}
		if(!chooseCoverage('biz_036012_tr')){
			cpic.alert("请先选择发动机涉水损失险。");
			return false;
		}
	}else if(id=='biz_036009_tr'){
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id=='biz_036010_tr'){
		if(!checkCargoInCarLiabilityCoverage()){
			return false;
		}
		if(!chooseCoverage('biz_036002_tr')){
			alertLoseCoverage("biz_036002");
			return false;
		}
	}else if(id=='biz_036021_tr'){
		if(!chooseCoverage('biz_036010_tr')){
			alertLoseCoverage("biz_036010");
			return false;
		}
	}else if(id=='biz_036011_tr'){
		if(!chooseCoverage('biz_036002_tr')&&!chooseCoverage('biz_036003_tr')&&!chooseCoverage('biz_036004_tr')){
			cpic.alert("请先选择第三者责任险或车上司机责任险或车上乘客责任险。");
			return false;
		}
	}else if(id=='biz_036020_tr'){

		if(!chooseCoverage('biz_036002_tr')&&!chooseCoverage('biz_036003_tr')&&!chooseCoverage('biz_036004_tr')){
			cpic.alert("请先选择第三者责任险或车上司机责任险或车上乘客责任险和精神损害抚慰金责任险。");
			return false;
		}

		if(!chooseCoverage('biz_036011_tr')){
			alertLoseCoverage("biz_036011");
			return false;
		}
	}else if(id=='biz_036024_tr'){
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id=='biz_036022_tr'){
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		}
	}else if(id == "biz_036037_tr"){
		/*新增机动车责任险 2017年3月17日11:07:54*/
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		};
	}else if(id == "biz_036034_tr"){
		/*新增机动车钥匙丢失或损坏费用补偿险2017年3月17日11:07:54*/
		if(!chooseCoverage('biz_036001_tr')){
			alertLoseCoverage("biz_036001");
			return false;
		};
	}else if(id == "biz_036035_tr"){
		/*新增机动车钥匙丢失或损坏费用补偿险2017年3月17日11:07:54*/
		if(!chooseCoverage('biz_036002_tr')){
			alertLoseCoverage("biz_036002");
			return false;
		};
	}


	//特种车部分
	else if(id=='spe_036001_tr'){

	}else if(id=='spe_036014_tr'){
		if(!chooseCoverage('spe_036001_tr')){
			alertLoseCoverage("spe_036001");
			return false;
		}
	}else if(id=='spe_036002_tr'){

	}else if(id=='spe_036015_tr'){
		if(!chooseCoverage('spe_036002_tr')){
			alertLoseCoverage("spe_036002");
			return false;
		}
	}else if(id=='spe_036003_tr'){
		if(!checkInCarDriverLiabilityCoverage()){
			return false;
		}
	}else if(id=='spe_036016_tr'){
		if(!chooseCoverage('spe_036003_tr')){
			alertLoseCoverage("spe_036003");
			return false;
		}
	}else if(id=='spe_036004_tr'){
		if(!checkInCarPassengerLiabilityCoverage())
			return false;
	}else if(id=='spe_036017_tr'){
		if(!chooseCoverage('spe_036004_tr')){
			alertLoseCoverage("spe_036004");
			return false;
		}
	}else if(id=='spe_036005_tr'){
//		document.getElementById("down_SpecialCarTheftCoverageExemptDeductibleSpecialClause").style.backgroundColor='white';
	}else if(id=='spe_036018_tr'){
		if(!chooseCoverage('spe_036005_tr')){
			alertLoseCoverage("spe_036005");
			return false;
		}
	}else if(id=='spe_036006_tr'){
		if(!checkGlassBrokenCoverage())
			return false;
		if(!chooseCoverage('spe_036006_tr')){
			alertLoseCoverage("spe_036006");
			return false;
		}
	}else if(id=='spe_036007_tr'){
		if(!chooseCoverage('spe_036001_tr')){
			alertLoseCoverage("spe_036007");
			return false;
		}
	}else if(id=='spe_036019_tr'){
		if(!chooseCoverage('spe_036001_tr')&&!chooseCoverage('spe_036007_tr')){
			cpic.alert("请先选择特种车损失险和自燃损失险。");
			return false;
		}
		if(!chooseCoverage('spe_036001_tr')){
			cpic.alert("请先选择特种车损失险。");
			return false;
		}
		if(!chooseCoverage('spe_036007')){
			cpic.alert("请先选择自燃损失险。");
			return false;
		}
	}else if(id=='spe_036008_tr'){
	}else if(id=='spe_036033_tr'){
		if(!chooseCoverage('spe_036001_tr')&&!chooseCoverage('spe_036008_tr')){
			cpic.alert("请先选择特种车损失险和新增设备损失险。");
			return false;
		}
		if(!chooseCoverage('spe_036001_tr')){
			cpic.alert("请先选择特种车损失险。");
			return false;
		}
		if(!chooseCoverage('spe_036008_tr')){
			cpic.alert("请先选择新增设备损失险。");
			return false;
		}
	}else if(id=='spe_036009_tr'){
		if(!chooseCoverage('spe_036001_tr')){
			alertLoseCoverage("spe_036001");
			return false;
		}
	}else if(id=='spe_036010_tr'){
		if(!checkCargoInCarLiabilityCoverage()){
			return false;
		}
		if(!chooseCoverage('spe_036002_tr')){
			alertLoseCoverage("spe_036002");
			return false;
		}
	}else if(id=='spe_036021_tr'){
		if(!chooseCoverage('spe_036010_tr')){
			alertLoseCoverage("spe_036010");
			return false;
		}
	}else if(id=='spe_036011_tr'){
		if(!chooseCoverage('spe_036002_tr')&&!chooseCoverage('spe_036003_tr')&&!chooseCoverage('spe_036004_tr')){
			cpic.alert("请先选择第三者责任险或车上司机责任险或车上乘客责任险。");
			return false;
		}
	}else if(id=='spe_036020_tr'){
		if(!chooseCoverage('spe_036011_tr')){
			alertLoseCoverage("spe_036011");
			return false;
		}
	}else if(id=='spe_036024_tr'){
		if(!chooseCoverage('spe_036001_tr')){
			alertLoseCoverage("spe_036001");
			return false;
		}
	}else if(id=='spe_036022_tr'){
		if(!chooseCoverage('spe_036001_tr')){
			alertLoseCoverage("spe_036001");
			return false;
		}
	}else if(id=='spe_036026_tr'){
		if(!chooseCoverage('spe_036001_tr')){
			alertLoseCoverage("spe_036001");
			return false;
		}
	}else if(id=='spe_036027_tr'){
		if(!chooseCoverage('spe_036001_tr')){
			alertLoseCoverage("spe_036001");
			return false;
		}
	}
	return true;
}

/**
 * 勾选险种规则判断
 * @return
 */
function choosejudgeCoverageRule(id){
	if(id == "biz_036001_tr"){
		if(chooseCoverage('biz_036001_tr')){
			chooseOnCoverage(['biz_036014_tr']);
		}
	}else if(id == "biz_036002_tr"){
		if(!chooseCoverage('biz_036002_tr')){
			chooseOnCoverage(['biz_036015_tr']);
		}
	}else if(id == "biz_036003_tr"){
		if(!chooseCoverage('biz_036003_tr')){
			chooseOnCoverage(['biz_036016_tr']);
		}
	}else if(id == "biz_036004_tr"){
		if(!chooseCoverage('biz_036004_tr')){
			chooseOnCoverage(['biz_036017_tr']);
		}
	}else if(id == "biz_036005_tr"){
		if(chooseCoverage('biz_036005_tr')){
			chooseOnCoverage(['biz_036018_tr']);
		}
	}else if(id == "biz_036007_tr"){
		if(chooseCoverage('biz_036007_tr')){
			chooseOnCoverage(['biz_036019_tr']);
		}
	}else if(id == "biz_036008_tr"){
		if(!chooseCoverage('biz_036008_tr')){
			chooseOnCoverage(['biz_036033_tr']);
		}
	}else if(id == "biz_036013_tr"){

		if(!chooseCoverage('biz_036013_tr')){
			chooseOnCoverage(['biz_036023_tr']);
		}
	}else if(id == "biz_036012_tr"){
		if(chooseCoverage('biz_036012_tr')){
			chooseOnCoverage(['biz_036025_tr']);
		}
	}else if(id == "biz_036010_tr"){
		if(!chooseCoverage('biz_036010_tr') && checkCargoInCarLiabilityCoverage()){
			chooseOnCoverage(['biz_036021_tr']);
		}
	}else if(id == "biz_036011_tr"){
		if(!chooseCoverage('biz_036011_tr')){
			chooseOnCoverage(['biz_036020_tr']);
		}
	}
}

/**
 * 删除险种规则判断
 * @return
 */
function deletejudgeCoverageRule(id){

	if(id=='biz_036001_tr'){
		deleteCoverage(['biz_036014_tr','biz_036006_tr',
						'biz_036007_tr','biz_036008_tr','biz_036013_tr',
						'biz_036012_tr','biz_036009_tr',
						'biz_036024_tr','biz_036022_tr',"biz_036034_tr","biz_036037_tr",
						'biz_036019_tr','biz_036033_tr',
						'biz_036023_tr','biz_036025_tr']);
		$("#DamageCarDeductibles_tr").remove();
	}else if(id=='biz_036014_tr'){

	}else if(id=='biz_036002_tr'){
		deleteCoverage(['biz_036015_tr','biz_036010_tr','biz_036011_tr','biz_036020_tr','biz_036035_tr','biz_036021_tr']);

		if(!chooseCoverage('biz_036003_tr')&&!chooseCoverage('biz_036016_tr')){
			deleteCoverage(['biz_036011_tr','biz_036020_tr']);
		}
	}else if(id=='biz_036015_tr'){
	}else if(id=='biz_036003_tr'){
		deleteCoverage(['biz_036016_tr']);
		if(!chooseCoverage("biz_036002_tr")&&
				!chooseCoverage("biz_036004_tr")){
			deleteCoverage(['biz_036011_tr','biz_036020_tr']);
		}
	}else if(id=='biz_036016_tr'){

	}else if(id=='biz_036004_tr'){
		deleteCoverage(['biz_036017_tr']);
		if(!chooseCoverage("biz_036002_tr")&&
				!chooseCoverage("biz_036003_tr")){
			deleteCoverage(['biz_036011_tr','biz_036020_tr']);
		}
	}else if(id=='biz_036017_tr'){

	}else if(id=='biz_036005_tr'){
		deleteCoverage(['biz_036018_tr']);
	}else if(id=='biz_036007_tr'){
		deleteCoverage(['biz_036019_tr']);
	}else if(id=='biz_036008_tr'){
		deleteCoverage(['biz_036033_tr']);
	}else if(id=='biz_036013_tr'){
		deleteCoverage(['biz_036023_tr']);
	}else if(id=='biz_036012_tr'){
		deleteCoverage(['biz_036025_tr']);
	}else if(id=='biz_036010_tr'){
		deleteCoverage(['biz_036021_tr']);
	}else if(id=='biz_036011_tr'){
		deleteCoverage(['biz_036020_tr']);
	}
	//特种车部分
	else if(id=='spe_036001_tr'){
		deleteCoverage(['spe_036014_tr','spe_036006_tr',
						'spe_036007_tr','spe_036008_tr',
						'spe_036009_tr','spe_036024_tr',
						'spe_036022_tr','spe_036019_tr',
						'spe_036033_tr','spe_036026_tr',
						'spe_036027_tr']);
	}else if(id=='spe_036014_tr'){

	}else if(id=='spe_036002_tr'){
		deleteCoverage(['spe_036015_tr','spe_036010_tr',
						'spe_036021_tr']);

		if(!chooseCoverage("spe_036003_tr")&&
				!chooseCoverage("spe_036004_tr")){
			deleteCoverage(['spe_036011_tr','spe_036020_tr']);
		}
	}else if(id=='spe_036015_tr'){

	}else if(id=='spe_036003_tr'){
		deleteCoverage(['spe_036016_tr']);
		if(!chooseCoverage("spe_036002_tr")&&
				!chooseCoverage("spe_036004_tr")){
			deleteCoverage(['spe_036011_tr','spe_036020_tr']);
		}
	}else if(id=='spe_036016_tr'){
	}else if(id=='spe_036004_tr'){
		deleteCoverage(['spe_036017_tr']);

		if(!chooseCoverage("spe_036002_tr")&&
				!chooseCoverage("spe_036003_tr")){
			deleteCoverage(['spe_036011_tr','spe_036020_tr']);
		}
	}else if(id=='spe_036017_tr'){

	}else if(id=='spe_036005_tr'){
		deleteCoverage(['spe_036018_tr']);
	}else if(id=='spe_036007_tr'){
		deleteCoverage(['spe_036019_tr']);
	}else if(id=='spe_036008_tr'){
		deleteCoverage(['spe_036033_tr']);
	}else if(id=='spe_036010_tr'){
		deleteCoverage(['spe_036021_tr']);
	}else if(id=='spe_036011_tr'){
		deleteCoverage(['spe_036020_tr']);
	}
	return;
}

/**
 * 车上人员责任险(司机)判断
 * @return
 */
function checkInCarDriverLiabilityCoverage(){
	if($.inArray(bizCategory, ["20","21","22","23","24","25","26"]) != -1){
		cpic.alert("<span class='font08em'>挂车不能投保车上人员责任险(司机)</span>");
		return false;
	}
	return true;
}

/**
 * 车上人员责任险(乘客)判断
 * @return
 */
function checkInCarPassengerLiabilityCoverage(){
	if($.inArray(bizCategory, ["20","21","22","23","24","25","26"]) != -1){
		cpic.alert("<span class='font08em'>挂车不能投保车上人员责任险(乘客)</span>");
		return false;
	}
	return true;
}

/**
 * 玻璃破碎险判断
 * @return
 */
function checkGlassBrokenCoverage(){
	if($.inArray(bizCategory, ["20","21","22","23","24","25","26"]) != -1){
		cpic.alert("<span class='font08em'>挂车不能投保商业险附加险中的玻璃单独破碎险</span>");
		return false;
	}
	return true;
}

/**
 * 验证车上货物责任险
 * @param obj_policy
 * @returns {Boolean}
 */
function checkCargoInCarLiabilityCoverage() {
	// 车上货物责任险 - 车辆是否或者或挂车验证
	// policy.vehInfo 无此字段
	return true;
	var validCategory = $.inArray(policy.vehInfo.category, ["06","07","08","09","19","20","21","22","23","24","25"]) > -1;

	var validBizCategory = $.inArray(policy.vehInfo.bizCategory, ["06","07","08","09","20","21","22","23","24","25","26"]) > -1;

	if (!(validCategory || validBizCategory)) {
		cpic.alert("<span class='font08em'>非货车和挂车不能勾选车上货物责任险</span>");
		return false;
	}else{
		return true;
	}
}

/**
 * 根据id判断是否选中险种
 * @param id
 * @return
 */
function chooseCoverage(id){
	var result = false;
	if($('#'+id).find(".insuredNum").attr('data-value')=='-1'){
		result = false;
	}else{
		result = true;
	}
	return result;
}

/**
 * 将险种置为未选中状态
 * @param ids
 * @return
 */
function deleteCoverage(ids){
	$.each(ids,function(index,id){
		$("#" + id + " td:first-child img:first-child").hide();
		$("#" + id + " td:first-child img:nth-child(2)").show();
		$("#" + id + " .insuredNum").attr("data-value","-1").hide();
		$("#" + id + " .moneyNum").hide();
	});
}

/**
 * 将险种置为选中状态
 * @param ids
 * @return
 */
function chooseOnCoverage(ids){
	$.each(ids,function(index,id){
		$("#" + id + " td:first-child img:first-child").show();
		$("#" + id + " td:first-child img:nth-child(2)").hide();
		$("#" + id + " .insuredNum").attr("data-value","");
		$("#" + id + " .moneyNum").show();
	});
}

/**
 * 往obj里设置手续费、业务费、绩效、实际折扣率
 */
function setRateForObj(){
	//校验手续费、业务费、绩效
	if(!checkRate($("#shouxufei").val(),poudage,"手续费")){
		return false;
	}
	if(!checkRate($("#yewufei").val(),businessfee,"业务费")){
		return false;
	}
	if(!checkRate($("#jixiao").val(),performance,"绩效")){
		return false;
	}

	//校验实际折扣率
	if(!checkActualDiscount($("#shijzkl").val())){
		return false;
	}
	policy.baseInfo.poudage = $("#shouxufei").val()/100;//手续费
	policy.baseInfo.businessfee = $("#yewufei").val()/100;//业务费
	policy.baseInfo.performance = $("#jixiao").val()/100;//绩效
	policy.baseInfo.actualdiscuteRate = parseFloat($("#shijzkl").val());//实际折扣率
	return true;
}

/**
 * 校验手续费、业务费、绩效，只能向下修改(若初始值为空或者是0，则不做向下校验)、数字
 */
function checkRate(value,init_value,msg){
	var rate_xiaoshu = $.trim(value).split(".")[1];
	if(common.isNotNull(rate_xiaoshu)){
		if(rate_xiaoshu.length>2){
			cpic.alert("<span class='font08em'>"+msg+"最多只能输入2位小数</span>");
			return false;
		}
	}
	if(isNaN(value)){
		cpic.alert("<span class='font08em'>数字格式不正确，请输入正确的数字</span>");
		return false;
	}
	if(common.isNotNull(init_value)){
//		if(common.isNotNull(init_value) && init_value != 0.00 && init_value != .00){
		var _value = new Number(value);
		var _init_value = new Number(init_value);
		if(_value > _init_value){
			cpic.alert("<span class='font08em'>您输入的"+msg+"过大，不能大于"+init_value+"%</span>");
			return false;
		}
	}
	return true;
}

/**
 * 实际折扣率校验
 */
function checkActualDiscount(value){
	var val_number = new Number(value);
	if(val_number<0){
		cpic.alert("<span class='font08em'>实际折扣率不可为负数</span>");
		$("#shijzkl").val(actualdiscuteRate);
		return false;
	}
	if(isNaN(value)){
		cpic.alert("<span class='font08em'>实际折扣率输入不正确，请输入正确的实际折扣率</span>");
		$("#shijzkl").val(actualdiscuteRate);
		return false;
	}
	var xiaoshuLength = $.trim(value).split(".")[1];
	if(common.isNotNull(xiaoshuLength)){
		if(xiaoshuLength.length>6){
			cpic.alert("<span class='font08em'>实际折扣率最多只能输入6位小数</span>");
			return false;
		}
	}
	return true;
}

/**
 * 指定修理厂险
 */
function initAppointedRepairFactorySpecialClause(){
	$('#main').hide();
	$('#AppointedRepairFactorySpecialClauseInput').show();
	$("#floatBtn").hide();
	$("#preUnderWrite").hide();

	$("#domestic").unbind();
	$("#entrance").unbind();
	$("#AppointedRepairFactorySpecialClauseInputConfirm").unbind();
	$("#china-li").find('span').eq(0).unbind();
	$('#AppointedRepairFactorySpecialClauseInputBack').unbind();
	myScroll.refresh();

	var id;

	if(specialcarFlag)
		id="spe_036022_tr";
	else
		id="biz_036022_tr";

	var sumInsured = $('#'+id).find(".selectContent").text();
	var dataValue = $('#'+id).find(".insuredNum").attr("data-value");

	if(dataValue=='0'){

//		if(sumInsured!="不投保"){
//			$("#china-li").find('input').val(sumInsured);
//		}
//		else{
//			if(unitCode == '4030100'){
//				$"(#china-li").find('input').val('0.1');
//			}else{
//				$("#china-li").find('input').val('0.15');
//			}
//		}
		$("#china-li").find('span').eq(0).attr('class','select-yes2');
		$("#inlet-li").find('span').eq(0).attr('class','select-no2');
		$("#inlet-li").find('input').val('0.3');
		if(common.isNotNull(sumInsured) && !isNaN(sumInsured)){
			$("#china-li").find('input').val(sumInsured);
		}else{
			$("#china-li").find('input').val('0.15');
		}

	}else{
//		if(unitCode == '4030100' && dataValue == '-1'){
//			$("#china-li").find('span').eq(0).attr('class','select-yes2');
//			$("#china-li").find('input').val('0.1');
//			$("#inlet-li").find('span').eq(0).attr('class','select-no2');
//		}else{
//			$("#china-li").find('span').eq(0).attr('class','select-no2');
//			if(unitCode == '4030100'){
//				$("#china-li").find('input').val('0.1');
//			}else{
//				$("#china-li").find('input').val('0.15');
//			}
//			$("#inlet-li").find('span').eq(0).attr('class','select-yes2');
//		}

		$("#china-li").find('span').eq(0).attr('class','select-no2');
		$("#china-li").find('input').val('0.15');
		$("#inlet-li").find('span').eq(0).attr('class','select-yes2');
		if(common.isNotNull(sumInsured) && !isNaN(sumInsured)){
			$("#inlet-li").find('input').val(sumInsured);
		}else{
			$("#inlet-li").find('input').val('0.3');
		}
//		if(sumInsured!="不投保")
//			$("#inlet-li").find('input').val(sumInsured);
//		else
//			$("#inlet-li").find('input').val('0.3');
	}
	/*
	*甘肃分公司指定修理厂险规则
	* */
//	if(unitCode == '7020100'){
//		$("#china-li").find('input').attr("readonly","readonly").val('0.15');
//		$("#inlet-li").find('input').attr("readonly","readonly").val('0.3');
//	}
	$("#china-li").find('span').eq(0).bind("click",function(){
		if($(this).hasClass('select-no2')){
			$(this).removeClass('select-no2').addClass('select-yes2');
			$("#inlet-li").find('span').eq(0).removeClass('select-yes2').addClass('select-no2');
		}
	});

	$("#inlet-li").find('span').eq(0).bind("click",function(){
		if($(this).hasClass('select-no2')){
			$(this).removeClass('select-no2').addClass('select-yes2');
			$("#china-li").find('span').eq(0).removeClass('select-yes2').addClass('select-no2');
		}
	});
	//返回按钮
	$('#AppointedRepairFactorySpecialClauseInputBack').on('click',function(e){
		e.preventDefault();
		$('#main').show();
		$('#AppointedRepairFactorySpecialClauseInput').hide();
		$("#floatBtn").show();
		$("#preUnderWrite").show();
		myScroll.refresh();
	});

	//确定按钮
	$('#AppointedRepairFactorySpecialClauseInputConfirm').on('click',function(){

		cpic.ui.loading.open();

		//国产
		if($("#china-li").find("span").eq(0).hasClass("select-yes2")){
			//验证输入费率
			if(!checkAppointedRepairFactorySpecialClauseInputFL('0',$('#domestic').val())){
				return;
				cpic.ui.loading.close();
			}
		//进口
		}else{
			if(!checkAppointedRepairFactorySpecialClauseInputFL('1',$('#entrance').val())){
				return;
				cpic.ui.loading.close();
			}
		}

		var appoinSelectId = $("#AppointedRepairFactorySpecialClauseInput .select-yes2").parent().attr("id");
		if(appoinSelectId=='china-li'){
			$('#'+id).find(".selectContent").text($('#china-li').find('input').val());
			$('#'+id).find(".insuredNum").attr('data-value','0');
		}else{
			$('#'+id).find(".selectContent").text($('#inlet-li').find('input').val());
			$('#'+id).find(".insuredNum").attr('data-value','1');
		}

		$('#main').show();
		$('#AppointedRepairFactorySpecialClauseInput').hide();

		$('#'+id).find('.moneyNum').removeClass('line-through');
		cpic.ui.loading.close();

		$('#biz_036022_tr').find("td").eq(0).find("img").eq(0).show();
		$('#biz_036022_tr').find("td").eq(0).find("img").eq(1).hide();
		$('#biz_036022_tr').find(".moneyNum").show();
		$('#biz_036022_tr').find(".insuredNum").show();

		$("#floatBtn").show();
		$("#preUnderWrite").show();
		myScroll.refresh();
	});
}

/**
 * 修理期间补偿费用
 */
function initRepairPeriodCompensationSpecialClause(){
	$('#main').hide();
	$('#RepairPeriodCompensationSpecialClauseInput').show();

	$("#floatBtn").hide();
	$("#preUnderWrite").hide();

	myScroll.refresh();

	$('#RepairPeriodCompensationSpecialClauseInputBack').unbind();
	$('#RepairPeriodCompensationSpecialClauseInputConfirm').unbind();
	$("#RepairPeriodCompensationSpecialClauseJE").unbind();
	$("#RepairPeriodCompensationSpecialClauseTS").unbind();

	var id;

	if(specialcarFlag)
		id="spe_036009_tr";
	else
		id="biz_036009_tr";

	var dayCost = $('#'+id).find('.insuredNum').attr('dayCost');//金额
	var dayCount = $('#'+id).find('.insuredNum').attr('dayCount');//天数

	$("#RepairPeriodCompensationSpecialClauseJE").val(common.setDefaultValue(dayCost,''));//金额
	$("#RepairPeriodCompensationSpecialClauseTS").val(common.setDefaultValue(dayCount,''));//天数

	$("#RepairPeriodCompensationSpecialClauseJE").on('click',function(){
		var defaultVal = common.setDefaultValue($("#RepairPeriodCompensationSpecialClauseJE").val(),'100');
		var params = selectList[id];

		$(this).scratcher(params,defaultVal,function(result){
			$("#RepairPeriodCompensationSpecialClauseJE").val(result);
		});
	});

	$("#RepairPeriodCompensationSpecialClauseJE").on('change',function(){
		check_dayCost($(this).val());
	});
	$("#RepairPeriodCompensationSpecialClauseTS").on('change',function(){
		check_daycount($(this).val());
	})

	//返回按钮
	$('#RepairPeriodCompensationSpecialClauseInputBack').on('click',function(e){
		e.preventDefault();
		$('#main').show();
		$('#RepairPeriodCompensationSpecialClauseInput').hide();
		$("#floatBtn").show();
		$("#preUnderWrite").show();
		myScroll.refresh();
	});

	//确定按钮
	$('#RepairPeriodCompensationSpecialClauseInputConfirm').on('click',function(){
		cpic.ui.loading.open();

		dayCost = $("#RepairPeriodCompensationSpecialClauseJE").val();	//金额
		dayCount = $("#RepairPeriodCompensationSpecialClauseTS").val();	//天数

		if(!check_daycount(dayCount)){
			return;
		}
		if(!check_dayCost(dayCost)){
			return;
		}

		$('#'+id).find('.insuredNum').attr('dayCount',dayCount);
		$('#'+id).find('.insuredNum').attr('dayCost',dayCost);
		$('#'+id).find(".insuredNum").attr('data-value','0');
		$('#'+id).find('.selectContent').text(dayCount + '天 x ' + dayCost + '元');

		$('#main').show();
		$('#RepairPeriodCompensationSpecialClauseInput').hide();

		$('#'+id).find('.moneyNum').removeClass('line-through');
		$('#'+id).find(".insuredNum").attr('data-value','0');

		cpic.ui.loading.close();

		$('#biz_036009_tr').find("td").eq(0).find("img").eq(0).show();
		$('#biz_036009_tr').find("td").eq(0).find("img").eq(1).hide();
		$('#biz_036009_tr').find(".moneyNum").show();
		$('#biz_036009_tr').find(".insuredNum").show();

		$("#floatBtn").show();
		$("#preUnderWrite").show();
		myScroll.refresh();
	});

	//验证天数输入规则
	function check_daycount(_daycount){
		if(isNaN(_daycount)){
			cpic.alert("<span class='font08em'>天数必须得是数字</span>");
			cpic.ui.loading.close();
			return false;
		}
		if((/^\\d+$/.test(_daycount)) || (new Number(_daycount)<1||new Number(_daycount)>90)){
			cpic.alert("<span class='font08em'>天数需介于[1,90]之间</span>");
			$("#RepairPeriodCompensationSpecialClauseTS").val("");
			cpic.ui.loading.close();
			return false;
		}
		return true;
	}

	//验证金额输入规则
	function check_dayCost(_dayCost){
		if((/^\\d+$/.test(_dayCost)) || (new Number(_dayCost)<1 || new Number(_dayCost)>300)){
			cpic.alert("<span class='font08em'>金额需介于[1,300]之间</span>");
			$("#RepairPeriodCompensationSpecialClauseJE").val("");
			cpic.ui.loading.close();
			return false;
		}
		return true;
	}
}

/**
 * 初始化新增设备险信息
 */
function initNewEquipmentCoverage(){
	$('#newEQTable').html("");
	//设备购买时间
	$("#purchaseDate").val(common.formatDate(new Date(),"yyyy-MM-dd"));

	var id;

	if(specialcarFlag)
		id="spe_036008_tr";
	else
		id="biz_036008_tr";
	if(newEquipments){
		$.each(newEquipments,function(index,element){
			var html = "";
			element.purchaseDate = element.purchaseDate.split(' ')[0];
			html+="<tr data-value="+JSON.stringify(element)+"><td>"+element.deviceName+"</td><td>"+element.marketPrice+"</td><td onclick='removeThis(this)'><span class=\"icon-substra\"></span></td></tr>";
			$('#newEQTable').append(html);
		});
	}

	//$('#main').hide();
	$('#NewEquipmentCoverageInput').show();

	//$("#floatBtn").hide();
	//$("#preUnderWrite").hide();
	myScroll.refresh();
	myScroll5.refresh();
	$('#NewEquipmentCoverageInputBack').unbind();
	$('#NewEquipmentCoverageInputConfirm').unbind();
	$('#NewEquipmentCoverageInputAdd').unbind();
	$('#NewEquipmentCoverageDetailConfirm').unbind();
	$('#NewEquipmentCoverageDetailInputBack').unbind();
	$('#produceAreaSort').unbind();

	//添加按钮
	$('#NewEquipmentCoverageInputAdd').on('click',function(){

		if($('#newEQTable tr').length == 10){
			cpic.alert("<span class='font08em'>新增设备不能超过10条!</span>");
			return;
		}
		$('#NewEquipmentCoverageInput').hide();
		$('#NewEquipmentCoverageDetailInput').show();

		myScroll.refresh();
		$('#purchaseDate').unbind();

		$("#purchaseDate").scroller('destroy').scroller(
				$.extend({
					preset : 'date',
					dateOrder : 'yymmdd',
					maxDate: new Date(),
					theme : 'android-ics light',
					mode : 'scroller',
					lang : 'zh',
					minWidth : minWidth,  //用于时间控件占据屏幕整个宽度
					onSelect : function(result){
						$("#purchaseDate").val(result);
					}
				})
			);
		$("#purchaseDate").val(common.formatDate(new Date(),"yyyy-MM-dd"));
	});

	//设备列表页面的确定按钮
	$('#NewEquipmentCoverageInputConfirm').on('click',function(){




		marketPriceCount = $("#xzsbInsuer").val();
		if(marketPriceCount<=0 || marketPriceCount > 1000000){
			cpic.alert("<span class='font08em'>保额必须大于0并小于100万</span>");
			return false;
		}
		marketPriceCount = new Digital(marketPriceCount).format();

		$('#'+id).find('.selectContent').text(marketPriceCount);

		$('#'+id).find('.moneyNum').removeClass('line-through');
		$('#'+id).find(".insuredNum").attr('data-value','0');

		$('#'+id).find('.selectContent').click(function(){
			initNewEquipmentCoverage();
		})

		$('#biz_036008_tr').find("td").eq(0).find("img").eq(0).show();
		$('#biz_036008_tr').find("td").eq(0).find("img").eq(1).hide();
		$('#biz_036008_tr').find(".moneyNum").show();
		$('#biz_036008_tr').find(".insuredNum").show();
		$("#biz_036008_arrow").hide();
		$('#NewEquipmentCoverageInput').hide();

	//	$('#main').show();
		//$("#floatBtn").show();
	//	$("#preUnderWrite").show();

		myScroll.refresh();
	});

	//设备列表返回按钮
	$('#NewEquipmentCoverageInputBack').on('click',function(e){
		e.preventDefault();
		if($("#biz_036008_tr").find('.selectContent').parent().css('display') == 'none'){
			deleteCoverage(["biz_036033_tr"]);
		}
		$('#main').show();
		$('#NewEquipmentCoverageInput').hide();
		$("#floatBtn").show();
		$("#preUnderWrite").show();
		myScroll.refresh();
	});
	//设备录入页面的返回按钮
	$('#NewEquipmentCoverageDetailInputBack').on('click',function(e){
		e.preventDefault();
		$('#NewEquipmentCoverageInput').show();
		$('#NewEquipmentCoverageDetailInput').hide();
	});
	//产地点击事件
	$('#produceAreaSort').on("click",function(){
		var defaultVal = common.isNull($('#produceAreaSort').val())?'国产':$('#produceAreaSort').val();

		Config.common_click(c.DICTData["produceAreaSort"],defaultVal,function(data){
			if (data.code) {
				$('#produceAreaSort').val(data.codeName);
				$('#produceAreaSort').attr('data-value',data.code);
				$('#NewEquipmentCoverageDetailInput').show();
			}
		});
	});

	//详细页面确定按钮
	$('#NewEquipmentCoverageDetailConfirm').on('click',function(){
		var deviceName = $('#deviceName').val();
		var produceAreaSort = $('#produceAreaSort').attr('data-value');
		var deviceBrand = $('#deviceBrand').val();
		var purchaseAmount = $('#purchaseAmount').val();
		var marketPrice = purchaseAmount;
		var purchaseDate = $('#purchaseDate').val();
		var remark = $('#remark').val();
		var temp={"deviceName":deviceName
				,"produceAreaSort":produceAreaSort
				,"deviceBrand":deviceBrand
				,"purchaseAmount":purchaseAmount
				,"marketPrice":marketPrice
				,"purchaseDate":purchaseDate
				,"remark":remark
				};
		if(deviceName==''){
			cpic.alert("<span class='font08em'>设备名称不能为空</span>");
			return false;
		}
		if($.isEmptyObject(produceAreaSort)||produceAreaSort==''){
			cpic.alert("<span class='font08em'>产地不能为空</span>");
			return false;
		}

		if(common.isNull(purchaseAmount)){
			cpic.alert("<span class='font08em'>实际价值不能为空</span>");
			return false;
		}

		if(!(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(purchaseAmount.trim()))){
			cpic.alert("<span class='font08em'>实际价值数字格式不正确</span>");
			return false;
		}
		var tmpValue=parseFloat(purchaseAmount.trim());
		if(tmpValue<=0){
			cpic.alert("<span class='font08em'>实际价值必须大于0</span>");
			return false;
		}
		if(!(/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(purchaseDate))){
			cpic.alert("<span class='font08em'>设备购买时间不能为空</span>");
			return false;
		}

		var html = "";
		html+="<tr data-value="+JSON.stringify(temp)+"><td>"+deviceName+"</td><td>"+marketPrice+"</td><td onclick='removeThis(this)'><span class=\"icon-substra\"></span></td></tr>";

		$('#newEQTable').append(html);
		//点击确定侯清空录入项
		$('#deviceName').val('');
		$('#produceAreaSort').val('');
		$('#produceAreaSort').attr('data-value','');
		$('#deviceBrand').val('');
		$('#purchaseAmount').val('');
		$('#purchaseDate').val('');
		$('#remark').val('');

		$('#NewEquipmentCoverageInput').show();
		$('#NewEquipmentCoverageDetailInput').hide();
		myScroll5.refresh();
	});
	//预核保绑定事件
	$('#preUnderWrite').bind('singleTap', function(){

		// 判断保险权益人信息是否完善
		if (common.isNull(policy.applicant.name) || common.isNull(policy.applicant.certCode) || common.isNull(policy.applicant.tel) || common.isNull(policy.applicant.address)) {
			cpic.alert("请完善保险权益人页面信息！");
			return;
		}

		cpic.ui.loading.open();
		Interface.autoUnderwriting(JSON.stringify(policy),function(result){
			cpic.ui.loading.close();
				var bzPass = '2'== result.bzUwResultCode;   //'2'表示核保通过 ''为默认状态 表示没有投保该险种
				var tcPass = '2'== result.tcUwResultCode;
			if(($.isEmptyObject(result.policy.tcCoverages) ||tcPass)&&($.isEmptyObject(result.policy.bzCoverages) ||bzPass))
			cpic.alert("<span class='font08em'>预核保通过</span>");
			else
				{
				var str = "<span class='font08em'>预核保不通过<br/></span>";
				if('2'!=result.tcUwResultCode&&''!=result.tcUwResultCode)
				str+="<span class='font08em'>"+result.tcUwResultText+"<br/></span>";
				if('2'!=result.bzUwResultCode&&''!=result.bzUwResultCode)
				str+="<span class='font08em'>"+result.bzUwResultText+"</span>"
				cpic.alert(str,{title:"预核保提示"});
				}
		});
		}
		);
}

/**
 * 验证车辆损失险的录入保额
 */
function checkDamageLossCoverage_sumInsured(){
	var DamageLossCoverage_sumInsured = null;
	if(C.isNewCarReform(unitCode)){
		if(specialcarFlag){
			DamageLossCoverage_sumInsured = $("#spe_036001_sumInsured");
		}else{
			DamageLossCoverage_sumInsured = $("#biz_036001_sumInsured");
		}
	}else{
		DamageLossCoverage_sumInsured = $("#biz_036001_sumInsured");
	}
	DamageLossCoverage_sumInsured_val = DamageLossCoverage_sumInsured.val().replace(/\,/g,'');
	// 保额不得高于实际价值且不得低于新车购置价的20%
	var purchasePrice = policy.vehInfo.purchasePrice;
	if (DamageLossCoverage_sumInsured_val > purchasePrice ) {
		if(specialcarFlag){
			$("#spe_036001_sumInsured").val(new Digital(purchasePrice).format());
		}else{
			$("#biz_036001_sumInsured").val();
		}

		cpic.alert("<span class='font08em'>车辆损失险的保额不得高于新车购置价且不得低于新车购置价的20%</span>");
		cpic.ui.loading.close();
		return false;
	}else if( DamageLossCoverage_sumInsured_val < purchasePrice * 0.2){
		if(specialcarFlag){
			$("#spe_036001_sumInsured").val(new Digital(purchasePrice*0.2).format());
		}else{
			$("#biz_036001_sumInsured").val();
		}
		cpic.alert("<span class='font08em'>车辆损失险的保额不得高于新车购置价且不得低于新车购置价的20%</span>");
		cpic.ui.loading.close();
		return false;
	}
	return true;
}

function bindMoneyInput(){
	$(".money-input").unbind();

	/**
	 * 给所有的输入数字的money-input样式赋予点击事件
	 */
	$('.money-input').bind("focus",function(){
		rebuildPolicyCoverageFlag = false;
		var val = $(this).val();
		if(common.isNotNull(val)&&!(isNaN(val.replace(/,/g,''))))
			$(this).val(Number($(this).val().replace(/,/g,'')));
	});
	$('.money-input').bind("blur",function(){
		var val = $(this).val();
		if(common.isNotNull(val)&&!(isNaN(val)))
			$(this).val(new Digital(val).format(0));

		if($(this).attr("id")=="biz_036001_sumInsured"
			||$(this).attr("id")=="spe_036001_sumInsured"){
			if(!checkDamageLossCoverage_sumInsured($(this).attr("id"),$(this).val().replace(/,/g,''))){
				$(this).blur();
				return;
			}
		}else if($(this).attr("id")=="biz_036007_sumInsured"
			||$(this).attr("id")=="spe_036007_sumInsured"){
			if(!checkSelfIgniteCoverage_sumInsured($(this).attr("id"),$(this).val().replace(/,/g,''))){
				$(this).blur();
				return;
			}
//		}else if($(this).attr("id")=="GoodsAccompaniedLiabilityCoverage_sumInsured"
//			||$(this).attr("id")=="UseLifeBeltSpecialClause_sumInsured"){
//			if(!checkGoodsAndUseLifeInput($(this).attr("id"),$(this).val().replace(/,/g,''))){
//				$(this).blur();
//				return;
//			}
		}else if($(this).attr("id")=="biz_036002_sumInsured"||$(this).attr("id")=="spe_036002_sumInsured"){
			if(!checkTheftCoverage_sumInsured()){
				$(this).blur();
				return;
			}
		}else if($(this).attr("id")=="biz_036012_sumInsured"){
			if(!checkPaddleDamageCoverage_sumInsured()){
				$(this).blur();
				return;
			}
		}
		$(this).blur();
	});
}

//车损绝对免赔额选择
function initDamageLossCoverageClause(){
	if($("#DamageLossCoverage_tr").next().attr("id") != "DamageCarDeductibles_tr"){
		var html = "<tr id=\"DamageCarDeductibles_tr\" class=\"mianpei\"><td></td><td>车损绝对免赔额</td>" +
		"<td class=\"td-right middle\"><span id=\"DamageCarDeductibles_sumInsured\" class=\"insuredNum\"><span class=\"selectContent\"></span><span id=\"damageCardeductibles\">0</span></span>" +
		"<span class=\"table-arrow-down-orange\"></span></td></tr>";
	$("#DamageLossCoverage_tr").after(html);

	$("#DamageCarDeductibles_tr").bind("click",function(){
		var params = ["0","300","500","1000","2000"];
		var defaultVal = $("#damageCardeductibles").html();
		$("#DamageCarDeductibles_sumInsured").scratcher(params,defaultVal,function(result){
			$("#damageCardeductibles").html(result);
			policy.bzCoverages.DamageLossCoverage.damageCardeductibles = parseInt($("#damageCardeductibles").html().replace(/,/g,''));
			common.setLocalStorage(Interface.ss.policy,policy,true);
		},function(result){});
	});
	}else{
		return;
	}
}

//检测司机、乘客险，当司机和乘客都选时，对应的2个不计免赔不能单独选，要选必须同时选
function checkDriverAndPassage(){
	if(specialcarFlag){
		if(common.isNotNull(policy.cvrg_list_biz.spe_036003) && common.isNotNull(policy.cvrg_list_biz.spe_036004)){
			if((common.isNull(policy.cvrg_list_biz.spe_036016) && common.isNotNull(policy.cvrg_list_biz.spe_036017)) ||
				(common.isNotNull(policy.cvrg_list_biz.spe_036016) && common.isNull(policy.cvrg_list_biz.spe_036017))){
				cpic.alert("<span class='font08em'>当选择车上司机责任险和车上乘客责任险时，车上司机责任险不计免赔率和车上乘客责任险不计免赔率必须同时选择或不选择</span>");
				return false;
			}
		}
	}else{
		if(common.isNotNull(policy.cvrg_list_biz.biz_036003) && common.isNotNull(policy.cvrg_list_biz.biz_036004)){
			if((common.isNull(policy.cvrg_list_biz.biz_036016) && common.isNotNull(policy.cvrg_list_biz.biz_036017)) ||
				(common.isNotNull(policy.cvrg_list_biz_036016) && common.isNull(policy.cvrg_list_biz.biz_036017))){
				cpic.alert("<span class='font08em'>当选择车上司机责任险和车上乘客责任险时，车上司机责任险不计免赔率和车上乘客责任险不计免赔率必须同时选择或不选择</span>");
				return false;
			}
		}
	}
	return true;
}

/**
 * 删除设备时调用   直接删除行
 */
function removeThis(newEquipment){
	$(newEquipment).parent().remove();
}

function alertLoseCoverage(kind){
	var tempCoverageList;
	if(!specialcarFlag)  //如何不是特殊车险
		tempCoverageList = bzCoverage;
	else
		tempCoverageList = specialcarBzCoverage;

	cpic.alert("请先选择"+tempCoverageList[kind].name);
}

/**
 * 校验所有input标签
 * @param type
 * @return
 */
function checkAllInput(type){
	var inputList = $("#coverageListHtml").find("input").add($("#moreInfoHtml").find("input"));
	var return_flag = true;
	$.each(inputList,function(index,element){
		if($(element).css("display")=="none")
			return true;
		var id = $(element).attr("id");
		return_flag = checkInput(id,type);
		if(!return_flag)
			return false;
	});

	return return_flag;
}

function checkInput(id,type){
	var return_flag = true;
	return return_flag;
}

//initCoverageHtml()
