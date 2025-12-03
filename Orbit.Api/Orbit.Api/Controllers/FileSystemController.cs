using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Orbit.Api.Dto.FileSystem;
using Orbit.Api.Service.Interface;

namespace Orbit.Api.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class FileSystemController : ControllerBase
    {
        private readonly IFileSystemService _fileSystemService;

        public FileSystemController(IFileSystemService fileSystemService)
        {
            _fileSystemService = fileSystemService;
        }

        /// <summary>
        /// Lista o conteúdo de um diretório.
        /// </summary>
        /// <param name="path">O caminho relativo dentro do diretório raiz. Deixe em branco para a raiz.</param>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ListContents([FromQuery] string path = "")
        {
            try
            {
                var contents = await _fileSystemService.ListDirectoryContentsAsync(path);
                return Ok(contents);
            }
            catch (DirectoryNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpPost("directory")]
        public async Task<IActionResult> CreateDirectory([FromBody] CreateDirectoryRequest request)
        {
            try
            {
                await _fileSystemService.CreateDirectoryAsync(request.Path);
                return Created("", new { message = "Diretório criado com sucesso" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar diretório: {ex.Message}");
            }
        }

        [HttpPost("file")]
        public async Task<IActionResult> CreateFile([FromBody] CreateFileRequest request)
        {
            try
            {
                await _fileSystemService.CreateFileAsync(request.Path, request.Content);
                return Created("", new { message = "Arquivo criado com sucesso" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao criar arquivo: {ex.Message}");
            }
        }
    }
}
