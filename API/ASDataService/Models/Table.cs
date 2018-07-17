using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuotaAPI.Models
{
    public class Table
    {
        public string id { get; set; }
        public string name { get; set; }
        public string source { get; set; }
        public string type { get; set; }
        public string description { get; set; }
        public string columnName { get; set; }
        public string columnType { get; set; }


    }
}