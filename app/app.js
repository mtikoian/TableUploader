(function() {
	'use strict'
	
    angular.module('app', ['ngRoute', 'ngCookies', 'ngAnimate', 'kendo.directives', 'ui.bootstrap'])
		.config(config)
		.factory('SharedSvc', SharedSvc)
		.service('AppSvc', AppSvc)
		.run(run);
		
	config.$inject = ['$routeProvider', '$locationProvider', '$windowProvider'];
	function config($routeProvider, $locationProvider, $windowProvider, AppSvc) {
		
		function showPhoneTemplate() {
			var $window = $windowProvider.$get();
			var isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(blackberry)/i);
				
			if (($window.innerHeight < 415 || $window.innerWidth < 415) && isMobile) {
				return true;
			} else {
				return false;
			}
		}
		
		$routeProvider
			.when ('/', {
				templateUrl: 'app/components/login/login.view.html',
				controller: 'LoginCtrl'
			})
			.when ('/dashboard', {
				templateUrl: function() {
					if (showPhoneTemplate()) {
						return 'app/components/dashboard/dashboard.view.phone.html'
					} else {
						return 'app/components/dashboard/dashboard.view.html'
					}
				}
			})
            .when('/tables', {
                templateUrl: function () {
                    if (showPhoneTemplate()) {
                        return 'app/components/tables/tables.view.phone.html'
                    } else {
                        return 'app/components/tables/tables.view.html'
                    }
                }
            })
            .when('/processes', {
                templateUrl: function () {
                    return 'app/components/processes/processes.view.html'
                    }
            })
										
			.otherwise({
				redirectTo: '/'
			});
	}
		
	function SharedSvc() {
	
		//var user_guid = "";
		
		var geog = {
			Id: '',
			Name: '',
			CurrencyString: '',
			TreeDataSource: ''
		}
		
		var originalGeog = "";
		var quotaId = "";
		
		var lastUpdateDate = "";
		
		var refreshDate = "";
		
		var overrideDate = "";
		
		var asOfDateLabel = "";
		var customDate = "";
		var currentDayLabel = "";
		var timeframeSelection = "";
		
		var exportInProcess = false;
		
		var globalCurrency = {
			CurrencyRegion: '',
			CurrencyDecimal: '',
			CurrencyThousandSymbol: '',
			ForeignCurrencyLabel: '',
			USDCurrency: '',
			CurrencyListDataSource: '',
			CurrencyListOptions: ''
		}
		
		var custVars = {
			AccountNum: '',
			AccountName: ''
		}
		
		var productDataSources = {
			GeogID: '',
			Division: '',
			Major: '',
			Minor: '',
			Line: '',
			Group: ''
		}
		
		var productSelections = {		
			divSelection: '',
		    majSelection: '',
		    minSelection: '',
		    lineSelection: '',
		    grpSelection: ''
		}	
		
		
		var geogSearchVars = {
			searchApplied: false,
			searchLabel: '',
			paramData: ''
		}
		
		var pageResetToggle = false;
						
		return {
			getGeog: function() {
				return geog;
			},
			setGeog: function(value) {
				geog = value;
			},
			getQuotaId: function() {
			    return quotaId;
			},
			setQuotaId: function(value) {
			    quotaId = value;
			},
			getOriginalGeog: function(){
				return originalGeog;
			},
			setOriginalGeog: function(value) {
				originalGeog = value;
			},			
			getPageResetToggle : function() {
				return pageResetToggle;
			},
			setPageResetToggle : function(value) {
				pageResetToggle = value;
			},
			getGeogSearchVars : function() {
				return geogSearchVars;
			},
			setGeogSearchVars : function(value) {
				geogSearchVars = value;
			},		
			getCurrency: function() {
				return globalCurrency;
			},
			setCurrency: function(value) {
				globalCurrency = value;
			},
			getCustVars: function() {
				return custVars ;
			},
			setCustVars: function(value) {
				custVars = value;
			},
			getLastUpdateDate: function() {
				return lastUpdateDate;
			},
			setLastUpdateDate: function(value) {
				lastUpdateDate = value;
			},
			getAsOfDateLabel: function() {
				return asOfDateLabel;
			},
			setAsOfDateLabel: function(value) {
				asOfDateLabel= value;
			},				

			getRefreshDate: function() {
				return refreshDate;
			},
			setRefreshDate: function(value) {
				refreshDate= value;
			},	
			
			getTimeframeSelection: function() {
				return timeframeSelection;
			},
			setTimeframeSelection: function(value) {
				timeframeSelection = value;
			},			
			getCurrentDayLabel: function() {
				return currentDayLabel;
			},
			setCurrentDayLabel: function(value) {
				currentDayLabel = value;
			},
			getOverrideDate: function() {
				return overrideDate;
			},
			setOverrideDate: function(value) {
				overrideDate= value;
			},			
			getExportInProcess: function() {
				return exportInProcess;
			},
			setExportInProcess: function(value) {
				exportInProcess = value;
			},
			getProductDS: function() {
				return productDataSources;
			},
			setProductDS: function(value) {
				productDataSources = value;
			},
			getProductSelections: function() {
				return productSelections;
			},
			setProductSelections: function(value) {
				productSelections = value;
			}
            ,
			getCustomDate: function() {
			    return customDate;
			},
		    setCustomDate: function(value) {
		        customDate =  value;
            }
		}
	}
	
	function AppSvc($http, $location, $window) {
	    this.apiPathCube = "services/UPLOADERAPI";

		//this.apiPath = "https://w4.linvatec.com/WebServices/DashAPI";
		//this.apiPathCube = "https://w4.linvatec.com/WebServices/InsightDevCubeAPI";
		
	    //this.exportFilePath = "https://insightqa.conmed.com/ExportFiles/";
	    this.exportFilePath = "https://webtools.conmed.com/tableuploader/ExportTemplates/";
	    //this.exportFilePath = "https://w4dev.linvatec.com/tableuploader/ExportTemplates/";
	
		this.getShortMonthName = function(month) {
			var shortMonth = "";
			switch(month) {
				case 0: 
					shortMonth = "Jan";
					break;
				case 1: 
					shortMonth = "Feb";
					break;
				case 2: 
					shortMonth = "Mar";
					break;
				case 3: 
					shortMonth = "Apr";
					break;
				case 4: 
					shortMonth = "May";
					break;
				case 5: 
					shortMonth = "Jun";
					break;
				case 6: 
					shortMonth = "Jul";
					break;
				case 7: 
					shortMonth = "Aug";
					break;
				case 8: 
					shortMonth = "Sep";
					break;
				case 9: 
					shortMonth = "Oct";
					break;
				case 10: 
					shortMonth = "Nov";
					break;
				case 11: 
					shortMonth = "Dec";
					break;
			}
			return shortMonth;
		}

	    this.urlPath = "/tableuploader/#";
		
		this.initGA = function() { 
			
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
			(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
		  	
			var user_guid = "";	
			var gaKey = "UA-68010438-4aa";

			//$http.get(this.apiPath + '/api/Users?guid_user_id=')			
			$http.get(this.apiPathCube + '/api/Misc/GetSetGUID')
		    	.success(function(data) {
		    		user_guid = data.UserGUID;
		    		ga('create', gaKey, 'auto');
					ga('set', 'userId', user_guid);
					ga('set', 'dimension1', user_guid);
					ga('send', 'pageview');
		    	})
		    	.error(function() {
		    		user_guid = "Unknown";
		    		ga('create', gaKey, 'auto');
					//ga('set', '&uid', user_guid);
					ga('set', 'userId', user_guid);
					ga('set', 'dimension1', user_guid);
					ga('send', 'pageview');
		    	});
		}
		  
		this.logGAClickEvent = function(view, action, label) {
			ga('send', {
				hitType: 'event',
				eventCategory: view + ' - User Click',
				eventAction: action,
				eventLabel: label
			});
		}
		
		this.logGATimingEvent = function(category, description, svcStartTime) {
			var d = new Date(); 	
			var diff = d - svcStartTime;
		    ga('send', 'timing', category, description, diff);
		}
		
		
		this.convertCurrency = function(val, region, thousandSymbol, decSymbol) {
			var currency = $("<span>"+val+"</span>").formatCurrency({roundToDecimalPlace: 0, 
			                                                   region: region, 
			                                                   digitGroupSymbol: thousandSymbol, 
			                                                   decimalSymbol: decSymbol}).text();		
			return currency;
		}
		
		this.convertToNumber = function(val, region, thousandSymbol, decSymbol) {
			var currency = $("<span>"+val+"</span>").formatCurrency({roundToDecimalPlace: 1, 
			                                                   region: region, 
			                                                   digitGroupSymbol: thousandSymbol, 
			                                                   decimalSymbol: decSymbol,
			                                                   symbol: ""}).text();		
			return currency;
		}
		
		
		this.loadInProcess = function(){		
			$location.path('/isLoading').replace();
		}
		
		this.isMobile = { 
				Android: function() { return navigator.userAgent.match(/Android/i); }, 
				BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); }, 
				iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); }, 
				Opera: function() { return navigator.userAgent.match(/Opera Mini/i); }, 
				Windows: function() { return navigator.userAgent.match(/IEMobile/i); }, 
				any: function() { return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows()); } 
		}	
		
		this.isSafari = function (){
		
			var safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
			
			if (safari){
				return true;
			}
			else{
				return false;
			}
			
		};
		
		
		/*this.isPhone = function() {
			var w = angular.element($window);
			
			if (w.innerHeight() < 415 || w.innerWidth() < 415) {
				return true;
			} else {
				return false;
			}
		}*/
	}
	
	run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];
	function run($rootScope, $location, $cookieStore, $http) {
		// keep user logged in after page refresh
		
		
		$rootScope.$on('$locationChangeStart', function (event, next, current) {
			// redirect to login page if not logged in
		    if ($location.path() !== '/' && !$rootScope.globals.currentUser) {
		        $rootScope.globals = $cookieStore.get('globals') || {};
		        if ($rootScope.globals.currentUser) {
		            //$http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
		            $http.defaults.headers.common['Authorization'] = $rootScope.globals.currentUser.authdata; // jshint ignore:line
		        }
				$location.path('/');
			}
		});
	};
	
})();