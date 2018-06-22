using QuotaAPI.Models;
using System;
using System.Collections.Generic;
using System.Reflection; 
using System.Web.Http;
using Microsoft.AnalysisServices.AdomdClient;
using System.Globalization;
using System.Data.SqlClient;
using System.Configuration;
using System.Data;
using System.IO;
using Oracle.DataAccess.Client;
using System.Text.RegularExpressions;
using System.Web;
using System.Linq;
using Microsoft.Reporting.WebForms;
using System.Net.Http;
using System.Net;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Text;
using System.Data.OleDb;
using OfficeOpenXml;
using OfficeOpenXml.Style;


namespace QuotaAPI.Controllers
{
    public class UploadController : ApiController
    {
        private static readonly log4net.ILog log = log4net.LogManager.GetLogger
    (System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        /*************************************************************************************************

            Method:         smoketest
            Description:    Verify that this controller is accessible and logging works

            EndPoint:       (GET) /api/csales/smoketest

         *************************************************************************************************/
        [HttpGet]
        public IHttpActionResult smoketest()
        {
            try
            {
                log.Debug("This is a log4net debug message from " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name);
                return Ok("Hello, World!");
            } catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }
        }

        /*************************************************************************************************

             Method:         Get Table Details
             Description:    Returns the column types of a given table

             Endpoint:       (POST) /api/upload/GetTableDetails

             Parameters:
                             { 
                                 "id" : "584"
                             }

          *************************************************************************************************/
        [HttpGet]
        public IHttpActionResult GetTableFromName(string tableName, string username)
        {
            if (tableName == null)
            {
                return BadRequest("Invalid or missing json request");
            }


            Table table = new Table();
            string query;
            DataTable dataTable = new DataTable();


            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    conn.Open();
                    query = "SELECT * FROM " + tableName;

                        using (SqlCommand cmd = new SqlCommand(query, conn))
                        {

                            SqlDataAdapter da = new SqlDataAdapter(cmd);
                            da.Fill(dataTable);
                            conn.Close();
                            da.Dispose();
                        }

                        var newFile = ExcelExport(dataTable, username);


                        return Ok(newFile);
                        
                    }
                }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }

        /*************************************************************************************************

             Method:         Get Quota For Id
             Description:    Returns children of the product tree hierarchy by user selection. Node sent in, children returned

             Endpoint:       (POST) /api/quota/GetQuotas

             Parameters:
                             { 
                                 "id" : "584"
                             }

          *************************************************************************************************/
        [HttpGet]
        public IHttpActionResult GetTablesByUser(string username)
        {
            if (username == null)
            {
                return BadRequest("Invalid or missing json request");
            }


            List<Table> tables = new List<Table>();

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPGetTablesById]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;

                        conn.Open();
                        var source = "";

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Table t = new Table();

                                t.id = reader["id"] != null ? reader["id"].ToString() : "";
                                t.name = reader["name"] != null ? reader["name"].ToString() : "";
                                t.description = reader["description"] != null ? reader["description"].ToString() : "";

                                if (reader["source"].ToString().Length > 0)
                                {
                                    var a = reader["source"] != null ? reader["source"].ToString() : "";
                                    source = a.Substring(a.IndexOf('.') +1);
                                }

                                t.source = source;
                                tables.Add(t);

                            }
                        }
                        return Ok(tables);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }
      

        [HttpPost]
        public IHttpActionResult UpdateUploads([FromBody]User jsonData)
        {
            if (jsonData == null)
            {
                return BadRequest("Invalid or missing json request");
            }

            //var strDate = String.Format("YYYY-MM-DD", jsonData.quotaDate);
            DateTime date = new DateTime();

            date = Convert.ToDateTime(jsonData.quotaDate);


            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[QMUpdateUploads]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;

                        cmd.Parameters.Add("@parentId", System.Data.SqlDbType.VarChar).Value = jsonData.parentId;
                        cmd.Parameters.Add("@id", System.Data.SqlDbType.VarChar).Value = jsonData.territoryId;
                        cmd.Parameters.Add("@date", System.Data.SqlDbType.VarChar).Value = date;
                        cmd.Parameters.Add("@capitalQuota", System.Data.SqlDbType.VarChar).Value = jsonData.capital;
                        cmd.Parameters.Add("@disposableQuota", System.Data.SqlDbType.VarChar).Value = jsonData.disposable;
                        cmd.Parameters.Add("@tissueQuota", System.Data.SqlDbType.VarChar).Value = jsonData.tissue;
                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = jsonData.username;

                        try
                        {
                            conn.Open();
                            var rows = cmd.ExecuteNonQuery();

                            conn.Close();
                            return Ok(rows.ToString());
                        }
                        catch (Exception ex)
                        {
                            return InternalServerError(ex);
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }

        /*************************************************************************************************

             Method:         Upload Quotas
             Description:    Uploads the quotas

             Endpoint:       (POST) /api/quota/InsertQuotaUpload

             Parameters:
                             { 
                                 "id" : "C200"
                             }

          *************************************************************************************************/
        [HttpPost]
        public IHttpActionResult InsertQuotaUpload([FromBody]User jsonData)
        {
            //need to send jsonData from newData kendo datasource on submit
            if (jsonData == null)
            {
                return BadRequest("Invalid or missing json request");
            }

            ClearUploads(jsonData.username);

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[QMQuotaUpload]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;

                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = jsonData.username;
                        cmd.Parameters.Add("@date", System.Data.SqlDbType.VarChar).Value = jsonData.quotaDate;
                        cmd.Parameters.Add("@capitalQuota", System.Data.SqlDbType.VarChar).Value = jsonData.capital;
                        cmd.Parameters.Add("@disposableQuota", System.Data.SqlDbType.VarChar).Value = jsonData.disposable;
                        cmd.Parameters.Add("@tissueQuota", System.Data.SqlDbType.VarChar).Value = jsonData.tissue;
                        cmd.Parameters.Add("@id", System.Data.SqlDbType.VarChar).Value = jsonData.territoryId;
                        cmd.Parameters.Add("@geogId", System.Data.SqlDbType.VarChar).Value = jsonData.territoryId;
                        cmd.Parameters.Add("@currencyCode", System.Data.SqlDbType.VarChar).Value = jsonData.currencyCode;


                        try
                        {
                            conn.Open();
                            var rows = cmd.ExecuteNonQuery();

                            conn.Close();
                            return Ok(rows.ToString());
                        }
                        catch (Exception ex)
                        {
                            return InternalServerError(ex);
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }

        [HttpPost]
        public IHttpActionResult SubmitQuotasToUpload(string username)
        {
            //need to send jsonData from newData kendo datasource on submit
            if (username == null)
            {
                return BadRequest("Invalid or missing json request");
            }

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[QMInsertQuotasFromUpload]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;

                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;

                        try
                        {
                            conn.Open();
                            var rows = cmd.ExecuteNonQuery();

                            conn.Close();
                            return Ok(rows.ToString());
                        }
                        catch (Exception ex)
                        {
                            return InternalServerError(ex);
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }

        private void ClearUploads(string username)
        {
            //call SP to clear uploads
            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[QMClearUploadTbl]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;

                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;

                        try
                        {
                            conn.Open();
                            var rows = cmd.ExecuteNonQuery();

                            conn.Close();
                        }
                        catch (Exception ex)
                        {

                        }

                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
            }

        }

        

        /*************************************************************************************************

              Method:         Get Quota For Id
              Description:    Returns children of the product tree hierarchy by user selection. Node sent in, children returned

              Endpoint:       (POST) /api/quota/GetQuotas

              Parameters:
                              { 
                                  "id" : "584"
                              }

           *************************************************************************************************/
        [HttpGet]
        public IHttpActionResult GetQuotas(string id)
        {
            if (id == null)
            {
                return BadRequest("Invalid or missing json request");
            }


            List<Table> tables = new List<Table>();

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPGetTables]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;


                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Table t = new Table();

                                t.id= reader["id"] != null ? reader["id"].ToString() : "";
                                t.name = reader["name"] != null ? reader["name"].ToString() : "";
                                t.description = reader["description"] != null ? reader["description"].ToString() : "";
                                t.source = reader["source"] != null ? reader["source"].ToString() : "";
                                tables.Add(t);

                            }
                        }
                        return Ok(tables);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }

        

        public string ExcelExport(DataTable dt, string username)
        {


            //var filename = GenerateRandomString(8) + ".xlsx";
            var filename = username + ".xlsx";
            var filePath = System.Web.Configuration.WebConfigurationManager.AppSettings["ExportDirectory"];

            if (File.Exists(filePath + filename))
            {
                File.Delete(filePath + filename);
            }

            OfficeOpenXml.ExcelPackage excel = new OfficeOpenXml.ExcelPackage();
            var workSheet = excel.Workbook.Worksheets.Add("Sheet1");

            workSheet.Cells[1, 1].LoadFromDataTable(dt, true);

            var strFilePath = filePath + filename;
            string path = strFilePath;
            Stream stream = File.Create(path);
            excel.SaveAs(stream);
            stream.Close();


            return (filename);
        }

            public DataTable ToDataTable<T>(List<T> items)
            {
                DataTable dataTable = new DataTable(typeof(T).Name);
                //Get all the properties by using reflection   
                PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
                foreach (PropertyInfo prop in Props)
                {
                    //Setting column names as Property names  
                    dataTable.Columns.Add(prop.Name);
                }
                foreach (T item in items)
                {
                    var values = new object[Props.Length];
                    for (int i = 0; i < Props.Length; i++)
                    {

                        values[i] = Props[i].GetValue(item, null);
                    }
                    dataTable.Rows.Add(values);
                }
                dataTable.Columns.Remove("username");
                dataTable.Columns.Remove("sortDate");
                dataTable.Columns.Remove("id");
                dataTable.Columns.Remove("currencyCode");

                return dataTable;
            }

        public static string GenerateRandomString(int length)
        {
            char[] charArr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".ToCharArray();
            string randomString = string.Empty;
            Random objRandom = new Random();
            for (int i = 0; i < length; i++)
            {
                int x = objRandom.Next(1, charArr.Length);
                if (!randomString.Contains(charArr.GetValue(x).ToString()))
                    randomString += charArr.GetValue(x);
                else
                    i--;
            }
            return randomString;
        }

        
        [HttpGet]
        public List<User> GetNewQuotas(string username)
        {
            var filename = username + ".xlsx";
            //var filePath = System.Web.Configuration.WebConfigurationManager.AppSettings["ImportDirectory"];
            var filePath = HttpContext.Current.Server.MapPath("~/ImportTemplates/");
            var excelFile = filePath + filename;
            DataSet dsQuotas = new DataSet();
            FileInfo fi = new FileInfo(excelFile);
            List<User> quotas = new List<User>();

            using (ExcelPackage xlPackage = new ExcelPackage(fi))
            {
                ExcelWorksheet worksheet = xlPackage.Workbook.Worksheets[1];
                ExcelCellAddress startCell = worksheet.Dimension.Start;
                ExcelCellAddress endCell = worksheet.Dimension.End;
                for (int row = startCell.Row + 1; row <= endCell.Row; row++)
                {
                    if (worksheet.Cells[row, 1].Value == null)
                    {
                        break;
                    }
                    
                    User newQuota = new User()
                    {
                        parentDesc = worksheet.Cells[row, 1].Value.ToString(),
                        parentId = worksheet.Cells[row, 2].Value.ToString(),
                        territoryDesc = worksheet.Cells[row, 3].Value.ToString(),
                        territoryId = worksheet.Cells[row, 4].Value.ToString(),
                        quotaDate = worksheet.Cells[row, 5].Value.ToString(),
                        capital = worksheet.Cells[row, 6].Value.ToString(),
                        disposable = worksheet.Cells[row, 7].Value.ToString(),
                        tissue = worksheet.Cells[row, 8].Value.ToString(),
                        
                    };
                    quotas.Add(newQuota);
                }
            }

            return quotas;
        }

        [HttpGet]
        public IHttpActionResult GetUploads(string username)
        {
            if (username == null)
            {
                return BadRequest("Invalid or missing json request");
            }


            List<User> uploads = new List<User>();

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[QMGetUploads]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;

                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;

                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                User q = new User();

                                if (reader["QUOTA_DATE"].ToString().Length > 0)
                                {
                                    var formattedDate = Convert.ToDateTime(reader["QUOTA_DATE"]);
                                    q.sortDate = formattedDate;
                                    q.quotaDate = formattedDate.ToString("MMMM-yyyy");
                                }
                                //q.id = reader["QUOTA_DATE"].ToString() + reader["TERRITORY_ID"].ToString();  
                                q.parentId = reader["PARENT_ID"] != null ? reader["PARENT_ID"].ToString() : "";
                                q.parentDesc = reader["PARENT_DESC"] != null ? reader["PARENT_DESC"].ToString() : "";
                                q.territoryId = reader["TERRITORY_ID"] != null ? reader["TERRITORY_ID"].ToString() : "";
                                q.territoryDesc = reader["TERRITORY_DESC"] != null ? reader["TERRITORY_DESC"].ToString() : "";
                                q.capital = reader["CAPITAL"] != null ? reader["CAPITAL"].ToString() : "";
                                q.disposable = reader["DISPOSABLE"] != null ? reader["DISPOSABLE"].ToString() : "";
                                q.tissue = reader["TISSUE"] != null ? reader["TISSUE"].ToString() : "";
                                uploads.Add(q);
                            }
                        }
                        var sortedUploads = uploads.OrderBy(a => a.parentId).ThenBy(a => a.territoryDesc).ThenBy(a => a.sortDate);
                        return Ok(sortedUploads);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }

        public static DataTable ImportToDataTable(string FilePath)
        {
            DataTable dt = new DataTable();
            FileInfo fi = new FileInfo(FilePath);

            // Check if the file exists
            if (!fi.Exists)
                throw new Exception("File " + FilePath + " Does Not Exists");

            using (ExcelPackage xlPackage = new ExcelPackage(fi))
            {
                // get the first worksheet in the workbook
                ExcelWorksheet worksheet = xlPackage.Workbook.Worksheets["Sheet1"];

                // Fetch the WorkSheet size
                ExcelCellAddress startCell = worksheet.Dimension.Start;
                ExcelCellAddress endCell = worksheet.Dimension.End;

                // create all the needed DataColumn
                for (int col = startCell.Column; col <= endCell.Column; col++)
                    dt.Columns.Add(col.ToString());

                // place all the data into DataTable
                for (int row = startCell.Row; row <= endCell.Row; row++)
                {
                    DataRow dr = dt.NewRow();
                    int x = 0;
                    for (int col = startCell.Column; col <= endCell.Column; col++)
                    {
                        dr[x++] = worksheet.Cells[row, col].Value;
                    }
                    dt.Rows.Add(dr);
                }
            }
            return dt;
        }

        public void ImportDataFromExcel(string excelFilePath, string tableName)
        {
            bool sql = true;
  
            var dt = new DataTable();
            dt = ImportToDataTable(excelFilePath);
            string ssqltable = tableName;

            if (sql == false)
            {

                using (OracleConnection conn = new OracleConnection(ConfigurationManager.ConnectionStrings["OracleContext"].ConnectionString))
                {
                    using (OracleBulkCopy oBulkCopy = new OracleBulkCopy(conn))
                    {


                        oBulkCopy.DestinationTableName = ssqltable;

                        try
                        {
                            oBulkCopy.WriteToServer(dt);
                        }
                        catch (Exception ex)
                        {
                            log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                        }


                    }
                }
            }
            else
            {
                
                SqlCommand cmd = new SqlCommand();

                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (cmd)
                    {

                        SqlBulkCopy bulkcopy = new SqlBulkCopy(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString);
                        bulkcopy.DestinationTableName = ssqltable;

                        try
                        {
                            bulkcopy.WriteToServer(dt);
                        }
                        catch (Exception ex)
                        {
                            log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                        }


                    }
                }
            }
                     
        }

        public void ImportDataFromExcelOLD(string excelFilePath, string tableName)
        {
            string ssqltable = tableName;

            string myexceldataquery = "select * from [Sheet1$]";
            try
            {
                //create our connection strings   
                string excelconnectionstring = @"Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + excelFilePath + ";Extended Properties='Excel 8.0;HDR=YES'";

                //execute a query to erase any previous data from our destination table   
                string sclearsql = "delete from " + ssqltable;
                SqlConnection sqlconn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString);
                SqlCommand sqlcmd = new SqlCommand(sclearsql, sqlconn);
                sqlconn.Open();
                sqlcmd.ExecuteNonQuery();
                sqlconn.Close();

                //series of commands to bulk copy data from the excel file into our sql table   
                OleDbConnection oledbconn = new OleDbConnection(excelconnectionstring);
                OleDbCommand oledbcmd = new OleDbCommand(myexceldataquery, oledbconn);
                oledbconn.Open();
                OleDbDataReader dr = oledbcmd.ExecuteReader();

                SqlBulkCopy bulkcopy = new SqlBulkCopy(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString);
                bulkcopy.DestinationTableName = ssqltable;

                List<DataColumn> listCols = new List<DataColumn>();
                var dt = new DataTable();

                DataTable dtSchema = dr.GetSchemaTable();

                if (dtSchema != null)
                {
                    foreach (DataRow drow in dtSchema.Rows)
                    {
                        string columnName = System.Convert.ToString(drow["ColumnName"]);
                        DataColumn column = new DataColumn(columnName, (Type)(drow["DataType"]));
                        column.Unique = (bool)drow["IsUnique"];
                        column.AllowDBNull = (bool)drow["AllowDBNull"];
                        column.AutoIncrement = (bool)drow["IsAutoIncrement"];
                        listCols.Add(column);
                        dt.Columns.Add(column);
                    }
                }

                while (dr.Read())
                {
                    DataRow dataRow = dt.NewRow();
                    for (int i = 0; i < listCols.Count; i++)
                    {
                        dataRow[((DataColumn)listCols[i])] = dr[i];
                        
                    }

                    dt.Rows.Add(dataRow);
                    
                }

                bulkcopy.WriteToServer(dt);

                oledbconn.Close();
                //dr.Close();

            }
            catch (Exception ex)
            {
                //handle exception   
            }
        }

        [HttpPost]
        public IHttpActionResult InsertImportTable(string username, string tableName)
        {
            var filename = username + ".xlsx";
            var filePath = HttpContext.Current.Server.MapPath("~/ImportTemplates/");
            var excelFile = filePath + filename;

            FileInfo fi = new FileInfo(excelFile);
            try
            {
                ImportDataFromExcel(excelFile, tableName);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex); 
            }


            return Ok(excelFile);
        }


        [HttpPost]
        public IHttpActionResult InsertUploads(string username)
        {
            var filename = username + ".xlsx";
            var filePath = HttpContext.Current.Server.MapPath("~/ImportTemplates/");
            var excelFile = filePath + filename;
            DataSet dsQuotas = new DataSet();
            FileInfo fi = new FileInfo(excelFile);
            List<User> quotas = new List<User>();

            using (ExcelPackage xlPackage = new ExcelPackage(fi))
            {
                ExcelWorksheet worksheet = xlPackage.Workbook.Worksheets[1];
                ExcelCellAddress startCell = worksheet.Dimension.Start;
                ExcelCellAddress endCell = worksheet.Dimension.End;
                for (int row = startCell.Row + 1; row <= endCell.Row; row++)
                {
                    if (worksheet.Cells[row, 1].Value == null)
                    {
                        break;
                    }

                    /*Template newQuota = new Template()
                    {
                        parentDesc = worksheet.Cells[row, 1] != null ? worksheet.Cells[row, 1].Value.ToString() : "",
                        parentId = worksheet.Cells[row, 2] != null ? worksheet.Cells[row, 2].Value.ToString() : "",
                        territoryDesc = worksheet.Cells[row, 3] != null ? worksheet.Cells[row, 3].Value.ToString() : "",
                        territoryId = worksheet.Cells[row, 4] != null ? worksheet.Cells[row, 4].Value.ToString() : "",
                        quotaDate = worksheet.Cells[row, 5] != null ? worksheet.Cells[row, 5].Value.ToString() : "",
                        capital = worksheet.Cells[row, 6] != null ? worksheet.Cells[row, 6].Value.ToString() : "0.00",
                        disposable = worksheet.Cells[row, 7] != null ? worksheet.Cells[row, 7].Value.ToString() : "0.00",
                        tissue = worksheet.Cells[row, 8] != null ? worksheet.Cells[row, 8].Value.ToString() : "0.00",

                    };*/
                    User newQuota = new User()
                    {
                        parentDesc = worksheet.Cells[row, 1].Value.ToString(),
                        parentId = worksheet.Cells[row, 2].Value.ToString(),
                        territoryDesc = worksheet.Cells[row, 3].Value.ToString(),
                        territoryId = worksheet.Cells[row, 4].Value.ToString(),
                        quotaDate = worksheet.Cells[row, 5].Value.ToString(),
                        capital = Convert.ToString(worksheet.Cells[row, 6].Value),
                        disposable = Convert.ToString(worksheet.Cells[row, 7].Value),
                        tissue = Convert.ToString(worksheet.Cells[row, 8].Value),

                    };
                    if (newQuota.capital == "" || newQuota.capital == null)
                    {
                        newQuota.capital = "0.00";
                    }
                    if (newQuota.tissue == "" || newQuota.tissue == null)
                    {
                        newQuota.tissue = "0.00";
                    }
                    if (newQuota.disposable == "" || newQuota.disposable == null)
                    {
                        newQuota.disposable = "0.00";
                    }
                    quotas.Add(newQuota);
                }
            }

            ClearUploads(username);
            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        foreach (var quota in quotas)
                        {
                            cmd.Parameters.Clear();


                            DateTime date = new DateTime();
                            date = Convert.ToDateTime(quota.quotaDate);

                            cmd.Connection = conn;
                            cmd.CommandText = "[Application].[dbo].[QMInsertUploads]";
                            cmd.CommandType = System.Data.CommandType.StoredProcedure;
                            cmd.Parameters.Add("@parentId", System.Data.SqlDbType.VarChar).Value = quota.parentId;
                            cmd.Parameters.Add("@parentDesc", System.Data.SqlDbType.VarChar).Value = quota.parentDesc;
                            cmd.Parameters.Add("@territoryId", System.Data.SqlDbType.VarChar).Value = quota.territoryId;
                            cmd.Parameters.Add("@territoryDesc", System.Data.SqlDbType.VarChar).Value = quota.territoryDesc;
                            cmd.Parameters.Add("@date", System.Data.SqlDbType.Date).Value = date;
                            cmd.Parameters.Add("@capitalQuota", System.Data.SqlDbType.Money).Value = quota.capital;
                            cmd.Parameters.Add("@disposableQuota", System.Data.SqlDbType.Money).Value = quota.disposable;
                            cmd.Parameters.Add("@tissueQuota", System.Data.SqlDbType.Money).Value = quota.tissue;
                            cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;

                            try
                            {
                                conn.Open();
                                var rows = cmd.ExecuteNonQuery();
                                conn.Close();

                            }
                            catch (Exception ex)
                            {
                                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                                return InternalServerError(ex);
                            }

                        }
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

            return Ok();
        }

        
        [HttpPost]
        public HttpResponseMessage PostFile(string username)
        {
            var filename = username + ".xlsx";
            //var Path = System.Web.Configuration.WebConfigurationManager.AppSettings["ImportDirectory"];
            var Path = HttpContext.Current.Server.MapPath("~/ImportTemplates/");

            if (File.Exists(Path + filename))
            {
                File.Delete(Path + filename);
            }


            HttpResponseMessage result = null;

            var httpRequest = HttpContext.Current.Request;

            if (httpRequest.Files.Count > 0)
            {

                var docfiles = new List<string>();

                foreach (string file in httpRequest.Files)
                {

                    var postedFile = httpRequest.Files[file];

                    //var filePath = System.Web.Configuration.WebConfigurationManager.AppSettings["ImportDirectory"] + username + ".xlsx";
                    var filePath = HttpContext.Current.Server.MapPath("~/ImportTemplates/" + username + ".xlsx");

                    //var filePath = Path + filename;

                    postedFile.SaveAs(filePath);


                    docfiles.Add(filePath);

                }

                result = Request.CreateResponse(HttpStatusCode.Created, docfiles);

            }

            else
            {

                result = Request.CreateResponse(HttpStatusCode.BadRequest);

            }

            return result;

        }

    } // class
} // package
            
            