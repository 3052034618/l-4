import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockShips } from '@/data/ship';
import { mockPorts } from '@/data/port';
import { Ship } from '@/types';

const CreateVoyagePage: React.FC = () => {
  const [cargoName, setCargoName] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [loadingPort, setLoadingPort] = useState('');
  const [unloadingPort, setUnloadingPort] = useState('');
  const [plannedDeparture, setPlannedDeparture] = useState('');
  const [plannedArrival, setPlannedArrival] = useState('');
  const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
  const [showShipPicker, setShowShipPicker] = useState(false);
  const [showPortPicker, setShowPortPicker] = useState('');

  const availableShips = mockShips.filter(s => s.status === 'idle');

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
    if (!cargoName || !cargoWeight || !loadingPort || !unloadingPort || !selectedShip) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '确认创建',
      content: '确认创建该航次吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '创建成功',
            icon: 'success'
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
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
