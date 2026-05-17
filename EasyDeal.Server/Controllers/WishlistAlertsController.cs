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
        public async Task<IActionResult> Post([FromBody] WishlistGameAlert request)
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

            //return Ok();

            

            WishlistAlertResult status_result = AddToWishlistAlerts(request, userId);

            return status_result switch
            {
                WishlistAlertResult.Success => Ok(),
                WishlistAlertResult.DatabaseError => StatusCode(500, "Failed to save"),
                _ => BadRequest()
            };

            
        }

        private WishlistAlertResult AddToWishlistAlerts(WishlistGameAlert game, string userid)
        {
            _logger.LogInformation($"Game deal to add to WishlistAlerts: {game.external}");
            // Implement logic to add the game deal to the wishlist

            //check if WishlistAlert record with user id is already in db
            List<WishlistAlert> wishlist_game = _context.WishlistAlerts
                .Where(w => w.GameId == game.gameId && w.UserId == userid)
                .ToList();

            _logger.LogInformation($"wishlist game info: {wishlist_game}");

            // Already exisits for user / gameID, set IsActive false before adding new game Alert record
            if (wishlist_game.Count > 0)
            {
                wishlist_game[0].IsActive = false;
                wishlist_game[0].DateSetInactive = DateTime.UtcNow;
                _context.SaveChanges();
            }
            else
                _logger.LogWarning("Count greater than on for wishlistgame added > AddToWishlistAlerts()");

            return CreateNewWishlistAlert(game, userid);
        }



        private WishlistAlertResult CreateNewWishlistAlert(WishlistGameAlert game, string userid)
        {
            // Map GameDeal to Wishlist
            WishlistAlert wishlistAlertEntry = new WishlistAlert
            {
                GameName = game.external,
                GameId = game.gameId,
                TargetPrice = game.targetPrice,
                DateAdded = DateTime.UtcNow,
                UserId = userid,
                IsActive = true
                // IsDeleted defaults to false since it is a bool
            };

            _context.WishlistAlerts.Add(wishlistAlertEntry);
            int result = _context.SaveChanges();

            if (result == 0)
            {
                _logger.LogError($"Not able to save changes - check db connection");
                return WishlistAlertResult.DatabaseError;
            }

            _logger.LogInformation($"New wishlist add saved successfully");
            return WishlistAlertResult.Success; // returns as success if at least one row was affected
        }
    }
}
