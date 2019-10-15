var jiaoqiangSum = 0;
var shangyeSum = 0;
var n_agg_tax_t = 0;
var token;
var orderNumber; //订单编号
var plateNo; //车牌号
var state; //订单状态
var photesharepolicy = '';
var defseat; //座位数
var deftonge; //载质量

var bzCoverage = {

	'biz_036006': {
		'name': '玻璃单碎险',
		'entry': '1',
		'defaultSumInsured': '国产玻璃',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036009": {
		'name': '修理补偿险',
		'entry': '3',
		'defaultSumInsured': '100',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036022": {
		'name': '指定修理险',
		'entry': '3',
		'defaultSumInsured': '0',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036024": {
		'name': '无法找到第三方险',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036034": {
		'name': '钥匙丢失险',
		'entry': '1',
		'defaultSumInsured': '1,000',
		'showFlag': 'false',
		'importFlag': 'false'
	},

	"biz_036012": {
		'name': '涉水损失险',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036025": {
		'name': '涉水损失险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},

	'biz_036001': {
		'name': '车辆损失险',
		'entry': '0',
		'defaultSumInsured': '',
		'showFlag': 'true',
		'importFlag': 'true',
		'child_id': 'DamageCarDeductibles',
		'child_name': '车损绝对免赔额',
		'child_defaultSumInsured': '300',
		'child_entry': '3'
	},
	"biz_036014": {
		'name': '车辆损失险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'true',
		'importFlag': 'false'
	},

	"biz_036008": {
		'name': '新增设备险',
		'entry': '3',
		'defaultSumInsured': '0',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036033": {
		'name': '新增设备险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},

	"biz_036007": {
		'name': '自燃损失险',
		'entry': '0',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036019": {
		'name': '自燃损失险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},

	"biz_036013": {
		'name': '车身划痕险',
		'entry': '1',
		'defaultSumInsured': '2,000',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036023": {
		'name': '车身划痕险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},

	'biz_036002': {
		'name': '三者责任险',
		'entry': '1',
		'defaultSumInsured': '50,000',
		'showFlag': 'true',
		'importFlag': 'true'
	},
	"biz_036015": {
		'name': '三者责任险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'true',
		'importFlag': 'false'
	},

	"biz_036011": {
		'name': '精神损害险不计免赔',
		'entry': '1',
		'defaultSumInsured': '10,000',
		'showFlag': 'false',
		'importFlag': 'false'
	},
	"biz_036020": {
		'name': '精神损害险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},


	'biz_036003': {
		'name': '司机责任险',
		'entry': '1',
		'defaultSumInsured': '10,000',
		'showFlag': 'true',
		'importFlag': 'true'
	},
	"biz_036016": {
		'name': '司机责任险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},

	'biz_036004': {
		'name': '乘客责任险',
		'entry': '3',
		'defaultSumInsured': '10,000',
		'showFlag': 'true',
		'importFlag': 'true'
	},
	"biz_036017": {
		'name': '乘客责任险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'false',
		'importFlag': 'false'
	},

	'biz_036005': {
		'name': '全车盗抢险',
		'entry': '0',
		'defaultSumInsured': '',
		'showFlag': 'true',
		'importFlag': 'true'
	},
	"biz_036018": {
		'name': '全车盗抢险不计免赔',
		'entry': '2',
		'defaultSumInsured': '',
		'showFlag': 'true',
		'importFlag': 'false'
	},
	"biz_036038": {
        'name': '法定假日三者险',
        'entry': '2',
        'defaultSumInsured': '',
        'showFlag': 'false',
        'importFlag': 'false'
    }	

	// "biz_036037" : {'name':'机动车油污责任险' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	// "biz_036010" : {'name':'车上货物责任险' , 'entry':'0', 'defaultSumInsured':'0', 'showFlag':'false', 'importFlag':'false'},
	// "biz_036021" : {'name':'(车上货物责任险)不计免赔率' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
	// "biz_036035" : {'name':'机动车第三者责任可选自负额特约险' , 'entry':'2', 'defaultSumInsured':'', 'showFlag':'false', 'importFlag':'false'},
}

$(function() {

	userInfo = common.getLocalStorage(Interface.ss.userInfo, true); //获取本地存储的登陆人信息
	token = userInfo.userToken; //token用来判断登陆是否过期
	initPages();
	bindEvent();
});

//获取URL中传送的值
var myutil = {
	GetQueryString: function(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) return decodeURI(r[2]);
		return null;
	}
};


function initPages() {
	orderNumber = myutil.GetQueryString("orderNumber"); //订单号
	plateNo = myutil.GetQueryString("plateNo");; //车牌号
	$("#plateNo").html(plateNo);
	state = myutil.GetQueryString("state");; //状态
	if (state == "70") { //已评价
		//$("#submit").hide();
		$("#backAllOrder").show();
	} else { //未评价
		$("#submit").show();
		//$("#backAllOrder").hide();
	}

	var objModel = {
		init: function() {
			this.bindEvent();
			this.save();
		},
		bindEvent: function() {
			$('header .home').on('singleTap', this.home);
			$('header .back').on('singleTap', this.back);
		},
		submit: function(orderNumber) {
			var param = {
				"requestObject": {
					"cOrderNo": orderNumber
				}
			};

			Interface.queryQuotation(token, param, function(data) {
				var html_tc = "";
				var html_biz = "";
				var jiaoqiang = data.tpfMap;
				var shangye = data.bizMap;

				//交强险
				if (common.isNotNull(jiaoqiang)) {
					if (jiaoqiang.resultCode != '0000') {
						cpic.Prompt(jiaoqiang.message);
						return;
					}
					var respBodyObject_tc = jiaoqiang.respBodyObject; //交强险
					var basePart_tc = respBodyObject_tc.basePart; //基础部分（BASE_PART）
					var cvrgInfo_tc = respBodyObject_tc.cvrgInfo; //险别<CVRG_LIST>

					//品牌型号
					var vhlinfo = respBodyObject_tc.vhlinfo;
					var brandName = vhlinfo.c_vehicle_brand + vhlinfo.c_vehicle_model;
					$("#brandName").html(brandName);

					var tcStartTime_ = basePart_tc.t_insrnc_bgn_tm;
					var tcEndTime_ = basePart_tc.t_insrnc_end_tm;

					$("#tcStartTime").val(tcStartTime_.substr(0, tcStartTime_.length - 3)); //保险起期
					$("#tcEndTime").val(tcEndTime_.substr(0, tcEndTime_.length - 3)); //保险止期
					var taxPrmInfo_t = respBodyObject_tc.taxPrmInfo; //交强相关信息列表<TAX_PRM_INFO>
					n_agg_tax_t = Number(taxPrmInfo_t.n_agg_tax); //税款合计
					html_tc += '<tr><td class="th-right">' + '车船税' + '</td><td class="th-right" style="padding-right:4%;">' + '正常纳税' + '</td><td class="th-right" style="padding-right: 3%;">' + n_agg_tax_t + '</td></tr>';

					for (var i = 0; i < cvrgInfo_tc.length; i++) {
						var c_cvrg_no = cvrgInfo_tc[i].c_cvrg_no; //险别
						var c_cvrg_name = (c_cvrg_no == "033201") ? "交强险" : c_cvrg_no;
						var n_amt = Number(cvrgInfo_tc[i].n_amt) == '0' ? "" : Number(cvrgInfo_tc[i].n_amt).toFixed(); //保额
						var n_prm = cvrgInfo_tc[i].n_prm; //应缴保费
						html_tc += '<tr><td class="th-right">' + c_cvrg_name + '</td><td class="th-right" style="padding-right:4%;">' + n_amt + '</td><td class="th-right" style="padding-right: 3%;">' + n_prm + '</td></tr>';
						jiaoqiangSum += Number(n_prm);
					}
					$("#toubaoInfo").append(html_tc);
					$("#tcPremium").html(jiaoqiangSum.toFixed(2)); //交强险合计金额
					$("#vsltax").html(n_agg_tax_t.toFixed(2)); //车船税合计金额
				} else {
					$("#tcTime").hide();
					$("#jq").hide();
					$("#ccs").hide();
				}

				//商业险
				if (common.isNotNull(shangye)) {
					if (shangye.resultCode != '0000') {
						cpic.Prompt(shangye.message);
						return;
					}
					var respBodyObject_bz = shangye.respBodyObject; //商业险
					var basePart_bz = respBodyObject_bz.basePart; //基础部分（BASE_PART）
					var cvrgInfo_bz = respBodyObject_bz.cvrgInfo; //险别<CVRG_LIST>
					//品牌型号
					var vhlinfo = respBodyObject_bz.vhlinfo;
					var brandName = vhlinfo.c_vehicle_brand + vhlinfo.c_vehicle_model;
					$("#brandName").html(brandName);

					var bzStartTime_ = basePart_bz.t_insrnc_bgn_tm;
					var bzEndTime_ = basePart_bz.t_insrnc_end_tm
					$("#bzStartTime").val(bzStartTime_.substr(0, bzStartTime_.length - 3)); //保险起期
					$("#bzEndTime").val(bzEndTime_.substr(0, bzEndTime_.length - 3)); //保险止期

					for (var i = 0; i < cvrgInfo_bz.length; i++) {
						var c_cvrg_no = cvrgInfo_bz[i].c_cvrg_no; //险别
						var c_cvrg_name = eval('bzCoverage.biz_' + c_cvrg_no + ".name"); //险别名称
						var n_amt = Number(cvrgInfo_bz[i].n_amt) == '0' ? "" : Number(cvrgInfo_bz[i].n_amt).toFixed(); //保额
                        var n_amta;
                        var insured;
                        var nAmtCut;
                        var impairment;
                        var scratchBody;
                        var keyLost;
						//三者责任险:shanzx20170905
						if (common.isNotNull(c_cvrg_no)) {

							if (c_cvrg_no == "036002") {
								if (n_amt == "50000") {
									n_amta = "5万";
								} else if (n_amt == "100000") {
									n_amta = "10万";
								} else if (n_amt == "150000") {
									n_amta = "15万";
								} else if (n_amt == "200000") {
									n_amta = "20万";
								} else if (n_amt == "300000") {
									n_amta = "30万";
								} else if (n_amt == "500000") {
									n_amta = "50万";
								} else if (n_amt == "1000000") {
									n_amta= "100万";
								} else if (n_amt == "1500000") {
									n_amta = "150万";
								} else if (n_amt == "2000000") {
									n_amta = "200万";
								}
							}


							//司机责任险:shanzx20170911
							//"biz_036003_tr":["1万","2万","3万","4万","5万","8万","10万","15万","20万","30万","40万","50万","100万"],
							if (c_cvrg_no == "036003") {
								if (n_amt == "10000") {
									insured = "1万";
								} else if (n_amt == "20000") {
									insured = "2万";

								}  else if (n_amt == "5000") {
									insured = "5千";

								} else if (n_amt == "30000") {
									insured = "3万";

								} else if (n_amt == "40000") {
									insured = "4万";

								} else if (n_amt == "50000") {
									insured = "5万";

								} else if (n_amt == "80000") {
									insured = "8万";

								} else if (n_amt == "100000") {
									insured = "10万";
								} else if (n_amt == "150000") {
									insured = "15万";
								} else if (n_amt == "300000") {
									insured = "30万";
								} else if (n_amt == "400000") {
									insured = "40万";
								} else if (n_amt == "500000") {
									insured = "50万";
								} else if (n_amt == "1000000") {
									insured = "100万";
								}else{
                                    insured = n_amt;
                                }
							}

							//精神损害险:shanzx20170911
							if (c_cvrg_no == "036011") {
								if (n_amt == "10000") {
									nAmtCut = "1万";
								} else if (n_amt == "20000") {
									nAmtCut = "2万";
								} else if (n_amt == "30000") {
									nAmtCut = "3万";
								} else if (n_amt == "40000") {
									nAmtCut = "4万";
								} else if (n_amt == "50000") {
									nAmtCut = "5万";
								} else if (n_amt == "100000") {
									nAmtCut = "10万";
								}
							}

							//乘客责任险:shanzx20170911
							if (c_cvrg_no == "036004") {
								if (n_amt == "10000") {
									 impairment= "1万";
								} else if (n_amt == "20000") {
									impairment = "2万";

								}  else if (n_amt == "5000") {
									impairment = "5千";

								} else if (n_amt == "30000") {
									impairment = "3万";

								} else if (n_amt == "40000") {
									impairment = "4万";

								} else if (n_amt == "50000") {
									impairment = "5万";

								} else if (n_amt == "80000") {
									impairment = "8万";

								} else if (n_amt == "100000") {
									impairment = "10万";
								} else if (n_amt == "150000") {
									impairment = "15万";
								} else if (n_amt == "300000") {
									impairment = "30万";
								} else if (n_amt == "400000") {
									impairment = "40万";
								} else if (n_amt == "500000") {
									impairment = "50万";
								} else if (n_amt == "1000000") {
									impairment = "100万";
								}else{
                                    impairment = n_amt;
                                }
							}


                                        //钥匙丢失险:shanzx20170928
                            if(c_cvrg_no == "036034"){
                                 if(n_amt == "1000"){
                                    keyLost = "1千";
                                }else if(n_amt == "2000"){
                                    keyLost = "2千";
                                }else if(n_amt == "3000"){
                                    keyLost = "3千";
                                }else if(n_amt == "5000"){
                                    keyLost = "5千";
                                }
                            }


                        //车身划痕险:shanzx20170928// ["2千","5千","1万","2万"],
                        if(c_cvrg_no == "036013"){
                             if(n_amt == "2000"){
                                scratchBody = "2千";
                            }else if(n_amt == "5000"){
                                scratchBody = "5千";
                            }else if(n_amt == "10000"){
                                scratchBody = "1万";
                            }else if(n_amt == "20000"){
                                scratchBody = "2万";
                            }
                        }
						}


						// 司机责任险和精神损害险shanzx20170911
						var n_prm = cvrgInfo_bz[i].n_prm; //应缴保费
						if(c_cvrg_no == "036003" || c_cvrg_no == "036011" || c_cvrg_no == "036004"||c_cvrg_no == "036002"||c_cvrg_no == "036034"||c_cvrg_no == "036013"){
							if (c_cvrg_no == "036003"){
							html_biz += '<tr style="font-size:15px;"><td class="th-right">' + c_cvrg_name + '</td><td class="th-right" style="padding-right:4%;">' +insured  + '</td><td class="th-right" style="padding-right: 3%;">' + n_prm + '</td></tr>';
						}
						if (c_cvrg_no == "036011") {
							html_biz += '<tr style="font-size:15px;"><td class="th-right">' + c_cvrg_name + '</td><td class="th-right" style="padding-right:4%;">' + nAmtCut + '</td><td class="th-right" style="padding-right: 3%;">' + n_prm + '</td></tr>';
						}
                        if (c_cvrg_no == "036004") {
                            html_biz += '<tr style="font-size:15px;"><td class="th-right">' + c_cvrg_name + '</td><td class="th-right" style="padding-right:4%;">' + impairment + '</td><td class="th-right" style="padding-right: 3%;">' + n_prm + '</td></tr>';
                        }
                        if (c_cvrg_no == "036002") {
                            html_biz += '<tr style="font-size:15px;"><td class="th-right">' + c_cvrg_name + '</td><td class="th-right" style="padding-right:4%;">' + n_amta + '</td><td class="th-right" style="padding-right: 3%;">' + n_prm + '</td></tr>';
                        }
                        if (c_cvrg_no == "036034") {
                            html_biz += '<tr style="font-size:15px;"><td class="th-right">' + c_cvrg_name + '</td><td class="th-right" style="padding-right:4%;">' + keyLost + '</td><td class="th-right" style="padding-right: 3%;">' + n_prm + '</td></tr>';
                        }
                        if (c_cvrg_no == "036013") {
							html_biz += '<tr style="font-size:15px;"><td class="th-right">' + c_cvrg_name + '</td><td class="th-right" style="padding-right:4%;">' + scratchBody + '</td><td class="th-right" style="padding-right: 3%;">' + n_prm + '</td></tr>';
						}

					}else{
						html_biz += '<tr style="font-size:15px;"><td class="th-right">' + c_cvrg_name + '</td><td class="th-right" style="padding-right:4%;">' + n_amt + '</td><td class="th-right" style="padding-right: 3%;">' + n_prm + '</td></tr>';
					}


						shangyeSum += Number(n_prm)
					}
					$("#toubaoInfo").append(html_biz);
					$("#bzPremium").html(shangyeSum.toFixed(2)); //商业险合计金额
				} else {
					$("#bzTime").hide();
					$("#sy").hide();
				}


				//大保单对象
				var rePolicyObj = data.listBiz[0];
				//将核心返回的座位数和载质量放入缓存；
				defseat = rePolicyObj.vhl_info.n_limit_load_person;
				deftonge = rePolicyObj.vhl_info.n_tonage;

				if (common.isNotNull(rePolicyObj)) {

					// var rePolicyObj = eval('(' + rePolicyObj_ + ')');
					common.setLocalStorage(Interface.ss.policy, rePolicyObj, true);

					/*var orderInfos = common.getLocalStorage(Interface.ss.orderInfos,true);
					if(common.isNotNull(orderInfos)){
						orderInfos.c_OrderNo = cOrderNo;
						common.setLocalStorage(Interface.ss.orderInfos,orderInfos,true);
					}*/

				} else {
					cpic.alert('该订单暂存信息异常');
				}

				var mapCNewBsnsTyp = data.mapCNewBsnsTyp;
				if (common.isNotNull(mapCNewBsnsTyp)) {
					photoBusiSet = {

						"c_dpt_cde": mapCNewBsnsTyp.c_dpt_cde, //出单机构
						"c_dpt_name": mapCNewBsnsTyp.c_dpt_name,

						"sin_channel_nam": mapCNewBsnsTyp.sin_channel_nam, //渠道类型
						"sin_channel_name": mapCNewBsnsTyp.sin_channel_name,

						"c_bsns_typ": mapCNewBsnsTyp.c_bsns_typ, //业务来源
						"c_bsns_typ_name": mapCNewBsnsTyp.c_bsns_typ_name,

						"c_service_code": mapCNewBsnsTyp.c_service_code, //服务代码
						"c_service_name": mapCNewBsnsTyp.c_service_name,

						"c_agency_cde": mapCNewBsnsTyp.c_agency_cde, //代理点代码
						"c_agency_name": mapCNewBsnsTyp.c_agency_name, //代理点名称
						"agreenCode": mapCNewBsnsTyp.c_agt_agr_no, //代理点协议号
						"c_sale_nme": mapCNewBsnsTyp.c_sale_nme, //销售人员名称 made zfy
					}
					common.setLocalStorage(Interface.ss.photoBusiSet, photoBusiSet, true);
				}

				var showPremium = (jiaoqiangSum + n_agg_tax_t + shangyeSum).toFixed(2)
				$("#totalPremium").html(showPremium);
				setTimeout(function() {
					myScroll.refresh();
				}, 300);

			});
			//modify by sc 20170603 拍照报价分享
			Interface.querySharePolicy(token, param, function(shawPolicy) {
				photesharepolicy = shawPolicy.listBiz[0];
			});

		},
		save: function(orderNumber) {
			this.submit(orderNumber);
		},
		back: function() {
			history.go(-1);
		},
		home: function() {
			location.href = '../tool/tools.html';
		}
	};
	objModel.save(orderNumber); //交强险标记
}

/**
 * 根据险别显示对应险种
 */
function getC_cvrg_name(c_cvrg_no) {
	var c_cvrg_name = "";
	if (c_cvrg_no == '033201') {
		c_cvrg_name = '';
	} else if (c_cvrg_no == '033201') {
		c_cvrg_name = '';
	}
}

function bindEvent() {
	/**
	 * 调用插件显示更多
	 */
	$('.more').menuNav({
		showObj: '.moreList',
	});

	$("#upBind").bind("click", function() {
		var showPremium_a = $("#showPremium").attr('a');
		if (showPremium_a == '1') {
			$("#showPremium").css('background', 'url(../../images/icon-open.png) no-repeat right center');
			$("#showPremium").css('background-size', '1em');
			//标示向下箭头
			$("#showPremium").attr('a', '0');
			$("#premiumInfo").hide();
			//myScroll.refresh();
		} else {
			$("#showPremium").css('background', 'url(../../images/icon-close.png) no-repeat right center');
			$("#showPremium").css('background-size', '1em');
			//标示向上箭头
			$("#showPremium").attr('a', '1');
			$("#premiumInfo").show();
			myScroll.refresh();
			//myScroll.scrollToElement("#premiumInfo");
		}
	});

	$('#submit').on("click", function() {
		Interface.queryByOrderNo(token, orderNumber, function(data) {
			if (data && data.resultCode == '0000') { //0000成功
				var responseObject = data.responseObject;
				if (responseObject.state == '60') { //(20.未接单 40.已接单 60.已报价 70.已评价 80.报价退回)
					window.location.href = "../cameraQuote/comments.html?receiveCode=" + responseObject.orderTaskCode + "&receiveName=" + responseObject.orderTaskName + "&orderNumber=" + orderNumber + "&plateNo=" + plateNo + "&state=" + responseObject.state;
				}
			} else { //1失败
				var jsonStr = JSON.stringify(data);
				console.log(jsonStr);
				console.log("调用异常");
			}
		});
	});


	$('#backAllOrder').on("click", function() {
		//history.go(-1);
		window.location.href = '../AllpolicyOrder/allOrder.html';
	});

	function getNextYear(inDateStr) {
		var inDate = new Date(inDateStr.replace(/-/g, '/')); // 将传入的字符串转换为时间类型
		var y1 = inDate.getFullYear() + 1;
		var retDate = new Date(inDate.setFullYear(y1));
		return new Date(retDate.setSeconds(retDate.getSeconds() - 1));
	}

	//短期单设置下一年 商业
	function setNextYear_biz() {
		var rePolicyObj = common.getLocalStorage(Interface.ss.policy, true);
		var t_insrnc_bgn_tm_biz = rePolicyObj.base_part.t_insrnc_bgn_tm_biz;
		if (common.isNotNull(t_insrnc_bgn_tm_biz)) {
			var t_insrnc_end_tm_biz = getNextYear(t_insrnc_bgn_tm_biz).format("yyyy-MM-dd 23:59:59").substring(0, 19)
			rePolicyObj.base_part.t_insrnc_end_tm_biz = t_insrnc_end_tm_biz;
		}
		common.setLocalStorage(Interface.ss.policy, rePolicyObj, true);
	}

	//短期单设置下一年 交强
	function setNextYear_tpf() {
		var rePolicyObj = common.getLocalStorage(Interface.ss.policy, true);
		var t_insrnc_bgn_tm_tpf = rePolicyObj.base_part.t_insrnc_bgn_tm_tpf;
		if (common.isNotNull(t_insrnc_bgn_tm_tpf)) {
			var t_insrnc_end_tm_tpf = getNextYear(t_insrnc_bgn_tm_tpf).format("yyyy-MM-dd 23:59:59").substring(0, 19)
			rePolicyObj.base_part.t_insrnc_end_tm_tpf = t_insrnc_end_tm_tpf;
		}
		common.setLocalStorage(Interface.ss.policy, rePolicyObj, true);
	}


	$('#promptlyInsure').on("click", function() {
		//拍照报价进来，将cicdiffobj存入缓存中；如果有值就将里面的值变成拍照报价返回的值，如果没有值，也是变成拍照报价返回的值；
		var cicDiffObj = common.getLocalStorage('cicDiffObj', true);


		if (cicDiffObj) {
			cicDiffObj.vhl_info.defseat = defseat;
			cicDiffObj.vhl_info.deftonge = deftonge;

			common.setLocalStorage("cicDiffObj", cicDiffObj, true);

		} else {

			cicDiffObj = {
				"vhl_info": {
					"defseat": defseat,
					"deftonge": deftonge
				}
			}
			common.setLocalStorage("cicDiffObj", cicDiffObj, true);

		}



		common.setLocalStorage('renewFlag', '5', false);
		common.setLocalStorage("pthotoOrderNumber", orderNumber, false);

		//删除主流程照片缓存
		common.removeLocalStorage("acqusitionPhotoNum");
		common.removeLocalStorage("acqusitionTempPath");
		common.removeLocalStorage("busiFlag");


		var d1 = $("#bzStartTime").val().split(' ')[0]; //商业险开始时间
		var d2 = $("#bzEndTime").val(); //商业险结束时间
		var d3 = common.formatDate(getNextYear(d1), "yyyy-MM-dd") + ' ' + $("#bzStartTime").val().split(' ')[1] + ':59'; //商业险开始时间的下一年

		var d4 = $("#tcStartTime").val().split(' ')[0]; //交强险开始时间
		var d5 = $("#tcEndTime").val(); //交强险结束时间
		var d6 = common.formatDate(getNextYear(d4), "yyyy-MM-dd") + ' ' + $("#tcStartTime").val().split(' ')[1] + ':59'; //交强险开始时间的下一年

		var syStart = new Date((d2 + ':59').replace(/-/g, '/')).getTime(); //商业险结束时间戳
		var syEnd = new Date(d3.replace(/-/g, '/')).getTime(); //商业险开始时间的下一年时间戳
		var jqStart = new Date((d5 + ':59').replace(/-/g, '/')).getTime(); //交强险结束时间时间戳
		var jqEnd = new Date(d6.replace(/-/g, '/')).getTime(); //交强险开始时间的下一年时间戳

		//如果商业险为短期单
		if (syEnd > syStart && jqStart >= jqEnd) {
			cpic.alert({
				message: "<div style=\"text-align: center;\">该单在报价时是短期单，移动端仅支持整年投保，请确认是否转投保？</div>",
				params: {
					autoOpen: false,
					closeBtn: false,
					title: null,
					buttons: {
						'取消': function() {
							this.close();
							this.destroy();
						},
						'确定': function() {
							cpic.ui.loading.open();
							this.close();
							this.destroy();
							setNextYear_biz();
							window.location.href = '../newInsV2/carInsurance.html?returnSource=rePolicy';
						}
					}
				}
			});
		} else if (syStart >= syEnd && jqEnd > jqStart) { //如果交强险为短期单
			cpic.alert({
				message: "<div style=\"text-align: center;\">该单在报价时是短期单，移动端仅支持整年投保，请确认是否转投保？</div>",
				params: {
					autoOpen: false,
					closeBtn: false,
					title: null,
					buttons: {
						'取消': function() {
							this.close();
							this.destroy();
						},
						'确定': function() {
							cpic.ui.loading.open();
							this.close();
							this.destroy();
							setNextYear_tpf();
							window.location.href = '../newInsV2/carInsurance.html?returnSource=rePolicy';
						}
					}
				}
			});
		} else if (syEnd > syStart && jqEnd > jqStart) { //如果交强险和商业险都为短期单
			cpic.alert({
				message: "<div style=\"text-align: center;\">该单在报价时是短期单，移动端仅支持整年投保，请确认是否转投保？</div>",
				params: {
					autoOpen: false,
					closeBtn: false,
					title: null,
					buttons: {
						'取消': function() {
							this.close();
							this.destroy();
						},
						'确定': function() {
							cpic.ui.loading.open();
							this.close();
							this.destroy();
							setNextYear_biz();
							setNextYear_tpf();
							window.location.href = '../newInsV2/carInsurance.html?returnSource=rePolicy';
						}
					}
				}
			});
		} else {
			window.location.href = '../newInsV2/carInsurance.html?returnSource=rePolicy';
		}
	});

	//modify by sc 20170602
	$("#shareWX").bind("click", function() {
		var param = {
			"policy": photesharepolicy,
			"shareType": "3" //拍照报价微信
		};

		common.setLocalStorage('forSharePolicy', photesharepolicy, true);


		//保存数据到数据库进行分享功能
		Interface.saveDataForWechatShare(token, param, function(result) {
			var shareId = result.attributes.shareId;
			window.location.href = '../newInsV2/wechatShareQuote.html?shareId=' + shareId + '&shareFlag=2';

		});

	});

	/**
	 * 拍照报价分享到短信
	 */
	$("#sendMessage").bind("click", function() {
		var totalPremium = $("#totalPremium").html();
		//	     if(common.isNull(totalPremium)){
		//
		//	    		cpic.alert("请报价之后分享");
		//				cpic.ui.loading.close();
		//				return;
		//	      }

		var defaultTel = common.isNull(photesharepolicy.policyholder.c_mobile) ? "" : photesharepolicy.policyholder.c_mobile;

		cpic.alert({
			message: '<div style="text-align:center;margin-bottom:8%;">短信分享</div>' + '<span>手机号码:&nbsp;&nbsp;&nbsp;</span><input type="phone" value=\"' + defaultTel + '\"  placeholder="请输入手机号" maxlength="11" style="width: 52%; padding: 5px 15px;text-align: left;border:1px solid initial" id="phoneNum">',
			params: {
				autoOpen: false,
				closeBtn: false,
				title: null,
				buttons: {
					'取消': function() {
						this.close();
						this.destroy();
					},
					'确定': function() {
						photesharepolicy.base_part.c_sls_nme = userInfo.userName;
						photesharepolicy.base_part.c_sls_tel = userInfo.mobile;
						var mobile = $("#phoneNum").val();

						if (common.isNotNull(mobile)) {
							if (common.checkMobile(mobile)) {
								// 第一步先把短信分享链接取到，并把对应的policy保存到数据库中。和微信分享使用同一个库；

								var param = {
									"policy": photesharepolicy,
									"shareType": "4" //短信
								};

								Interface.saveDataForWechatShare(token, param, function(result) {

									var shareId = result.attributes.shareId;
									var param = {
										"policy": photesharepolicy,
										"templateType": '3', //模板类型,3拍照报价短信
										"templateUse": '0', //模板标示
										"orgId": '999', //拍照报价模板
										"subOrgId": '',
										'planLink': location.href.split('?')[0].replace('cameraQuote/orderInfo.html', 'newInsV2/wechatShareQuote.html') + '?shareId=' + shareId,
										"plateNo": photesharepolicy.vhl_info.c_plate_no, //车牌号
										"tcPremium": jiaoqiangSum.toFixed(2), //交强险
										"bzPremium": shangyeSum.toFixed(2), //商业险
										"totalPremium": $("#totalPremium").html(), //总金额
										"vsltax": $("#vsltax").html(), //车船税
										"sendUser": userInfo.userName, //发件人(业务员)
										"reciveUser": photesharepolicy.policyholder.c_insured_nme, //收件人(投保人)
										"recivePhone": mobile //收件人号码
									};

									//保存数据到数据库进行分享功能
									Interface.sendQuoteMessage(token, param, function(result) {
										if (result.success == true) {
											cpic.Prompt("短信发送成功");
										} else {
											cpic.Prompt("短信发送失败，请重试");
										}
									})
								})
							} else {
								cpic.Prompt("输入的电话号码不正确");
								return;
							}
						} else {
							cpic.Prompt("请输入电话号码");
							return;
						}
						this.close();
						this.destroy();
					}
				}
			}
		})
	});
}