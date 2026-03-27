import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ParserService } from './parser.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Parser')
@Controller('api/parser')
export class ParserController {
  constructor(private readonly svc: ParserService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a PDF or DOCX resume for parsing' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (_req, file, cb) => {
      const allowed = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];
      cb(null, allowed.includes(file.mimetype));
    },
  }))
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { error: 'No file uploaded or unsupported file type', statusCode: 400 };
    return this.svc.parseFile(file);
  }
}
