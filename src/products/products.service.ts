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
import { Product } from './entities/product.entity';

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
    const totalPages = await this.product.count();
    const lastPage = Math.ceil(totalPages / limit);
    const data: Iproduct[] = await this.product.findMany({
      take: limit,
      skip: (page - 1) * limit,
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
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not exists`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    const product = this.findOne(id);
    if (product) {
      return this.product.update({
        where: {
          id,
        },
        data: updateProductDto,
      });
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
