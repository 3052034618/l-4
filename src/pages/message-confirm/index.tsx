import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import useAppStore from '@/store/app';
import { MessageType } from '@/types';

const filterOptions: { key: MessageType | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'notice', label: '通知' },
  { key: 'change', label: '改港改期' },
  { key: 'delay', label: '延误' },
  { key: 'expense', label: '费用' },
  { key: 'document', label: '单据' }
];

const MessageConfirmPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<MessageType | 'all'>('all');
  const messages = useAppStore(state => state.messages);
  const markMessageRead = useAppStore(state => state.markMessageRead);
  const confirmMessage = useAppStore(state => state.confirmMessage);
  const initFromStorage = useAppStore(state => state.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useDidShow(() => {
    initFromStorage();
  });

  const filteredMessages = activeFilter === 'all'
    ? messages
    : messages.filter(m => m.type === activeFilter);

  const unreadCount = messages.filter(m => !m.isRead).length;
  const typeUnreadCounts = filterOptions.reduce((acc, opt) => {
    if (opt.key === 'all') {
      acc[opt.key] = unreadCount;
    } else {
      acc[opt.key] = messages.filter(m => m.type === opt.key && !m.isRead).length;
    }
    return acc;
  }, {} as Record<string, number>);

  const handleFilterClick = (key: MessageType | 'all') => {
    setActiveFilter(key);
  };

  const handleMessageClick = (message: any) => {
    if (!message.isRead) {
      markMessageRead(message.id);
    }
    
    if (message.voyageId) {
      Taro.navigateTo({
        url: `/pages/voyage-detail/index?id=${message.voyageId}`
      });
    }
  };

  const handleConfirm = (e: any, message: any) => {
    e.stopPropagation();
    if (message.isConfirmed) return;
    
    confirmMessage(message.id);
    Taro.showToast({
      title: '已确认',
      icon: 'success'
    });
  };

  usePullDownRefresh(() => {
    initFromStorage();
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 500);
  });

  const getTypeStyle = (type: string) => {
    const typeMap: Record<string, { color: string; bgColor: string }> = {
      notice: { color: '#1677ff', bgColor: '#e6f4ff' },
      change: { color: '#ff7d00', bgColor: '#fff7e6' },
      delay: { color: '#f53f3f', bgColor: '#fff1f0' },
      expense: { color: '#722ed1', bgColor: '#f9f0ff' },
      document: { color: '#1677ff', bgColor: '#e6f4ff' }
    };
    return typeMap[type] || typeMap.notice;
  };

  const getTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      notice: '通知',
      change: '改港改期',
      delay: '延误',
      expense: '费用',
      document: '单据'
    };
    return labelMap[type] || '通知';
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>
          消息确认
          {unreadCount > 0 && (
            <Text className={styles.unreadBadge}>{unreadCount}</Text>
          )}
        </Text>
        <Text className={styles.headerSubtitle}>及时查看并确认重要消息</Text>
      </View>

      <ScrollView scrollX className={styles.filterTabs}>
        {filterOptions.map(option => (
          <View
            key={option.key}
            className={classnames(styles.filterTab, activeFilter === option.key && styles.active)}
            onClick={() => handleFilterClick(option.key)}
          >
            {option.label}
            {typeUnreadCounts[option.key] > 0 && (
              <View className={styles.unreadDot} />
            )}
          </View>
        ))}
      </ScrollView>

      <View className={styles.listContainer}>
        {filteredMessages.length > 0 ? (
          filteredMessages.map(message => {
            const typeStyle = getTypeStyle(message.type);
            return (
              <View
                key={message.id}
                className={classnames(styles.messageCard, !message.isRead && styles.unread)}
                onClick={() => handleMessageClick(message)}
              >
                <View className={styles.cardHeader}>
                  <View
                    className={classnames(styles.typeTag, styles[message.type])}
                    style={{ color: typeStyle.color, backgroundColor: typeStyle.bgColor }}
                  >
                    {getTypeLabel(message.type)}
                  </View>
                  <Text className={styles.messageTitle}>{message.title}</Text>
                </View>

                <View className={styles.cardBody}>
                  <Text className={styles.messageContent}>{message.content}</Text>
                  {message.voyageNo && (
                    <Text className={styles.voyageNo}>航次号：{message.voyageNo}</Text>
                  )}
                </View>

                <View className={styles.cardFooter}>
                  <View style={{ flex: 1 }}>
                    <Text className={styles.senderInfo}>发件人：{message.sender}</Text>
                    <Text className={styles.sendTime}> · {message.sendTime}</Text>
                  </View>
                  {message.needConfirm && (
                    <View
                      className={classnames(styles.actionBtn, message.isConfirmed && styles.confirmed)}
                      onClick={(e: any) => handleConfirm(e, message)}
                    >
                      {message.isConfirmed ? '已确认' : '确认'}
                    </View>
                  )}
                </View>

                {message.isConfirmed && message.confirmer && (
                  <View className={styles.confirmInfo}>
                    <Text className={styles.confirmText}>
                      ✓ {message.confirmer} 于 {message.confirmTime} 确认
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>💬</Text>
            <Text className={styles.emptyText}>暂无消息</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default MessageConfirmPage;
