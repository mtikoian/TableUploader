using QuotaAPI.Models;
using System;
using System.Collections.Generic;
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


namespace QuotaAPI.Controllers
{
    public class LoginController : ApiController
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

            Method:         IsValidUser
            Description:    Verify that the user can hit the service

            EndPoint:       (GET) /api/csales/IsValidUser

         *************************************************************************************************/
        [HttpGet]
        public IHttpActionResult IsValidUser(string username)
        {

            string user = "";
            if (username == null)
            {
                return BadRequest("Invalid or missing json request");
            }

            try
            {
                //log.Debug("This is a log4net debug message from " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name);

                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["SQLContext"].ConnectionString))
                {
                    using (SqlCommand cmd = new SqlCommand())
                    {
                        cmd.Connection = conn;
                        cmd.CommandText = "[Application].[dbo].[UPGetUser]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;

                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;

                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {

                                user = reader["userName"] != null ? reader["userName"].ToString() : "";

                            }
                        }
                    }
                }
                if (user.ToUpper() == username.ToUpper())
                {
                    return Ok(true);
                }
                else
                {
                    return Ok(false);
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }

        /*************************************************************************************************

              Method:         Get User
              Description:    Makes sure that the user exists

              Endpoint:       (POST) /api/quota/GetUser

              Parameters:
                              { 
                                  "username" : "SBROWN"
                              }

           *************************************************************************************************/
        [HttpGet]
        public IHttpActionResult GetUser(string username)
        {
            string user = "";
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
                        cmd.CommandText = "[Application].[dbo].[UPGetUser]";
                        cmd.CommandType = System.Data.CommandType.StoredProcedure;

                        cmd.Parameters.Add("@username", System.Data.SqlDbType.VarChar).Value = username;

                        conn.Open();

                        using (SqlDataReader reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {

                                user = reader["userName"] != null ? reader["userName"].ToString() : "";

                            }
                        }
                        return Ok(user);
                    }
                }
            }
            catch (Exception ex)
            {
                log.Error("*** ERROR: " + this.GetType().Name + "." + System.Reflection.MethodBase.GetCurrentMethod().Name + ": " + ex.Message);
                return InternalServerError(ex);
            }

        }



      

        
          
    } // class
} // package
            
            