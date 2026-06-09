import { Ship } from '@/types';

export const mockShips: Ship[] = [
  {
    id: 's1',
    name: '长江之星',
    imo: 'IMO9876543',
    captain: '张伟',
    capacity: 8000,
    status: 'sailing',
    currentPort: '武汉港',
    nextPort: '重庆港',
    eta: '2024-06-15 18:00'
  },
  {
    id: 's2',
    name: '明珠号',
    imo: 'IMO9876544',
    captain: '李明',
    capacity: 15000,
    status: 'docked',
    currentPort: '秦皇岛港',
    nextPort: '南京港',
    eta: '2024-06-18 14:00'
  },
  {
    id: 's3',
    name: '远航一号',
    imo: 'IMO9876545',
    captain: '王强',
    capacity: 10000,
    status: 'idle',
    currentPort: '上海港'
  },
  {
    id: 's4',
    name: '顺风号',
    imo: 'IMO9876546',
    captain: '赵刚',
    capacity: 7000,
    status: 'sailing',
    currentPort: '黄石港',
    nextPort: '广州港',
    eta: '2024-06-20 12:00'
  },
  {
    id: 's5',
    name: '海韵号',
    imo: 'IMO9876547',
    captain: '刘洋',
    capacity: 6000,
    status: 'docked',
    currentPort: '南京港'
  },
  {
    id: 's6',
    name: '江渝18号',
    imo: 'IMO9876548',
    captain: '陈涛',
    capacity: 5000,
    status: 'docked',
    currentPort: '宜昌港',
    nextPort: '重庆港',
    eta: '2024-06-13 20:00'
  },
  {
    id: 's7',
    name: '蓝鲸号',
    imo: 'IMO9876549',
    captain: '周磊',
    capacity: 12000,
    status: 'idle',
    currentPort: '上海港'
  },
  {
    id: 's8',
    name: '飞翼号',
    imo: 'IMO9876550',
    captain: '孙浩',
    capacity: 4000,
    status: 'idle',
    currentPort: '重庆港'
  },
  {
    id: 's9',
    name: '银河号',
    imo: 'IMO9876551',
    captain: '马超',
    capacity: 9000,
    status: 'sailing',
    currentPort: '芜湖港',
    nextPort: '上海港',
    eta: '2024-06-14 10:00'
  },
  {
    id: 's10',
    name: '长江7号',
    imo: 'IMO9876552',
    captain: '黄健',
    capacity: 6500,
    status: 'docked',
    currentPort: '九江港'
  }
];
