using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

[assembly: log4net.Config.XmlConfigurator(Watch = true)]

namespace QuotaAPI
{

    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API routes
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                //routeTemplate: "api/{controller}/{action}/{salesGeoKey}/{productKey}/{customerKey}/{year}/{month}/{day}"
                routeTemplate: "api/{controller}/{action}"
            );
        }
    }
}
