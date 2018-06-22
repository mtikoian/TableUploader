using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuotaAPI.Models
{
    public class User
    {

        public string parentDesc { get; set; }
        public string parentId { get; set; }
        public string territoryDesc { get; set; }
        public string territoryId { get; set; }
        public string quotaDate { get; set; }
        public string capital { get; set; }
        public string disposable { get; set; }
        public string tissue { get; set; }
        public string currencyCode { get; set; }

        public string username { get; set; }
        public DateTime sortDate { get; set; }
        public string id { get; set; }


    }
}