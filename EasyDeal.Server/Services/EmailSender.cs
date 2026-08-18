using Microsoft.AspNetCore.Identity.UI.Services;

namespace EasyDeal.Server.Services;

public class EmailSender : IEmailSender
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailSender> _logger;

    public EmailSender(IConfiguration config, ILogger<EmailSender> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        var smtpHost = _config["Email:SmtpHost"];
        var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
        var smtpUser = _config["Email:SmtpUser"];
        var smtpPass = _config["Email:SmtpPass"];

        using var client = new System.Net.Mail.SmtpClient(smtpHost, smtpPort)
        {
            Credentials = new System.Net.NetworkCredential(smtpUser, smtpPass),
            EnableSsl = true
        };

        var mail = new System.Net.Mail.MailMessage
        {
            From = new System.Net.Mail.MailAddress(smtpUser!, "EasyDeal"),
            Subject = subject,
            Body = htmlMessage,
            IsBodyHtml = true
        };
        mail.To.Add(email);

        await client.SendMailAsync(mail);
        _logger.LogInformation("Confirmation email sent to {Email}", email);
    }
}