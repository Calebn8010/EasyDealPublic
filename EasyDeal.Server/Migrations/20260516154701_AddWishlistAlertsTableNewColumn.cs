using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EasyDeal.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddWishlistAlertsTableNewColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TargetPrice",
                table: "WishlistAlerts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TargetPrice",
                table: "WishlistAlerts");
        }
    }
}
