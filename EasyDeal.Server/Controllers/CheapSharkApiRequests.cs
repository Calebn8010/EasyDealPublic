using EasyDeal.Server.Data;
using EasyDeal.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Text.Json.Nodes;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace EasyDeal.Server.Controllers
{
    public enum SetAlertResult
    {
        Success,
        Failed,
        Error
    }

    public enum EmailAlertAction
    {
        Set,
        Delete
    }

    public class CheapSharkApiRequests
    {
        private readonly ILogger<CheapSharkApiRequests> _logger;

        // Centralized factory so every HttpClient created here includes the User-Agent header.

        private static HttpClient CreateHttpClient()
        {
            var client = new HttpClient();
            client.DefaultRequestHeaders.Add("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36");
            return client;
        }

        public CheapSharkApiRequests(ILogger<CheapSharkApiRequests> logger)
        {
            _logger = logger;
        }

        public static async Task<List<GameDeal>> GetGameList(string game, ILogger<DealSearchController> logger)
        {
            using (HttpClient client = CreateHttpClient())
            {
                try
                {
                    string url = $"https://www.cheapshark.com/api/1.0/games?title={game}";

                    HttpResponseMessage response = await client.GetAsync(url);

                    string responseBody = await response.Content.ReadAsStringAsync();
                    logger.LogInformation(responseBody);

                    response.EnsureSuccessStatusCode(); // Throws an exception for 4xx/5xx responses

                    string type = response.Content.GetType().ToString();
                    logger.LogInformation($"Response type: {type}");

                    // Deserialize the JSON response into a dynamic object
                    JsonNode jsonResponse = JsonNode.Parse(responseBody);

                    List<GameDeal> deals = System.Text.Json.JsonSerializer.Deserialize<List<GameDeal>>(responseBody);

                    foreach (var entry in jsonResponse.AsArray())
                    {
                        //Access properties
                        Console.WriteLine(entry);
                        Console.WriteLine();

                        /*
                        // Check for null before accessing 
                        if (entry?["gameID"] != null)
                        {
                            Console.WriteLine(entry["gameID"]);
                            //Console.WriteLine(entry["gameID"].GetType());
                            
                            // Extract game id as string from the Json Object
                            string id = entry["gameID"].GetValue<string>();
                            GetRequestId(id);
                        }
                        */
                        Console.WriteLine();
                    }


                    return deals ?? new List<GameDeal>();



                }
                catch (HttpRequestException e)
                {
                    logger.LogWarning($"Request error: {e.Message}");
                    return new List<GameDeal>(); // Return an empty list on error
                }
            }
        }

        public static async Task<BestGameDeal> GameInfoById(string id, ILogger<BestDealInfoController> logger)
        {
            BestGameDeal bestDeal = new BestGameDeal();

            using (HttpClient client = CreateHttpClient())
            {
                try
                {
                    string url = $"https://www.cheapshark.com/api/1.0/games?id={id}";
                    HttpResponseMessage response = await client.GetAsync(url);

                    response.EnsureSuccessStatusCode(); // Throws an exception for 4xx/5xx responses

                    logger.LogInformation("Response received for Individual game id");

                    //string type = response.Content.GetType().ToString();

                    string responseBody = await response.Content.ReadAsStringAsync();
                    //Console.WriteLine(responseBody);

                    // Deserialize the JSON response into a dynamic object
                    JsonNode jsonResponse = JsonNode.Parse(responseBody);
                    //Console.WriteLine(jsonResponse);
                    Console.WriteLine(jsonResponse["cheapestPriceEver"]);

                    JsonNode cheapestPriceEver = jsonResponse["cheapestPriceEver"];
                    string Price = cheapestPriceEver["price"]?.GetValue<string>();
                    Console.WriteLine(Price);
                    bestDeal.cheapestPriceEver = Price != null ? Price : "No price available";

                    if (cheapestPriceEver["date"] != null)
                    {
                        long unixTimestamp = cheapestPriceEver["date"].GetValue<long>();

                        // Set Unix timestamp value to Human date 
                        DateTimeOffset dateTime = DateTimeOffset.FromUnixTimeSeconds(unixTimestamp);

                        string Date = dateTime.Date.ToString("MMMM dd, yyyy");
                        Console.WriteLine(Date);
                        bestDeal.date = Date != null ? Date : "No date available";
                    }

                    return bestDeal ?? new BestGameDeal();
                }
                catch (HttpRequestException e)
                {
                    logger.LogWarning($"Request error: {e.Message}");
                    return new BestGameDeal(); // Return an empty BestGameDeal on error
                }
            }
        }

        public static async Task GetDealInfo(string id)
        {
            using (HttpClient client = CreateHttpClient())
            {
                try
                {
                    string url = $"https://www.cheapshark.com/api/1.0/deals?id={id}";
                    HttpResponseMessage response = await client.GetAsync(url);

                    response.EnsureSuccessStatusCode(); // Throws an exception for 4xx/5xx responses

                    Console.WriteLine("Response received");

                    string type = response.Content.GetType().ToString();

                    string responseBody = await response.Content.ReadAsStringAsync();
                    //Console.WriteLine(responseBody);

                    // Deserialize the JSON response into a dynamic object
                    JsonNode jsonResponse = JsonNode.Parse(responseBody);
                    //Console.WriteLine(jsonResponse);
                    Console.WriteLine(jsonResponse["gameInfo"]);
                    Console.WriteLine(jsonResponse["cheapestPrice"]);

                    JsonNode gameInfo = jsonResponse["gameInfo"];
                    JsonNode cheapestPrice = jsonResponse["cheapestPrice"];

                    string retailPrice = gameInfo["retailPrice"]?.GetValue<string>();
                    Console.WriteLine($"retailPrice: {retailPrice}");

                    string steamRatingText = gameInfo["steamRatingText"]?.GetValue<string>();
                    Console.WriteLine($"steamRatingText: {steamRatingText}");

                    string steamRatingCount = gameInfo["steamRatingCount"]?.GetValue<string>();
                    Console.WriteLine($"steamRatingCount: {steamRatingCount}");

                    string metacriticScore = gameInfo["metacriticScore"]?.GetValue<string>();
                    Console.WriteLine($"metacriticScore: {metacriticScore}");

                    string dealLink = $"https://www.cheapshark.com/redirect?dealID={id}";
                    Console.WriteLine($"dealLink: {dealLink}");


                    string chepestPriceEver = cheapestPrice["price"]?.GetValue<string>();
                    Console.WriteLine($"Cheapest Price ever: {chepestPriceEver}");

                    //Check for cheapest price date
                    if (cheapestPrice["date"] != null)
                    {
                        long unixTimestamp = cheapestPrice["date"].GetValue<long>();

                        // Set Unix timestamp value to Human date 
                        DateTimeOffset dateTime = DateTimeOffset.FromUnixTimeSeconds(unixTimestamp);

                        string Date = dateTime.Date.ToString("MMMM dd, yyyy");
                        Console.WriteLine($"chepest price date: {Date}");
                    }

                    //Check for release date
                    if (gameInfo["releaseDate"] != null)
                    {
                        long unixTimestamp = gameInfo["releaseDate"].GetValue<long>();

                        //Set Unix timestamp value to Human date 
                        DateTimeOffset dateTime = DateTimeOffset.FromUnixTimeSeconds(unixTimestamp);

                        string releaseDate = dateTime.Date.ToString("MMMM dd, yyyy");
                        Console.WriteLine($"Release date: {releaseDate}");
                    }
                }
                catch (HttpRequestException e)
                {
                    Console.WriteLine($"Request error: {e.Message}");
                }
            }
        }


        public static async Task<SetAlertResult> SetAlert(string gameId, string email, string price, ILogger logger, EmailAlertAction action_type)
        {
            using (HttpClient client = CreateHttpClient())
            {
                try
                {
                    //string url = $"https://www.cheapshark.com/api/1.0/deals?id={id}";
                    //https://www.cheapshark.com/api/1.0/alerts?action=set&email=someone@example.org&gameID=59&price=14.99
                    string set_url = $"https://www.cheapshark.com/api/1.0/alerts?action=set&email={email}&gameID={gameId}&price={price}";
                    string delete_url = $"https://www.cheapshark.com/api/1.0/alerts?action=delete&email={email}&gameID={gameId}&price={price}";
                    string url = "";
                    if (action_type == EmailAlertAction.Set)
                        url = set_url;
                    else if (action_type == EmailAlertAction.Delete)
                        url = delete_url;
                        
                    
                        
                    HttpResponseMessage response = await client.GetAsync(url);

                    response.EnsureSuccessStatusCode(); // Throws an exception for 4xx/5xx responses
                    logger.LogInformation("Response received");

                    string type = response.Content.GetType().ToString();

                    string responseBody = await response.Content.ReadAsStringAsync();
                    //Console.WriteLine(responseBody);

                    // Deserialize the JSON response into a dynamic object
                    JsonNode jsonResponse = JsonNode.Parse(responseBody);
                    //Console.WriteLine(jsonResponse);

                    // Handle cheapshark api response for setting alert attempt
                    if (jsonResponse != null)
                    {
                        logger.LogInformation(jsonResponse.ToJsonString());
                        if (jsonResponse.ToString() == "true")
                            return SetAlertResult.Success;
                        if (jsonResponse.ToString() == "false")
                        {
                            logger.LogError($"CheapSharkAPI set fialed");
                            return SetAlertResult.Failed;
                        }
                            

                    }

                    return SetAlertResult.Error;

                    //Console.WriteLine(jsonResponse["gameInfo"]);
                    //Console.WriteLine(jsonResponse["cheapestPrice"]);

                    //JsonNode gameInfo = jsonResponse["gameInfo"];
                }
                catch (HttpRequestException e)
                {
                    logger.LogWarning($"Request error: {e.Message}");
                    return SetAlertResult.Error;
                }
            }
        }

        
        public static async Task GetRequestIdOld(string id)
        {
            using (HttpClient client = CreateHttpClient())
            {
                try
                {
                    string url = $"https://www.cheapshark.com/api/1.0/games?id={id}";
                    HttpResponseMessage response = await client.GetAsync(url);

                    response.EnsureSuccessStatusCode(); // Throws an exception for 4xx/5xx responses

                    Console.WriteLine("Response received for Individual game id");

                    string type = response.Content.GetType().ToString();

                    string responseBody = await response.Content.ReadAsStringAsync();
                    //Console.WriteLine(responseBody);

                    // Deserialize the JSON response into a dynamic object
                    JsonNode jsonResponse = JsonNode.Parse(responseBody);
                    //Console.WriteLine(jsonResponse);
                    Console.WriteLine(jsonResponse["cheapestPriceEver"]);

                    JsonNode cheapestPriceEver = jsonResponse["cheapestPriceEver"];
                    string Price = cheapestPriceEver["price"]?.GetValue<string>();
                    Console.WriteLine(Price);

                    if (cheapestPriceEver["date"] != null)
                    {
                        long unixTimestamp = cheapestPriceEver["date"].GetValue<long>();

                        // Set Unix timestamp value to Human date 
                        DateTimeOffset dateTime = DateTimeOffset.FromUnixTimeSeconds(unixTimestamp);

                        string Date = dateTime.Date.ToString("MMMM dd, yyyy");
                        Console.WriteLine(Date);
                    }
                }
                catch (HttpRequestException e)
                {
                    Console.WriteLine($"Request error: {e.Message}");
                }
            }
        }
    }
}
