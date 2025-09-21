using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using EasyDeal.Server.Models;


namespace EasyDeal.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DealSearchController : ControllerBase
    {
        private readonly ILogger<DealSearchController> _logger;

        public DealSearchController(ILogger<DealSearchController> logger)
        {
            _logger = logger;
        }


        // Handles Post request from front end for DealSearch endpoint
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DealSearchRequest request)
        {
            _logger.LogInformation("DealSearchController Post method called.");
            _logger.LogInformation($"Received query: {request?.query}");
            //var deals = await GetGameListRequest(request.Query);
            var deals = await CheapSharkApiRequests.GetGameList(request.query, _logger);

            //Testing new request function / git test
            //Console.WriteLine(deals[0].cheapestDealID);
            //CheapSharkApiRequests.GetDealInfo(deals[0].cheapestDealID);
            //CheapSharkApiRequests.GetRequestIdOld(deals[0].gameID);


            return Ok(deals); // Serialize list of deals to JSON
        }
        

    }
}
