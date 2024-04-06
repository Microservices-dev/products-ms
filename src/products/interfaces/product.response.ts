import { Iproduct } from './products.interface';

export interface IProductResponse {
  data: Iproduct[];
  meta: {
    page: number;
    limit: number;
    lastPage: number;
    total: number;
  };
}
