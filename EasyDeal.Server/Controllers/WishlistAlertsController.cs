using EasyDeal.Server.Data;
using EasyDeal.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EasyDeal.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WishlistAlertsController : ControllerBase
    {
        private readonly ILogger<WishlistAlertsController> _logger;
        private readonly ApplicationDbContext _context;

        public WishlistAlertsController(ILogger<WishlistAlertsController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public enum WishlistAlertResult
        {
            Success,
            DatabaseError
        }

        // Handles Post request from front end for WishlistUpdates endpoint
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] GameDeal request)
        {
            _logger.LogInformation("WishlistAlertsController Post method called.");

            // Get logged in user id 
            string? userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("No user is logged in.");
                return Unauthorized(new { message = "User is not logged in." });
            }

            _logger.LogInformation($"User id: {userId}");

            return Ok();

            /*

            WishlistAlertResult status_result = AddToAlerts(request, userId);

            return status_result switch
            {
                WishlistAlertResult.Success => Ok(),
                WishlistAlertResult.DatabaseError => StatusCode(500, "Failed to save"),
                _ => BadRequest()
            };

            */
        }

    }
}
