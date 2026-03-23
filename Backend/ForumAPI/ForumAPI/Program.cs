using ForumAPI.DataContext;
using ForumAPI.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

// --------- BUILDER SETTINGS ----------

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

#region Frontend Policies

string angularCorsPolicy = "AngularCorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(angularCorsPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://localhost:4200")
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

#endregion

builder.Services.AddControllers();

builder.Services.Configure<JWTSettings>(options =>
{
    options.SecretKey = builder.Configuration["JwtSettings:SecretKey"]
        ?? throw new InvalidOperationException("JWT Secret Key is not configured");
});

#region Database Settings

var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("ForumContext"));
dataSourceBuilder.MapEnum<Role>("role");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ForumContext>(options
    => options.UseNpgsql(dataSource, o => o.MapEnum<Role>("role")));

#endregion

// ---------- APP SETTINGS ----------

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(angularCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
