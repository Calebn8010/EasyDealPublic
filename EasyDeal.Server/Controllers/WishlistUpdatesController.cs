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

        public WishlistUpdatesController(ILogger<WishlistUpdatesController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public enum WishlistResult
        {
            Success,
            AlreadyExists,
            DatabaseError
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

            // Update user's wishlist entry for selected game deal id
            Wishlist? game_deal = await _context.Wishlists
                .FirstOrDefaultAsync(w => w.UserId == userId && w.GameId == request.gameID);

            // Return 404 if gamne deal not found in Wishlist db
            if (game_deal == null)
                return NotFound("Wishlist entry not found.");

            // Soft delete user game deal requested
            game_deal.IsDeleted = true;
            int result = await _context.SaveChangesAsync();

            return result > 0 ? Ok() : StatusCode(500, "Failed to delete.");

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

            // Map to a DTO that matches what the frontend expects
            var result = wishlist.Select(w => new
            {
                external = w.GameName,
                gameID = w.GameId,
                dateAdded = w.DateAdded
            });

            return Ok(result);
        }


        private WishlistResult AddToWishlist(GameDeal gameDeal, string userid)
        {
            _logger.LogInformation($"Game deal to add: {gameDeal.external}");
            // Implement logic to add the game deal to the wishlist

            //check if Wishlist gane record with user id is already in db
            bool inWishlist = _context.Wishlists
                .Any(w => w.GameId == gameDeal.gameID && w.UserId == userid && !w.IsDeleted);

            if (inWishlist)
            {
                _logger.LogInformation($"Game is already in wishlist for this user: {gameDeal.external}");
                return WishlistResult.AlreadyExists;
            }

            //bool in_wishlist = from _context.Wishlists
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
    }
}
