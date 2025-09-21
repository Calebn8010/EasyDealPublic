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
            AddToWishlist(request, userId);
            return Ok(new { message = "Wishlist updated successfully." });
            
            /*
            if (AddToWishlist(request, userId))
            {
                return Ok(new { message = "Wishlist updated successfully." });
            }
            
            else // 409 standard for resource conflicts
                return StatusCode(409, new { message = "Game is already added into your Wishlist" });
            */
        }

        public bool AddToWishlist(GameDeal gameDeal, string userid)
        {
            _logger.LogInformation($"Game deal to add: {gameDeal.external}");
            // Implement logic to add the game deal to the wishlist

            //check if Wishlist gane record with user id is already in db
            bool inWishlist = _context.Wishlists
                .Any(w => w.GameId == gameDeal.gameID && w.UserId == userid && !w.IsDeleted);

            if (inWishlist)
            {
                _logger.LogInformation($"Game is already in wishlist for this user: {gameDeal.external}");
                return false;
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
                return false;
            }
            else
                return result > 0; // returns true if at least one row was affected



        }
    }
}
