namespace EasyDeal.Server.Models
{
    public class GameDeal
    {
        public string gameID { get; set; }
        public string? steamAppID { get; set; } //Only field that can be null, causing issues for deluxe game deal entries - sending client 400 reponse
        public string cheapest { get; set; }
        public string cheapestDealID { get; set; }
        public string external { get; set; }
        public string internalName { get; set; }
        public string thumb { get; set; }
       
    }
}
