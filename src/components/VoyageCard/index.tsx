import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '../StatusTag';
import { Voyage, voyageStatusMap } from '@/types';

interface VoyageCardProps {
  voyage: Voyage;
}

const VoyageCard: React.FC<VoyageCardProps> = ({ voyage }) => {
  const statusInfo = voyageStatusMap[voyage.status];

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/voyage-detail/index?id=${voyage.id}`
    });
  };

  return (
    <View className={styles.voyageCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.voyageNo}>{voyage.voyageNo}</Text>
        <StatusTag status={voyage.status} text={statusInfo.label} />
      </View>

      <View className={styles.cardBody}>
        <View className={styles.routeInfo}>
          <Text className={styles.port}>{voyage.loadingPort}</Text>
          <Text className={styles.arrow}>→</Text>
          <Text className={styles.port} style={{ textAlign: 'right' }}>{voyage.unloadingPort}</Text>
        </View>

        <View className={styles.cargoInfo}>
          <Text className={styles.label}>货物：</Text>
          <Text>{voyage.cargoName} · {voyage.cargoWeight}吨</Text>
        </View>

        <View className={styles.timeInfo}>
          <Text>计划出发：{voyage.plannedDeparture}</Text>
        </View>
      </View>

      <View className={styles.cardFooter}>
        <View className={styles.shipInfo}>
          <Text>{voyage.shipName}</Text>
          <Text className={styles.captain}>{voyage.captain}</Text>
        </View>
        <View className={styles.progressInfo}>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${voyage.progress}%` }} />
          </View>
          <Text className={styles.progressText}>{voyage.progress}%</Text>
        </View>
      </View>
    </View>
  );
};

export default VoyageCard;
