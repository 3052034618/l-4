import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store/app';
import { VoyageStatus, voyageStatusMap } from '@/types';

const boardGroups: { key: VoyageStatus | 'sailing_delayed'; label: string; icon: string; statuses: VoyageStatus[] }[] = [
  { key: 'pending', label: '待执行', icon: '📋', statuses: ['pending', 'loading'] },
  { key: 'sailing_delayed', label: '在航/延误', icon: '🚢', statuses: ['sailing', 'unloading', 'delayed'] },
  { key: 'completed', label: '已完成', icon: '✅', statuses: ['completed'] }
];

const DashboardPage: React.FC = () => {
  const voyages = useAppStore(state => state.voyages);
  const initFromStorage = useAppStore(state => state.initFromStorage);
  const [activeGroup, setActiveGroup] = useState<VoyageStatus | 'sailing_delayed'>('sailing_delayed');

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useDidShow(() => {
    initFromStorage();
  });

  const getVoyagesByStatuses = (statuses: VoyageStatus[]) => {
    return voyages.filter(v => statuses.includes(v.status));
  };

  const stats = {
    total: voyages.length,
    pending: getVoyagesByStatuses(['pending', 'loading']).length,
    sailing: getVoyagesByStatuses(['sailing', 'unloading']).length,
    delayed: getVoyagesByStatuses(['delayed']).length,
    completed: getVoyagesByStatuses(['completed']).length
  };

  const handleVoyageClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/voyage-detail/index?id=${id}`
    });
  };

  const currentGroup = boardGroups.find(g => g.key === activeGroup);
  const displayVoyages = currentGroup ? getVoyagesByStatuses(currentGroup.statuses) : [];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>调度看板</Text>
        <Text className={styles.headerSubtitle}>实时掌握船队动态</Text>
        
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>总航次</Text>
          </View>
          <View className={classnames(styles.statCard, styles.warning)}>
            <Text className={styles.statNum}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待执行</Text>
          </View>
          <View className={classnames(styles.statCard, styles.success)}>
            <Text className={styles.statNum}>{stats.sailing}</Text>
            <Text className={styles.statLabel}>在航</Text>
          </View>
          <View className={classnames(styles.statCard, styles.danger)}>
            <Text className={styles.statNum}>{stats.delayed}</Text>
            <Text className={styles.statLabel}>延误</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.groupTabs}>
          {boardGroups.map(group => {
            const count = getVoyagesByStatuses(group.statuses).length;
            return (
              <View
                key={group.key}
                className={classnames(styles.groupTab, activeGroup === group.key && styles.active)}
                onClick={() => setActiveGroup(group.key)}
              >
                <Text className={styles.tabIcon}>{group.icon}</Text>
                <Text className={styles.tabLabel}>{group.label}</Text>
                <Text className={styles.tabCount}>{count}</Text>
              </View>
            );
          })}
        </View>

        <View className={styles.voyageList}>
          {displayVoyages.length > 0 ? (
            displayVoyages.map(voyage => {
              const statusInfo = voyageStatusMap[voyage.status];
              return (
                <View 
                  key={voyage.id} 
                  className={classnames(
                    styles.voyageItem,
                    voyage.status === 'delayed' && styles.delayedItem
                  )}
                  onClick={() => handleVoyageClick(voyage.id)}
                >
                  <View className={styles.itemHeader}>
                    <Text className={styles.voyageNo}>{voyage.voyageNo}</Text>
                    <View 
                      className={classnames(styles.statusTag, styles[voyage.status])}
                      style={{ 
                        color: statusInfo.color, 
                        backgroundColor: statusInfo.bgColor 
                      }}
                    >
                      {statusInfo.label}
                    </View>
                  </View>

                  <View className={styles.routeRow}>
                    <Text className={styles.portName}>{voyage.loadingPort}</Text>
                    <Text className={styles.routeArrow}>→</Text>
                    <Text className={styles.portName}>{voyage.unloadingPort}</Text>
                  </View>

                  <View className={styles.infoRow}>
                    <Text className={styles.cargoInfo}>
                      {voyage.cargoName} · {voyage.cargoWeight}吨
                    </Text>
                    <Text className={styles.shipInfo}>{voyage.shipName}</Text>
                  </View>

                  <View className={styles.timeRow}>
                    <View className={styles.timeItem}>
                      <Text className={styles.timeLabel}>出发</Text>
                      <Text className={styles.timeValue}>
                        {voyage.actualDeparture || voyage.plannedDeparture}
                      </Text>
                    </View>
                    <View className={styles.timeItem}>
                      <Text className={styles.timeLabel}>
                        {voyage.actualArrival ? '实际到达' : '预计到达'}
                      </Text>
                      <Text className={classnames(
                        styles.timeValue,
                        styles.etaValue,
                        voyage.actualArrival && styles.actualArrival
                      )}>
                        {voyage.actualArrival || voyage.plannedArrival}
                      </Text>
                    </View>
                  </View>

                  {voyage.status === 'delayed' && voyage.delayReason && (
                    <View className={styles.delayBanner}>
                      <Text className={styles.delayIcon}>⚠️</Text>
                      <View className={styles.delayContent}>
                        <Text className={styles.delayReason}>延误原因：{voyage.delayReason}</Text>
                        {voyage.newEta && (
                          <Text className={styles.delayEta}>新ETA：{voyage.newEta}</Text>
                        )}
                      </View>
                    </View>
                  )}

                  <View className={styles.progressRow}>
                    <View className={styles.progressBar}>
                      <View 
                        className={styles.progressFill} 
                        style={{ 
                          width: `${voyage.progress}%`,
                          backgroundColor: statusInfo.color
                        }}
                      />
                    </View>
                    <Text className={styles.progressText}>{voyage.progress}%</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📭</Text>
              <Text className={styles.emptyText}>暂无航次</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardPage;
