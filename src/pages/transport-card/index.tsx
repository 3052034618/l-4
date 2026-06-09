import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Canvas } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store/app';
import { voyageStatusMap } from '@/types';

const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const TransportCardPage: React.FC = () => {
  const router = useRouter();
  const voyageId = router.params.id as string;
  const isCustomerView = router.params.customer === '1';
  
  const getVoyageById = useAppStore(state => state.getVoyageById);
  const initFromStorage = useAppStore(state => state.initFromStorage);
  
  const [voyage, setVoyage] = useState<any>(null);
  const [cardImage, setCardImage] = useState<string>('');
  const [updateTime, setUpdateTime] = useState(getCurrentTime());

  const displayEta = voyage?.newEta || voyage?.plannedArrival || '';
  const displayDeparture = voyage?.actualDeparture || voyage?.plannedDeparture || '';

  useEffect(() => {
    loadData();
  }, [voyageId]);

  useDidShow(() => {
    initFromStorage();
    loadData();
    setUpdateTime(getCurrentTime());
  });

  const loadData = () => {
    const found = getVoyageById(voyageId);
    if (found) {
      setVoyage(found);
    }
  };

  useEffect(() => {
    if (voyage) {
      const timer = setTimeout(() => {
        generateCardImage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [voyage]);

  const generateCardImage = () => {
    if (!voyage) return;

    const query = Taro.createSelectorQuery();
    query.select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec((res: any) => {
        if (!res || !res[0]) return;
        
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const dpr = Taro.getSystemInfoSync().pixelRatio;
        const width = 750;
        const height = 1000;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        ctx.fillStyle = '#f5f7fa';
        ctx.fillRect(0, 0, width, height);

        const gradient = ctx.createLinearGradient(0, 0, width, 180);
        gradient.addColorStop(0, '#1677ff');
        gradient.addColorStop(1, '#4096ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, 180);

        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(680, 60, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(700, 140, 60, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('运输进度查询', 40, 70);

        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = '24px sans-serif';
        ctx.fillText(`航次号：${voyage.voyageNo}`, 40, 110);

        const statusLabel = voyageStatusMap[voyage.status]?.label || '待执行';
        const statusColor = voyageStatusMap[voyage.status]?.color || '#1677ff';
        
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.roundRect(40, 130, 140, 36, 18);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(statusLabel, 110, 154);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(30, 200, width - 60, 220, 16);
        ctx.fill();

        ctx.fillStyle = '#4e5969';
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('运输路线', 60, 250);

        ctx.fillStyle = '#1677ff';
        ctx.beginPath();
        ctx.arc(100, 330, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f53f3f';
        ctx.beginPath();
        ctx.arc(width - 120, 330, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c9cdd4';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(114, 330);
        ctx.lineTo(width - 134, 330);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#1d2129';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(voyage.loadingPort, 60, 380);

        ctx.textAlign = 'right';
        ctx.fillText(voyage.unloadingPort, width - 60, 380);

        const etaLabel = voyage.newEta ? '最新ETA：' : '预计到达：';
        const departureLabel = voyage.actualDeparture ? '实际出发：' : '计划出发：';
        
        ctx.fillStyle = '#86909c';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${departureLabel}${displayDeparture}`, 60, 410);

        ctx.textAlign = 'right';
        if (voyage.newEta) {
          ctx.fillStyle = '#f53f3f';
        }
        ctx.fillText(`${etaLabel}${displayEta}`, width - 60, 410);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(30, 440, width - 60, 300, 16);
        ctx.fill();

        ctx.fillStyle = '#4e5969';
        ctx.font = '26px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('货物信息', 60, 490);

        ctx.fillStyle = '#f5f7fa';
        ctx.beginPath();
        ctx.roundRect(60, 520, width - 120, 180, 12);
        ctx.fill();

        ctx.fillStyle = '#1d2129';
        ctx.font = '28px sans-serif';
        ctx.fillText(`货物名称：${voyage.cargoName}`, 90, 570);
        ctx.fillText(`货物重量：${voyage.cargoWeight} 吨`, 90, 610);
        if (!isCustomerView) {
          ctx.fillText(`承运船舶：${voyage.shipName}`, 90, 650);
        }

        const progressY = 680;
        ctx.fillStyle = '#f2f3f5';
        ctx.beginPath();
        ctx.roundRect(60, progressY, width - 120, 20, 10);
        ctx.fill();

        const progressWidth = (width - 120) * (voyage.progress / 100);
        const progressGradient = ctx.createLinearGradient(60, 0, 60 + progressWidth, 0);
        progressGradient.addColorStop(0, '#1677ff');
        progressGradient.addColorStop(1, '#4096ff');
        ctx.fillStyle = progressGradient;
        ctx.beginPath();
        ctx.roundRect(60, progressY, progressWidth, 20, 10);
        ctx.fill();

        ctx.fillStyle = '#4e5969';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`运输进度 ${voyage.progress}%`, width - 60, progressY + 50);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(30, 760, width - 60, 120, 16);
        ctx.fill();

        ctx.fillStyle = '#86909c';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`最后更新时间：${updateTime}`, width / 2, 810);

        ctx.fillStyle = '#1d2129';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText('水运调度系统 · 实时追踪', width / 2, 850);

        ctx.fillStyle = '#f5f7fa';
        ctx.fillRect(0, 900, width, 100);
        ctx.fillStyle = '#86909c';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('本卡片信息仅供参考，实际情况以调度通知为准', width / 2, 940);
        ctx.fillText('© 水运调度系统', width / 2, 970);

        try {
          const tempFilePath = canvas.toTempFilePathSync({
            x: 0,
            y: 0,
            width: width,
            height: height,
            destWidth: width,
            destHeight: height,
            fileType: 'png',
            quality: 1
          });
          setCardImage(tempFilePath);
        } catch (err) {
          console.error('[Card] Generate image failed:', err);
        }
      });
  };

  const handleSaveImage = () => {
    if (!cardImage) {
      Taro.showToast({ title: '卡片生成中，请稍候', icon: 'none' });
      return;
    }

    Taro.saveImageToPhotosAlbum({
      filePath: cardImage,
      success: () => {
        Taro.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: (err: any) => {
        console.error('[Card] Save failed:', err);
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          Taro.showModal({
            title: '提示',
            content: '需要您授权保存图片到相册',
            confirmText: '去授权',
            success: (res) => {
              if (res.confirm) {
                Taro.openSetting();
              }
            }
          });
        } else {
          Taro.previewImage({
            urls: [cardImage],
            current: cardImage
          });
          Taro.showToast({ title: '可长按保存图片', icon: 'none' });
        }
      }
    });
  };

  const handleShare = () => {
    if (!cardImage) {
      Taro.showToast({ title: '卡片生成中，请稍候', icon: 'none' });
      return;
    }

    Taro.showActionSheet({
      itemList: ['保存图片', '预览图片', '复制链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          handleSaveImage();
        } else if (res.tapIndex === 1) {
          Taro.previewImage({
            urls: [cardImage],
            current: cardImage
          });
        } else if (res.tapIndex === 2) {
          const shareUrl = `${window.location.origin}/pages/transport-card/index?id=${voyageId}&customer=1`;
          Taro.setClipboardData({
            data: shareUrl,
            success: () => {
              Taro.showToast({ title: '链接已复制', icon: 'success' });
            }
          });
        }
      }
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

  return (
    <View className={styles.page}>
      <View className={styles.cardPreview}>
        <View className={styles.previewCard}>
          <View className={styles.cardHeader}>
            <View className={styles.headerTop}>
              <Text className={styles.cardTitle}>运输进度查询</Text>
              <View
                className={classnames(styles.statusTag, styles[voyage.status])}
                style={{
                  backgroundColor: statusInfo?.color ? `${statusInfo.color}20` : '#e6f4ff',
                  color: statusInfo?.color || '#1677ff'
                }}
              >
                {statusInfo?.label || '待执行'}
              </View>
            </View>
            <Text className={styles.voyageNoText}>
              航次号：{voyage.voyageNo}
            </Text>
          </View>

          <View className={styles.cardContent}>
            <View className={styles.cardSection}>
              <Text className={styles.sectionLabel}>运输路线</Text>
              <View className={styles.routeBox}>
                <View className={styles.routePortStart}>
                  <View className={styles.routeDot} />
                  <Text className={styles.portName}>{voyage.loadingPort}</Text>
                  <Text className={styles.portTime}>
                    {voyage.actualDeparture ? '实际出发' : '计划出发'}：{displayDeparture}
                  </Text>
                </View>
                <View className={styles.routeLine}>
                  <Text className={styles.shipEmoji}>🚢</Text>
                </View>
                <View className={styles.routePortEnd}>
                  <View className={classnames(styles.routeDot, styles.end)} />
                  <Text className={styles.portName}>{voyage.unloadingPort}</Text>
                  <Text className={classnames(styles.portTime, voyage.newEta && styles.etaDelayed)}>
                    {voyage.newEta ? '最新ETA' : '预计到达'}：{displayEta}
                  </Text>
                </View>
              </View>
            </View>

            <View className={styles.cardSection}>
              <Text className={styles.sectionLabel}>货物信息</Text>
              <View className={styles.cargoInfo}>
                <View className={styles.infoItem}>
                  <Text className={styles.itemLabel}>货物名称</Text>
                  <Text className={styles.itemValue}>{voyage.cargoName}</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.itemLabel}>货物重量</Text>
                  <Text className={styles.itemValue}>{voyage.cargoWeight} 吨</Text>
                </View>
                {!isCustomerView && (
                  <View className={styles.infoItem}>
                    <Text className={styles.itemLabel}>承运船舶</Text>
                    <Text className={styles.itemValue}>{voyage.shipName}</Text>
                  </View>
                )}
              </View>
            </View>

            <View className={styles.progressSection}>
              <Text className={styles.sectionLabel}>运输进度</Text>
              <View className={styles.progressBar}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${voyage.progress}%` }}
                />
              </View>
              <Text className={styles.progressText}>{voyage.progress}%</Text>
            </View>
          </View>

          <View className={styles.cardFooter}>
            <Text className={styles.updateTime}>最后更新时间：{updateTime}</Text>
            <Text className={styles.footerText}>水运调度系统 · 实时追踪</Text>
          </View>
        </View>

        <View className={styles.cardTip}>
          <Text className={styles.tipText}>
            本卡片信息仅供参考，实际情况以调度通知为准
          </Text>
        </View>

        <Canvas
          id="cardCanvas"
          type="2d"
          style={{
            width: '750px',
            height: '1000px',
            position: 'fixed',
            left: '-9999px',
            top: '-9999px'
          }}
        />
      </View>

      {!isCustomerView && (
        <View className={styles.actions}>
          <View className={classnames(styles.actionBtn, styles.secondary)} onClick={handleSaveImage}>
            <Text>📷 保存图片</Text>
          </View>
          <View className={classnames(styles.actionBtn, styles.primary)} onClick={handleShare}>
            <Text>🔗 分享给客户</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default TransportCardPage;
