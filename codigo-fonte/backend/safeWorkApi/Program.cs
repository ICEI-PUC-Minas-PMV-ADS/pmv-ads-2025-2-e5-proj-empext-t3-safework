using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using Microsoft.IdentityModel.Tokens;
using safeWorkApi.Models;
using safeWorkApi.service;
using safeWorkApi.utils.Controller;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<Filters>();

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
// builder.Services.AddEndpointsApiExplorer(); => so funciona no dotnet9
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<TempDataService>();

//Implement database connection using appsettings in dev or .env in release
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DB_CONNECTION");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
);

builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
                .AddJwtBearer(options =>
                {
                    options.SaveToken = true;
                    options.RequireHttpsMetadata = false;
                    options.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        //Chave de criptografia deve ser o mesmo do controller de autenticacao
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("BjRxlIiDQHvTrRQM3Ke4CeS9uE3RZODH"))
                    };
                });

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        if (dbContext.Database.CanConnect())
        {
            Console.WriteLine("✅ Banco de dados conectado com sucesso!");
        }
        else
        {
            Console.WriteLine("❌ Falha ao conectar ao banco de dados!");
        }

        // dbContext.Database.Migrate();  // NÃO usar em SmarterASP
    }
    catch (Exception ex)
    {
        Console.WriteLine("❌ Erro ao testar conexão com o banco:");
        Console.WriteLine(ex.Message);
    }
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // redireciona para /swagger na raiz se acessar /
    app.MapGet("/", context =>
    {
        context.Response.Redirect("/swagger");
        return Task.CompletedTask;
    });
}


app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();