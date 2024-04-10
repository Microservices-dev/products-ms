import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto-';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { Iproduct, IProductResponse } from './interfaces';
import { PaginationDto } from '../common/';
import { RpcException } from '@nestjs/microservices';

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
      throw new RpcException({
        message: `Product with id ${id} not exists`,
        status: HttpStatus.NOT_FOUND,
      });
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

  async validateProducts(ids: number[]): Promise<Iproduct[]> {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      select: {
        id: true,
        price: true,
        name: true,
      },
      where: {
        id: {
          in: ids,
        },
        available: true,
      },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        message: 'Some products are not available',
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return products as Iproduct[];
  }
}
