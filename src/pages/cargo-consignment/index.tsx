import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { mockCargos } from '@/data/cargo';
import { Cargo } from '@/types';

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待分配', color: 'pending' },
  assigned: { label: '已分配', color: 'notice' },
  loading: { label: '装货中', color: 'loading' },
  transit: { label: '运输中', color: 'sailing' },
  unloaded: { label: '已卸货', color: 'completed' }
};

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待分配' },
  { key: 'assigned', label: '已分配' },
  { key: 'loading', label: '装货中' },
  { key: 'transit', label: '运输中' },
  { key: 'unloaded', label: '已卸货' }
];

const CargoConsignmentPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [cargos, setCargos] = useState<Cargo[]>(mockCargos);
  const [searchText, setSearchText] = useState('');

  const filteredCargos = cargos.filter(cargo => {
    const matchFilter = activeFilter === 'all' || cargo.status === activeFilter;
    const matchSearch = !searchText || 
      cargo.name.includes(searchText) || 
      cargo.consignor.includes(searchText);
    return matchFilter && matchSearch;
  });

  const handleFilterClick = (key: string) => {
    setActiveFilter(key);
  };

  const handleCreateClick = () => {
    Taro.showToast({
      title: '新建委托功能',
      icon: 'none'
    });
  };

  const handleCardClick = (cargo: Cargo) => {
    Taro.showToast({
      title: `查看${cargo.name}详情`,
      icon: 'none'
    });
  };

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>货物委托</Text>
        <Text className={styles.headerSubtitle}>管理所有货物运输委托</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索货物名称/委托方"
            placeholderClass="searchInput"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <ScrollView scrollX className={styles.filterTabs}>
        {filterOptions.map(option => (
          <View
            key={option.key}
            className={classnames(styles.filterTab, activeFilter === option.key && styles.active)}
            onClick={() => handleFilterClick(option.key)}
          >
            {option.label}
          </View>
        ))}
      </ScrollView>

      <View className={styles.listContainer}>
        {filteredCargos.length > 0 ? (
          filteredCargos.map(cargo => (
            <View key={cargo.id} className={styles.cargoCard} onClick={() => handleCardClick(cargo)}>
              <View className={styles.cardHeader}>
                <Text className={styles.cargoName}>{cargo.name}</Text>
                <StatusTag 
                  status={statusMap[cargo.status].color} 
                  text={statusMap[cargo.status].label} 
                />
              </View>

              <View className={styles.cardBody}>
                <View className={styles.routeRow}>
                  <Text className={styles.port}>{cargo.loadingPort}</Text>
                  <Text className={styles.arrow}>→</Text>
                  <Text className={styles.port} style={{ textAlign: 'right' }}>{cargo.unloadingPort}</Text>
                </View>

                <View className={styles.infoRow}>
                  <Text className={styles.label}>计划日期：</Text>
                  <Text className={styles.value}>{cargo.plannedTime}</Text>
                </View>

                <View className={styles.infoRow}>
                  <Text className={styles.label}>委托方：</Text>
                  <Text className={styles.value}>{cargo.consignor}</Text>
                </View>
              </View>

              <View className={styles.cardFooter}>
                <Text className={styles.consignor}>货重：{cargo.weight}{cargo.unit}</Text>
                <Text className={styles.weightInfo}>查看详情 →</Text>
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📦</Text>
            <Text className={styles.emptyText}>暂无货物委托数据</Text>
          </View>
        )}
      </View>

      <View className={styles.createBtn} onClick={handleCreateClick}>
        <Text>+</Text>
      </View>
    </View>
  );
};

export default CargoConsignmentPage;
