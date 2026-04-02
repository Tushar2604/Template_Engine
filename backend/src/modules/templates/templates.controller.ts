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
  @ApiOperation({ summary: 'Generate 100+ structurally distinct composed templates (shell × zones × type scale × presentation)' })
  @ApiQuery({ name: 'count', required: false, description: 'Target count (100–300)' })
  generateBulk(@Query('count') count?: string) {
    const n = count ? parseInt(count, 10) : 120;
    const result = this.svc.generateBulk({ targetCount: Number.isFinite(n) ? n : 120 });
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
