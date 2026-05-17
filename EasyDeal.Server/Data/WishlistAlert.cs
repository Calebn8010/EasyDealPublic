using System.ComponentModel.DataAnnotations;
using EasyDeal.Server.Data;

namespace EasyDeal.Server.Data
{
    public class WishlistAlert
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string GameName { get; set; }

        public string GameId { get; set; }

        public string TargetPrice { get; set; }

        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        public DateTime? DateSetInactive { get; set; }

        public DateTime? DateDeleted { get; set; }

        public string UserId { get; set; }

        public bool IsActive { get; set; }

        public bool IsDeleted { get; set; }
        //public ApplicationUser User { get; set; }
    }
}

