(function($$){
	
	// 父頁面床送過來的數據
	var param_data = {};
	
	var stockListVm = new Vue({
		el:'#stockListVm',
			data:{
				datas:{}
			},
			methods:{
				resetData:function(){//重置数据
					Object.assign(this.$data, {});
				},
				// 服務器返回移除成功時調用，
				// 從數據模型刪除自選，不用再次請求服務器。
				delFavoriteStock: function(item){
					console.log("delFavoriteStock:" + item.name);
					
					var lst = []
					var data = this.$data.datas;
					for(var it in data){
						var obj = data[it];
//						console.log(JSON.stringify(obj));
						
						if(obj.code != item.code) {
							lst.push(obj);
						}
					}
					
					this.$data.datas = lst;
				},
				delstockRequest:function(it, cb){
					console.log("del button taped, " + it.code + " " + it.name);
					
					var  postdata = {}
					app.fillToken(postdata);
					postdata['uid'] = app.getState().uid;
					postdata['code'] = it.code;
				
					mui.ajax({
			            type: "post",
						url: urls.url_delFromFavoriteStock,
						data:postdata,
			            timeout: 3000,
			            success: function(data) {
			            	console.log("success:" + urls.url_delFromFavoriteStock);
			            	
			            	if(data['errcode'] != 0){
			            		plus.nativeUI.toast(data['errmsg']);
			            		return;
			            	}
			            	
			            	// vm模型數據刪除
			            	cb(it);
			            	
			            	plus.nativeUI.toast("移除 "+ it.name + " 自選成功！");
			            },
			            error: function(xhr, type, errorThrown) {
			                plus.nativeUI.toast(errorThrown);
			            }
			        });// ajax
				},
				
				/***
				 * 轉到股票詳情頁面
				 * @param {Object} item：個股信息
				 */
				toStockDetail:function(item){
					console.log("toStockDetail..");
					
					item.symbol = item.code;
					
					//  標識是不是比賽相關的展示頁面， 用於在股票詳情頁面點擊購買時，區分下單類型
					if(param_data.contestid != undefined) {
						item.contestid = param_data.contestid;
					}
					
					mui.fire(stockDetailPage,'display',{data:item});
					//打开個股詳情
					mui.openWindow({
						id:'stockDetail'
					});
				}
			}     // end method area
	});
	
	
	// 處理獲取自選股列表數據的囘調函數
	// 在這個函數内請求行情
	function getStockCb(data){
		console.log(JSON.stringify(data));
		
		var codelst=[];
		
		//test
		for(var it in data){
//			console.log(it + ': ' + data[it].name);
			codelst.push('s_' + data[it].code);
		}
		
		hq_obj.get_hq_stock(function(rdat){
			rdat = rdat.replace(/[\r\n]/g, "");

			eval(rdat);
			
			for(var it in data) {
				var hq = eval('hq_str_s_' + data[it].code);
				
				hq = JSON.stringify(hq).split(',');
				data[it].cur_price = hq[1];          // 現價
				data[it].change_per = hq[3];          // 漲跌幅
			}
				
			//test
//			for(var it in data){
//				console.log(it + ': ' + JSON.stringify(data[it]) );
//			}
			
			// 賦值數據到模型
			stockListVm.datas = data;
		}, codelst);
	};
	
	function getStock(){
		var  postdata = {}
					
		app.fillToken(postdata);
		postdata['uid'] = app.getState().uid;
		
		for(var it in postdata) {
			console.log(it + " : " + postdata[it]);
		}
		
		mui.ajax({
            type: "get",
			url: urls.url_getFavoriteStock,
			data:postdata,
            timeout: 3000,
            success: function(data) {
            	console.log("success:" + urls.url_getFavoriteStock);
            	
            	if(data['errcode'] != 0){
            		plus.nativeUI.toast(data['errmsg']);
            		return;
            	}
            	
            	getStockCb(data.retdata);
            },
            error: function(xhr, type, errorThrown) {
                plus.nativeUI.toast(errorThrown);
            }
        });// ajax
	};
	
	/*******
	 *  點擊跳轉到股票詳情頁
	 */
	var stockDetailPage = NaN;
	
	/**
	 * plusReady 處理：
	 */
	mui.plusReady(function(){
		
		stockDetailPage= mui.preload({
			url:"stockDetail.html",
			id:"stockDetail",//默认使用当前页面的url作为id
		});
		
		getStock();
	});
	
	window.addEventListener('display', function(event){
		param_data = event.detail.data || {};
		console.log("myfavorite stock page display.:" + JSON.stringify(param_data));
//		getStock();
	});
	
})(mui);
