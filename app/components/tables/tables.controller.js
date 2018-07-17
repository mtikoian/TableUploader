(function() {
	'use strict'
	
	angular.module('app')
		.controller('TablesCtrl', TablesCtrl);
		
	function TablesCtrl($scope, $http, $location, $window, SharedSvc, AppSvc, $rootScope) {

	    $("#downloadTablesBtn").kendoButton();
	    $("#uploadTablesBtn").kendoButton();
	    var downloadButton = $("#downloadTablesBtn").data("kendoButton");
	    downloadButton.enable(false);
	    var uploadButton = $("#uploadTablesBtn").data("kendoButton");
	    uploadButton.enable(false);
	    //$("#downloadQuotasBtn").hide();
	    //$("#uploadQuotasBtn").hide();

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

	    function onChange(e) {
	        var rows = e.sender.select();
	        rows.each(function (e) {
	            var grid = $("#tableGrid").data("kendoGrid");
	            var dataItem = grid.dataItem(this);
	            $scope.selectedTable = dataItem.source

	            $scope.GetTable();

	        })
	    };

	    $scope.username = $rootScope.globals.currentUser.username;

	    getTables();

	    function getTables() {
	        $scope.tableData = new kendo.data.DataSource({
	            transport: {
	                read: {
	                    url: "services/UPLOADERAPI/api/upload/GetTablesByUser?username=" + $scope.username,
	                    beforeSend: function (request) {
	                        request.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
	                    }
	                }
	            },
	        });

	        var windowHeight = $window.innerHeight;

	        var gridHeight = (windowHeight * .70);
	        $("#tableGrid").kendoGrid({
	            dataSource: $scope.tableData,
	            // pageSize: 100,
	            databound: $("#tableGrid").show(),
	            columns: [
                  { field: "id", title: "Parent ID", editable: false, hidden: true },
                  { field: "name", title: "Name", editable: false, hidden: true },
                  { field: "description", title: "Description", editable: false, hidden: true },
                  {
                      template: "<b>#= name #</b><br> #= description #", title: "<b>Table</b>"

                  },
                  { field: "type", title: "Type", editable: false, hidden: true },
                  { field: "source", title: "Source", editable: false},

	            ],
	            filterable: false,
	            /*scrollable: {
	                virtual: true
	            },*/
	            height: gridHeight,
	            resizable: true,
	            selectable: true,
                change: onChange,
	            sortable: true
	        }).data("kendoGrid");
        }


	    var windowHeight = $window.innerHeight;
	    var divHeight = windowHeight * .75;

	    function onUpload(e) {
	        var xhr = e.XMLHttpRequest;
	        if (xhr) {
	            xhr.addEventListener("readystatechange", function (e) {
	                if (xhr.readyState == 1 /* OPENED */) {
	                    xhr.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
	                }
	            });
	        }
	    }

	    var username = $rootScope.globals.currentUser.username;

	    $("#files").kendoUpload({
	        async: {
	            autoUpload: true,
	            saveUrl: "services/UPLOADERAPI/api/upload/postfile?username=" + username
	            
	        },
	        upload: onUpload,
	        validation: {
	            allowedExtensions: [".xlsx"],
	        },
	        success: insertNewTable
	    });

	        
	    $("#editWindow").hide();
	    $("#loadWindow").hide();
	    $("#submitTableBtn").hide();
	    $("#downloadTableBtn").kendoButton({
	        enable: false
	    });
	    $("#uploadTableBtn").kendoButton({
	        enable: true
	    });

	    
	    $scope.getQuotas = function () {
	        $scope.id = SharedSvc.getQuotaId();
		    loadQuotas();

	    };

	    $scope.GetTable = function () {
	        
	        //loadTableDetails();
	        var downloadButton = $("#downloadTablesBtn").data("kendoButton");
	        downloadButton.enable(true);
	        var uploadButton = $("#uploadTablesBtn").data("kendoButton");
	        uploadButton.enable(true);
	    };

	    $scope.uploadTable= function () {
	        //alert("This function has not yet been implemented");
	        openLoadForm();

	    };

	    function insertNewTable(e) {
	        
	        kendo.ui.progress($("#loadWindow"), true);
	        $http.post('services/UPLOADERAPI/api/upload/InsertImportTable?username=' + $rootScope.globals.currentUser.username + '&tableName=' + $scope.selectedTable)
		    	.success(function (d) {
		    	    $(".k-widget.k-upload").find("ul").remove();
		    	    $(".k-window-content").each(function () {
		    	        $(this).data("kendoWindow").close();
		    	    })
		    	.error(function () {
		    	    $(".k-widget.k-upload").find("ul").remove();
		    	    $(".k-window-content").each(function () {
		    	        $(this).data("kendoWindow").close();
		    	    })
		    	        toastr.error("Please make sure that your imported columns match the columns from the template");
		    	    
		    	});

		    	});
	        kendo.ui.progress($("#loadWindow"), false);
	    }


	    $scope.downloadTable= function () {
	        kendo.ui.progress($("#mainDivContent"), true);

	        if ($scope.selectedTable == "") {
	            toastr.error("Please select a table");
	        }
	        else {
	            $http.get('services/UPLOADERAPI/api/upload/GetTableFromName?tableName=' + $scope.selectedTable + "&username=" + $rootScope.globals.currentUser.username)
                .success(function (d) {
                    var filename = d;

                    var fileLocation = AppSvc.exportFilePath + filename;
                    window.open(fileLocation);
                    //toastr.info("Your template has been created and downloaded");
                    
                    var uploadBtn = $("#uploadTablesBtn").data("kendoButton");
                    uploadBtn.enable(true);
                    
                });
	        }
	        kendo.ui.progress($("#mainDivContent"), false);
	    };

	    $scope.uploadQuotaTemplate = function () {
	        toastr.info("This function has not yet been implemented");
	        //read the file, create a datatable and put it into a kendo grid 

	        //Need to call GetDataFromTemplate and then newQuotas()


	    };

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



	}
		
})();