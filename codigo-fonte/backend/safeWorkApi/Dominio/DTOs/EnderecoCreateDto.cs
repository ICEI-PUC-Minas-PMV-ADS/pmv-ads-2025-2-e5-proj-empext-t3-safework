using System.ComponentModel.DataAnnotations;

namespace safeWorkApi.DTOs
{
    public class EnderecoCreateDto
    {
        [Required(ErrorMessage = "Logradouro é obrigatório")]
        [StringLength(200, ErrorMessage = "Logradouro deve ter no máximo 200 caracteres")]
        public string Logradouro { get; set; } = null!;

        [Required(ErrorMessage = "Número é obrigatório")]
        [StringLength(20, ErrorMessage = "Número deve ter no máximo 20 caracteres")]
        public string Numero { get; set; } = null!;

        [StringLength(100, ErrorMessage = "Complemento deve ter no máximo 100 caracteres")]
        public string? Complemento { get; set; }

        [Required(ErrorMessage = "Bairro é obrigatório")]
        [StringLength(100, ErrorMessage = "Bairro deve ter no máximo 100 caracteres")]
        public string Bairro { get; set; } = null!;

        [Required(ErrorMessage = "Município é obrigatório")]
        [StringLength(100, ErrorMessage = "Município deve ter no máximo 100 caracteres")]
        public string Municipio { get; set; } = null!;

        [Required(ErrorMessage = "UF é obrigatório")]
        [StringLength(2, MinimumLength = 2, ErrorMessage = "UF deve ter exatamente 2 caracteres")]
        public string Uf { get; set; } = null!;

        [Required(ErrorMessage = "CEP é obrigatório")]
        [StringLength(8, MinimumLength = 8, ErrorMessage = "CEP deve ter exatamente 8 dígitos")]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "CEP deve conter apenas números (8 dígitos)")]
        public string Cep { get; set; } = null!;
    }
}