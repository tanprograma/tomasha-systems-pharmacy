import { Product } from '../../src/app/interfaces/product';
import { Sale } from '../../src/app/interfaces/sale';
import { TransactionItem } from '../../src/app/interfaces/transaction-item';
import { InventoryModel } from '../models/inventory';
import { ProductModel } from '../models/product';
import { SaleModel } from '../models/sale';

export class SaleUtil {
  static async createSale(data: any) {
    let [products, sale] = await Promise.all([
      SaleUtil.getProducts(),
      SaleModel.create(data),
    ]);
    for (let item of sale.products) {
      await SaleUtil.updateInventoryQuantity(
        sale.store,
        item.product,
        item.quantity
      );
    }
    return SaleUtil.populateSale(sale, products);
  }
  static async createSales(data: any) {
    let [products, sales] = await Promise.all([
      SaleUtil.getProducts(),
      SaleModel.create(data),
    ]);
    for (let sale of sales) {
      for (let item of sale.products) {
        await SaleUtil.updateInventoryQuantity(
          sale.store,
          item.product,
          item.quantity
        );
      }
    }
    return SaleUtil.populateSales(sales, products);
  }
  static async getAllSales(store?: string) {
    //   get sales
    if (store != undefined) {
      let [products, sales] = await Promise.all([
        SaleUtil.getProducts(),
        SaleModel.find({ store: store }),
      ]);
      return SaleUtil.populateSales(sales, products);
    } else {
      let [products, sales] = await Promise.all([
        SaleUtil.getProducts(),
        SaleModel.find(),
      ]);
      return SaleUtil.populateSales(sales, products);
    }
  }
  static async getSales(store?: string) {
    //   get sales
    if (store != undefined) {
      let [products, sales] = await Promise.all([
        SaleUtil.getProducts(),
        SaleModel.find({ store: store }),
      ]);
      return SaleUtil.populateSales(sales, products);
    } else {
      let [products, sales] = await Promise.all([
        SaleUtil.getProducts(),
        SaleModel.find(),
      ]);
      return SaleUtil.populateSales(sales, products);
    }
  }

  static populateSales(sales: any, products: any) {
    sales = (sales as Sale[]).map((sale) => {
      return SaleUtil.populateSale(sale, products);
    });
    return sales;
  }
  static populateSale(sale: any, products: any) {
    return {
      store: sale.store,
      _id: sale._id,
      discount: sale.discount,
      createdAt: sale.createdAt,
      products: (sale.products as TransactionItem[]).map((item) => {
        return {
          quantity: item.quantity,
          unit: item.unit,
          unit_value: item.unit_value,
          price: item.price,
          product: SaleUtil.getProductFromID(
            item.product as string,
            products as Product[]
          ),
        };
      }),
    };
  }
  static async getProducts() {
    return ProductModel.find();
  }
  static async updateInventoryQuantity(
    storeID: string,
    productID: string,
    quantity: number
  ) {
    const inventory = await InventoryModel.findOne({
      store: storeID,
      product: productID,
    });
    inventory.quantity -= quantity;
    return inventory.save();
  }
  static getProductID(id: string, products: Product[]) {
    return products.find((product) => product._id == id)?._id as string;
  }
  static getProductFromID(id: string, products: Product[]) {
    return products.find((product) => product._id == id) as Product;
  }
}
