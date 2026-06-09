import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Canvas, Button } from '@tarojs/components';
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
  const canvasRef = useRef<any>(null);
  
  const getVoyageById = useAppStore(state => state.getVoyageById);
  const initFromStorage = useAppStore(state => state.initFromStorage);
  
  const [voyage, setVoyage] = useState<any>(null);
  const [cardImage, setCardImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [updateTime, setUpdateTime] = useState(getCurrentTime());

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
      setTimeout(() => {
        generateCardImage();
      }, 300);
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
        const width = 600;
        const height = 800;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        ctx.fillStyle = '#f5f7fa';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#1677ff';
        ctx.fillRect(0, 0, width, 140);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('运输进度卡', 32, 56);

        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = '24px sans-serif';
        ctx.fillText(`航次号：${voyage.voyageNo}`, 32, 92);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(32, 108, 120, 28, 14);
        ctx.fill();
        ctx.fillStyle = '#1677ff';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(voyageStatusMap[voyage.status]?.label || '待执行', 92, 128);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(24, 160, width - 48, 200);

        ctx.fillStyle = '#4e5969';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('运输路线', 48, 200);

        ctx.fillStyle = '#1677ff';
        ctx.beginPath();
        ctx.arc(80, 260, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f53f3f';
        ctx.beginPath();
        ctx.arc(width - 100, 260, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c9cdd4';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(92, 260);
        ctx.lineTo(width - 112, 260);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#1d2129';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(voyage.loadingPort, 48, 300);

        ctx.textAlign = 'right';
        ctx.fillText(voyage.unloadingPort, width - 48, 300);

        ctx.fillStyle = '#86909c';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(voyage.plannedDeparture, 48, 330);

        ctx.textAlign = 'right';
        ctx.fillText(`预计到达：${voyage.plannedArrival}`, width - 48, 330);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(24, 380, width - 48, 280);

        ctx.fillStyle = '#4e5969';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('货物信息', 48, 420);

        ctx.fillStyle = '#1d2129';
        ctx.font = '26px sans-serif';
        ctx.fillText(`货物名称：${voyage.cargoName}`, 48, 460);
        ctx.fillText(`货物重量：${voyage.cargoWeight} 吨`, 48, 496);
        ctx.fillText(`承运船舶：${voyage.shipName}`, 48, 532);

        const progressY = 580;
        ctx.fillStyle = '#f2f3f5';
        ctx.beginPath();
        ctx.roundRect(48, progressY, width - 96, 16, 8);
        ctx.fill();

        const progressWidth = (width - 96) * (voyage.progress / 100);
        ctx.fillStyle = '#1677ff';
        ctx.beginPath();
        ctx.roundRect(48, progressY, progressWidth, 16, 8);
        ctx.fill();

        ctx.fillStyle = '#4e5969';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`进度 ${voyage.progress}%`, width - 48, progressY + 40);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(24, 680, width - 48, 100);

        ctx.fillStyle = '#86909c';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`更新时间：${updateTime}`, width / 2, 720);

        ctx.fillStyle = '#4e5969';
        ctx.font = '22px sans-serif';
        ctx.fillText('水运调度系统 · 实时追踪', width / 2, 756);

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
      itemList: ['保存图片', '预览图片'],
      success: (res) => {
        if (res.tapIndex === 0) {
          handleSaveImage();
        } else if (res.tapIndex === 1) {
          Taro.previewImage({
            urls: [cardImage],
            current: cardImage
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
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16rpx' }}>
              <Text style={{ fontSize: '36rpx', fontWeight: 'bold', color: '#fff' }}>运输进度卡</Text>
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
            <Text style={{ fontSize: '26rpx', color: 'rgba(255,255,255,0.85)' }}>
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
                  <Text className={styles.portTime}>{voyage.plannedDeparture}</Text>
                </View>
                <View className={styles.routeLine}>
                  <Text style={{ fontSize: '32rpx' }}>🚢</Text>
                </View>
                <View className={styles.routePortEnd}>
                  <View className={classnames(styles.routeDot, styles.end)} />
                  <Text className={styles.portName}>{voyage.unloadingPort}</Text>
                  <Text className={styles.portTime}>预计到达：{voyage.plannedArrival}</Text>
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
                <View className={styles.infoItem}>
                  <Text className={styles.itemLabel}>承运船舶</Text>
                  <Text className={styles.itemValue}>{voyage.shipName}</Text>
                </View>
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
            <Text className={styles.updateTime}>更新时间：{updateTime}</Text>
            <Text className={styles.footerText}>水运调度系统 · 实时追踪</Text>
          </View>
        </View>

        <Canvas
          id="cardCanvas"
          type="2d"
          style={{
            width: '600px',
            height: '800px',
            position: 'fixed',
            left: '-9999px',
            top: '-9999px'
          }}
        />
      </View>

      <View className={styles.actions}>
        <View className={classnames(styles.actionBtn, styles.secondary)} onClick={handleSaveImage}>
          <Text>📷 保存图片</Text>
        </View>
        <View className={classnames(styles.actionBtn, styles.primary)} onClick={handleShare}>
          <Text>🔗 分享给客户</Text>
        </View>
      </View>

      <View className={styles.tip}>
        <Text>💡 小提示：保存图片后可分享给客户查看运输进度</Text>
      </View>
    </View>
  );
};

export default TransportCardPage;
