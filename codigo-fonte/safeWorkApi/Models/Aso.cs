using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
        [Key]
        public int Id { get; set; }

        [Required]
        [Column("tipo_aso")]
        public TipoAso TipoAso { get; set; }

        [Required]
        [Column("data_solicitacao")]
        public DateTime DataSolicitacao { get; set; }

        [Required]
        [Column("data_validade")]
        public DateTime DataValidade { get; set; }

        [Required]
        [Column("status")]
        public StatusAso Status { get; set; }

        [Column("path_file")]
        public string PathFile { get; set; }

        [Column("observacoes")]
        public string Observacoes { get; set; } = null!;

        [Required]
        [Column("id_colaborador")]
        public int IdColaborador { get; set; }
        public Colaborador Colaborador { get; set; } = null!;
    }
}