using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuotaAPI.Models
{
    public class Log
    {
        public string username { get; set; }
        public DateTime? logDate { get; set; }
        public string logText { get; set; }

    }
}