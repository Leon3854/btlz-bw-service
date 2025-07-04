export interface Tariff {
  tariff_id: string; // id тарифа из API
  name: string;
  price: number;
  [key: string]: any; // остальные поля
}
