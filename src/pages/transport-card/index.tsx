import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockVoyages } from '@/data/voyage';
import { Voyage, voyageStatusMap } from '@/types';

const TransportCardPage: React.FC = () => {
  const router = useRouter();
  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const id = router.params.id;
    const found = mockVoyages.find(v => v.id === id);
    if (found) {
      setVoyage(found);
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setCurrentTime(timeStr);
  }, [router.params.id]);

  const handleShare = () => {
    Taro.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  };

  const handleSaveImage = () => {
    Taro.showToast({
      title: '保存图片功能开发中',
      icon: 'none'
    });
  };

  if (!voyage) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const statusInfo = voyageStatusMap[voyage.status];

  return (
    <View className={styles.page}>
      <View className={styles.cardContainer}>
        <View className={styles.cardHeader}>
          <Text className={styles.cardTitle}>航次编号</Text>
          <Text className={styles.voyageNo}>{voyage.voyageNo}</Text>
          <View className={styles.statusBadge}>
            {statusInfo.label}
          </View>
        </View>

        <View className={styles.cardBody}>
          <View className={styles.routeSection}>
            <View className={styles.routePort}>
              <Text className={styles.portLabel}>装货港</Text>
              <Text className={styles.portName}>{voyage.loadingPort}</Text>
              <Text className={styles.portTime}>{voyage.plannedDeparture}</Text>
            </View>
            <View className={styles.routeLine}>
              <View className={styles.lineTrack} />
              <View className={styles.lineProgress} style={{ width: `${voyage.progress}%` }} />
              <View className={styles.shipIndicator}>🚢</View>
            </View>
            <View className={styles.routePort}>
              <Text className={styles.portLabel}>卸货港</Text>
              <Text className={styles.portName}>{voyage.unloadingPort}</Text>
              <Text className={styles.portTime}>{voyage.plannedArrival}</Text>
            </View>
          </View>

          <View className={styles.progressInfo}>
            <Text className={styles.progressText}>运输进度</Text>
            <Text className={styles.progressPercent}>{voyage.progress}%</Text>
          </View>

          <View className={styles.infoGrid}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>承运船舶</Text>
              <Text className={styles.infoValue}>{voyage.shipName}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>船长</Text>
              <Text className={styles.infoValue}>{voyage.captain}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>货物名称</Text>
              <Text className={styles.infoValue}>{voyage.cargoName}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>货物重量</Text>
              <Text className={styles.infoValue}>{voyage.cargoWeight} 吨</Text>
            </View>
          </View>

          {voyage.status !== 'completed' && (
            <View className={styles.etaSection}>
              <Text className={styles.etaLabel}>
                <Text>⏱️</Text>
                预计到达时间
              </Text>
              <Text className={styles.etaValue}>{voyage.plannedArrival}</Text>
            </View>
          )}
        </View>

        <View className={styles.cardFooter}>
          <View className={styles.footerLeft}>
            <View className={styles.companyLogo}>水</View>
            <Text className={styles.companyName}>水运调度平台</Text>
          </View>
          <Text className={styles.footerTime}>更新于 {currentTime}</Text>
        </View>
      </View>

      <View className={styles.actionBar}>
        <View className={classnames(styles.actionBtn, styles.secondary)} onClick={handleSaveImage}>
          保存图片
        </View>
        <View className={classnames(styles.actionBtn, styles.primary)} onClick={handleShare}>
          分享给客户
        </View>
      </View>
    </View>
  );
};

export default TransportCardPage;
