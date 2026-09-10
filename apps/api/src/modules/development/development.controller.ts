import { Controller, Get, Param } from '@nestjs/common';
import { PublicCache } from '../../common/cache-control.decorator.js';
import { DevelopmentService } from './development.service.js';
import { InventoryService } from '../inventory/inventory.service.js';

@Controller('development')
export class DevelopmentController {
  constructor(
    private readonly development: DevelopmentService,
    private readonly inventory: InventoryService,
  ) {}

  @Get(':slug')
  @PublicCache()
  find(@Param('slug') slug: string) {
    return this.development.findBySlug(slug);
  }

  /** §5.3 — the elevation stack payload (§2.5). */
  @Get(':slug/inventory')
  @PublicCache()
  inventoryFor(@Param('slug') slug: string) {
    return this.inventory.elevationStack(slug);
  }
}
