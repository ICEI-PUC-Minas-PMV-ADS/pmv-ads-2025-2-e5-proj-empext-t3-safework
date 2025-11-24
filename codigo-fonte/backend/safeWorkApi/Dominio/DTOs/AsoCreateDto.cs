using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using safeWorkApi.Models;

namespace safeWorkApi.Dominio.DTOs
{
    public class AsoCreateDto
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

        public string? PathFile { get; set; }

        public string? Observacoes { get; set; }

        [Required]
        public int IdColaborador { get; set; }
    }
}