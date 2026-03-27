import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

class ExportHtmlDto {
  html!: string;
}

class ExportUrlDto {
  url!: string;
}

@ApiTags('Export')
@Controller('api/export')
export class ExportController {
  constructor(private readonly svc: ExportService) {}

  @Post('pdf')
  @ApiOperation({ summary: 'Convert HTML to A4 PDF' })
  @ApiBody({ type: ExportHtmlDto })
  async exportPdf(@Body() body: ExportHtmlDto, @Res() res: Response) {
    if (!body.html) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'html field is required' });
    }
    const pdf = await this.svc.htmlToPdf(body.html);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf',
      'Content-Length': pdf.length.toString(),
    });
    return res.send(pdf);
  }

  @Post('pdf-from-url')
  @ApiOperation({ summary: 'Render a URL to A4 PDF' })
  @ApiBody({ type: ExportUrlDto })
  async exportPdfFromUrl(@Body() body: ExportUrlDto, @Res() res: Response) {
    if (!body.url) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'url field is required' });
    }
    const pdf = await this.svc.urlToPdf(body.url);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=resume.pdf',
      'Content-Length': pdf.length.toString(),
    });
    return res.send(pdf);
  }

  @Post('screenshot')
  @ApiOperation({ summary: 'Render HTML to PNG screenshot (for thumbnails)' })
  @ApiBody({ type: ExportHtmlDto })
  async exportScreenshot(@Body() body: ExportHtmlDto, @Res() res: Response) {
    if (!body.html) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'html field is required' });
    }
    const img = await this.svc.htmlToScreenshot(body.html);
    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline; filename=resume-thumbnail.png',
      'Content-Length': img.length.toString(),
    });
    return res.send(img);
  }
}
