using EasyDeal.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;


namespace EasyDeal.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class BestDealInfoController : ControllerBase
    {
        private readonly ILogger<BestDealInfoController> _logger;

        public BestDealInfoController(ILogger<BestDealInfoController> logger)
        {
            _logger = logger;
        }

        // Handles Post request from front end for BestDealInfo endpoint
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] BestGameDealRequest request)
        {
            _logger.LogInformation("BestDealInfoController Post method called.");
            
            // Fetch the list of game deals based on the query
            var dealInfo = await CheapSharkApiRequests.GameInfoById(request.gameID, _logger);
            
            return Ok(dealInfo); // Serialize detailed deal info to JSON
        }
    }
}
