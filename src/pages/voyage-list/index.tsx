import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import VoyageCard from '@/components/VoyageCard';
import useAppStore from '@/store/app';
import { VoyageStatus } from '@/types';

const filterOptions: { key: VoyageStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待执行' },
  { key: 'loading', label: '装货中' },
  { key: 'sailing', label: '在航' },
  { key: 'unloading', label: '卸货中' },
  { key: 'completed', label: '已完成' },
  { key: 'delayed', label: '延误' }
];

const VoyageListPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<VoyageStatus | 'all'>('all');
  const voyages = useAppStore(state => state.voyages);
  const initFromStorage = useAppStore(state => state.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useDidShow(() => {
    initFromStorage();
  });

  const filteredVoyages = activeFilter === 'all'
    ? voyages
    : voyages.filter(v => v.status === activeFilter);

  const stats = {
    total: voyages.length,
    sailing: voyages.filter(v => v.status === 'sailing').length,
    completed: voyages.filter(v => v.status === 'completed').length,
    delayed: voyages.filter(v => v.status === 'delayed').length
  };

  const handleFilterClick = (key: VoyageStatus | 'all') => {
    setActiveFilter(key);
  };

  const handleCreateClick = () => {
    Taro.navigateTo({
      url: '/pages/create-voyage/index'
    });
  };

  usePullDownRefresh(() => {
    initFromStorage();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>水路运输调度</Text>
        <Text className={styles.headerSubtitle}>内河船队智能调度平台</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.total}</Text>
            <Text className={styles.statLabel}>总航次</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.sailing}</Text>
            <Text className={styles.statLabel}>在航</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats.delayed}</Text>
            <Text className={styles.statLabel}>延误</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {filterOptions.map(option => (
          <View
            key={option.key}
            className={classnames(styles.filterItem, activeFilter === option.key && styles.active)}
            onClick={() => handleFilterClick(option.key)}
          >
            {option.label}
          </View>
        ))}
      </ScrollView>

      <View className={styles.listContainer}>
        {filteredVoyages.length > 0 ? (
          filteredVoyages.map(voyage => (
            <VoyageCard key={voyage.id} voyage={voyage} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🚢</Text>
            <Text className={styles.emptyText}>暂无航次数据</Text>
          </View>
        )}
      </View>

      <View className={styles.createBtn} onClick={handleCreateClick}>
        <Text>+</Text>
      </View>
    </View>
  );
};

export default VoyageListPage;
