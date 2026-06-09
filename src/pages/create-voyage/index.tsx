import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockShips } from '@/data/ship';
import { mockPorts } from '@/data/port';
import { Ship } from '@/types';
import useAppStore from '@/store/app';

const CreateVoyagePage: React.FC = () => {
  const addVoyage = useAppStore(state => state.addVoyage);
  const checkShipConflict = useAppStore(state => state.checkShipConflict);
  const voyages = useAppStore(state => state.voyages);
  
  const [cargoName, setCargoName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [loadingPort, setLoadingPort] = useState('');
  const [unloadingPort, setUnloadingPort] = useState('');
  const [plannedDeparture, setPlannedDeparture] = useState('');
  const [plannedArrival, setPlannedArrival] = useState('');
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [showShipPicker, setShowShipPicker] = useState(false);
  const [showPortPicker, setShowPortPicker] = useState('');

  const conflictVoyages = useMemo(() => {
    if (!selectedShip || !plannedDeparture || !plannedArrival) return [];
    return checkShipConflict(selectedShip.id, plannedDeparture, plannedArrival);
  }, [selectedShip, plannedDeparture, plannedArrival, checkShipConflict, voyages]);

  const availableShips = mockShips;

  const handleSelectShip = (ship: Ship) => {
    setSelectedShip(ship);
    setShowShipPicker(false);
  };

  const handleSelectPort = (portName: string) => {
    if (showPortPicker === 'loading') {
      setLoadingPort(portName);
    } else {
      setUnloadingPort(portName);
    }
    setShowPortPicker('');
  };

  const handleSubmit = () => {
    if (!cargoName.trim()) {
      Taro.showToast({ title: '请输入货物名称', icon: 'none' });
      return;
    }
    if (!cargoWeight || parseFloat(cargoWeight) <= 0) {
      Taro.showToast({ title: '请输入正确的货物重量', icon: 'none' });
      return;
    }
    if (!loadingPort) {
      Taro.showToast({ title: '请选择装货港', icon: 'none' });
      return;
    }
    if (!unloadingPort) {
      Taro.showToast({ title: '请选择卸货港', icon: 'none' });
      return;
    }
    if (!selectedShip) {
      Taro.showToast({ title: '请选择船舶', icon: 'none' });
      return;
    }
    if (!plannedDeparture) {
      Taro.showToast({ title: '请输入计划出发时间', icon: 'none' });
      return;
    }
    if (!plannedArrival) {
      Taro.showToast({ title: '请输入计划到达时间', icon: 'none' });
      return;
    }

    const hasConflict = conflictVoyages.length > 0;
    const confirmTitle = hasConflict ? '⚠️ 时间冲突提醒' : '确认创建';
    let confirmContent = `货物：${cargoName}\n重量：${cargoWeight}吨\n航线：${loadingPort} → ${unloadingPort}\n船舶：${selectedShip.name}\n时间：${plannedDeparture} 至 ${plannedArrival}`;
    
    if (hasConflict) {
      const conflictList = conflictVoyages.map(v => `  · ${v.voyageNo} (${v.plannedDeparture} ~ ${v.plannedArrival})`).join('\n');
      confirmContent = `检测到该船舶在同一时间段已有任务：\n${conflictList}\n\n${confirmContent}\n\n是否仍要创建该航次？`;
    }

    Taro.showModal({
      title: confirmTitle,
      content: confirmContent,
      confirmText: hasConflict ? '仍要创建' : '确认',
      confirmColor: hasConflict ? '#f53f3f' : '#1677ff',
      success: (res) => {
        if (res.confirm) {
          addVoyage({
            shipId: selectedShip.id,
            shipName: selectedShip.name,
            captain: selectedShip.captain,
            cargoId: `c_${Date.now()}`,
            cargoName: cargoName.trim(),
            cargoWeight: parseFloat(cargoWeight),
            loadingPort,
            unloadingPort,
            plannedDeparture,
            plannedArrival
          });

          Taro.showToast({
            title: '创建成功',
            icon: 'success'
          });
          
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      }
    });
  };

  const renderPortPicker = () => {
    if (!showPortPicker) return null;

    return (
      <View className={styles.shipList}>
        {mockPorts.map(port => (
          <View
            key={port.id}
            className={styles.shipOption}
            onClick={() => handleSelectPort(port.name)}
          >
            <View className={styles.shipInfo}>
              <Text className={styles.shipName}>{port.name}</Text>
              <Text className={styles.shipDetail}>{port.code} · {port.province}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.icon}>📦</Text>
            <Text>货物信息</Text>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>货物名称</Text>
            <Input
              className={styles.formInput}
              placeholder="请输入货物名称"
              placeholderClass={styles.placeholder}
              value={cargoName}
              onInput={(e) => setCargoName(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>货物重量</Text>
            <Input
              className={styles.formInput}
              type="digit"
              placeholder="请输入重量"
              placeholderClass={styles.placeholder}
              value={cargoWeight}
              onInput={(e) => setCargoWeight(e.detail.value)}
            />
            <Text className={styles.unit}>吨</Text>
          </View>
        </View>

        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.icon}>⚓</Text>
            <Text>港口信息</Text>
          </View>

          <View className={styles.formItem} onClick={() => setShowPortPicker(showPortPicker === 'loading' ? '' : 'loading')}>
            <Text className={styles.formLabel}>装货港</Text>
            <Text className={classnames(styles.formValue, !loadingPort && styles.placeholder)}>
              {loadingPort || '请选择装货港'}
            </Text>
            <Text className={styles.arrow}>›</Text>
          </View>

          {showPortPicker === 'loading' && renderPortPicker()}

          <View className={styles.formItem} onClick={() => setShowPortPicker(showPortPicker === 'unloading' ? '' : 'unloading')}>
            <Text className={styles.formLabel}>卸货港</Text>
            <Text className={classnames(styles.formValue, !unloadingPort && styles.placeholder)}>
              {unloadingPort || '请选择卸货港'}
            </Text>
            <Text className={styles.arrow}>›</Text>
          </View>

          {showPortPicker === 'unloading' && renderPortPicker()}
        </View>

        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.icon}>🚢</Text>
            <Text>船舶信息</Text>
          </View>

          <View className={styles.formItem} onClick={() => setShowShipPicker(!showShipPicker)}>
            <Text className={styles.formLabel}>选择船舶</Text>
            <Text className={classnames(styles.formValue, !selectedShip && styles.placeholder)}>
              {selectedShip ? selectedShip.name : '请选择船舶'}
            </Text>
            <Text className={styles.arrow}>›</Text>
          </View>

          {showShipPicker && (
            <View className={styles.shipList}>
              {availableShips.length > 0 ? (
                availableShips.map(ship => (
                  <View
                    key={ship.id}
                    className={classnames(styles.shipOption, selectedShip?.id === ship.id && styles.selected)}
                    onClick={() => handleSelectShip(ship)}
                  >
                    <View className={styles.shipInfo}>
                      <Text className={styles.shipName}>{ship.name}</Text>
                      <Text className={styles.shipDetail}>
                        船长：{ship.captain} · 载重：{ship.capacity}吨
                      </Text>
                    </View>
                    <View className={classnames(styles.checkBox, selectedShip?.id === ship.id && styles.selected)}>
                      {selectedShip?.id === ship.id && <Text className={styles.check}>✓</Text>}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: '#86909c', padding: '32rpx 0' }}>
                  暂无可用船舶
                </Text>
              )}
            </View>
          )}

          {selectedShip && (
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>船长</Text>
              <Text className={styles.formValue}>{selectedShip.captain}</Text>
            </View>
          )}
        </View>

        <View className={styles.formSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.icon}>📅</Text>
            <Text>时间计划</Text>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>计划出发</Text>
            <Input
              className={styles.formInput}
              placeholder="YYYY-MM-DD HH:mm"
              placeholderClass={styles.placeholder}
              value={plannedDeparture}
              onInput={(e) => setPlannedDeparture(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>计划到达</Text>
            <Input
              className={styles.formInput}
              placeholder="YYYY-MM-DD HH:mm"
              placeholderClass={styles.placeholder}
              value={plannedArrival}
              onInput={(e) => setPlannedArrival(e.detail.value)}
            />
          </View>

          {conflictVoyages.length > 0 && (
            <View className={styles.conflictWarning}>
              <Text className={styles.conflictIcon}>⚠️</Text>
              <View className={styles.conflictContent}>
                <Text className={styles.conflictTitle}>时间冲突提醒</Text>
                <Text className={styles.conflictDesc}>
                  该船舶在同一时间段已有 {conflictVoyages.length} 个航次任务：
                </Text>
                {conflictVoyages.map(v => (
                  <Text key={v.id} className={styles.conflictItem}>
                    · {v.voyageNo} ({v.plannedDeparture} ~ {v.plannedArrival})
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.submitBar}>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          创建航次
        </View>
      </View>
    </View>
  );
};

export default CreateVoyagePage;
