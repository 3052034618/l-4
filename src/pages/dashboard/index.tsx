import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store/app';
import { VoyageStatus, voyageStatusMap, Voyage } from '@/types';

const getDateStr = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDateLabel = (offset: number) => {
  if (offset === -1) return '昨天';
  if (offset === 0) return '今天';
  if (offset === 1) return '明天';
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

const isSameDay = (dateStr: string, dayStr: string) => {
  return dateStr?.startsWith?.(dayStr) || false;
};

interface DashboardGroup {
  key: string;
  label: string;
  icon: string;
  statuses: VoyageStatus[];
}

const boardGroups: DashboardGroup[] = [
  { key: 'pending', label: '待执行', icon: '📋', statuses: ['pending', 'loading'] },
  { key: 'sailing', label: '在航', icon: '🚢', statuses: ['sailing', 'unloading'] },
  { key: 'delayed', label: '延误', icon: '⚠️', statuses: ['delayed'] },
  { key: 'completed', label: '已完成', icon: '✅', statuses: ['completed'] }
];

const DashboardPage: React.FC = () => {
  const voyages = useAppStore(state => state.voyages);
  const messages = useAppStore(state => state.messages);
  const initFromStorage = useAppStore(state => state.initFromStorage);
  
  const [dateOffset, setDateOffset] = useState(0);
  const [activeGroup, setActiveGroup] = useState<string>('sailing');
  const [filterShip, setFilterShip] = useState<string>('all');
  const [filterPort, setFilterPort] = useState<string>('all');
  const [showShipPicker, setShowShipPicker] = useState(false);
  const [showPortPicker, setShowPortPicker] = useState(false);

  useDidShow(() => {
    initFromStorage();
  });

  const currentDate = getDateStr(dateOffset);

  const shipOptions = useMemo(() => {
    const ships = new Set<string>();
    voyages.forEach(v => ships.add(v.shipName));
    return [{ id: 'all', name: '全部船舶' }, ...Array.from(ships).map(name => ({ id: name, name }))];
  }, [voyages]);

  const portOptions = useMemo(() => {
    const ports = new Set<string>();
    voyages.forEach(v => {
      ports.add(v.loadingPort);
      ports.add(v.unloadingPort);
    });
    return [{ id: 'all', name: '全部港口' }, ...Array.from(ports).map(name => ({ id: name, name }))];
  }, [voyages]);

  const filteredVoyages = useMemo(() => {
    return voyages.filter(v => {
      if (filterShip !== 'all' && v.shipName !== filterShip) return false;
      if (filterPort !== 'all' && v.loadingPort !== filterPort && v.unloadingPort !== filterPort) return false;
      return true;
    });
  }, [voyages, filterShip, filterPort]);

  const dayVoyages = useMemo(() => {
    return filteredVoyages.filter(v => {
      const departMatch = isSameDay(v.plannedDeparture, currentDate) || isSameDay(v.actualDeparture, currentDate);
      const arrivalMatch = isSameDay(v.plannedArrival, currentDate) || isSameDay(v.actualArrival, currentDate);
      const inProgress = !isSameDay(v.plannedDeparture, currentDate) && !isSameDay(v.plannedArrival, currentDate)
        && new Date(v.plannedDeparture) < new Date(currentDate + ' 23:59:59')
        && new Date(v.plannedArrival) > new Date(currentDate + ' 00:00:00');
      return departMatch || arrivalMatch || inProgress;
    });
  }, [filteredVoyages, currentDate]);

  const stats = useMemo(() => {
    const pending = dayVoyages.filter(v => ['pending', 'loading'].includes(v.status)).length;
    const sailing = dayVoyages.filter(v => ['sailing', 'unloading'].includes(v.status)).length;
    const delayed = dayVoyages.filter(v => v.status === 'delayed').length;
    const completed = dayVoyages.filter(v => v.status === 'completed').length;
    
    const departToday = dayVoyages.filter(v => 
      isSameDay(v.plannedDeparture, currentDate) || isSameDay(v.actualDeparture, currentDate)
    ).length;
    const arriveToday = dayVoyages.filter(v => 
      isSameDay(v.plannedArrival, currentDate) || isSameDay(v.actualArrival, currentDate)
    ).length;
    
    return { total: dayVoyages.length, pending, sailing, delayed, completed, departToday, arriveToday };
  }, [dayVoyages, currentDate]);

  const getUnconfirmedCount = (voyageId: string) => {
    return messages.filter(m => m.voyageId === voyageId && m.needConfirm && !m.isConfirmed).length;
  };

  const currentGroup = boardGroups.find(g => g.key === activeGroup);
  const displayVoyages = currentGroup 
    ? dayVoyages.filter(v => currentGroup.statuses.includes(v.status))
    : [];

  const handleVoyageClick = (id: string) => {
    Taro.navigateTo({
      url: `/pages/voyage-detail/index?id=${id}`
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.headerTitle}>调度看板</Text>
          <Text className={styles.headerSubtitle}>实时掌握船队动态</Text>
        </View>

        <View className={styles.dateSelector}>
          {[-2, -1, 0, 1, 2].map(offset => (
            <View
              key={offset}
              className={classnames(styles.dateItem, dateOffset === offset && styles.active)}
              onClick={() => setDateOffset(offset)}
            >
              <Text className={styles.dateLabel}>{getDateLabel(offset)}</Text>
              <Text className={styles.dateSub}>{getDateStr(offset).slice(5)}</Text>
            </View>
          ))}
        </View>

        <View className={styles.filterBar}>
          <View className={styles.filterItem} onClick={() => setShowShipPicker(!showShipPicker)}>
            <Text className={styles.filterLabel}>🚢 {filterShip === 'all' ? '全部船舶' : filterShip}</Text>
            <Text className={styles.filterArrow}>▾</Text>
          </View>
          <View className={styles.filterItem} onClick={() => setShowPortPicker(!showPortPicker)}>
            <Text className={styles.filterLabel}>⚓ {filterPort === 'all' ? '全部港口' : filterPort}</Text>
            <Text className={styles.filterArrow}>▾</Text>
          </View>
        </View>

        {showShipPicker && (
          <View className={styles.pickerDropdown}>
            {shipOptions.map(option => (
              <View
                key={option.id}
                className={classnames(styles.pickerOption, filterShip === option.id && styles.selected)}
                onClick={() => {
                  setFilterShip(option.id);
                  setShowShipPicker(false);
                }}
              >
                {option.name}
              </View>
            ))}
          </View>
        )}

        {showPortPicker && (
          <View className={styles.pickerDropdown}>
            {portOptions.map(option => (
              <View
                key={option.id}
                className={classnames(styles.pickerOption, filterPort === option.id && styles.selected)}
                onClick={() => {
                  setFilterPort(option.id);
                  setShowPortPicker(false);
                }}
              >
                {option.name}
              </View>
            ))}
          </View>
        )}

        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <Text className={styles.statNum}>{stats.departToday}</Text>
            <Text className={styles.statLabel}>今日待发</Text>
          </View>
          <View className={classnames(styles.statCard, styles.info)}>
            <Text className={styles.statNum}>{stats.sailing}</Text>
            <Text className={styles.statLabel}>在航中</Text>
          </View>
          <View className={classnames(styles.statCard, styles.success)}>
            <Text className={styles.statNum}>{stats.arriveToday}</Text>
            <Text className={styles.statLabel}>今日到港</Text>
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
            const count = dayVoyages.filter(v => group.statuses.includes(v.status)).length;
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
              const unconfirmedCount = getUnconfirmedCount(voyage.id);
              const isDelayed = voyage.status === 'delayed';
              
              return (
                <View 
                  key={voyage.id} 
                  className={classnames(
                    styles.voyageItem,
                    isDelayed && styles.delayedItem
                  )}
                  onClick={() => handleVoyageClick(voyage.id)}
                >
                  <View className={styles.itemHeader}>
                    <Text className={styles.voyageNo}>{voyage.voyageNo}</Text>
                    <View 
                      className={classnames(styles.statusTag, voyage.status)}
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
                        {voyage.actualArrival ? '实际抵港' : '预计到港'}
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

                  {isDelayed && (
                    <View className={styles.delayBanner}>
                      <View className={styles.delayHeader}>
                        <Text className={styles.delayIcon}>⚠️</Text>
                        <Text className={styles.delayTitle}>延误提醒</Text>
                        {unconfirmedCount > 0 && (
                          <View className={styles.badge}>
                            <Text className={styles.badgeText}>{unconfirmedCount} 条待确认</Text>
                          </View>
                        )}
                      </View>
                      {voyage.delayReason && (
                        <Text className={styles.delayReason}>原因：{voyage.delayReason}</Text>
                      )}
                      {voyage.newEta && (
                        <Text className={styles.delayEta}>新ETA：{voyage.newEta}</Text>
                      )}
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
              <Text className={styles.emptyText}>该分组暂无航次</Text>
              <Text className={styles.emptyHint}>试试切换日期或筛选条件</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardPage;
