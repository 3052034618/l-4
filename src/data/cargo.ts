import { Cargo } from '@/types';

export const mockCargos: Cargo[] = [
  {
    id: 'c1',
    name: '集装箱货物',
    weight: 5000,
    unit: '吨',
    loadingPort: '上海港',
    unloadingPort: '重庆港',
    plannedTime: '2024-06-10',
    consignor: '上海国际物流有限公司',
    status: 'transit'
  },
  {
    id: 'c2',
    name: '煤炭',
    weight: 12000,
    unit: '吨',
    loadingPort: '秦皇岛港',
    unloadingPort: '南京港',
    plannedTime: '2024-06-12',
    consignor: '华能煤炭贸易公司',
    status: 'loading'
  },
  {
    id: 'c3',
    name: '钢材',
    weight: 8000,
    unit: '吨',
    loadingPort: '武汉港',
    unloadingPort: '上海港',
    plannedTime: '2024-06-08',
    consignor: '武汉钢铁集团',
    status: 'unloaded'
  },
  {
    id: 'c4',
    name: '粮食',
    weight: 6500,
    unit: '吨',
    loadingPort: '九江港',
    unloadingPort: '广州港',
    plannedTime: '2024-06-11',
    consignor: '中粮集团九江分公司',
    status: 'transit'
  },
  {
    id: 'c5',
    name: '化工原料',
    weight: 4500,
    unit: '吨',
    loadingPort: '南京港',
    unloadingPort: '武汉港',
    plannedTime: '2024-06-14',
    consignor: '南京化工有限公司',
    status: 'pending'
  },
  {
    id: 'c6',
    name: '汽车配件',
    weight: 3200,
    unit: '吨',
    loadingPort: '重庆港',
    unloadingPort: '宜昌港',
    plannedTime: '2024-06-09',
    consignor: '重庆长安汽车股份有限公司',
    status: 'transit'
  },
  {
    id: 'c7',
    name: '建材',
    weight: 9800,
    unit: '吨',
    loadingPort: '上海港',
    unloadingPort: '南京港',
    plannedTime: '2024-06-15',
    consignor: '上海建材集团',
    status: 'pending'
  },
  {
    id: 'c8',
    name: '日用百货',
    weight: 2800,
    unit: '吨',
    loadingPort: '宜昌港',
    unloadingPort: '重庆港',
    plannedTime: '2024-06-07',
    consignor: '宜昌商贸有限公司',
    status: 'unloaded'
  },
  {
    id: 'c9',
    name: '机械设备',
    weight: 5500,
    unit: '吨',
    loadingPort: '广州港',
    unloadingPort: '武汉港',
    plannedTime: '2024-06-16',
    consignor: '广州重工集团',
    status: 'pending'
  },
  {
    id: 'c10',
    name: '水泥',
    weight: 7200,
    unit: '吨',
    loadingPort: '芜湖港',
    unloadingPort: '南京港',
    plannedTime: '2024-06-13',
    consignor: '芜湖海螺水泥有限公司',
    status: 'assigned'
  }
];
