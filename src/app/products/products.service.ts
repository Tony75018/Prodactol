import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product, ProductMongoFormat, Products } from './products.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private products: Products = [];
  private productsUpdated  = new Subject<Products>();

  constructor(private http: HttpClient) { }

  public getProducts(): Subscription {
    return this.http
      .get('http://localhost:3000/products')
      .pipe(map((data: {products: ProductMongoFormat[], message: string}) => {
        return data?.products.map(product => {
          return {
            id: product._id,
            name: product.name,
            type: product.type,
            price: product.price,
            rating: product.rating,
            warranty_years: product.warranty_years,
            available: product.available,
          };
        });
      })
      ).subscribe((products: Products) => {
        this.products = products;
        this.productsUpdated.next([...this.products]);
      });
  }

  public getProductsUpdateListener(): Observable<Products> {
    return this.productsUpdated.asObservable();
  }

  public addProduct(product: Product): void {
    const body = new HttpParams()
      .set('name', product.name)
      .set('type', product.type)
      .set('price', product.price.toString())
      .set('rating', product.rating.toString())
      .set('warranty_years', product.warranty_years.toString())
      .set('available', product.available.toString());
    this.http
      .post('http://localhost:3000/product', body)
      .subscribe((productResponse: {message: string, productId: string}) => {
        product.id = productResponse.productId;
        this.products.push(product);
        this.productsUpdated.next([...this.products]);
      });
  }

  public updateProduct(product: Product): void {
    this.http
      .put('http://localhost:3000/product/' + product.id, product)
      .subscribe(() => {
        const updateProduct = [...this.products];
        const oldProductIndex = updateProduct.findIndex(p => p.id === product.id);
        updateProduct[oldProductIndex] = product;
        this.products = updateProduct;
        this.productsUpdated.next([...this.products]);
      });
  }

  public deleteProduct(productId: string): void {
    this.http
      .delete('http://localhost:3000/product/' + productId)
      .subscribe(() => {
        const updateProduct = this.products.filter(p => p.id !== productId);
        this.products = updateProduct;
        this.productsUpdated.next([...this.products]);
      });
  }
}
