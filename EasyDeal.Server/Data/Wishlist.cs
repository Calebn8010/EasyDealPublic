using System.ComponentModel.DataAnnotations;
using EasyDeal.Server.Data;

namespace EasyDeal.Server.Data
{
    public class Wishlist
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string GameName { get; set; }

        public string GameId { get; set; }

        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        // Optional: link to Identity user
        public string UserId { get; set; }

        public bool IsDeleted { get; set; }
        //public ApplicationUser User { get; set; }
    }
}

