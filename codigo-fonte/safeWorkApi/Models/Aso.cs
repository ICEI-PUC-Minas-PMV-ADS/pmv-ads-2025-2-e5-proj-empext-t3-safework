using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace safeWorkApi.Models
{
    public enum TipoAso
    {
        Admissional = 1,
        Periodico = 2,
        RetornoAoTrabalho = 3,
        MudancaDeFuncao = 4,
        Demissional = 5
    }

    public enum StatusAso
    {
        Valido = 1,
        Vencido = 2,
        Aguardando = 3,
        Cancelado = 4
    }

    [Table("asos")]
    public class Aso
    {
        public int Id { get; set; }

        public TipoAso TipoAso { get; set; }

        public DateTime DataSolicitacao { get; set; }

        public DateTime DataValidade { get; set; }

        public StatusAso Status { get; set; }

        public string Observacoes { get; set; } = null!;

        public int IdColaborador { get; set; }
        public Colaborador Colaborador { get; set; } = null!;
    }
}