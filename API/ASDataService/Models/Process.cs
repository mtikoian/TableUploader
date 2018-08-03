using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuotaAPI.Models
{
    public class Process
    {
        public string id { get; set; }
        public string tableName { get; set; }
        public string jobName { get; set; }
        public string type { get; set; }
        public string description { get; set; }
        public string isRunning { get; set; }
    }
}