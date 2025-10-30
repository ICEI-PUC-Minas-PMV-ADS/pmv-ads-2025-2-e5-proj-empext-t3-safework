using System.ComponentModel.DataAnnotations;

namespace safeWorkApi.Dominio.DTOs
{
    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email deve ter um formato válido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Senha temporária é obrigatória")]
        public string TempPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nova senha é obrigatória")]
        [MinLength(6, ErrorMessage = "Nova senha deve ter pelo menos 6 caracteres")]
        public string NewPassword { get; set; } = string.Empty;
    }
}

