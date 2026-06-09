import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import StatusTag from '../StatusTag';
import { Ship, shipStatusMap } from '@/types';

interface ShipCardProps {
  ship: Ship;
}

const ShipCard: React.FC<ShipCardProps> = ({ ship }) => {
  const statusInfo = shipStatusMap[ship.status];

  return (
    <View className={styles.shipCard}>
      <View className={styles.cardHeader}>
        <View className={styles.cardHeaderLeft}>
          <View className={styles.shipIcon}>🚢</View>
          <View className={styles.shipInfo}>
            <Text className={styles.shipName}>{ship.name}</Text>
            <Text className={styles.shipImo}>{ship.imo}</Text>
          </View>
        </View>
        <StatusTag status={ship.status} text={statusInfo.label} />
      </View>

      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>船长：</Text>
          <Text>{ship.captain}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>当前位置：</Text>
          <Text>{ship.currentPort}</Text>
        </View>
        {ship.nextPort && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>下一港口：</Text>
            <Text>{ship.nextPort}</Text>
          </View>
        )}
        {ship.eta && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>预计到达：</Text>
            <Text>{ship.eta}</Text>
          </View>
        )}
      </View>

      <View className={styles.capacityBar}>
        <View className={styles.capacityLabel}>
          <Text>载重吨位</Text>
          <Text>{ship.capacity.toLocaleString()} 吨</Text>
        </View>
        <View className={styles.capacityTrack}>
          <View className={styles.capacityFill} style={{ width: `${Math.min(100, (ship.capacity / 15000) * 100)}%` }} />
        </View>
      </View>
    </View>
  );
};

export default ShipCard;
