import React, { useState } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockPorts } from '@/data/port';
import { Port } from '@/types';

const PortNodesPage: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>(mockPorts);
  const [searchText, setSearchText] = useState('');

  const filteredPorts = ports.filter(port => {
    if (!searchText) return true;
    return port.name.includes(searchText) || 
           port.code.toLowerCase().includes(searchText.toLowerCase()) ||
           port.province.includes(searchText);
  });

  const handleCardClick = (port: Port) => {
    Taro.showToast({
      title: `查看${port.name}详情`,
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
        <Text className={styles.headerTitle}>港口节点</Text>
        <Text className={styles.headerSubtitle}>内河沿线港口信息查询</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索港口名称/代码"
            placeholderClass="searchInput"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <ScrollView scrollY className={styles.listContainer}>
        {filteredPorts.length > 0 ? (
          filteredPorts.map(port => (
            <View key={port.id} className={styles.portCard} onClick={() => handleCardClick(port)}>
              <View className={styles.cardHeader}>
                <View className={styles.portIcon}>⚓</View>
                <View className={styles.portInfo}>
                  <Text className={styles.portName}>{port.name}</Text>
                  <Text className={styles.portCode}>{port.code} · {port.province}</Text>
                </View>
              </View>

              <View className={styles.cardStats}>
                <View className={styles.statItem}>
                  <Text className={styles.statValue}>{port.docks}</Text>
                  <Text className={styles.statLabel}>总泊位</Text>
                </View>
                <View className={classnames(styles.statItem, styles.success)}>
                  <Text className={styles.statValue}>{port.availableDocks}</Text>
                  <Text className={styles.statLabel}>可用泊位</Text>
                </View>
                <View className={classnames(styles.statItem, styles.warning)}>
                  <Text className={styles.statValue}>{port.waitShips}</Text>
                  <Text className={styles.statLabel}>等待船舶</Text>
                </View>
              </View>

              <View className={styles.portDesc}>
                {port.description}
              </View>
            </View>
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🏭</Text>
            <Text className={styles.emptyText}>暂无港口数据</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default PortNodesPage;
