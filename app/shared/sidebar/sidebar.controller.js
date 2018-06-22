(function() {
	'use strict'
	
	angular.module('app')
		.controller('SidebarCtrl', SidebarCtrl);
		
	function SidebarCtrl($scope, $http, $rootScope, SharedSvc, AppSvc) {
		var initialLoad = true;
	    var datasource;
	    var userName = $rootScope.globals.currentUser.username;
	    
	    $scope.showGeogTree = true;
	    
	    var pageResetGeog = false;
	    
	    SharedSvc.setPageResetToggle(false);
	        
	    
	    //Check if the geog was already selected
		var currentGeog = SharedSvc.getGeog();
	    
 		var paramData = {
		                	"geogID" : currentGeog.Id,
							"userID": userName,
							"overrideId": ""
						};	    
						
		
		//Check if user applied a search/geog filter from a previous page				
	    var geogSearch = SharedSvc.getGeogSearchVars();
	    
	    if (geogSearch.searchApplied){
	    	$scope.geogSearchHasSelection = true;
	    	$scope.selectedGeogSearchVal = geogSearch.searchLabel;
	    	paramData = geogSearch.paramData;
	    	

            	
        	//flag set to true to open top level of new tree list
        	initialLoad = false;
			
			setGlobalSearchVars(geogSearch.searchLabel);	
	    		    	
	    }
	    else{
	    	$scope.geogSearchHasSelection = false;
	    	
	    }
	  
		if (currentGeog === "" || currentGeog.Id === ""){
			//Initialize Google Analytics
			//AppSvc.initGA();
			
			//set default tree source			
			setTreeDatasource();		     
		    
		}
		else{
			initialLoad = false;
			datasource = currentGeog.TreeDataSource;					
		}
		
		function setTreeDatasource(){
		
			//set default tree source			
			datasource = new kendo.data.HierarchicalDataSource({
		        transport: {
		            read: {
		                url: AppSvc.apiPathCube + '/api/misc/GetNextGeogWithSearch',
		                data: function(x){
		                	var d = SharedSvc.getGeogSearchVars();	
		                	var y = d.paramData;   
		                			                	
		                	var reset = SharedSvc.getPageResetToggle();
		                	
		                	if (reset){
		                		SharedSvc.setPageResetToggle(false);
		                		return y;
		                	}
		                	else{
		                		return paramData;	
		                	}	                			                	
		                	
		                },
		                dataType: "json",
		                type: "POST",
			            beforeSend: function(req) {
			                req.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
			            }
		            }
		        },
		        schema: {
		            model: {
		                id: "id",
		                hasChildren: "hasChildren"
		            }
		        }
		    });
		    
		    //bind datasource to tree control
			$scope.treeOptions = {
				dataSource: datasource,
		        selectable: true,
		        dataTextField: "GeogDesc",
		        dataBound: treeDataBound,
		        select: treeNodeSelected
			};
		    
		}		
		
		//Check if the currency was already selected
		var currentCurr = SharedSvc.getCurrency();

		$scope.treeOptions = {
			dataSource: datasource,
	        selectable: true,
	        dataTextField: "GeogDesc",
	        dataBound: treeDataBound,
	        select: treeNodeSelected
		};
		
		function treeDataBound(e) {
			if (initialLoad) {
						
				var x = currentGeog;
				var y = SharedSvc.getGeogSearchVars();	
				
		    	var z = $scope.geogSearchHasSelection;
		    	var w = $scope.selectedGeogSearchVal;
		    	var t = geogSearch.paramData;

				var oid = "";
				
				var topTree = this.dataItem('.k-first').id;
				
				if (topTree == paramData.overrideId){
					oid = "";
					
		 			paramData = {
		            	"geogID" : this.dataItem('.k-first').id,
		            	"id" : this.dataItem('.k-first').id,
						"userID": userName,
						"overrideId": oid 
					};	 
					
					
				}
				else if(paramData.overrideId == ""){
					oid = "";
					
					SharedSvc.setOriginalGeog(this.dataItem('.k-first').id);
					
		 			paramData = {
		            	"geogID" : this.dataItem('.k-first').id,
		            	"id" : this.dataItem('.k-first').id,
						"userID": userName,
						"overrideId": oid 
					};	 
					
				}
				else{
					oid = oid = paramData.overrideId;
					
		 			paramData = {
		            	"geogID" : oid,
		            	"id" : oid,
						"userID": userName,
						"overrideId": ""
					};	 
					
				}
				



				this.select(".k-first");
				this.expand(".k-first");
				initialLoad = false;
				
				
				//refreshDatasource();				
				
				updateGeog({
					Id:  this.dataItem('.k-first').id,
					Name: this.dataItem('.k-first').GeogDesc,
					CurrencyString: this.dataItem('.k-first').localCurrSymbol,
					TreeDataSource: this.dataSource,
					isGenSurgeryNode: this.dataItem('.k-first').isGenSurgeryNode
				});
				
				setCurrencySettings(this.dataItem('.k-first').localCurrSymbol);
			}
		}
		
		function treeNodeSelected(e) {
			this.expand(e.node);
		}
		
		$scope.treeClicked = function(e) {
			var dataItem = this.tree.dataItem(e.target);
			
			//Google Analystics Log Tree Nav
			AppSvc.logGAClickEvent('Dashboard - Geography Navigation', dataItem.id + " - " + dataItem.GeogDesc);
		
			//Set Current Global Settings into SharedSvc
			setCurrencySettings(dataItem.localCurrSymbol);
			
			
 			paramData = {
            	"geogID" : dataItem.id,
            	"id" : dataItem.id,
				"userID": userName,
					"overrideId": ""
			};	 			
		
			updateGeog({
				Id: dataItem.id,
				Name: dataItem.GeogDesc,
				CurrencyString: dataItem.localCurrSymbol,
				TreeDataSource: this.tree.dataSource,
				isGenSurgeryNode: dataItem.isGenSurgeryNode
			});
		};
		
		function setCurrencySettings(currString){						
			//Split currency string into individual values	
			var currencyArray= currString.split('~');
			
			var tempCurrency = {
				CurrencyRegion: '',
				CurrencyDecimal: '',
				CurrencyThousandSymbol: '',
				ForeignCurrencyLabel: '',
				USDCurrency: true,
				CurrencyListDataSource: '',
				CurrencyListOptions: ''  
			};
					
			if (currencyArray.length === 4){					    
			    tempCurrency.CurrencyRegion = currencyArray[0];			    
			    tempCurrency.CurrencyDecimal = currencyArray[1];	
			    tempCurrency.CurrencyThousandSymbol = currencyArray[2];	
			    tempCurrency.ForeignCurrencyLabel= currencyArray[3];	
			}
			else{
				//Default to USD when currency string is empty
			    tempCurrency.CurrencyRegion = "en-US";			    
			    tempCurrency.CurrencyDecimal = ".";
			    tempCurrency.CurrencyThousandSymbol = ",";
			    tempCurrency.ForeignCurrencyLabel= "$USD";	 
			}
			
			//Flag scope variable based on USD or not, used in html to show/hide data tables
			if (tempCurrency.CurrencyRegion === 'en-US'){
				tempCurrency.USDCurrency = true;
			}
			else{
				tempCurrency.USDCurrency = false;
			}
			
			//Array to hold currency list values for drop down on views
			var currencyValueArray = [];
				
			if (tempCurrency.ForeignCurrencyLabel !== "$USD"){
				currencyValueArray.push({"value": "$USD"});
				currencyValueArray.push({"value": tempCurrency.ForeignCurrencyLabel});
			}
			else{
				currencyValueArray.push({"value": tempCurrency.ForeignCurrencyLabel});
			}
			tempCurrency.CurrencyListDataSource = currencyValueArray; 

			updateCurr(tempCurrency);
		}
		
		function updateGeog(geog) {
			SharedSvc.setGeog(geog);
			
			//clear previous customer selection on geog change
			var custVars = {
				AccountNum: "",
				AccountName: ""
			}
			
        	SharedSvc.setCustVars(custVars);
						
		}
		
		function updateCurr(curr) {
			SharedSvc.setCurrency(curr)
		}
		
		$scope.ToggleSearch = function(val) {
		
			if (val === "HideTree"){
				$scope.showGeogTree = false;
			}
			else{
				$scope.showGeogTree = true;
			}
		
		}
		
		//*** Start of geog filter code ***			
	    $scope.geogSearchListOptions = {
	        placeholder: "Type to search territories...",
            dataTextField: "GeogDesc",
            dataValueField: "id",
            filter: "contains",
            delay: 500,
            highlightFirst: true,          
	    	autoBind: false,
	        minLength: 3,
	        tagTemplate: '<span class="k-state-default">#: data.id #</span>',  
	        filtering: function(e){
	        	var x = SharedSvc.getGeogSearchVars();
	        },
            select: function(e){
            	$scope.geogSearchHasSelection = true;            
            	var dataItem = this.dataItem(e.item);
            	
            	//flag set to true to open top level of new tree list
            	initialLoad = true;
            	
		 		paramData = {
                	"id" : dataItem.id,
					"userID": userName,
					"overrideId": dataItem.id 
				};	    
										
				setGlobalSearchVars(dataItem.GeogDesc);
				
				SharedSvc.setPageResetToggle(true);	
				
				setTreeDatasource();

				$("#geogTreeView").data("kendoTreeView").dataSource.read();
            	
            },        
	        dataSource: {
	            type: "json",
	            serverFiltering: true,
	            transport: {
	                read: {
	                    url: AppSvc.apiPathCube + "/api/misc/SearchGeogTree",
	                    type:"POST",
	                    data: function (x) { 
	                    
							try {
								if (x.filter.filters[0].value !== undefined){
																									
									return {
										"userId": userName, 
										"searchTerm": x.filter.filters[0].value
									};
								
								}	
								else{                    
									return {
										"userId": userName, 
										"searchTerm": ""
									};
			                    }  
							}
							catch(err) {
								var autocomplete= $("#geogSearchList").data("kendoAutoComplete");		    
		    
							    var autoSource = autocomplete.dataSource;		    
							    autocomplete.close();
							    //err.preventDefault();
				     			//err.sender.dataSource.data([]);
								
							
									return {
										"userId": userName, 
										"searchTerm": ""
									};
							}	  
                             
	                    },
			            beforeSend: function(req) {
			                req.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
			            }
	                }
	            },
	            error :function(xhr, status, text) {
					if (status == "410"){
						AppSvc.loadInProcess();
					}
				}

	        }
	    };	
	    
		$scope.clearSelectedAcct = function(){
			$scope.selectedGeogSearchVal = "";
			$scope.geogSearchHasSelection = false;
			        	
     		var autoComplete = kendo.widgetInstance($("#geogSearchList"));		
			autoComplete.search("");
        	
        	//reset param data back to users geography
 			paramData = {
            	"geogID" : "",
            	"id" : "",
				"userID": userName,
				"overrideId": ""
			};	 

			pageResetGeog = true;
			
			var geogSearchVars = {
				searchApplied: false,
				searchLabel: "",
				paramData: paramData

			}	
			
			SharedSvc.setPageResetToggle(true);
			
			$scope.selectedGeogSearchVal = "";
			
			SharedSvc.setGeogSearchVars(geogSearchVars);	
			
			geogSearch = SharedSvc.getGeogSearchVars();			
			
			
        	//flag set to true to open top level of new tree list
        	initialLoad = true;
        	
        	//reset tree datasource with new paramData
        	setTreeDatasource();
			
			//Rebind tree
			$("#geogTreeView").data("kendoTreeView").dataSource.read();     	
		    
		    //Get autoComplete object
		    var autocomplete= $("#geogSearchList").data("kendoAutoComplete");		    
		    
		    var autoSource = autocomplete.dataSource;
		    //Clear filters:
		    autoSource.filter([]);
		    autocomplete.close();
		    
		    autocomplete.dataSource.data([]);
		    
		}
		
		function resetGlobalSearchVars(){
		
			var geogSearchVars = {
				searchApplied: false,
				searchLabel: ''
			}	
			
			SharedSvc.setGeogSearchVars(geogSearchVars);		
		
		}
		
		function setGlobalSearchVars(val){
		
			var geogSearchVars = {
				searchApplied: true,
				searchLabel: val,
				paramData: paramData
			}	
			
			SharedSvc.setPageResetToggle(false);
			
			$scope.selectedGeogSearchVal = val;
			
			SharedSvc.setGeogSearchVars(geogSearchVars);		
		
		}		
		
	}
})();