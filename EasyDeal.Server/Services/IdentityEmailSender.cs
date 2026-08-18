using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using EasyDeal.Server.Data;

namespace EasyDeal.Server.Services;

public class IdentityEmailSender : IEmailSender<ApplicationUser>
{
    private readonly IEmailSender _emailSender;

    public IdentityEmailSender(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    public Task SendConfirmationLinkAsync(ApplicationUser user, string email, string confirmationLink) =>
        _emailSender.SendEmailAsync(email, "Confirm your EasyDeal account",
            $"<p>Please confirm your account by <a href='{confirmationLink}'>clicking here</a>.</p>");

    public Task SendPasswordResetLinkAsync(ApplicationUser user, string email, string resetLink) =>
        _emailSender.SendEmailAsync(email, "Reset your EasyDeal password",
            $"<p>Reset your password by <a href='{resetLink}'>clicking here</a>.</p>");

    public Task SendPasswordResetCodeAsync(ApplicationUser user, string email, string resetCode) =>
        _emailSender.SendEmailAsync(email, "Your EasyDeal password reset code",
            $"<p>Your password reset code is: <strong>{resetCode}</strong></p>");
}