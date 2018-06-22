(function() {
	'use strict'
	
	angular.module('app')
		.controller('DashboardCtrlPhone', DashboardCtrlPhone);
		
	function DashboardCtrlPhone($scope, $http, $location, $window, SharedSvc, AppSvc) {
		
		var asOfDate = "";
		var lastRefreshDate;
		
		var dayParam, monthParam, yearParam;	
		
		var currentDayInTime = "";	
		
		var currentGeog = SharedSvc.getGeog();
		var currentCurr = SharedSvc.getCurrency();
		
		//var expanded = false;
		
		var initialTimeframeLoad = true,
			initialProdTypeLoad = true;
			
		$scope.DefaultGeogCurrency = "";
		
			
				
			
		$scope.$watch(
			function() {
				return SharedSvc.getGeog();
			},
			function(newValue, oldValue) {
				if (newValue !== oldValue) {
					currentGeog = newValue
					$scope.geogName = currentGeog.Name;
					
					$scope.DefaultGeogCurrency = "";
					
					/*LoadDirectTraceData();
					LoadYtdComSales();
					$scope.GetUpDownData();*/
				}
			}
		)
		
		$scope.$watch(
			function() {
				return SharedSvc.getCurrency();
			},
			function(newValue, oldValue) {
				if (newValue !== oldValue) {
					currentCurr = newValue;
					$scope.USDCurrency = currentCurr.USDCurrency;
					$scope.foreighCurrencyLabel = currentCurr.ForeignCurrencyLabel;
					
					if ($scope.DefaultGeogCurrency === ""){
						$scope.DefaultGeogCurrency = currentCurr.ForeignCurrencyLabel;
					
					}		
					
					if (currentGeog.Id === "C140"){
						$scope.DefaultGeogCurrency = "-1";	
					}			
					
					LoadDirectTraceData();
					LoadYtdComSales();
					$scope.GetUpDownData();
				}
			}
		)
		
		
		
		$scope.$watch(
			function() {
				return SharedSvc.getLastUpdateDate();
			},
			function(newValue, oldValue) {
			
				var refreshedOn = SharedSvc.getRefreshDate();
							
				$scope.yesterdayDate = "Last Refreshed: " + moment(refreshedOn).format("MMM D YYYY, h:mma") + " EST";
			
			
				var newValDate = "", oldValDate = "";
				
				if (newValue !== ""){
					newValDate = newValue.RefreshDate.toString();
				}
				
				if (oldValue !== ""){
					oldValDate = oldValue.RefreshDate.toString();
				}
				
			
				if (newValDate  !== oldValDate ) {
					
					
					currentDayInTime = newValue;
					dayParam = moment(newValue.RefreshDate).format('D');
					monthParam = moment(newValue.RefreshDate).format('M');
					yearParam = moment(newValue.RefreshDate).format('YYYY');	
					
					$scope.quotaMonth = newValue.RefreshMonthName;
					
					SharedSvc.getAsOfDateLabel();	
					$scope.yesterdayDataTableLabel = SharedSvc.getCurrentDayLabel();						
					
				
					LoadDirectTraceData();
					LoadYtdComSales();
					$scope.GetUpDownData();
																				
				}
			}
		)
		
		
		
		$scope.$watch('growthTimeframe', function() {	
		 	if (!initialTimeframeLoad){
		 		AppSvc.logGAClickEvent('Dashboard - Growth Timeframe Changed', $scope.growthTimeframe);		 
		 	}
		 	else{
		 		initialTimeframeLoad = false;
		 	}	       
		 });   
		 
		 $scope.$watch('growthCapDisp', function() {	
		 	if (!initialProdTypeLoad){
		 		AppSvc.logGAClickEvent('Dashboard - All/Cap/Disposable Changed', $scope.growthCapDisp);		
		 	}
		 	else{
		 		initialProdTypeLoad = false;
		 	}	       
		 });
		
		//Set initial panel height
		//resizePanelsNormal();
				
		//Currency format call function called from HTML to format currency labels appropriately based on geog selected
		$scope.currencyFormatter = function(d){		
			var currency = $("<span>"+d+"</span>").formatCurrency({roundToDecimalPlace: 0, 
			                                                   region: currentCurr.CurrencyRegion, 
			                                                   digitGroupSymbol: currentCurr.CurrencyThousandSymbol, 
			                                                   decimalSymbol: currentCurr.CurrencyDecimal}).text();		
			return currency;
		}
		
		//Expand the panel to full screen
		/*$scope.GoFull = function(activePanel) {
	        
	        var $expandButton = $('#' + activePanel).find('button');
	        
	        if ($expandButton.hasClass('glyphicon-resize-full')) {
	        	$expandButton.removeClass('glyphicon-resize-full');
	        	$expandButton.addClass('glyphicon-resize-small');
	        }
	        else if ($expandButton.hasClass('glyphicon-resize-small'))
	        {
	            $expandButton.removeClass('glyphicon-resize-small');
	            $expandButton.addClass('glyphicon-resize-full');
	        }

	        $('#' + activePanel).toggleClass('panel-fullscreen');
			if ($('#' + activePanel).hasClass('panel-fullscreen')) {
				resizePanelsFullScreen();
				expanded = true;
			} else {
				resizePanelsNormal();
				expanded = false;
			}
		}*/
		
		$scope.yesterdayDataTableLabel = "";
		
		var momentDay, momentMonth, momentYear;
		
		function getLastRefreshInfo (){
			var data = SharedSvc.getLastUpdateDate();
			
			$scope.quotaMonth = data.RefreshMonthName;		
			
			asOfDate = new Date(data.RefreshDate);
			lastRefreshDate  = new Date(data.RefreshDate);
			
    		dayParam = moment(asOfDate).format('D');
			monthParam = moment(asOfDate).format('M');
			yearParam = moment(asOfDate).format('YYYY');	
			

			SetDateInTime(true);
	
		
		
			//$http.get('https://w4.linvatec.com/WebServices/DashAPI/api/Dash?dt_info')
			/*$http.get(AppSvc.apiPathCube + '/api/Misc/GetLastUpdateDate')
				.success(function(data) {
					SharedSvc.setLastUpdateDate(data);
				
					$scope.quotaMonth = data.RefreshMonthName;		
					
					asOfDate = new Date(data.RefreshDate);
					lastRefreshDate  = new Date(data.RefreshDate);
					
		    		dayParam = moment(asOfDate).subtract(1, 'days').format('D');
					monthParam = moment(asOfDate).subtract(1, 'days').format('M');
					yearParam = moment(asOfDate).subtract(1, 'days').format('YYYY');	
					

					SetDateInTime(true);
								
				}).error(function(xhr, status, text) {
					if (status == "410"){
						AppSvc.loadInProcess();
					}
				}); // End $http success	
				*/			
		}
		
		function SetDateInTime(initialLoad){	
			
					var d = asOfDate;	
						
					var day, month, year, hours, minutes = "";
					day = d.getDate();
					month = AppSvc.getShortMonthName(d.getMonth());
					year = d.getFullYear();
					hours = d.getHours();
					
									
					if (hours < 10) {
						hours = "0" + hours;
					}
					minutes = d.getMinutes();
					if (minutes < 10) {
						minutes = "0" + minutes;
					}
					
					var refreshLabel;
					
					
					if (initialLoad !== true){					
			    		dayParam = moment(d).format('D');
						monthParam = moment(d).format('M');
						yearParam = moment(d).format('YYYY');	
						
						momentDay = moment(d).format('D');
						momentMonth = moment(d).format('MMM');
						momentYear = moment(d).format('YYYY');	
						
						refreshLabel = 'As Of: '; 					
					}	
					else{
						momentDay = moment(d).subtract(1, 'days').format('D');
						momentMonth = moment(d).subtract(1, 'days').format('MMM');
						momentYear = moment(d).subtract(1, 'days').format('YYYY');	
						
						refreshLabel = 'Last Refreshed: ';					
					}					
					
				
									
					
					$scope.yesterdayDataTableLabel =  momentMonth + ' - ' + momentDay;
					
					$scope.yesterdayDate = refreshLabel + day + '-' + month + '-' + year + ' ' + hours + ':' + minutes + ' EST';
					
					LoadDirectTraceData();
					LoadYtdComSales();
					$scope.GetUpDownData();
					
		
		}
		
		//**Resize all charts when screen resizes
	/*	$(window).resize(function() {
			if (expanded) {
				resizePanelsFullScreen();
			} else {
				resizePanelsNormal();
			}
		});
	*/
		
		/*var w = angular.element($window);
		$scope.$watch(
		  function () {
		    return $window.innerWidth;
		  },
		  function (value) {
			if (expanded) {
				resizePanelsFullScreen();
			} else {
				resizePanelsNormal();
			}
		  }
		);
		
		w.bind('resize.dashboardResize', function(){
		  $scope.$apply();
		});		
		
		$scope.$on('$destroy',function (){
			$(window).off('resize.dashboardResize'); // remove the handler added earlier
		});*/
		
		
		
		//**Set fixed height for panels based on screen size
		/*function resizePanelsNormal() {
			var wh = $(window).height();
			var panelHeight = (wh - 175) / 2;
			var panelBodyHeight = panelHeight - 75;
			
			$('.panel').height(panelHeight);
			$('.panel-body').height(panelBodyHeight);
			$('.panel-chart-height').height(panelBodyHeight * .65);
			$('.panel-data-table').height(panelBodyHeight * .35);
			$('.panel-col-scroll').height(panelBodyHeight);
			
			$(".k-chart").each(function() {
				// get the instance of the chart
				var chart = kendo.widgetInstance($(this), kendo.dataviz.ui);
				// redraw the chart
				if (chart && chart.resize) {
					chart.resize();
				}
			});
		}
		
		function resizePanelsFullScreen() {
			var wh = $(window).height();
			var panelHeight = wh;
			var panelBodyHeight = panelHeight - 75;
			
			$('.panel-chart-height').height(panelBodyHeight * .75);
			$('.panel-data-table').height(panelBodyHeight * .25);
			$('.panel-col-scroll').height(panelBodyHeight);
			
			$(".k-chart").each(function() {
				// get the instance of the chart
				var chart = kendo.widgetInstance($(this), kendo.dataviz.ui);
				// redraw the chart
				if (chart && chart.resize) {
					chart.resize();
				}
			});
		}*/

		
		
//******************** Dashboard Charts ********************

//*** Start of Direct Tracing Chart Load ***

	var checkForRefresh= function(){
		var updateDate = SharedSvc.getLastUpdateDate();
		
	    if(updateDate.RefreshDate !== undefined){
	    	asOfDate = new Date(updateDate.RefreshDate);
	        // run when condition is met
	    }
	    else {
	        setTimeout(checkForRefresh, 1000); // check again in a second
	    }
	}


		function LoadDirectTraceData() {
			checkForRefresh();
			
			var d = asOfDate;
			
			if (d.toString() !== "Invalid Date"){
				
				
				
			
	
		        var chartSeriesData = [];
		        var chartOptions = [];  
		        var regionSpecificData = [];     
		        var startTime = new Date();  
		        
		        
		        var currType = "USD";
		        var startTime = new Date();
		        
		        if(currentCurr.USDCurrency !== true){
		        	currType = "Local";
		        }
		         	        
		        
		       var paramData = {
					"salesGeoKey" : currentGeog.Id,
					"year" : yearParam,
					"month" : monthParam,
					"day" : dayParam,
					"currency": currType   
				};
		        
		        
		        if (currentGeog.Id !== undefined){
		        
		 
			        $scope.noDataDirectTraceChart = true;
			        kendo.ui.progress($(".directTraceChart-loading"), true);
			        
			        
					//$http.get(AppSvc.apiPath + '/api/Dash?dt_geogid=' + currentGeog.Id)
					$http.post(AppSvc.apiPathCube + '/api/csales/InsightDashboardMonthData', JSON.stringify(paramData))
						.success(function(data) {
							AppSvc.logGATimingEvent('Dashboard - Web API', 'Load Commissionable Sales vs Quota', startTime);
						
			        		    			    		    
						    //Datasets to hold individual series data			
							var traceData = data.TracingRecs,
							    directData = data.DirectRecs,
							    estimateData = data.EstimateRecs,
							    currentQuota = null;
							    
							$scope.currentMonthDataTable = data.CurrentMonDataTableRecs;					
							
							if (data.CurrentMonDataTableRecs[0] != undefined){
								if (data.CurrentMonDataTableRecs[0].PriorOpen === 0 && data.CurrentMonDataTableRecs[0].CurrentOpen === 0){
									$scope.showCommSales = false;
								} 
								else{
									$scope.showCommSales = true;
								}					
							 
							}						
							 
			   				//Handles when no data is returned from service
						    if (traceData.length === 0 && directData.length === 0 ) {
								$scope.noDataDirectTraceChart = false;
								kendo.ui.progress($(".directTraceChart-loading"), false);
								return false;
							} else {
								$scope.noDataDirectTraceChart = true;
							}
							    
							//Only apply quotas if territory has a quota, otherwise keeps default value of null
							if (data.QuotaRecs.length > 0){
								currentQuota = data.QuotaRecs[0].Quota;
							}								
							
							//Arrays used to load days on value axis and quota data
							var categoryAxisValues = [],
							    quotaData = [],
							    cleanTrace=[];
							
						    $.each($(traceData), function(key, value) {	
								categoryAxisValues.push(value.DayOfWeek); //charts with multiple series cannot be bound to the data's categoryAxis Field. Have to create the Day Array to be shown					  				  
								quotaData.push({ "CurrentQuota": currentQuota}); //create array for every day with the current month's quota value
								  
								if (currentCurr.USDCurrency){
									if (value.AmtUSD !== null){
										cleanTrace.push({ "Amt": parseInt(value.AmtUSD)}); 
									}
								}
								else{
									if (value.AmtLocal!== null){
										cleanTrace.push({ "Amt": parseInt(value.AmtLocal)}); 
									}
								}						  
								  
						    });		
			  
			  				var cleanEstimates = [],
			  				    cleanDirect = [],
			  				    runRateEst = [];
			  				    
			 				//Convert to Numbers
						    $.each($(estimateData), function(key, value) {	
						    	if (currentCurr.USDCurrency){
						    		cleanEstimates.push({ "Amt": parseInt(value.AmtUSD)}); //create array for every day with the current month's quota value
						    	}
						    	else{
						    		cleanEstimates.push({ "Amt": parseInt(value.AmtLocal)}); //create array for every day with the current month's quota value
						    	}
						    					  
						    });	  
						    
							var currentSalesAmt = 0;
					    	var i = 0;
					    	var firstTime = true;
					    	var lastRunRateVal = 0;
					    
						    $.each($(directData), function(key, value) {	
						    	i = i + 1;
						    
						    	if (currentCurr.USDCurrency){
							    	if (value.AmtUSD !== null){
							    		cleanDirect.push({ "Amt": parseInt(value.AmtUSD)});
							    		runRateEst.push({ "": null});
						    		    currentSalesAmt  = parseInt(value.AmtUSD);
							    	}
							    	else{
							    		if (firstTime){
							    			runRateEst[runRateEst.length - 1].RunRate = currentSalesAmt + cleanEstimates[i - 2].Amt;
							    			firstTime = false;
							    			lastRunRateVal = currentSalesAmt + cleanEstimates[i - 2].Amt;				    			
							    		}
							    		else{					    			
							    			runRateEst.push({ "RunRate": null});
							    		}
							    	}
							    }
							    else{
							    	if (value.AmtLocal !== null){
							    		cleanDirect.push({ "Amt": parseInt(value.AmtLocal)});
							    		runRateEst.push({ "": null});
						    		    currentSalesAmt  = parseInt(value.AmtLocal);				    		
							    	} else {
							    		if (firstTime){
											runRateEst[runRateEst.length - 1].RunRate = currentSalesAmt + cleanEstimates[i - 2].Amt;
							    			firstTime = false;
							    			lastRunRateVal = currentSalesAmt + cleanEstimates[i - 2].Amt;
							    		} else {
							    			runRateEst.push({ "RunRate": null});
							    		}
							    	}				    				    
							    }			    
						    });	 
						    
						    //Set last node of runRate to estimated runrate value
						    if (data.CurrentMonDataTableRecs.length > 0 ) {
								var estVal = cleanEstimates[cleanEstimates.length -1].Amt;
								
						    	if (currentCurr.USDCurrency){
						    		var x = data.CurrentMonDataTableRecs[0].RunRateEstUSD;
						    		runRateEst.push({ "RunRate": x });
								}	    
								else{
									var x = data.CurrentMonDataTableRecs[0].RunRateEstLocal;
									runRateEst.push({ "RunRate": x });
								}					
							}				    
						    
						    var BindField;
						    
							if (currentCurr.USDCurrency){	    
								BindField = "AmtUSD";
							}
							else{
								BindField = "AmtLocal";				
							}
						    
						    //Push all series options to object
							chartSeriesData.push(
								{
									type: "area",	
									stack: true,						
									field: "Amt" ,
									name: "Trace (act)",
									missingValues: "gap",
									data: cleanTrace,
									tooltip: {							
										template: function(x){		                    
						                    return $scope.currencyFormatter(x.value);		                    		                    	
				                    	}
				                    },							
									markers: {
				                        visible: false
				                	},
				                	color: "#ff0000",
									opacity: 0.8
								},					
								{																					
									field: "Amt",
									name: "Trace (est)",							
									data: cleanEstimates,
									type: "line",	
									//stack: true,
									markers: {
				                        visible: false
				                    },
									tooltip: {							
										template: function(x){		                    
						                    return $scope.currencyFormatter(x.value);		                    		                    	
				                    	}
				                    },								
									missingValues: "gap",
									color: "#8AACC9",
									opacity: 0.8
								},					
								{
									field: "Amt",
									name: "Direct Sales (act)",
									data: cleanDirect,
									type: "area",	
									stack: true,
									tooltip: {							
										template: function(x){		                    
						                    return $scope.currencyFormatter(x.value);		                    		                    	
				                    	}
				                    },								
									missingValues: "gap",
									color: "#329832",
									opacity: 0.8						
								},
								{
									type: "line",							
									field: "CurrentQuota",
									name: "Month Quota",
									missingValues: "gap",
									tooltip: {							
										template: function(x){		                    
						                    return $scope.currencyFormatter(x.value);		                    		                    	
				                    	}
				                    },								
									data: quotaData,
									markers: {
				                        visible: false
				                    },
									color: "#686c70"
								}
							);			
						   
						    //Apply Default Chart Options
						    $scope.directTraceChartOptions = {
						    	chartArea: {
							    	margin: {
							    		top: 10
							    	}
							  	},
						    	transitions: false,
								categoryAxis: {
									categories: categoryAxisValues,
									title: {
								      	visible: false
								    },
								    majorGridLines:{
								    	visible: false
								    },
						            labels:{
						            	step: 2
						            }					    
								},						
								valueAxis: {
								    labels: {
								    	visible: false
								    }
								  },											    
								series: chartSeriesData,				
								tooltip: {
									visible: true,
				                    shared: true,
				                    sharedTemplate: function(x){
				                    
				                    	var quota = 0,
				                    	    traceEst = 0,
				                    	    traceAct = 0,
				                    	    direct = 0;
				                    
									    $.each($(x.points), function(key, value) {	
			
											var x = 1;
											switch (value.options.name) {
											    case "Trace (act)":
											    	traceAct = value.dataItem.Amt;									    	
											        break;
											    case "Direct Sales (act)":
			        								direct = value.dataItem.Amt;
											        break;
											    case "Trace (est)":
					        			    		traceEst = value.dataItem.Amt;
											    	break;
											    case "Month Quota":
					        			    		quota = value.dataItem.CurrentQuota;
											    	break;									    	
											}									  
									    });	
									    
										var total = traceAct  + direct;		
										
			                    		var tbl = "<table>" + 
			                    					"<tr><td>Quota:</td><td td style='text-align:right'>"+ $scope.currencyFormatter(quota) +"</td></tr>" +
			                    					"<tr><td>Trace (est):</td><td td style='text-align:right'>"+ $scope.currencyFormatter(traceEst) +"</td></tr>" +
			                    					"<tr style='height:8px;'><td> </td><td> </td></tr>" +
			                    					"<tr><td>Direct Sales (act):</td><td td style='text-align:right'>"+ $scope.currencyFormatter(direct) +"</td></tr>" +
			                    					"<tr><td>Trace (act):</td><td td style='text-align:right'>"+ $scope.currencyFormatter(traceAct) +"</td></tr>" +
			                    					"<tr><td>Total:</td><td style='text-align:right'>"+ $scope.currencyFormatter(total)  +"</td></tr>" +
			                    				  "</table>";
				                    
				                    	return tbl;			                    
				                    
				                    	//handle when only quota and trace est series are present
				                    /*	if (x.points.length === 2){
					                    	var traceEst = x.points[0];
					                    	var quota = x.points[1];		                    	
					                    
				                    		var tbl = "<table>" + 
				                    					"<tr><td>Quota:</td><td td style='text-align:right'>"+ $scope.currencyFormatter(quota.dataItem.CurrentQuota) +"</td></tr>" +
				                    					"<tr><td>Trace (est):</td><td td style='text-align:right'>"+ $scope.currencyFormatter(traceEst.dataItem.Amt) +"</td></tr>" +
				                    				  "</table>";
					                    
					                    	return tbl;
				                    	}
				                    	
				                    	//handle when all series values are present
				                    	if (x.points.length === 4){
					                    	var traceAct = x.points[0];
					                    	var direct = x.points[1];
					                    	var traceEst = x.points[2];
					                    	var quota = x.points[3];			                    	
					                    	
					                    	var total = traceAct.dataItem.Amt + direct.dataItem.Amt;
				                    	
				                    		var tbl = "<table>" + 
				                    					"<tr><td>Quota:</td><td td style='text-align:right'>"+ $scope.currencyFormatter(quota.dataItem.CurrentQuota) +"</td></tr>" +
				                    					"<tr><td>Trace (est):</td><td td style='text-align:right'>"+ $scope.currencyFormatter(traceEst.dataItem.Amt) +"</td></tr>" +
				                    					"<tr style='height:8px;'><td> </td><td> </td></tr>" +
				                    					"<tr><td>Direct Sales (act):</td><td td style='text-align:right'>"+ $scope.currencyFormatter(direct.dataItem.Amt) +"</td></tr>" +
				                    					"<tr><td>Trace (act):</td><td td style='text-align:right'>"+ $scope.currencyFormatter(traceAct.dataItem.Amt) +"</td></tr>" +
				                    					"<tr><td>Total:</td><td style='text-align:right'>"+ $scope.currencyFormatter(total)  +"</td></tr>" +
				                    				  "</table>";
					                    
					                    	return tbl;		                    	
				                    	}	
				                    	
										*/                    	
				                    
				                    },
									background: "whitesmoke",
									border: {
							          color: "gray"
							        }	                    
								},
								legend: {
									position: "bottom"
								}
							}	
							
							//This is required in order for the series data to be updated when selecting a different geography
							if(typeof $scope.directTraceChart !== 'undefined'){ 
								$scope.directTraceChart.setOptions($scope.directTraceChartOptions);	 
							};
							
							kendo.ui.progress($(".directTraceChart-loading"), false);
							
						}) // End $http success
						.error(function() {
							kendo.ui.progress($(".directTraceChart-loading"), false);
							if (status === "410"){
								AppSvc.loadInProcess();
							}					
						}); 
				}
			}				
		}

//End Direct Tracing Chart Load


//*** This Year Commisionable Sales vs. Quota ***

		function LoadYtdComSales() {

	        var currType = "USD";
	        var startTime = new Date();
	        
	        if(currentCurr.USDCurrency !== true){
	        	currType = "Local";
	        }
	        
	        var d = asOfDate;
	        
	        if (d != ""){
	        
	
		        
		        var paramData = {
					"salesGeoKey" : currentGeog.Id,
					"year" : yearParam,
					"month" : monthParam,
					"day" : dayParam,
					"currency": currType 
				};	 	        
		        
		        
		        $scope.noDataYtdChart = true;
		        
		        if (currentGeog.Id !== undefined){
		        
			        kendo.ui.progress($(".ytdChart-loading"), true);
			        
					//$http.get(AppSvc.apiPath + '/api/Dash?geogid=' + currentGeog.Id + '&curr_type=' + currType)
					$http.post(AppSvc.apiPathCube + '/api/csales/InsightDashboardYearData', JSON.stringify(paramData))
						.success(function(data) {
							
							var chartSeriesData = [];
							
							AppSvc.logGATimingEvent('Dashboard - Web API', 'Load YTD Commissionable Sales vs Quota', startTime);
						
							$scope.YearSalesDataTable = data.YearSalesDataTableRec;
			        
						    $.each($(data.MonthBucketRec), function(key, value) {
						    	var seriesColor;
						    	
						    	if (value.ProdType === "Capital") {
						    		seriesColor = "#8aacc9";
						    	} else {
						    		seriesColor = "#0098d5"
						    	}
								  
								chartSeriesData.push({ data : [value.Jan, value.Feb, value.Mar, value.Apr, value.May, value.Jun, 
								                       value.Jul, value.Aug, value.Sep, value.Oct, value.Nov, value.Dec], 
								                       name: value.ProdType,
								                       type: "column",
								                       color: seriesColor,
								                       stack: true});
								  
						    }); // End each loop
			
							var MonthBucketData;
			
						    $.each($(data.MonthQuotaBucketRec), function(key, value) {			
			
								var data = [
									{ current: 1, target: value.Jan, category: 'Jan', labelVal: null, PTQStack: 0 },
									{ current: 2, target: value.Feb, category: 'Feb', labelVal: null, PTQStack: 0  },
									{ current: 3, target: value.Mar, category: 'Mar', labelVal: null, PTQStack: 0  },
									{ current: 4, target: value.Apr, category: 'Apr', labelVal: null, PTQStack: 0  },
									{ current: 5, target: value.May, category: 'May', labelVal: null, PTQStack: 0  },
									{ current: 6, target: value.Jun, category: 'Jun', labelVal: null, PTQStack: 0  },
									{ current: 7, target: value.Jul, category: 'Jul', labelVal: null, PTQStack: 0  },
									{ current: 8, target: value.Aug, category: 'Aug', labelVal: null, PTQStack: 0  },
									{ current: 9, target: value.Sep, category: 'Sep', labelVal: null, PTQStack: 0 },
									{ current: 10, target: value.Oct, category: 'Oct', labelVal: null, PTQStack: 0  },
									{ current: 11, target: value.Nov, category: 'Nov', labelVal: null, PTQStack: 0  },
									{ current: 12, target: value.Dec, category: 'Dec', labelVal: null, PTQStack: 0  }
								];
								                     
								  
								MonthBucketData = data;                   
								                     
								  
						    }); // End each loop
						    			    
						    			
							var PTQData = MonthBucketData;
							var hasPTQ = false;
		
						    $.each($(data.MonthPTQRec), function(key, value) {			
								hasPTQ = true;
								PTQData[key].labelVal= value.PTQ;							
							  
						    }); // End each loop
						    
						    if (chartSeriesData.length === 0) {
								$scope.noDataYtdChart = false;
								kendo.ui.progress($(".ytdChart-loading"), false);
								return false;
							} else {
								$scope.noDataYtdChart = true;
							}
						    
							chartSeriesData.push({ data : MonthBucketData ,
							                       name: "Total Quota",
							                       type: "verticalBullet",
							                       color: '#272425',
							                       target: {
							                       	color: '#272425'
							                       },
							                       tooltip: {
												      visible: true,
														template: function(x){		                    
										                    	return x;		                    		                    	
								                    	}
												      
												    }
							                     });
						    
							    
							    
						    if (hasPTQ) {
								chartSeriesData.push({ 
									data : PTQData,
									name: "PTQ %",
								    type: "column",
								    stack: true,
								    color: "transparent",
								    markers: {
								    	visible: false
								    },
									tooltip: {
										visible: false
									},						                       
									labels: {
										visible: true,
										template: function(e) {
											if (e.dataItem.labelVal !== null) {
												return e.dataItem.labelVal + "%";
											} else {
												return "";
											}
										}
									},
				                   	field: "PTQStack"
								});
						    }
						    
						    $scope.ytdChartOptions = {
						    	transitions: false,
						    	seriesDefaults: {
						    		overlay: {
						    			gradient: "none"
						    		},
									tooltip: {
										visible: true,							
										template: function(x){		                    
						                    	return $scope.currencyFormatter(x.value);		                    		                    	
				                    	}
				                    },
				                    gap: .25
						    	},
						    	tooltip:{
							    	shared: true,
									visible: true,
				                    sharedTemplate: function(x){
				                    
				                    	var capAmt = "", dispAmt = "", quota = "N/A", ptq = "N/A", monthLabel = x.category;
				                    	
				                    
									    $.each($(x.points), function(key, value) {	
			
											switch (value.options.name) {
											    case "Total Quota":
											    	ptq = value.dataItem.labelVal + "%";
											    	quota = value.dataItem.target;									    	
											        break;
											    case "Capital":
			        								capAmt = value.dataItem;
											        break;
											    case "Disposable":
					        			    		dispAmt = value.dataItem;
											    	break;
											}									  
									    });			                    
			                    	
					                    	
				                    	var total = capAmt + dispAmt;
			                    	
			                    		var tbl =   "<table>" + 
					                    			"<tr><td>"+ monthLabel +" Quota: </td><td td style='text-align:right'>"+ $scope.currencyFormatter(quota) +"</td></tr>" +
					                    			"<tr><td>PTQ %: </td><td td style='text-align:right'>"+ ptq +"</td></tr>" +
			                    					"<tr style='height:8px;'><td> </td><td> </td></tr>" +
			                    					"<tr><td>Capital:</td><td td style='text-align:right'>"+ $scope.currencyFormatter(capAmt) +"</td></tr>" +
			                    					"<tr><td>Disposable:</td><td td style='text-align:right'>"+ $scope.currencyFormatter(dispAmt) +"</td></tr>" +
			                    					"<tr><td>Total:</td><td style='text-align:right'>"+ $scope.currencyFormatter(total)  +"</td></tr>" +
			                    				  "</table>";
				                    
				                    	return tbl;		                    	
			                    		                    	
				                    
				                    },
									background: "whitesmoke",
									border: {
							          color: "gray"
							        }								
						    	},
								series: chartSeriesData,
								categoryAxis: {
									categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
						            majorGridLines: {
						                visible: false
						            }
								},					
					            legend: {
									position: "bottom"
								},
								valueAxis: {
						            majorGridLines: {
						                visible: false
						            },
						            labels: {
						            	visible: false
						            }				            
								}
							}
							
							//This is required in order for the series data to be updated when selecting a different geography
							if(typeof $scope.ytdChart !== 'undefined'){
								$scope.ytdChart.setOptions($scope.ytdChartOptions);
							};
							
							kendo.ui.progress($(".ytdChart-loading"), false);
							
						}) // End $http success			
						.error(function() {
							kendo.ui.progress($(".ytdChart-loading"), false);
		
							if (status === "410"){
								AppSvc.loadInProcess();
							}
							
						}); 
					
				}
			}			
		}
			
//End This Year Commisionable Sales vs. Quota


//*** Product Growth
		var growthRangeMin = 0;
		var growthRangeMax = 0;
		
	
		var lastSelectedBar;
		
		$scope.growthLbl = "";
		$scope.amtLbl = "";
		$scope.growthTimeframe= 'YTD';
		$scope.growthCapDisp = "All"
		
		$scope.GetUpDownData = function() {
		
			$scope.custUpDownDataRows = [];
			$scope.selectedCustListGrp = "";
			$scope.custGrowthGridShow = false;
			
			var startTime = new Date();    				
		
			if(typeof $scope.custGrowthGrid!== 'undefined'){ 
				$scope.custGrowthGrid.setOptions({dataSource: {data: []}});
			};	
			
	        var d = asOfDate ;
    		/*var dayParam = moment(d.RefreshDate).subtract(1, 'days').format('D');
			var monthParam = moment(d.RefreshDate).subtract(1, 'days').format('M');
			var yearParam = moment(d.RefreshDate).subtract(1, 'days').format('YYYY');	
	        */
	        
	        if (d !== ""){
	        
		        
		        
		        var capDispKey = "";
		        
		        if ($scope.growthCapDisp == "Capital"){
		        	capDispKey = "CAPITAL";
		        }
		        else if ($scope.growthCapDisp == "Disposable"){
		        	capDispKey = "DISPOSABLE";
		        }
		        
		        var currType = "USD";
		        
		        if(currentCurr.USDCurrency !== true){
		        	currType = "Local";
		        }
		        	        
		        var upDownParamData = {
					"salesGeoKey" : currentGeog.Id,
					"year" : yearParam,
					"month" : monthParam,
					"day" : dayParam,
					"timeframe": $scope.growthTimeframe,
					"capitalDisposableKey": capDispKey,
					"currency": currType 
				};	 			
				
		
				if (currentGeog.Id !== undefined){		
					kendo.ui.progress($(".growthdata-loading"), true);
					//$http.get(AppSvc.apiPath + '/api/Dash?geogid=' + currentGeog.Id + '&timeframe=' + $scope.growthTimeframe + '&capdispflag=' + $scope.growthCapDisp)
					$http.post(AppSvc.apiPathCube + '/api/csales/DashProductGrowth', JSON.stringify(upDownParamData))			
						.success(function(data) {
							AppSvc.logGATimingEvent('Dashboard - Web API', 'Load Product Growth', startTime);   
							
			        		$scope.custUpDownDataRows = data;
			
			        		var minRange = 0,
							    maxRange = 0;				
							
							for (var i = 0; i < data.length; i++) { 					
								minRange = data[i].SigDecline + data[i].MildDecline;
								maxRange = data[i].SigIncrease + data[i].MildIncrease;
								
								if (minRange < growthRangeMin){
									growthRangeMin = minRange;
								}
								
								if (maxRange > growthRangeMax){
									growthRangeMax = maxRange ;
								}
							}
							
							kendo.ui.progress($(".growthdata-loading"), false);
							
						}) // End $http success
						.error(function() {
							kendo.ui.progress($(".growthdata-loading"), false);
		
							if (status === "410"){
								AppSvc.loadInProcess();
							}
											
						}); 
				}
			} 
		}
	
		$scope.setProdGrowthChartOptions = function(data){
			//Format data array with OBJECT Wrapper
			var dataObj = [];
			dataObj.push(data);
			
			var chartOptions = {
				transitions: false,
				dataSource:{
	            	data: dataObj //apply data object to dataSource
	        	},
				chartArea: {
				    height: 40
			  	},		
		        legend: {
		            visible: false
		        },
		        tooltip:{
		        	visible: false
		        },
		        seriesDefaults: {
		            type: "bar",
		            stack:true,
		            gap: 0,
		            overlay: {
		            	gradient: "none"
		            },
		            border: {
		            	width: 0,
		            	color: '#272425'
		            }
		        },
				yAxis: {
					majorTicks: {
						width: 3
					}
				},	        
				series:
		            [ {
		                field: "MildDecline",
		                name: "Mild Decline",
		                color: "#FFCBBD"
		            },{
		                field: "SigDecline",
		                name: "Significant Decline",
		                color: "#B43A3E"
		            }, {
		                field: "MildIncrease",
		                name: "Mild Increase",
		                color: "#ACF2AE"
		            }, {
		                field: "SigIncrease",
		                name: "Significant Increase",
		                color: "#3AC040",
		            }, {
		            	data : [{ current: 0, target: 0 }],
	                    type: "verticalBullet",
	                    color: '#686c70',
	                    tooltip: {
	                    	visible: false
	                    },
	                    target: {
	                   	color: '#686c70'
		                }
		            }],
				seriesClick: function(e) {
					LoadCustGrowthByClick(e.dataItem.ProdLevel, e.dataItem.LevelName, e.series.field);
					
					var i = 0;
					var stopLoop = false;
					
					$(".k-chart").each(function() {
						// get the instance of the chart
						var chart = kendo.widgetInstance($(this), kendo.dataviz.ui);
						// redraw the chart
						if (chart) {
							if (typeof chart.options.seriesDefaults.border !== 'undefined') {
								for (i=0; i < chart.options.series.length; i++) {
									if (chart.options.series[i].border.width > 0) {
										
										chart.options.series[i].border.width = 0;
										
										stopLoop = true;
										break;
									} else {
										stopLoop = false;
									}
								}
							}
						}
						if (stopLoop) { 
							if (e.sender !== chart) {
								chart.redraw();
							}
							return false; 
						}
					});

					e.series.border.width = 2;
					e.sender.redraw();					
			    },	                
		        valueAxis: {
		        	min: growthRangeMin,
		        	max: growthRangeMax,
		            line: {
		                visible: false
		            },
		            minorGridLines: {
		                visible: false
		            },
		            majorGridLines: {
		                visible: false
		            },
		            labels: {
		            	visible: false
		            }
		        },
				categoryAxis: {
			        minorGridLines: {
			            visible: false
			        },
			        majorGridLines: {
			            visible: false,
			        },
	                line: {
	                    visible: false
	                },
			    }  
			};
		
			return chartOptions;
		};
		
		function LoadCustGrowthByClick(prodLevel, levelName, bucket) {
	
	        /*var chartOptions = [];
        
			if ($scope.growthTimeframe=== "YTD"){
				$scope.growthLbl= "YTD Growth %";
				$scope.amtLbl = $scope.growthTimeframe;
			}
			else if ($scope.growthTimeframe=== "MTD"){
				$scope.growthLbl= "MTD Growth %";
				$scope.amtLbl = $scope.growthTimeframe;			
			}
			else if ($scope.growthTimeframe=== "90Day"){
				$scope.growthLbl= "90-Day Growth %";
				$scope.amtLbl = "90-Day";			
			}
			
			var startTime = new Date();    							
			
			kendo.ui.progress($(".custgrid-loading"), true);
			$http.get(AppSvc.apiPath + '/api/Dash?geogid='+ currentGeog.Id + '&prod_level='+ prodLevel +'&level_name='+ encodeURIComponent(levelName) +'&timeframe='+ $scope.growthTimeframe +'&bucket=' + bucket + '&capdispflag=' + $scope.growthCapDisp)
				.success(function(data) {
					AppSvc.logGATimingEvent('Dashboard - Web API', 'Load Customer Growth', startTime); 
					
					$scope.selectedCustListGrp = prodLevel + "/" + levelName + "/" + bucket; 				
	        		    			    		    
					$scope.custGrowthGridShow = true;
					
					var amtField = "AmtUSD",
					    growthField = "GrowthUSD";
					
					if ($scope.USDCurrency === false){
						amtField = "AmtLocal";
					    growthField = "GrowthLocal";						
					}
					
					$scope.mainGridOptions = {
	                    dataSource: {
	                        data: data,
	                        schema: {
	                            model: {
	                                fields: {
	                                    AcctName: { type: "string" },
	                                    AmtUSD: { type: "number" },
	                                    GrowthUSD: { type: "number" }
	                                }
	                            }
	                        }
	                    },
						sortable: true,
						selectable: true,
						change: function(e){
							var grid = e.sender;
    						var dataItem = grid.dataItem(this.select());	
    						
							var custVars = {
								AccountNum: dataItem.AcctNum,
								AccountName: dataItem.AcctName
							}	    						
    						
						    SharedSvc.setCustVars(custVars); 		    
						    
						    //Navigate to customer details page
							$location.path('/custdetails').replace();
				         	$scope.$apply();
    						
    						
						},						
		                columns: [{
				                    field: "AcctName",
				                    title: " ",
				                    sortable: false
		                    	},
		                    	{
				                    field: amtField,
				                    title: $scope.amtLbl + ' Sales',
				                    sortable: true, 
				                    width: "150px",
				                    headerAttributes:{ style:"text-align:center" },
				                    attributes:{ style:"text-align:right" },
				                    template: function(x){		                    
				                    	if ($scope.USDCurrency === false){
				                    		return $scope.currencyFormatter(x.AmtLocal);
										}
										else{
											return $scope.currencyFormatter(x.AmtUSD);
										} 		                    		                    	
		                    		},
		                    	},
			                    {
				                    field: growthField,
				                    headerAttributes:{ style:"text-align:center" },
				                    attributes:{ style:"text-align:center" },				                    
				                    title: "YoY%",
				                    width: "100px",
				                    format: "{0:#,##}",
				                    sortable: true
			                    }
		                ]
		            };		
		            
			
					//This is required in order for the series data to be updated when selecting a different geography
					if(typeof $scope.custGrowthGrid!== 'undefined'){ 
						$scope.custGrowthGridShow = true;
						$scope.custGrowthGrid.setOptions($scope.mainGridOptions);	 
					};	
					
					kendo.ui.progress($(".custgrid-loading"), false);
					
				}) // End $http success
				.error(function() {
					kendo.ui.progress($(".custgrid-loading"), false);

					if (status === "410"){
						AppSvc.loadInProcess();
					}					
				}); 
				
			*/
				
		}

// End Product Growth

		//Call to Get last data refresh info/date
		getLastRefreshInfo();


		//Reload charts when navigating back to Dashboard
		if (currentGeog.Id !== "") {
			showToastrQA();
			$scope.geogName = currentGeog.Name;
			$scope.USDCurrency = currentCurr.USDCurrency;
			$scope.foreighCurrencyLabel = currentCurr.ForeignCurrencyLabel;
			
			LoadDirectTraceData();
			LoadYtdComSales();
			$scope.GetUpDownData();
		}
		
		
		function showToastrQA(){
			/*setTimeout(function(){ 
				toastr.error('This is the Insight QA Site. The Production Version can be accessed here by clicking the button below: <br><br><div style="text-align:center;"><a href="http://insight.conmed.com" class="btn btn-default" role="button" style="color:black;">Go To Production</a></div>', 'Insight QA Site', { positionClass: "toast-top-center", "showEasing": "swing", "hideEasing": "linear", "showMethod": "fadeIn", "closeButton": true, "tapToDismiss": true, "hideMethod": "fadeOut", "timeOut": 0});
			
			}, 1500);
			*/
		}
		
		showToastrQA();
		
		
	}
})();