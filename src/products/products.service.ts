import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { Iproduct, IProductResponse } from './interfaces';
import { PaginationDto } from '../common/';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(createProductDto: CreateProductDto): Promise<Iproduct> {
    const product = await this.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto): Promise<IProductResponse> {
    const { limit, page } = paginationDto;
    const totalPages = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(totalPages / limit);
    const data: Iproduct[] = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
      where: { available: true },
    });
    return {
      data: data,
      meta: {
        page,
        limit,
        lastPage,
        total: totalPages,
      },
    };
  }

  async findOne(id: number): Promise<Iproduct> {
    const product = await this.product.findUnique({
      where: {
        id,
        available: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not exists`);
    }
    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...data } = updateProductDto;
    await this.findOne(id);
    return await this.product.update({
      where: {
        id,
      },
      data,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.product.update({
      where: {
        id,
      },
      data: {
        available: false,
      },
    });
  }
}
