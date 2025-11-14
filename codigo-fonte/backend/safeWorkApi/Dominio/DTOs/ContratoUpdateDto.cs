using System.ComponentModel.DataAnnotations;

namespace safeWorkApi.Dominio.DTOs
{
    public class ContratoUpdateDto : ContratoCreateDto
    {
        [Required]
        public int Id { get; set; }
    }
}

