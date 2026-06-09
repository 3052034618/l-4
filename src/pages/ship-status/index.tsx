import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import ShipCard from '@/components/ShipCard';
import { mockShips } from '@/data/ship';
import { ShipStatus } from '@/types';

const filterOptions: { key: ShipStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'sailing', label: '在航' },
  { key: 'docked', label: '靠泊' },
  { key: 'idle', label: '空载' }
];

const ShipStatusPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<ShipStatus | 'all'>('all');
  const [ships, setShips] = useState(mockShips);

  const filteredShips = activeFilter === 'all'
    ? ships
    : ships.filter(s => s.status === activeFilter);

  const stats = {
    total: ships.length,
    sailing: ships.filter(s => s.status === 'sailing').length,
    docked: ships.filter(s => s.status === 'docked').length,
    idle: ships.filter(s => s.status === 'idle').length
  };

  const handleFilterClick = (key: ShipStatus | 'all') => {
    setActiveFilter(key);
  };

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>船舶状态</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.total}</Text>
            <Text className={styles.statLabel}>总船舶</Text>
          </View>
          <View className={classnames(styles.statCard, styles.sailing)}>
            <Text className={styles.statNumber}>{stats.sailing}</Text>
            <Text className={styles.statLabel}>在航</Text>
          </View>
          <View className={classnames(styles.statCard, styles.docked)}>
            <Text className={styles.statNumber}>{stats.docked}</Text>
            <Text className={styles.statLabel}>靠泊</Text>
          </View>
          <View className={classnames(styles.statCard, styles.idle)}>
            <Text className={styles.statNumber}>{stats.idle}</Text>
            <Text className={styles.statLabel}>空载</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterTabs}>
        {filterOptions.map(option => (
          <View
            key={option.key}
            className={classnames(styles.filterTab, activeFilter === option.key && styles.active)}
            onClick={() => handleFilterClick(option.key)}
          >
            {option.label}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {filteredShips.length > 0 ? (
          filteredShips.map(ship => (
            <ShipCard key={ship.id} ship={ship} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>⚓</Text>
            <Text className={styles.emptyText}>暂无船舶数据</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ShipStatusPage;
