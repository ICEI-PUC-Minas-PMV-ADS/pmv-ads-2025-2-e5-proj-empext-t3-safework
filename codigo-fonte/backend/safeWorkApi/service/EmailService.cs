using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Net.Mail;
using System.Net.Mime;
using System.Net;
using System.Text;

namespace safeWorkApi.service
{
    public class EmailService
    {
        private string _emailGmail = "smtp.gmail.com";
        private int _portEmailGmail = 587;

        private string _emailFrom = "safework982@gmail.com";
        private string _passwordEmailFrom = "lngc lhrx snzj eosc";


        private string assetsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "assets");
        private string _emailHTML;
        private string _imageHTML;

        public EmailService()
        {
            _emailHTML = File.ReadAllText(Path.Combine(assetsPath, "email_template.html"));
            _imageHTML = Path.Combine(assetsPath, "imgs", "IconSafeWork.png");
        }

        public async Task<string> SendEmail(string emailTo, string? userNameTo)
        {
            using (var client = new SmtpClient(_emailGmail, _portEmailGmail))
            {
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(_emailFrom, _passwordEmailFrom);

                //Receber Password e nome do usuario e incluir no HTML
                string temPassword = GeneratePassword();
                _emailHTML = _emailHTML.Replace("{{TEMP_PASSWORD}}", temPassword);
                _emailHTML = _emailHTML.Replace("{{USER_NAME}}", userNameTo);

                //Configuracoes do Email
                var mail = new MailMessage();
                mail.From = new MailAddress(_emailFrom, "Suporte SafeWork");
                mail.To.Add(emailTo);
                mail.Subject = "SafeWork - Recuperação de Email";
                mail.Body = _emailHTML;
                mail.IsBodyHtml = true;

                //Criar AlternateView com HTML
                AlternateView avHTML = AlternateView.CreateAlternateViewFromString(_emailHTML, null, MediaTypeNames.Text.Html);

                //Inclui imagem no HTML como recurso vinculado
                LinkedResource logo = new LinkedResource(_imageHTML, MediaTypeNames.Image.Png);
                logo.ContentId = "LogoEmpresa";
                avHTML.LinkedResources.Add(logo);

                //Vincula o AlternateView ao Email
                mail.AlternateViews.Add(avHTML);

                //Envia o Email
                await client.SendMailAsync(mail);

                return temPassword;
            }
        }

        private string GeneratePassword()
        {
            const string letrasMinusculas = "abcdefghijklmnopqrstuvwxyz";
            const string letrasMaiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string numeros = "0123456789";
            const string especiais = "@_#*$";

            string todosCaracteres = letrasMinusculas + letrasMaiusculas + numeros + especiais;

            StringBuilder senha = new StringBuilder();
            Random rnd = new Random();

            for (int i = 0; i < 12; i++)
            {
                int indice = rnd.Next(todosCaracteres.Length);
                senha.Append(todosCaracteres[indice]);
            }

            return senha.ToString();
        }
    }
}