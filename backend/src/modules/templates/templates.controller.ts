import { Controller, Get, Param, Query } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Templates')
@Controller('api/templates')
export class TemplatesController {
  constructor(private readonly svc: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List all base template schemas' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category (sidebar-left, banner, single-column, etc.)' })
  findAll(@Query('category') category?: string) {
    if (category) return this.svc.findByCategory(category);
    return this.svc.findAll();
  }

  @Get('bulk')
  @ApiOperation({ summary: 'Generate bulk template variants (layouts × palettes × fonts × spacing)' })
  @ApiQuery({ name: 'palettes', required: false, description: 'Comma-separated palette ids' })
  @ApiQuery({ name: 'fonts', required: false, description: 'Comma-separated font ids' })
  @ApiQuery({ name: 'spacing', required: false, description: 'Comma-separated spacing options (compact,normal,spacious)' })
  generateBulk(
    @Query('palettes') palettes?: string,
    @Query('fonts') fonts?: string,
    @Query('spacing') spacing?: string,
  ) {
    const result = this.svc.generateBulk({
      paletteIds: palettes?.split(',').map((s) => s.trim()),
      fontIds: fonts?.split(',').map((s) => s.trim()),
      spacingOptions: spacing?.split(',').map((s) => s.trim()) as ('compact' | 'normal' | 'spacious')[] | undefined,
    });
    return { count: result.length, templates: result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single template schema by ID' })
  findById(@Param('id') id: string) {
    const schema = this.svc.findById(id);
    if (!schema) return { error: 'Template not found', statusCode: 404 };
    return schema;
  }
}
