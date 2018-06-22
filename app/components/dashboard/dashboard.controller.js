(function() {
	'use strict'
	
	angular.module('app')
		.controller('DashboardCtrl', DashboardCtrl);
		
	function DashboardCtrl($scope, $http, $location, $window, SharedSvc, AppSvc, $rootScope) {
	    toastr.options = {
	        "closeButton": true,
	        "debug": false,
	        "newestOnTop": false,
	        "progressBar": true,
	        "positionClass": "toast-top-center",
	        "preventDuplicates": true,
	        "onclick": null,
	        "showDuration": "750",
	        "hideDuration": "1000",
	        "timeOut": "3000",
	        "extendedTimeOut": "1000",
	        "showEasing": "swing",
	        "hideEasing": "linear",
	        "showMethod": "fadeIn",
	        "hideMethod": "fadeOut"
	    }

	    $scope.treeOptions = {
	        height: "600px"
	    };


	    var windowHeight = $window.innerHeight;
	    var divHeight = windowHeight * .75;
	    document.getElementById('leftPanel').setAttribute("style", "height: " + divHeight + "px");


	    $("#files").kendoUpload({
	        async: {
	            autoUpload: true,
	            saveUrl: "services/QuotaAPI/api/quota/postfile?username=" + $rootScope.globals.currentUser.username
	        },
	        validation: {
	            allowedExtensions: [".xlsx"],
	        },
	        multiple: false,
	        success: openNewQuotas
	    });


	    /*$('#txtUploadFile').on('change', function (e) {
	        kendo.ui.progress($("#quotaGrid"), true);
	        var files = e.target.files;
	        if (files.length > 0) {
	            if (this.value.lastIndexOf('.xlsx') === -1) {
	                toastr.error('Only excel files with the xlxs extension are allowed!');
	                this.value = '';
	                return;
	            }
	            if (window.FormData !== undefined) {
	                var data = new FormData();
	                for (var x = 0; x < files.length; x++) {
	                    data.append("file" + x, files[x]);
	                }
	            }


	                $.ajax({
	                    type: "POST",
	                    url: '/services/QuotaAPI/api/quota/postfile?username=' + $rootScope.globals.currentUser.username,
	                    
	                    contentType: false,
	                    processData: false,
	                    data: data,
	                    
	                    success: function (result) {
	                        //load Upload
	                        openNewQuotas();
	                        newQuotas();
	                    },

	                    error: function (xhr, status, p3, p4) {
	                        var err = "Error " + " " + status + " " + p3 + " " + p4;
	                        if (xhr.responseText && xhr.responseText[0] == "{")
	                            err = JSON.parse(xhr.responseText).Message;
	                        console.log(err);
	                    }
	                });
	            } else {
	                toastr.error("This browser doesn't support HTML5 file uploads!");
	            }
	    });*/

	    function editQuota(e) {
	       

	    }
	    function editNewQuota(e) {

	    }


	    loadTree();
	    $("#editWindow").hide();
	    $("#loadWindow").hide();
	    $("#submitQuotasBtn").hide();
	    $("#downloadQuotasBtn").kendoButton({
	        enable: false
	    });
	    $("#uploadQuotasBtn").kendoButton({
	        enable: true
	    });
	    //$("#downloadQuotasBtn").addClass("k-state-active");
	    //$("#uploadQuotasBtn").removeClass("k-state-active");
	    //$("#addQuotasBtn").hide();
	    
	    $scope.getQuotas = function () {
	        $scope.id = SharedSvc.getQuotaId();
		    loadQuotas();

	    };

	    $scope.uploadQuotas = function () {
	        //alert("This function has not yet been implemented");
	        openLoadForm();

	    };

	    $scope.submitQuotas = function () {
	        $http.post('services/QuotaAPI/api/quota/SubmitQuotasToUpload?username=' + $rootScope.globals.currentUser.username)
                .success(function (d) {
                    $(".k-window-content").each(function () {
                        $(this).data("kendoWindow").close();

                    });
                    loadQuotas();
                });
	    };

	    $scope.downloadQuotas = function () {
	        kendo.ui.progress($("#quotaGrid"), true);
	        $scope.id = SharedSvc.getQuotaId();
	        if ($scope.id == "") {
	            toastr.error("Please select a geography");
	        }
	        else {
	            $http.get('services/QuotaAPI/api/quota/GetTemplateFromId?id=' + $scope.id + "&username=" + $rootScope.globals.currentUser.username)
                .success(function (d) {
                    var filename = d;

                    var fileLocation = AppSvc.exportFilePath + filename;
                    window.open(fileLocation);
                    //toastr.info("Your template has been created and downloaded");
                    
                    var uploadBtn = $("#uploadQuotasBtn").data("kendoButton");
                    uploadBtn.enable(true);
                    kendo.ui.progress($("#quotaGrid"), false);
                });
	        }

	    };

	    $scope.uploadQuotaTemplate = function () {
	        toastr.info("This function has not yet been implemented");
	        //read the file, create a datatable and put it into a kendo grid 

	        //Need to call GetDataFromTemplate and then newQuotas()


	    };

	    function onChange(e) {
	        var rows = e.sender.select();
	        rows.each(function (e) {
	            var grid = $("#quotaGrid").data("kendoGrid");
	            var dataItem = grid.dataItem(this);
	            
	            openEditForm(dataItem);

	        })
	    };
	    //var quotaData = [];

	    function updateQuota(e) {

	        var dateObj = new Date(e.model.quotaDate);
	        var month = dateObj.getUTCMonth() + 1; //months from 1-12
	        var day = dateObj.getUTCDate();
	        var year = dateObj.getUTCFullYear();

	        var newdate = year + "-" + month + "-" + day;
	        //var date = new Date(e.model.quotaDate).toDateString("YYYY-MM-DD");
	        var jsonData = {
	            "quotaDate": newdate,
	            "id": e.model.geogId,
	            "capital": e.model.capital,
	            "disposable": e.model.disposable,
	            "tissue": e.model.tissue,
	            "username": $rootScope.globals.currentUser.username 
	        };

	        $http.post('services/QuotaAPI/api/quota/UpdateQuota', JSON.stringify(jsonData))
            .success(function (d) {
                
                loadQuotas();

            });
	    };

	    function updateNewQuota(e) {
	        var dateObj = new Date(e.model.quotaDate);
	        var month = dateObj.getUTCMonth() + 1; //months from 1-12
	        var day = dateObj.getUTCDate();
	        var year = dateObj.getUTCFullYear();

	        var newdate = year + "-" + month + "-" + day;
	        //var date = new Date(e.model.quotaDate).toDateString("YYYY-MM-DD");
	        var jsonData = {
	            "quotaDate": newdate,
	            "parentId": e.model.parentId,
	            "territoryId": e.model.territoryId,
	            "capital": e.model.capital,
	            "disposable": e.model.disposable,
	            "tissue": e.model.tissue,
	            "username": $rootScope.globals.currentUser.username
	        };

	        $http.post('services/QuotaAPI/api/quota/UpdateUploads', JSON.stringify(jsonData))
            .success(function (d) {

                newQuotas();

            });

	    };


	    $scope.addQuotas = function() {
	        openLoadForm();
	    };

	    function loadQuotas() {

	        $scope.quotaData = new kendo.data.DataSource({
	            transport: {
	                read: {
	                    url: "services/QuotaAPI/api/quota/GetQuotas?id=" + $scope.id,
	                    beforeSend: function (request) {
	                        request.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
	                    }
	                },/*{
	                    
	                    url: "services/QuotaAPI/api/quota/UpdateQuota",// + JSON.stringify(jsonData),
	                    dataType: "jsonp",
	                    beforeSend: function (request) {
	                        request.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
	                    }
	                },*/
	              
	            },
	            schema: {
	                model: {
	                    id: "id",
	                    fields: {
	                        quotaDate: { editable: false },
	                        total: { format: "{0:c}", type: "number", editable: false },
	                        geogId: { editable: false, hidden: true },
	                        capital: { format: "{0:c}", type: "number" },
	                        disposable: { format: "{0:c}", type: "number" },
	                        tissue: { format: "{0:c}", type: "number" },
	                        currencyCode: { editable: false, hidden: true }
	                    }
	                }
	            }
	        });

	        


	    var windowHeight = $window.innerHeight;
	    //var toolbarHeight = document.getElementById('propToolbar').offsetHeight;
	    //var tabHeight = document.getElementById('allProposals').offsetHeight;

	    var gridHeight = (windowHeight * .80);
	    $("#quotaGrid").kendoGrid({
	        dataSource: $scope.quotaData,
	        databound: $("#quotagrid").show(),
	        columns: [
              { field: "quotaDate", title: "Date", editable: false },
              { field: "geogId", title: "ID", hidden: true },
              { field: "total", title: "Total Quota", format: "{0:c}", editable: false, defaultValue: "0.00", type: "number", headerAttributes: { style: "text-align:right" }, attributes: { style: "text-align:right" }, template: '#= kendo.toString(capital + disposable + tissue, "n2")#' },
              { field: "capital", title: "Capital", format: "{0:c}", defaultValue: "0.00", type: "number", headerAttributes: { style: "text-align:right" }, attributes: { style: "text-align:right" } },
              { field: "disposable", title: "Disposable", format: "{0:c}", defaultValue: "0.00", type: "number", headerAttributes: { style: "text-align:right" }, attributes: { style: "text-align:right" } },
              { field: "tissue", title: "Tissue", format: "{0:c}", defaultValue: "0.00", type: "number", headerAttributes: { style: "text-align:right" }, attributes: { style: "text-align:right" } },
              { field: "currencyCode", title: "Currency", editable: false, hidden: true },
              {
                  command: [
                      //define the commands here
                      { name: "edit", text: "Edit", click: editQuota }
                  ],
                  title: "Edit"
              }
	        ],
	        filterable: false,
	        height: "500px",
	        //change: onChange,
	        resizable: true,
	        selectable: true,
	        noRecords: true,
	        editable: "inline",
	        save: function(e) {
	            updateQuota(e);
	        },
	        cancel: function (e) {
	            loadQuotas();
	        },
	        messages: {
	            noRecords: "No quotas found for this geography."
	        },
	        sortable: true
	    }).data("kendoGrid");

	        $('#quotaGrid').data('kendoGrid').dataSource.read();
	        $('#quotaGrid').data('kendoGrid').refresh();

	    }


        ///////////////////////////////////Uploaded Quotas////////////////////////////////////////////////////////
	    function newQuotas() {
	        $scope.newData = new kendo.data.DataSource({
	            transport: {
	                read: {

	                    url: "services/QuotaAPI/api/quota/GetUploads?username=" + $rootScope.globals.currentUser.username,
	                    beforeSend: function (request) {
	                        request.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
	                    }
	                },
	            },
	            schema: {
	                model: {
	                    id: "id",
	                    fields: {
	                        parentId: { editable: false, hidden: true },
	                        parentDesc: { editable: false },
	                        territoryId: { editable: false, hidden: true },
	                        territoryDesc: { editable: false },
	                        quotaDate: { editable: false },
	                        sortDate: { editable: false, hidden: true },
	                        capital: { format: "{0:c}", type: "number" },
	                        disposable: { format: "{0:c}", type: "number" },
	                        tissue: { format: "{0:c}", type: "number" }
	                    }
	                }
	            }
	        });

	        var windowHeight = $window.innerHeight;

	        var gridHeight = (windowHeight * .70);
	        $("#loadGrid").kendoGrid({
	            dataSource: $scope.newData,
	           // pageSize: 100,
	            databound: $("#loadGrid").show(),
	            columns: [
                  { field: "parentId", title: "Parent ID", editable: false, hidden: true },
                  { field: "parentDesc", title: "Parent", editable: false, width: "300px" },
                  { field: "territoryId", title: "Territory ID", editable: false, hidden: true },
                  { field: "territoryDesc", title: "Territory", editable: false, width: "300px" },
                  { field: "quotaDate", title: "Date", editable: false },
                  { field: "sortDate", title: "Date", editable: false, hidden: true },
                  { field: "capital", title: "Capital", format: "{0:c}", defaultValue: "0.00", type: "number", headerAttributes: { style: "text-align:right" }, attributes: { style: "text-align:right" } },
                  { field: "disposable", title: "Disposable", format: "{0:c}", defaultValue: "0.00", type: "number", headerAttributes: { style: "text-align:right" }, attributes: { style: "text-align:right" } },
                  { field: "tissue", title: "Tissue", format: "{0:c}", defaultValue: "0.00", type: "number", headerAttributes: { style: "text-align:right" }, attributes: { style: "text-align:right" } },
                  {
                      command: [
                          //define the commands here
                          { name: "edit", text: "Edit", click: editNewQuota }
                      ],
                      title: "Edit"
                  }
	            ],
	            filterable: false,
	            /*scrollable: {
	                virtual: true
	            },*/
	            height: gridHeight,
	            resizable: true,
	            selectable: true,
	            editable: "inline",
	            save: function (e) {
	                updateNewQuota(e);

	            },
	            cancel: function (e) {
	                newQuotas();
	            },
	            sortable: true
	        }).data("kendoGrid");

	        $('#loadGrid').data('kendoGrid').dataSource.read();
	        $('#loadGrid').data('kendoGrid').refresh();
	    }


	    ///////////////////////////////////Uploaded Quotas////////////////////////////////////////////////////////


	    function openEditForm(dataItem) {
	        var editWindow = $("#editWindow");

	        function onClose() {

	        }
	        $("#editWindow").kendoWindow({
	            width: "30%",
	            title: "Edit Quotas",
	            visible: false,
	            position: { top: "10%", left: "10%" },
	            modal: true,
	            draggable: false,
	            actions: [
                    "Close"
	            ],
	            close: onClose
	        }).data("kendoWindow").center().open();

	    }

	    function openLoadForm() {
	        var loadWindow = $("#loadWindow");

	        function onClose() {

	        }
	        $("#loadWindow").kendoWindow({
	            width: "30%",
	            title: "Upload Quotas",
	            visible: false,
	            position: { top: "10%", left: "10%" },
	            modal: true,
	            draggable: false,
	            actions: [
                    "Close"
	            ],
	            close: onClose
	        }).data("kendoWindow").center().open();

	    }

	    function openNewQuotas() {
	        var loadWindow = $("#newQuotasWindow");

	        function onClose() {

	        }
	        $("#newQuotasWindow").kendoWindow({
	            width: "80%",
	            title: "New Quotas",
	            visible: false,
	            position: { top: "10%", left: "10%" },
	            modal: true,
	            draggable: false,
	            actions: [
                    "Close"
	            ],
	            close: onClose
	        }).data("kendoWindow").open();
	        $("#submitQuotasBtn").show();

	        $http.post('services/QuotaAPI/api/quota/InsertUploads?username=' + $rootScope.globals.currentUser.username)
            .success(function (d) {

                newQuotas();

            });

	        
	        var upload = $("#files").data("kendoUpload");
	        upload.clearAllFiles();
//	        upload.destroy();
	    }

	    function loadTree() {
	        var initialLoad = true;
	        var datasource;
	        var userName = $rootScope.globals.currentUser.username;

	        $scope.showGeogTree = true;

	        var pageResetGeog = false;

	        SharedSvc.setPageResetToggle(false);


	        //Check if the geog was already selected
	        var currentGeog = SharedSvc.getGeog();

	        var paramData = {
	            "geogID": currentGeog.Id,
	            "userID": userName,
	            "overrideId": ""
	        };


	        //Check if user applied a search/geog filter from a previous page				
	        var geogSearch = SharedSvc.getGeogSearchVars();

	        if (geogSearch.searchApplied) {
	            $scope.geogSearchHasSelection = true;
	            $scope.selectedGeogSearchVal = geogSearch.searchLabel;
	            paramData = geogSearch.paramData;



	            //flag set to true to open top level of new tree list
	            initialLoad = false;

	            setGlobalSearchVars(geogSearch.searchLabel);

	        }
	        else {
	            $scope.geogSearchHasSelection = false;

	        }

	        if (currentGeog === "" || currentGeog.Id === "") {
	            //Initialize Google Analytics
	            //AppSvc.initGA();

	            //set default tree source			
	            setTreeDatasource();

	        }
	        else {
	            initialLoad = false;
	            datasource = currentGeog.TreeDataSource;
	        }

	        function setTreeDatasource() {

	            //set default tree source			
	            datasource = new kendo.data.HierarchicalDataSource({
	                transport: {
	                    read: {
	                        url: AppSvc.apiPathCube + '/api/misc/GetNextGeogWithSearch',
	                        data: function (x) {
	                            var d = SharedSvc.getGeogSearchVars();
	                            var y = d.paramData;

	                            var reset = SharedSvc.getPageResetToggle();

	                            if (reset) {
	                                SharedSvc.setPageResetToggle(false);
	                                return y;
	                            }
	                            else {
	                                return paramData;
	                            }

	                        },
	                        dataType: "json",
	                        type: "POST",
	                        beforeSend: function (req) {
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

	                if (topTree == paramData.overrideId) {
	                    oid = "";

	                    paramData = {
	                        "geogID": this.dataItem('.k-first').id,
	                        "id": this.dataItem('.k-first').id,
	                        "userID": userName,
	                        "overrideId": oid
	                    };


	                }
	                else if (paramData.overrideId == "") {
	                    oid = "";

	                    SharedSvc.setOriginalGeog(this.dataItem('.k-first').id);

	                    paramData = {
	                        "geogID": this.dataItem('.k-first').id,
	                        "id": this.dataItem('.k-first').id,
	                        "userID": userName,
	                        "overrideId": oid
	                    };

	                }
	                else {
	                    oid = oid = paramData.overrideId;

	                    paramData = {
	                        "geogID": oid,
	                        "id": oid,
	                        "userID": userName,
	                        "overrideId": ""
	                    };

	                }

	                

	                this.select(".k-first");
	                this.expand(".k-first");
	                initialLoad = false;


	                //refreshDatasource();	
	                

	                updateGeog({
	                    Id: this.dataItem('.k-first').id,
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

	            var dataItem = this.dataItem(e.node);
	            SharedSvc.setQuotaId(dataItem.id);
	            var downloadBtn = $("#downloadQuotasBtn").data("kendoButton");
	            downloadBtn.enable(true);
	            var uploadBtn = $("#uploadQuotasBtn").data("kendoButton");
	            uploadBtn.enable(true);

	        }

	        $scope.treeClicked = function (e) {
	            var downloadBtn = $("#downloadQuotasBtn").data("kendoButton");
	            downloadBtn.enable(true);
	            var uploadBtn = $("#uploadQuotasBtn").data("kendoButton");
	            uploadBtn.enable(true);

			try {
  
	            var grid = $("#quotaGrid").data("kendoGrid");
	            var dataSource = grid.dataSource;
	            dataSource.data([]);//clear out old data
			}

			catch(error) 
			{
  

			}


	            var dataItem = this.tree.dataItem(e.target);
	            SharedSvc.setQuotaId(dataItem.id);

	            //Set Current Global Settings into SharedSvc
	            setCurrencySettings(dataItem.localCurrSymbol);


	            paramData = {
	                "geogID": dataItem.id,
	                "id": dataItem.id,
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

	        function setCurrencySettings(currString) {
	            //Split currency string into individual values	
	            var currencyArray = currString.split('~');

	            var tempCurrency = {
	                CurrencyRegion: '',
	                CurrencyDecimal: '',
	                CurrencyThousandSymbol: '',
	                ForeignCurrencyLabel: '',
	                USDCurrency: true,
	                CurrencyListDataSource: '',
	                CurrencyListOptions: ''
	            };

	            if (currencyArray.length === 4) {
	                tempCurrency.CurrencyRegion = currencyArray[0];
	                tempCurrency.CurrencyDecimal = currencyArray[1];
	                tempCurrency.CurrencyThousandSymbol = currencyArray[2];
	                tempCurrency.ForeignCurrencyLabel = currencyArray[3];
	            }
	            else {
	                //Default to USD when currency string is empty
	                tempCurrency.CurrencyRegion = "en-US";
	                tempCurrency.CurrencyDecimal = ".";
	                tempCurrency.CurrencyThousandSymbol = ",";
	                tempCurrency.ForeignCurrencyLabel = "$USD";
	            }

	            //Flag scope variable based on USD or not, used in html to show/hide data tables
	            if (tempCurrency.CurrencyRegion === 'en-US') {
	                tempCurrency.USDCurrency = true;
	            }
	            else {
	                tempCurrency.USDCurrency = false;
	            }

	            //Array to hold currency list values for drop down on views
	            var currencyValueArray = [];

	            if (tempCurrency.ForeignCurrencyLabel !== "$USD") {
	                currencyValueArray.push({ "value": "$USD" });
	                currencyValueArray.push({ "value": tempCurrency.ForeignCurrencyLabel });
	            }
	            else {
	                currencyValueArray.push({ "value": tempCurrency.ForeignCurrencyLabel });
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

	        $scope.ToggleSearch = function (val) {

	            if (val === "HideTree") {
	                $scope.showGeogTree = false;
	            }
	            else {
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
	            filtering: function (e) {
	                var x = SharedSvc.getGeogSearchVars();
	            },
	            select: function (e) {
	                $scope.geogSearchHasSelection = true;
	                var dataItem = this.dataItem(e.item);

	                //flag set to true to open top level of new tree list
	                initialLoad = true;

	                paramData = {
	                    "id": dataItem.id,
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
	                        type: "POST",
	                        data: function (x) {

	                            try {
	                                if (x.filter.filters[0].value !== undefined) {

	                                    return {
	                                        "userId": userName,
	                                        "searchTerm": x.filter.filters[0].value
	                                    };

	                                }
	                                else {
	                                    return {
	                                        "userId": userName,
	                                        "searchTerm": ""
	                                    };
	                                }
	                            }
	                            catch (err) {
	                                var autocomplete = $("#geogSearchList").data("kendoAutoComplete");

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
	                        beforeSend: function (req) {
	                            req.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
	                        }
	                    }
	                },
	                error: function (xhr, status, text) {
	                    if (status == "410") {
	                        AppSvc.loadInProcess();
	                    }
	                }

	            }
	        };

	        $scope.clearSelectedAcct = function () {
	            $scope.selectedGeogSearchVal = "";
	            $scope.geogSearchHasSelection = false;

	            var autoComplete = kendo.widgetInstance($("#geogSearchList"));
	            autoComplete.search("");

	            //reset param data back to users geography
	            paramData = {
	                "geogID": "",
	                "id": "",
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
	            var autocomplete = $("#geogSearchList").data("kendoAutoComplete");

	            var autoSource = autocomplete.dataSource;
	            //Clear filters:
	            autoSource.filter([]);
	            autocomplete.close();

	            autocomplete.dataSource.data([]);

	        }

	        function resetGlobalSearchVars() {

	            var geogSearchVars = {
	                searchApplied: false,
	                searchLabel: ''
	            }

	            SharedSvc.setGeogSearchVars(geogSearchVars);

	        }

	        function setGlobalSearchVars(val) {

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

	}
		
})();