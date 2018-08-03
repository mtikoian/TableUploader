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
using System.Collections;


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
            var newFile = "";

            //find out if sql or oracle
            //bool sql = IsSQLTable(username, tableName);
            bool sql = true;//only doing sql for now

            if (sql == true)
            {
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

                        newFile = ExcelExport(dataTable, username);

                        Log logRecord = new Log();
                        logRecord.username = username;
                        logRecord.logDate = DateTime.Now;
                        logRecord.logText = "Downloaded " + tableName;

                        try
                        {
                            insertLog(logRecord);
                        }
                        catch (Exception ex)
                        {
                        }

                        return Ok(newFile);

                    }
                }
                catch (Exception ex)
                {
                    log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                    Log logRecord = new Log();
                    logRecord.username = username;
                    logRecord.logDate = DateTime.Now;
                    logRecord.logText = "Error in GetTableFromName " + tableName + " error: " + ex;

                    try
                    {
                        insertLog(logRecord);
                    }
                    catch (Exception)
                    {
                    }
                    return InternalServerError(ex);
                }
            }
            else
            {
                try
                {
                    using (OracleConnection conn = new OracleConnection(ConfigurationManager.ConnectionStrings["OracleContext"].ConnectionString))
                    {
                        conn.Open();
                        query = "SELECT * FROM " + tableName;

                        using (OracleCommand cmd = new OracleCommand(query, conn))
                        {
                            OracleDataAdapter da = new OracleDataAdapter(cmd);
                            da.Fill(dataTable);
                            conn.Close();
                            da.Dispose();
                        }
                        newFile = ExcelExport(dataTable, username);
                        return Ok(newFile);

                    }
                }
                catch (Exception ex)
                {
                    log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                    Log logRecord = new Log();
                    logRecord.username = username;
                    logRecord.logDate = DateTime.Now;
                    logRecord.logText = "Error in GetTableFromName " + tableName + " error: " + ex;

                    try
                    {
                        insertLog(logRecord);
                    }
                    catch (Exception)
                    {
                    }
                    return InternalServerError(ex);
                }

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
                                t.type = reader["type"] != null ? reader["type"].ToString() : "";
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
                Log logRecord = new Log();
                logRecord.username = username;
                logRecord.logDate = DateTime.Now;
                logRecord.logText = "Error in GetTablesByUser " + " error: " + ex;

                try
                {
                    insertLog(logRecord);
                }
                catch (Exception)
                {
                }
                return InternalServerError(ex);
            }

        }
        [HttpGet]
        public IHttpActionResult GetProcessStatus(string username, string tableName)
        {
            if (tableName == null)
            {
                return BadRequest("Invalid or missing json request");
            }
            Process p = new Process();

            var name = tableName.Split('.').Last();

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPGetJobStatus]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add("@tableName", System.Data.SqlDbType.VarChar).Value = name;

                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {

                                p.id = reader["id"] != null ? reader["id"].ToString() : "";
                                p.isRunning = reader["isRunning"] != null ? reader["isRunning"].ToString() : "";

                            }
                        }
                        return Ok(p);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                Log logRecord = new Log();
                logRecord.username = username;
                logRecord.logDate = DateTime.Now;
                logRecord.logText = "Error in GetProcessesByTable " + " error: " + ex;

                try
                {
                    insertLog(logRecord);
                }
                catch (Exception)
                {
                }
                return InternalServerError(ex);
            }

        }
        [HttpGet]
        public IHttpActionResult GetProcess(string username, string tableName)
        {
            if (tableName == null)
            {
                return BadRequest("Invalid or missing json request");
            }
            Process p = new Process();

            var name = tableName.Split('.').Last();

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPGetProcessesByTable]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add("@tableName", System.Data.SqlDbType.VarChar).Value = name;

                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                
                                p.id = reader["id"] != null ? reader["id"].ToString() : "";
                                p.tableName = reader["tableName"] != null ? reader["tableName"].ToString() : "";
                                p.jobName = reader["jobName"] != null ? reader["jobName"].ToString() : "";
                                p.description = reader["description"] != null ? reader["description"].ToString() : "";
                                p.type = reader["type"] != null ? reader["type"].ToString() : "";
                                p.isRunning = reader["isRunning"] != null ? reader["isRunning"].ToString() : "";

                            }
                        }
                        return Ok(p);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                Log logRecord = new Log();
                logRecord.username = username;
                logRecord.logDate = DateTime.Now;
                logRecord.logText = "Error in GetProcessesByTable " + " error: " + ex;

                try
                {
                    insertLog(logRecord);
                }
                catch (Exception)
                {
                }
                return InternalServerError(ex);
            }

        }

        [HttpGet]
        public IHttpActionResult GetProcessById(string username, string id)
        {
            if (id == null)
            {
                return BadRequest("Invalid or missing json request");
            }
            Process p = new Process();

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPGetProcessById]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add("@id", System.Data.SqlDbType.VarChar).Value = id;

                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {

                                p.id = reader["id"] != null ? reader["id"].ToString() : "";
                                p.tableName = reader["tableName"] != null ? reader["tableName"].ToString() : "";
                                p.jobName = reader["jobName"] != null ? reader["jobName"].ToString() : "";
                                p.description = reader["description"] != null ? reader["description"].ToString() : "";
                                p.type = reader["type"] != null ? reader["type"].ToString() : "";
                                p.isRunning = reader["isRunning"] != null ? reader["isRunning"].ToString() : "";

                            }
                        }
                        return Ok(p);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                Log logRecord = new Log();
                logRecord.username = username;
                logRecord.logDate = DateTime.Now;
                logRecord.logText = "Error in GetProcessesByTable " + " error: " + ex;

                try
                {
                    insertLog(logRecord);
                }
                catch (Exception)
                {
                }
                return InternalServerError(ex);
            }

        }

        [HttpPost]
        public IHttpActionResult RunProcess(string username, string id)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPSetProcessToRunNew]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add("@id", System.Data.SqlDbType.VarChar).Value = id;
                        try
                        {
                            conn.Open();
                            cmd.ExecuteNonQuery();

                            conn.Close();

                            Log logRecord = new Log();
                            logRecord.username = username;
                            logRecord.logDate = DateTime.Now;
                            logRecord.logText = "Set Process To Run " + " process: " + id;

                            try
                            {
                                insertLog(logRecord);
                            }
                            catch (Exception)
                            {
                            }
                        }
                        catch (Exception ex)
                        {

                        }

                    }
                }
            }
            catch (Exception)
            {
            }
            return Ok();
        }

        //call after data transfer to table or from a table of processes when a user selects

        public void UpdateProcessToRun(string username, string tableName)
        {
            var name = tableName.Split('.').Last().ToUpper();
            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPSetProcessToRun]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add("@tableName", System.Data.SqlDbType.VarChar).Value = name;
                        try
                        {
                            conn.Open();
                            cmd.ExecuteNonQuery();

                            conn.Close();

                            Log logRecord = new Log();
                            logRecord.username = username;
                            logRecord.logDate = DateTime.Now;
                            logRecord.logText = "Set Process To Run " + " process: " + name;

                            try
                            {
                                insertLog(logRecord);
                            }
                            catch (Exception)
                            {
                            }
                        }
                        catch (Exception ex)
                        {

                        }

                    }
                }
            }
            catch (Exception)
            {
            }

        }

        [HttpGet]
        public IHttpActionResult GetProcessesByUser(string username)
        {
            if (username == null)
            {
                return BadRequest("Invalid or missing json request");
            }


            List<Process> processes = new List<Process>();

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPGetProcessesById]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;

                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                Process p = new Process();

                                p.id = reader["id"] != null ? reader["id"].ToString() : "";
                                p.tableName = reader["tableName"] != null ? reader["tableName"].ToString() : "";
                                p.jobName = reader["jobName"] != null ? reader["jobName"].ToString() : "";
                                p.description = reader["description"] != null ? reader["description"].ToString() : "";
                                p.type = reader["type"] != null ? reader["type"].ToString() : "";
                                var status = reader["isRunning"] != null ? reader["isRunning"].ToString() : "";

                                if (status == "0")
                                {
                                    p.isRunning = "Scheduled";
                                }
                                if (status == "1")
                                {
                                    p.isRunning = "Running";
                                }
                                if (status == "2")
                                {
                                    p.isRunning = "Completed";
                                }

                                processes.Add(p);

                            }
                        }
                        return Ok(processes);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                Log logRecord = new Log();
                logRecord.username = username;
                logRecord.logDate = DateTime.Now;
                logRecord.logText = "Error in GetProcessesByUser " + " error: " + ex;

                try
                {
                    insertLog(logRecord);
                }
                catch (Exception)
                {
                }
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

            workSheet.Cells.LoadFromDataTable(dt, true);
            var dPos = new List<int>();
            for (var i = 0; i < dt.Columns.Count; i++)
                if (dt.Columns[i].DataType.Name.Contains("Date"))
                    dPos.Add(i);
            foreach (var pos in dPos)
            {
                workSheet.Column(pos + 1).Style.Numberformat.Format = CultureInfo.CurrentCulture.DateTimeFormat.ShortDatePattern;
            }


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

        public static void insertLog(Log logRecord)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPInsertLog]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;

                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = logRecord.username;
                        cmd.Parameters.Add("@logdate", System.Data.SqlDbType.VarChar).Value = logRecord.logDate;
                        cmd.Parameters.Add("@logText", System.Data.SqlDbType.VarChar).Value = logRecord.logText;

                        try
                        {
                            conn.Open();
                            cmd.ExecuteNonQuery();

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
            }

        }

        public static DateTime? CleanDateField(string DateField)
        {
            // Convert the text to DateTime and return the value or null
            DateTime? CleanDate = new DateTime();
            int intDate;
            bool DateIsInt = int.TryParse(DateField, out intDate);
            if (DateIsInt)
            {
                // If this is a serial date, convert it
                CleanDate = DateTime.FromOADate(intDate);
            }
            else if (DateField.Length != 0 && DateField != "" &&
                DateField != null)
            {
                // Convert from a General format
                CleanDate = (Convert.ToDateTime(DateField));
            }
            else
            {
                // Date is blank
                CleanDate = null;
            }
            return CleanDate;
        }

        

        public static DataTable ImportToDataTable(string FilePath, string username)
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
                
                //when going from excel to dt keep date format currently it changes to 47xxx


                // Fetch the WorkSheet size
                ExcelCellAddress startCell = worksheet.Dimension.Start;
                ExcelCellAddress endCell = worksheet.Dimension.End;

                // create all the needed DataColumn
                for (int col = startCell.Column; col <= endCell.Column; col++)
                    dt.Columns.Add(col.ToString());


                bool firstRow = true;
                var numberOfRows = 0;
                // place all the data into DataTable

                //numcol
                for (int row = startCell.Row; row <= endCell.Row; row++)
                {
                    if (!firstRow)
                    {
                        numberOfRows++;
                        DataRow dr = dt.NewRow();
                        int x = 0;
                        for (int col = startCell.Column; col <= endCell.Column; col++)//end is less or equal numcol
                        {
                            dr[x++] = worksheet.Cells[row, col].Value;
                        }
                        dt.Rows.Add(dr);
                    }
                    else {
                        firstRow = false;
                        //how many does it see how many with header change end to 
                        //numcol how many header not not null
                    }
                    
                    
                    //dt.Rows[0].Delete();
                    //dt.AcceptChanges();
                }

                


                //log number of rows - user, date text -
                Log logRecord = new Log();
                logRecord.username = username;
                logRecord.logDate = DateTime.Now;
                logRecord.logText = "Attempting to Insert " + numberOfRows + " rows into datatable from " + FilePath;

                try
                {
                    insertLog(logRecord);
                }
                catch (Exception ex)
                {
                }
            }
            return dt;
        }
        


        public bool ImportDataFromExcel(string excelFilePath, string tableName, string username)
        {
  
            var dt = new DataTable();
            dt = ImportToDataTable(excelFilePath, username);
            string ssqltable = tableName;
            string deleteQuery = "delete from " + ssqltable;


            /*test data
            DataTable table = new DataTable();
            table.Columns.Add("userName", typeof(string));
            table.Columns.Add("date", typeof(DateTime));
            table.Columns.Add("text", typeof(string));
            table.Rows.Add("sbrown", "2018/06/28", "Downloaded application.dbo.uploader_log");
            table.Rows.Add("2", DateTime.Now, "test");*/

            //bool sql = IsSQLTable(username, tableName);
            bool sql = true;//only doing sql for now
            var source = "";
            var rows = "";
            var name = tableName.Split('.').Last();
            

            if (sql == true)


            {

                //get source tablename

                using (SqlConnection conn2 = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd2 = new SqlCommand())
                    {
                        cmd2.Connection = conn2;
                        cmd2.CommandText = "[Application].[dbo].[UPGetTable]";
                        cmd2.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd2.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;
                        cmd2.Parameters.Add("@tableName", System.Data.SqlDbType.VarChar).Value = name;

                        conn2.Open();

                        using (SqlDataReader reader = cmd2.ExecuteReader())
                        {
                            while (reader.Read())
                            {

                                source = reader["target"] != null ? reader["target"].ToString() : "";

                            }
                        }
                        conn2.Close();
                    }
                }


                var newSource = source.Split('.').First();
                newSource = newSource + '.';
                var paramSource = source.Replace(newSource, "");

                //get number of rows
                using (SqlConnection conn1 = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd1 = new SqlCommand())
                    {
                        cmd1.Connection = conn1;
                        cmd1.CommandText = "[Application].[dbo].[UPGetCountRows]";
                        cmd1.CommandType = System.Data.CommandType.StoredProcedure;
                        //need table name param
                        cmd1.Parameters.Add("@tableName", System.Data.SqlDbType.VarChar).Value = paramSource;

                        try
                        {
                            conn1.Open();
                            using (SqlDataReader reader = cmd1.ExecuteReader())
                            {
                                while (reader.Read())
                                {

                                    rows = reader["count"] != null ? reader["count"].ToString() : "";

                                }
                            }

                            conn1.Close();
                            Log logRecord = new Log();
                            logRecord.username = username;
                            logRecord.logDate = DateTime.Now;
                            logRecord.logText = "Original Table " + paramSource + " Has " + rows + " rows";

                            try
                            {
                                insertLog(logRecord);
                            }
                            catch (Exception ex)
                            {
                            }
                        }
                        catch (Exception ex)
                        {
                            Log logRecord = new Log();
                            logRecord.username = username;
                            logRecord.logDate = DateTime.Now;
                            logRecord.logText = "Failed Getting Number of Rows For " + source;

                            try
                            {
                                insertLog(logRecord);
                            }
                            catch (Exception)
                            {
                            }
                            return false;
                        }
                    }
                }
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    conn.Open();
                    using (SqlCommand cmd = new SqlCommand(deleteQuery, conn))
                    {
                        
                        cmd.ExecuteNonQuery();
                        SqlBulkCopy bulkcopy = new SqlBulkCopy(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString, SqlBulkCopyOptions.KeepIdentity);
                        bulkcopy.DestinationTableName = ssqltable;

                        /*foreach (DataColumn column in dt.Columns)
                        {
                            bulkcopy.ColumnMappings.Add(column.ColumnName, column.ColumnName);
                        }*/

                        try

                            //get number of rows in orignal table
                        {
                            bulkcopy.WriteToServer(dt);
   
                            Log logRecord = new Log();
                            logRecord.username = username;
                            logRecord.logDate = DateTime.Now;
                            logRecord.logText = "Succesfully Copied " + tableName + " from " + excelFilePath;

                            

                            try
                            {
                                insertLog(logRecord);
                            }
                            catch (Exception ex)
                            {
                                Log logRecord2 = new Log();
                                logRecord2.username = username;
                                logRecord2.logDate = DateTime.Now;
                                logRecord2.logText = "Failed Copying " + tableName + " from " + excelFilePath;

                                insertLog(logRecord);
                            }
                            
                        }
                     

                        catch (Exception ex)
                        {
                            log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                            Log logRecord = new Log();
                            logRecord.username = username;
                            logRecord.logDate = DateTime.Now;
                            logRecord.logText = "Error in ImportDataFromExcel " + tableName + " error: " + ex;

                            try
                            {
                                insertLog(logRecord);
                            }
                            catch (Exception)
                            {
                            }
                            return false;
                        }
                        conn.Close();
                    }

                }
            }
            else
            {
                //if oracle send in json to SP and loop through dt sending one row at a time
                foreach (DataRow row in dt.Rows)
                {
                    //send row as param to oracle sp
                    using (OracleConnection conn = new OracleConnection(ConfigurationManager.ConnectionStrings["OracleContext"].ConnectionString))
                    {
                        conn.Open();
                        using (OracleCommand cmd = new OracleCommand(deleteQuery, conn))
                        {
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
                }
        
                /*using (OracleConnection conn = new OracleConnection(ConfigurationManager.ConnectionStrings["OracleContext"].ConnectionString))
                {
                    conn.Open();
                    using (OracleCommand cmd = new OracleCommand(deleteQuery, conn))
                    {
                        cmd.ExecuteNonQuery();
                    }
                    using (OracleBulkCopy oBulkCopy = new OracleBulkCopy(conn))
                    {

                        oBulkCopy.DestinationTableName = ssqltable;

                        try
                        {
                            oBulkCopy.WriteToServer(dt);
                            oBulkCopy.Close();
                            Log logRecord = new Log();
                            logRecord.username = username;
                            logRecord.logDate = DateTime.Now;
                            logRecord.logText = "Copied " + tableName + " from " + excelFilePath;

                            try
                            {
                                insertLog(logRecord);
                            }
                            catch (Exception ex)
                            {
                            }
                        }
                        catch (Exception ex)
                        {
                            log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                            Log logRecord = new Log();
                            logRecord.username = username;
                            logRecord.logDate = DateTime.Now;
                            logRecord.logText = "Error in GetTableFromName " + tableName + " error: " + ex;

                            try
                            {
                                insertLog(logRecord);
                            }
                            catch (Exception)
                            {
                            }
                        }
                        conn.Close();

                    }
                }*/

            return true;
                     
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
        public bool IsSQLTable(string username, string tableName)
        {

            //int split = tableName.LastIndexOf('.', +1);
            //string newTable = tableName.Substring(split);
            string newTable = tableName.Split('.').Last();
            Table t = new Table();

            try
            {
                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPGetTable]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;
                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;
                        cmd.Parameters.Add("@tableName", System.Data.SqlDbType.VarChar).Value = newTable;

                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                t.type = reader["type"] != null ? reader["type"].ToString() : "";

                            }
                        }
                        if (t.type == "SQL")
                        {
                            return true;
                        }
                        else
                        {
                            return false;
                        }
           
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                Log logRecord = new Log();
                logRecord.username = username;
                logRecord.logDate = DateTime.Now;
                logRecord.logText = "Error in IsSQLTable " + tableName + " error: " + ex;

                try
                {
                    insertLog(logRecord);
                }
                catch (Exception)
                {
                }
                return false;
            } 


        }

        [HttpPost]
        public IHttpActionResult InsertImportTable(string username, string tableName)
        {
            var filename = username + ".xlsx";
            var filePath = HttpContext.Current.Server.MapPath("~/ImportTemplates/");
            var excelFile = filePath + filename;

            bool success = false;

            List<Table> userAccessTables = new List<Table>();

            userAccessTables = ValidateTable(username);

            bool exists = false;

            foreach (var item in userAccessTables)
            {
                if(item.source == tableName){
                    exists = true;
                }
            }

            if (exists)
            {

                FileInfo fi = new FileInfo(excelFile);
                try
                {
                    success = ImportDataFromExcel(excelFile, tableName, username);
                }
                catch (Exception ex)
                {
                    Log logRecord = new Log();
                    logRecord.username = username;
                    logRecord.logDate = DateTime.Now;
                    logRecord.logText = "Error in InsertImportTable " + tableName + " error: " + ex;

                    try
                    {
                        insertLog(logRecord);
                    }
                    catch (Exception)
                    {
                    }
                    return InternalServerError(ex);
                }

                if (success == true)
                {
                    return Ok(excelFile);
                }
                else
                {
                    return InternalServerError();
                }
            }
            else
            {

                return Ok();
            }

        }
        [HttpPost]
        public HttpResponseMessage PostExcel()
        {
            var httpRequest = HttpContext.Current.Request;
            if (httpRequest.Files.Count < 1)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            var filename = "SBROWN" + ".xlsx";
            var Path = HttpContext.Current.Server.MapPath("~/ImportTemplates/");
            if (File.Exists(Path + filename))
            {
                File.Delete(Path + filename);
            }

            foreach (string file in httpRequest.Files)
            {
                var postedFile = httpRequest.Files[file];
                var filePath = HttpContext.Current.Server.MapPath("~/" + postedFile.FileName);
                postedFile.SaveAs(filePath);
                // NOTE: To store in memory use postedFile.InputStream
            }

            return Request.CreateResponse(HttpStatusCode.Created);
        }
        [HttpPost]
        public HttpResponseMessage Postx()
        {
            var Path = HttpContext.Current.Server.MapPath("~/ImportTemplates/");
            var request = HttpContext.Current.Request;
            var filePath = Path + request.Headers["filename"];
            using (var fs = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
            {
                request.InputStream.CopyTo(fs);
            }

            return Request.CreateResponse(HttpStatusCode.Created);
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
                    try
                    {
                        postedFile.SaveAs(filePath);
                    }
                    catch (Exception ex)
                    {
                        Log logRecord = new Log();
                        logRecord.username = username;
                        logRecord.logDate = DateTime.Now;
                        logRecord.logText = "Error Posting File " + filePath + " Error " + ex;
                        try
                        {
                            insertLog(logRecord);
                        }
                        catch (Exception)
                        {
                        }
                    }
                    


                    docfiles.Add(filePath);
                    Log logRecord1 = new Log();
                    logRecord1.username = username;
                    logRecord1.logDate = DateTime.Now;
                    logRecord1.logText = "Posted File " + filePath;

                    try
                    {
                        insertLog(logRecord1);
                    }
                    catch (Exception)
                    {
                    }

                }

                result = Request.CreateResponse(HttpStatusCode.Created, docfiles);

            }

            else
            {

                result = Request.CreateResponse(HttpStatusCode.BadRequest);

            }

            return result;

        }


        public List<Table> ValidateTable(string username)
        {

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
                                t.type = reader["type"] != null ? reader["type"].ToString() : "";
                                if (reader["source"].ToString().Length > 0)
                                {
                                    var a = reader["source"] != null ? reader["source"].ToString() : "";
                                    source = a.Substring(a.IndexOf('.') + 1);
                                }

                                t.source = source;
                                tables.Add(t);

                            }
                        }
                        return tables;
                    }
                }
            }
            catch (Exception ex)
            {
                Log logRecord = new Log();
                logRecord.username = username;
                logRecord.logDate = DateTime.Now;
                logRecord.logText = "Error in ValidateTable " + " error: " + ex;

                try
                {
                    insertLog(logRecord);
                }
                catch (Exception)
                {
                }
                return new List<Table>();
            }

        }


    } // class
} // package
            
            