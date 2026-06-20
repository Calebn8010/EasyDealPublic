using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
using EasyDeal.Server.Data;

namespace EasyDeal.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmailSender _emailSender;

    public AuthController(UserManager<ApplicationUser> userManager, IEmailSender emailSender)
    {
        _userManager = userManager;
        _emailSender = emailSender;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AuthRegisterRequest request)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email
        };

        Console.WriteLine("Make it to register 1");
        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        Console.WriteLine("Make it to register 2");

        // Generate and encode token
        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        // Link goes to React /confirm-email route
        var confirmLink = $"{request.ClientBaseUrl}/confirm-email?userId={user.Id}&token={encodedToken}";

        await _emailSender.SendEmailAsync(
            request.Email,
            "Confirm your EasyDeal account",
            $@"<h2>Welcome to EasyDeal!</h2>
               <p>Please confirm your email by clicking the link below:</p>
               <a href='{confirmLink}'>Confirm Email</a>
               <p>This link expires in 24 hours.</p>
               <p>If you did not register an account with EasyDeal please disregard this email.</p>"
        );

        return Ok(new { message = "Registration successful. Please check your email." });
    }

    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] AuthConfirmEmailRequest request)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

        return result.Succeeded
            ? Ok(new { message = "Email confirmed! You can now log in." })
            : BadRequest(new { message = "Invalid or expired confirmation link." });
    }

    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation([FromBody] AuthResendRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        // Always return OK to avoid exposing whether email exists
        if (user == null || await _userManager.IsEmailConfirmedAsync(user))
            return Ok(new { message = "If that email exists and is unconfirmed, a new link has been sent." });

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var confirmLink = $"{request.ClientBaseUrl}/confirm-email?userId={user.Id}&token={encodedToken}";

        await _emailSender.SendEmailAsync(
            request.Email,
            "Confirm your EasyDeal account",
            $"<p>New confirmation link: <a href='{confirmLink}'>Confirm Email</a></p>"
        );

        return Ok(new { message = "If that email exists and is unconfirmed, a new link has been sent." });
    }
}

public record AuthRegisterRequest(string Email, string Password, string ClientBaseUrl);
public record AuthConfirmEmailRequest(string UserId, string Token);
public record AuthResendRequest(string Email, string ClientBaseUrl);