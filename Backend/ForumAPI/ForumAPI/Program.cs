using ForumAPI.DataContext;
using ForumAPI.Models;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

builder.Services.AddControllers();

var dataSourceBuilder = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("ForumContext"));
dataSourceBuilder.MapEnum<Role>("role");
var dataSource = dataSourceBuilder.Build();

builder.Services.AddDbContext<ForumContext>(options
    => options.UseNpgsql(dataSource, o => o.MapEnum<Role>("role")));

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
