import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import { mockVoyages } from '@/data/voyage';
import { Voyage, voyageStatusMap } from '@/types';

const timelineSteps = [
  { key: 'pending', label: '待执行', desc: '航次已创建，等待装货' },
  { key: 'loading', label: '装货中', desc: '正在装货作业' },
  { key: 'sailing', label: '在航', desc: '船舶航行中' },
  { key: 'unloading', label: '卸货中', desc: '正在卸货作业' },
  { key: 'completed', label: '已完成', desc: '航次完成' }
];

const VoyageDetailPage: React.FC = () => {
  const router = useRouter();
  const [voyage, setVoyage] = useState<Voyage | null>(null);

  useEffect(() => {
    const id = router.params.id;
    const found = mockVoyages.find(v => v.id === id);
    if (found) {
      setVoyage(found);
    }
  }, [router.params.id]);

  const getCurrentStepIndex = () => {
    if (!voyage) return 0;
    const statusOrder = ['pending', 'loading', 'sailing', 'unloading', 'completed', 'delayed'];
    const idx = statusOrder.indexOf(voyage.status);
    if (voyage.status === 'delayed') return 2;
    return idx;
  };

  const handleReport = () => {
    Taro.showActionSheet({
      itemList: ['上报开航', '上报抵港', '上报装卸完成', '上报异常延误', '上传单据照片']
    }).then(res => {
      const actions = ['开航', '抵港', '装卸完成', '异常延误', '上传单据'];
      Taro.showToast({
        title: `${actions[res.tapIndex]}功能`,
        icon: 'none'
      });
    });
  };

  const handleAdjustEta = () => {
    Taro.showToast({
      title: '调整预计到港时间',
      icon: 'none'
    });
  };

  const handleViewCard = () => {
    Taro.navigateTo({
      url: `/pages/transport-card/index?id=${voyage?.id}`
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
  const currentStepIndex = getCurrentStepIndex();

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.voyageNo}>{voyage.voyageNo}</Text>
        <View className={styles.statusRow}>
          <View className={styles.statusBadge}>
            {statusInfo.label}
          </View>
          <Text className={styles.progressText}>进度 {voyage.progress}%</Text>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.infoCard}>
          <View className={styles.progressSection}>
            <Text className={styles.sectionTitle}>航次进度</Text>
            <View className={styles.timeline}>
              {timelineSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isActive = index === currentStepIndex;
                const stepStatus = isCompleted ? 'completed' : isActive ? 'active' : '';
                
                let timeText = '';
                if (step.key === 'pending') {
                  timeText = voyage.plannedDeparture;
                } else if (step.key === 'sailing' && voyage.actualDeparture) {
                  timeText = voyage.actualDeparture;
                } else if (step.key === 'completed' && voyage.actualArrival) {
                  timeText = voyage.actualArrival;
                } else if (step.key === 'unloading') {
                  timeText = voyage.plannedArrival;
                }

                return (
                  <View 
                    key={step.key} 
                    className={classnames(styles.timelineItem, styles[stepStatus])}
                  >
                    <View className={classnames(styles.timelineDot, styles[stepStatus])} />
                    <View className={styles.timelineContent}>
                      <Text className={styles.timelineTitle}>{step.label}</Text>
                      <Text>{step.desc}</Text>
                      {timeText && (
                        <Text className={styles.timelineTime}>{timeText}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View className={styles.routeSection}>
            <View className={styles.routePort}>
              <Text className={styles.portName}>{voyage.loadingPort}</Text>
              <Text className={styles.portTime}>{voyage.plannedDeparture}</Text>
            </View>
            <View className={styles.routeMiddle}>
              <View className={styles.routeLine} />
              <Text className={styles.shipIcon}>🚢</Text>
            </View>
            <View className={styles.routePort}>
              <Text className={styles.portName}>{voyage.unloadingPort}</Text>
              <Text className={styles.portTime}>{voyage.plannedArrival}</Text>
            </View>
          </View>

          <View className={styles.infoRow}>
            <Text className={styles.label}>货物名称</Text>
            <Text className={styles.value}>{voyage.cargoName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>货物重量</Text>
            <Text className={styles.value}>{voyage.cargoWeight} 吨</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>承运船舶</Text>
            <Text className={styles.value}>{voyage.shipName}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.label}>船长</Text>
            <Text className={styles.value}>{voyage.captain}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>相关单据</Text>
          <View className={styles.documentsList}>
            <View className={styles.docItem}>📄</View>
            <View className={styles.docItem}>📋</View>
            <View className={styles.docItem}>➕</View>
          </View>
        </View>

        {voyage.expense && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>费用备注</Text>
            <View className={styles.expenseContent}>
              {voyage.expense}
            </View>
          </View>
        )}
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={classnames(styles.actionBtn, styles.secondary)} onClick={handleViewCard}>
          进度卡片
        </View>
        <View className={classnames(styles.actionBtn, styles.secondary)} onClick={handleAdjustEta}>
          调整ETA
        </View>
        <View className={classnames(styles.actionBtn, styles.primary)} onClick={handleReport}>
          上报操作
        </View>
      </View>
    </View>
  );
};

export default VoyageDetailPage;
