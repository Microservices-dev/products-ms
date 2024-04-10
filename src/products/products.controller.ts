import { Controller } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto-';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @HttpCode(201)
  // @Post()
  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // @Get()
  @MessagePattern({ cmd: 'find_all_products' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  // @Get(':id')
  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload('id') id: number) {
    return this.productsService.findOne(+id);
  }

  // @Patch(':id')
  @MessagePattern({ cmd: 'update_product' })
  update(
    //@Param('id') id: number, @Body() updateProductDto: UpdateProductDto
    @Payload() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(updateProductDto);
  }

  // @HttpCode(204)
  // @Delete(':id')
  @MessagePattern({ cmd: 'remove_product' })
  remove(@Payload('id') id: number) {
    return this.productsService.remove(+id);
  }

  @MessagePattern({ cmd: 'validate_products' })
  validateProducts(@Payload('ids') ids: number[]) {
    return this.productsService.validateProducts(ids);
  }
}
