import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import StatusTag from '../StatusTag';
import { Voyage, voyageStatusMap } from '@/types';

interface VoyageCardProps {
  voyage: Voyage;
  showDelayReason?: boolean;
}

const VoyageCard: React.FC<VoyageCardProps> = ({ voyage, showDelayReason = false }) => {
  const statusInfo = voyageStatusMap[voyage.status];

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/voyage-detail/index?id=${voyage.id}`
    });
  };

  const displayArrival = voyage.actualArrival || voyage.plannedArrival;

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
          <View className={styles.timeItem}>
            <Text className={styles.timeLabel}>出发：</Text>
            <Text>{voyage.actualDeparture || voyage.plannedDeparture}</Text>
          </View>
        </View>
        <View className={styles.timeInfo}>
          <View className={styles.timeItem}>
            <Text className={styles.timeLabel}>
              {voyage.actualArrival ? '实际到达：' : '预计到达：'}
            </Text>
            <Text className={voyage.actualArrival ? styles.actualTime : styles.etaTime}>
              {displayArrival}
            </Text>
          </View>
        </View>

        {showDelayReason && voyage.status === 'delayed' && voyage.delayReason && (
          <View className={styles.delayReason}>
            <Text className={styles.delayLabel}>延误原因：</Text>
            <Text className={styles.delayText}>{voyage.delayReason}</Text>
          </View>
        )}
        {showDelayReason && voyage.status === 'delayed' && voyage.newEta && (
          <View className={styles.delayReason}>
            <Text className={styles.delayLabel}>新ETA：</Text>
            <Text className={styles.newEta}>{voyage.newEta}</Text>
          </View>
        )}
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
