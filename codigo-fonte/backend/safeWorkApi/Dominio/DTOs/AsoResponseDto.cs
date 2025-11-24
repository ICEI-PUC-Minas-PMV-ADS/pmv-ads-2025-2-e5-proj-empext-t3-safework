using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class AsoResponseDto
    {
        [Required]
        public TipoAso TipoAso { get; set; }

        [Required]
        public DateTime DataSolicitacao { get; set; }

        [Required]
        public DateTime DataValidade
        {
            get; set;
        }

        [Required]
        public StatusAso Status { get; set; }

        [Required]
        public string? PathFile { get; set; }

        [Required]
        public string? Observacoes { get; set; }

        [Required]
        public int IdColaborador { get; set; }
    }
}