using System.ComponentModel.DataAnnotations;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class ColaboradorUpdateDto : ColaboradorCreateDto
    {
        [Required]
        public int Id { get; set; }
    }
}

