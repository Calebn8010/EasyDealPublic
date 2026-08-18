using Azure.Core;
using EasyDeal.Server.Data;
using EasyDeal.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EasyDeal.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WishlistUpdatesController : ControllerBase
    {
        private readonly ILogger<WishlistUpdatesController> _logger;
        private readonly ApplicationDbContext _context;
        private readonly CheapSharkApiRequests _cheapShark;

        public WishlistUpdatesController(ILogger<WishlistUpdatesController> logger, ApplicationDbContext context, CheapSharkApiRequests cheapSharkApiRequests)
        {
            _logger = logger;
            _context = context;
            _cheapShark = cheapSharkApiRequests;

        }

        public enum WishlistResult
        {
            Success,
            AlreadyExists,
            DatabaseError,
            NotFound
        }

        // Handles Post request from front end for WishlistUpdates endpoint
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] GameDeal request)
        {
            _logger.LogInformation("WishlistUpdatesController Post method called.");

            // Get logged in user id 
            string? userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("No user is logged in.");
                return Unauthorized(new { message = "User is not logged in." });
            }

            _logger.LogInformation($"User id: {userId}");

            WishlistResult status_result = AddToWishlist(request, userId);

            return status_result switch
            {
                WishlistResult.Success => Ok(),
                WishlistResult.AlreadyExists => Conflict("Already in wishlist"),
                WishlistResult.DatabaseError => StatusCode(500, "Failed to save"),
                _ => BadRequest()
            };
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromBody] WishlistItem request)
        {
            _logger.LogInformation("WishlistUpdatesController Delete method called.");

            // Get logged in user id 
            string? userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("No user is logged in.");
                return Unauthorized(new { message = "User is not logged in." });
            }

            _logger.LogInformation($"User id: {userId}");

            WishlistResult status_result = await DeleteWishlistItem(request, userId);

            return status_result switch
            {
                WishlistResult.Success => Ok(),
                WishlistResult.NotFound => Conflict("Already in wishlist"),
                WishlistResult.DatabaseError => StatusCode(500, "Failed to save"),
                _ => BadRequest()
            };

            //// Update user's wishlist entry for selected game deal id
            //Wishlist ? game_deal = await _context.Wishlists
            //    .FirstOrDefaultAsync(w => w.UserId == userId && w.GameId == request.gameID);

            //// Return 404 if gamne deal not found in Wishlist db
            //if (game_deal == null)
            //    return NotFound("Wishlist entry not found.");

            //// Soft delete user game deal requested
            //game_deal.IsDeleted = true;
            //int result = await _context.SaveChangesAsync();

            //return result > 0 ? Ok() : StatusCode(500, "Failed to delete.");

        }

        // Handles GET request from front end to fetch user's wishlist
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            _logger.LogInformation("WishlistUpdatesController Get method called.");

            // Get logged in user id
            string? userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("No user is logged in.");
                return Unauthorized(new { message = "User is not logged in." });
            }

            _logger.LogInformation($"Fetching wishlist for user id: {userId}");

            List<Wishlist> wishlist = await _context.Wishlists
                .Where(w => w.UserId == userId && !w.IsDeleted)
                .OrderByDescending(w => w.DateAdded)
                .ToListAsync();

            // Load all alerts for this user once (avoids N+1 queries)
            List<WishlistAlert> alerts = await _context.WishlistAlerts
                .Where(w => w.UserId == userId && !w.IsDeleted && w.IsActive)
                .ToListAsync();

            // Map to a DTO that matches what the frontend expects
            var result = wishlist.Select(w => new
            {
                external = w.GameName,
                gameID = w.GameId,
                dateAdded = w.DateAdded,
                targetPrice = alerts.FirstOrDefault(a => a.GameId == w.GameId)?.TargetPrice
            });

            return Ok(result);
        }


        private WishlistResult AddToWishlist(GameDeal gameDeal, string userid)
        {
            _logger.LogInformation($"Game deal to add: {gameDeal.external}");
            // Implement logic to add the game deal to the wishlist

            //check if Wishlist game record with user id is already in db
            List<Wishlist> wishlist_game = _context.Wishlists
                .Where(w => w.GameId == gameDeal.gameID && w.UserId == userid)
                .ToList();

            _logger.LogInformation($"wishlist game info: {wishlist_game}");

            if (wishlist_game.Count == 0)
            {
                // Map GameDeal to Wishlist
                Wishlist wishlistEntry = new Wishlist
                {
                    GameName = gameDeal.external,
                    GameId = gameDeal.gameID,
                    DateAdded = DateTime.UtcNow,
                    UserId = userid
                    // IsDeleted defaults to false since it is a bool
                };

                _context.Wishlists.Add(wishlistEntry);
                int result = _context.SaveChanges();

                if (result == 0)
                {
                    _logger.LogError($"Not able to save changes - check db connection");
                    return WishlistResult.DatabaseError;
                }

                _logger.LogInformation($"New wishlist add saved successfully");
                return WishlistResult.Success; // returns as success if at least one row was affected
            }

            // Return with already exisits if record is not set deleted
            else if (wishlist_game[0].IsDeleted == false)
            {
                _logger.LogInformation($"Game is already in wishlist for this user: {gameDeal.external}");
                return WishlistResult.AlreadyExists;
            }

            // Game is already in wishlist but has been soft deleted previously
            else
            {
                wishlist_game[0].IsDeleted = false;
                _context.SaveChanges();
                return WishlistResult.Success;
            }
        }

        private async Task<WishlistResult> DeleteWishlistItem(WishlistItem item, string userId)
        {
            // Update user's wishlist entry for selected game deal id
            Wishlist? game_deal = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.GameId == item.gameID);

            // Return 404 if gamne deal not found in Wishlist db
            if (game_deal == null)
            {
                _logger.LogWarning("Wishlist Item not found when calling DeleteWishlistItem().");
                return WishlistResult.NotFound;
            }

            // Get user's email 
            ApplicationUser? user = await _context.Users
                .FirstOrDefaultAsync(w => w.Id == userId);

            string? user_email = user.UserName;

            // Remove from Cheapshark api
            _logger.LogInformation($"------------------------deleting");
            SetAlertResult api_result = await _cheapShark.SetAlert(item.gameID, user_email, "0", _logger, EmailAlertAction.Delete);
            _logger.LogInformation($"------------------------");

            if (api_result != SetAlertResult.Success)
            {
                _logger.LogWarning("Failed to delete from Cheapshark API exiting without deleting from Wishlist db");
                return WishlistResult.DatabaseError;
            }

            // Soft delete user Wishlist item requested
            game_deal.IsDeleted = true;
            int result = await _context.SaveChangesAsync();

            if (result == 0)
            {
                _logger.LogWarning("Failed to delete when calling DeleteWishlistItem() > WishlistItem");
                return WishlistResult.DatabaseError;
            }

            // Find WishlistAlert record for this user/game (active) and soft delete if present
            WishlistAlert? wishlist_game = await _context.WishlistAlerts
                .Where(w => w.GameId == item.gameID && w.UserId == userId && w.IsActive == true)
                .FirstOrDefaultAsync();

            if (wishlist_game != null)
            {
                wishlist_game.IsActive = false;
                wishlist_game.IsDeleted = true;
                wishlist_game.DateDeleted = DateTime.UtcNow;

                int result2 = await _context.SaveChangesAsync();

                if (result2 == 0)
                {
                    _logger.LogWarning("Failed to delete when calling DeleteWishlistItem() > WishlistAlert");
                    return WishlistResult.DatabaseError;
                }
            }
            else
            {
                _logger.LogInformation("No active WishlistAlert found for user/game; skipping alert deletion.");
            }

            return WishlistResult.Success;
        }
    }
}
