import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatusTag from '@/components/StatusTag';
import useAppStore from '@/store/app';
import { Voyage, voyageStatusMap, VoyageStatus, MessageType } from '@/types';

const timelineSteps = [
  { key: 'pending', label: '待执行', desc: '航次已创建，等待装货' },
  { key: 'loading', label: '装货中', desc: '正在装货作业' },
  { key: 'sailing', label: '在航', desc: '船舶航行中' },
  { key: 'unloading', label: '已抵港', desc: '船舶已到达目的港' },
  { key: 'completed', label: '装卸完成', desc: '货物装卸作业完成' }
];

const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const getTypeLabel = (type: MessageType) => {
  const labelMap: Record<MessageType, string> = {
    notice: '通知',
    change: '改港改期',
    delay: '延误',
    expense: '费用',
    document: '单据'
  };
  return labelMap[type] || '通知';
};

const VoyageDetailPage: React.FC = () => {
  const router = useRouter();
  const voyageId = router.params.id as string;
  
  const getVoyageById = useAppStore(state => state.getVoyageById);
  const updateVoyageStatus = useAppStore(state => state.updateVoyageStatus);
  const updateVoyageEta = useAppStore(state => state.updateVoyageEta);
  const reportDelay = useAppStore(state => state.reportDelay);
  const addDocument = useAppStore(state => state.addDocument);
  const initFromStorage = useAppStore(state => state.initFromStorage);
  const checkShipConflict = useAppStore(state => state.checkShipConflict);

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [showEtaModal, setShowEtaModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [newEta, setNewEta] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [delayEta, setDelayEta] = useState('');

  useEffect(() => {
    loadVoyage();
  }, [voyageId]);

  useDidShow(() => {
    initFromStorage();
    loadVoyage();
  });

  const loadVoyage = () => {
    const found = getVoyageById(voyageId);
    if (found) {
      setVoyage(found);
    }
  };

  const getCurrentStepIndex = () => {
    if (!voyage) return 0;
    const statusOrder: VoyageStatus[] = ['pending', 'loading', 'sailing', 'unloading', 'completed'];
    const idx = statusOrder.indexOf(voyage.status);
    if (voyage.status === 'delayed') return 2;
    return idx >= 0 ? idx : 0;
  };

  const handleViewCard = () => {
    Taro.navigateTo({
      url: `/pages/transport-card/index?id=${voyageId}`
    });
  };

  const handleAdjustEta = () => {
    setNewEta(voyage?.plannedArrival || '');
    setShowEtaModal(true);
  };

  const handleSaveEta = () => {
    if (!newEta.trim()) {
      Taro.showToast({ title: '请输入新的预计到达时间', icon: 'none' });
      return;
    }
    
    const conflictVoyages = checkShipConflict(
      voyage!.shipId, 
      voyage!.plannedDeparture, 
      newEta.trim(), 
      voyageId
    );
    
    if (conflictVoyages.length > 0) {
      const conflictList = conflictVoyages.map(v => `  · ${v.voyageNo} (${v.plannedDeparture} ~ ${v.plannedArrival})`).join('\n');
      Taro.showModal({
        title: '⚠️ 时间冲突提醒',
        content: `调整后，该船舶与其他航次存在时间冲突：\n${conflictList}\n\n是否仍要调整ETA？`,
        confirmText: '仍要调整',
        confirmColor: '#f53f3f',
        success: (res) => {
          if (res.confirm) {
            doSaveEta();
          }
        }
      });
    } else {
      doSaveEta();
    }
  };

  const doSaveEta = () => {
    updateVoyageEta(voyageId, newEta.trim(), '调度调整');
    setShowEtaModal(false);
    loadVoyage();
    Taro.showToast({ title: '改期已保存', icon: 'success' });
  };

  const handleReport = () => {
    setShowReportSheet(true);
  };

  const handleReportAction = (action: string) => {
    setShowReportSheet(false);
    const now = getCurrentTime();

    switch (action) {
      case 'departure':
        if (voyage?.status === 'sailing') {
          Taro.showToast({ title: '船舶已在航行中', icon: 'none' });
          return;
        }
        updateVoyageStatus(voyageId, 'sailing', now);
        loadVoyage();
        Taro.showToast({ title: '开航已上报', icon: 'success' });
        break;
      case 'arrival':
        if (voyage?.status === 'unloading' || voyage?.status === 'completed') {
          Taro.showToast({ title: '船舶已抵港', icon: 'none' });
          return;
        }
        updateVoyageStatus(voyageId, 'unloading', now);
        loadVoyage();
        Taro.showToast({ title: '抵港已上报', icon: 'success' });
        break;
      case 'unload':
        if (voyage?.status === 'completed') {
          Taro.showToast({ title: '航次已完成', icon: 'none' });
          return;
        }
        updateVoyageStatus(voyageId, 'completed', now);
        loadVoyage();
        Taro.showToast({ title: '装卸完成已上报', icon: 'success' });
        break;
      case 'delay':
        setDelayReason('');
        setDelayEta(voyage?.plannedArrival || '');
        setShowDelayModal(true);
        break;
    }
  };

  const handleDelaySubmit = () => {
    if (!delayReason.trim()) {
      Taro.showToast({ title: '请填写延误原因', icon: 'none' });
      return;
    }
    if (!delayEta.trim()) {
      Taro.showToast({ title: '请填写新的预计到达时间', icon: 'none' });
      return;
    }
    reportDelay(voyageId, delayReason.trim(), delayEta.trim());
    setShowDelayModal(false);
    loadVoyage();
    Taro.showToast({ title: '延误已上报', icon: 'success' });
  };

  const handleAddDocument = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        addDocument(voyageId, tempFilePath);
        loadVoyage();
        Taro.showToast({ title: '单据已上传', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Document] Choose image failed:', err);
        Taro.showToast({ title: '选择图片失败', icon: 'none' });
      }
    });
  };

  const handlePreviewImage = (url: string) => {
    const urls = voyage?.documents || [];
    Taro.previewImage({
      current: url,
      urls: urls
    });
  };

  if (!voyage) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 0', textAlign: 'center', color: '#86909c' }}>
          <Text>加载中...</Text>
        </View>
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
                } else if (step.key === 'unloading' && voyage.actualArrival) {
                  timeText = voyage.actualArrival;
                } else if (step.key === 'completed' && voyage.actualUnloadingFinish) {
                  timeText = voyage.actualUnloadingFinish;
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
              <Text className={styles.portTime}>
                {voyage.plannedArrival}
                <Text className={styles.etaEditBtn} onClick={handleAdjustEta}>调整</Text>
              </Text>
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
          
          {voyage.actualDeparture && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>实际开航</Text>
              <Text className={classnames(styles.value, styles.actualTime)}>{voyage.actualDeparture}</Text>
            </View>
          )}
          {voyage.actualArrival && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>实际抵港</Text>
              <Text className={classnames(styles.value, styles.actualTime)}>{voyage.actualArrival}</Text>
            </View>
          )}
          {voyage.actualUnloadingFinish && (
            <View className={styles.infoRow}>
              <Text className={styles.label}>装卸完成</Text>
              <Text className={classnames(styles.value, styles.actualTime)}>{voyage.actualUnloadingFinish}</Text>
            </View>
          )}
          {voyage.status === 'delayed' && voyage.delayReason && (
            <View className={styles.delayInfo}>
              <Text className={styles.delayLabel}>延误原因</Text>
              <Text className={styles.delayText}>{voyage.delayReason}</Text>
            </View>
          )}
          {voyage.status === 'delayed' && voyage.newEta && (
            <View className={styles.delayInfo}>
              <Text className={styles.delayLabel}>新ETA</Text>
              <Text className={styles.newEtaText}>{voyage.newEta}</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>相关单据</Text>
          <View className={styles.documentsList}>
            {voyage.documents?.map((doc, index) => (
              <View 
                key={index} 
                className={styles.docItem}
                onClick={() => handlePreviewImage(doc)}
              >
                <Image className={styles.docImage} src={doc} mode="aspectFill" />
              </View>
            ))}
            <View className={styles.docItem} onClick={handleAddDocument}>
              <View className={styles.docAddBtn}>
                <Text>＋</Text>
              </View>
            </View>
          </View>
        </View>

        {voyage.confirmRecords && voyage.confirmRecords.length > 0 && (
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>调度确认记录</Text>
            <View className={styles.confirmList}>
              {voyage.confirmRecords.map(record => (
                <View key={record.id} className={styles.confirmItem}>
                  <View className={styles.confirmHeader}>
                    <Text className={styles.confirmTitle}>{record.title}</Text>
                    <Text className={styles.confirmType}>{getTypeLabel(record.type)}</Text>
                  </View>
                  <View className={styles.confirmFooter}>
                    <Text className={styles.confirmer}>确认人：{record.confirmer}</Text>
                    <Text className={styles.confirmTime}>{record.confirmTime}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

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

      {showReportSheet && (
        <View className={styles.modalOverlay} onClick={() => setShowReportSheet(false)}>
          <View className={styles.actionSheet} onClick={(e) => e.stopPropagation()}>
            <View className={styles.reportItem} onClick={() => handleReportAction('departure')}>
              <View className={styles.reportIcon}>🚢</View>
              <View className={styles.reportInfo}>
                <Text className={styles.reportTitle}>上报开航</Text>
                <Text className={styles.reportDesc}>船舶已完成装货，确认开航</Text>
              </View>
              <Text className={styles.reportArrow}>›</Text>
            </View>
            <View className={styles.reportItem} onClick={() => handleReportAction('arrival')}>
              <View className={styles.reportIcon}>⚓</View>
              <View className={styles.reportInfo}>
                <Text className={styles.reportTitle}>上报抵港</Text>
                <Text className={styles.reportDesc}>船舶已到达目的港</Text>
              </View>
              <Text className={styles.reportArrow}>›</Text>
            </View>
            <View className={styles.reportItem} onClick={() => handleReportAction('unload')}>
              <View className={styles.reportIcon}>📦</View>
              <View className={styles.reportInfo}>
                <Text className={styles.reportTitle}>上报装卸完成</Text>
                <Text className={styles.reportDesc}>货物装卸作业已完成</Text>
              </View>
              <Text className={styles.reportArrow}>›</Text>
            </View>
            <View className={styles.reportItem} onClick={() => handleReportAction('delay')}>
              <View className={styles.reportIcon} style={{ backgroundColor: '#fff1f0' }}>⚠️</View>
              <View className={styles.reportInfo}>
                <Text className={styles.reportTitle}>上报异常延误</Text>
                <Text className={styles.reportDesc}>遇到异常情况，需延误航次</Text>
              </View>
              <Text className={styles.reportArrow}>›</Text>
            </View>
            <View className={classnames(styles.actionSheetItem, styles.actionSheetCancel)} onClick={() => setShowReportSheet(false)}>
              取消
            </View>
          </View>
        </View>
      )}

      {showEtaModal && (
        <View className={styles.modalOverlay} onClick={() => setShowEtaModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>调整预计到达时间</Text>
            <Input
              className={styles.modalInput}
              placeholder="请输入新的到达时间"
              placeholderClass="placeholder"
              value={newEta}
              onInput={(e) => setNewEta(e.detail.value)}
            />
            <Text style={{ fontSize: '24rpx', color: '#86909c', marginBottom: '16rpx' }}>
              格式：YYYY-MM-DD HH:mm
            </Text>
            <View className={styles.modalActions}>
              <View className={classnames(styles.modalBtn, styles.cancel)} onClick={() => setShowEtaModal(false)}>
                取消
              </View>
              <View className={classnames(styles.modalBtn, styles.confirm)} onClick={handleSaveEta}>
                保存
              </View>
            </View>
          </View>
        </View>
      )}

      {showDelayModal && (
        <View className={styles.modalOverlay} onClick={() => setShowDelayModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>上报异常延误</Text>
            <Text style={{ fontSize: '26rpx', color: '#4e5969', marginBottom: '24rpx' }}>
              请填写延误原因和新的预计到达时间
            </Text>
            <Input
              className={styles.modalInput}
              placeholder="延误原因"
              placeholderClass="placeholder"
              value={delayReason}
              onInput={(e) => setDelayReason(e.detail.value)}
            />
            <Input
              className={styles.modalInput}
              placeholder="新的预计到达时间"
              placeholderClass="placeholder"
              value={delayEta}
              onInput={(e) => setDelayEta(e.detail.value)}
            />
            <Text style={{ fontSize: '24rpx', color: '#86909c' }}>
              格式：YYYY-MM-DD HH:mm
            </Text>
            <View className={styles.modalActions}>
              <View className={classnames(styles.modalBtn, styles.cancel)} onClick={() => setShowDelayModal(false)}>
                取消
              </View>
              <View className={classnames(styles.modalBtn, styles.confirm)} onClick={handleDelaySubmit}>
                提交
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default VoyageDetailPage;
