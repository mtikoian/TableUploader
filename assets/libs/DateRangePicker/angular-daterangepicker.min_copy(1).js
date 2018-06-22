(function(){var a;a=angular.module("daterangepicker",[]),a.constant("dateRangePickerConfig",{clearLabel:"Clear",locale:{separator:" - ",format:"YYYY-MM-DD"}}),a.directive("dateRangePicker",["$compile","$timeout","$parse","dateRangePickerConfig",function(a,b,c,d){return{require:"ngModel",restrict:"A",scope:{min:"=",max:"=",model:"=ngModel",opts:"=options",clearable:"="},link:function(a,b,c,e){var f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u;return m=function(){var a,b;return b=angular.extend.apply(angular,Array.prototype.slice.call(arguments).map(function(a){return null!=a?a.locale:void 0}).filter(function(a){return!!a})),a=angular.extend.apply(angular,arguments),a.locale=b,a},g=$(b),f=a.opts,h=m({},d,f),n=null,i=function(){return n.setStartDate(),n.setEndDate()},o=function(a){return function(b){return n&&b?a(moment(b)):void 0}},q=o(function(a){return n.endDate<a&&n.setEndDate(a),n.setStartDate(a)}),p=o(function(a){return n.startDate>a&&n.setStartDate(a),n.setEndDate(a)}),j=function(a){var b;return b=function(a){return moment.isMoment(a)?a.format(h.locale.format):moment(a).format(h.locale.format)},a?h.singleDatePicker?b(a.startDate):[b(a.startDate),b(a.endDate)].join(h.locale.separator):""},r=function(a){var b;return b=j(a),g.val(b),e.$setViewValue(b)},s=function(a){return function(b,c){return b&&c?a(moment(b),moment(c)):!0}},u=s(function(a,b){return a.isBefore(b)||a.isSame(b,"day")}),t=s(function(a,b){return a.isAfter(b)||a.isSame(b,"day")}),e.$formatters.push(j),e.$render=function(){return e.$modelValue&&e.$modelValue.startDate?(q(e.$modelValue.startDate),p(e.$modelValue.endDate)):i(),g.val(e.$viewValue)},e.$parsers.push(function(a){var b,c,d;return b=function(a){return moment(a,h.locale.format)},c={startDate:null,endDate:null},angular.isString(a)&&a.length>0&&(h.singleDatePicker?c=b(a):(d=a.split(h.locale.separator).map(b),c.startDate=d[0],c.endDate=d[1])),c}),e.$isEmpty=function(a){return!(angular.isString(a)&&a.length>0)},k=function(){var b,c;g.daterangepicker(angular.extend(h,{autoUpdateInput:!1}),function(a,b){return r({startDate:a,endDate:b})}),n=g.data("daterangepicker"),c=[];for(b in h.eventHandlers)c.push(g.on(b,function(b){var c;return c=b.type+"."+b.namespace,a.$evalAsync(h.eventHandlers[c])}));return c},k(),a.$watch("model.startDate",function(b){return q(b),r(a.model)}),a.$watch("model.endDate",function(b){return p(b),r(a.model)}),l=function(b,d,f,g){return c[b]?(e.$validators[b]=function(a){return a&&d(h[g],a[f])},a.$watch(b,function(a){return h[g]=a?moment(a):!1,k()})):void 0},l("min",u,"startDate","minDate"),l("max",t,"endDate","maxDate"),c.options&&a.$watch("opts",function(a){return h=m(h,a),k()},!0),c.clearable&&a.$watch("clearable",function(a){return a&&(h=m(h,{locale:{cancelLabel:h.clearLabel}})),k(),g.on("cancel.daterangepicker",a?r.bind(this,{startDate:null,endDate:null}):null)}),a.$on("$destroy",function(){return null!=n?n.remove():void 0})}}}])}).call(this);
//# sourceMappingURL=angular-daterangepicker.min.js.map