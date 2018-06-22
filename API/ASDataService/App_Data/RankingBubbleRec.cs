using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QuotaAPI.Models
{
    // This model class is used by all of the product matrix Crosstab outputs.  title/subtitle can vary depending on what is returned on rows by the query

    public class RankingBubbleRec
    {
        public string GeogID { get; set; }
        public string LevelName { get; set; }
        public double Growth { get; set; }
        public double PTQ { get; set; }
        public string Color { get; set; }
        public string ParentLevelName { get; set; }
        public int AreaGrowthRank { get; set; }
        public int AreaPTQRank { get; set; }
        public int NatlGrowthRank { get; set; }
        public int NatlPTQRank { get; set; }

    }
}