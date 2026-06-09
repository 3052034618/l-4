import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockMessages } from '@/data/message';
import { Message, MessageType, messageTypeMap } from '@/types';

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
  const [messages, setMessages] = useState<Message[]>(mockMessages);

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

  const handleMessageClick = (message: Message) => {
    if (!message.isRead) {
      setMessages(prev => prev.map(m => 
        m.id === message.id ? { ...m, isRead: true } : m
      ));
    }
    Taro.showToast({
      title: `查看消息详情`,
      icon: 'none'
    });
  };

  const handleConfirm = (e: any, message: Message) => {
    e.stopPropagation();
    if (message.isConfirmed) return;
    
    setMessages(prev => prev.map(m => 
      m.id === message.id ? { ...m, isConfirmed: true, isRead: true } : m
    ));
    Taro.showToast({
      title: '已确认',
      icon: 'success'
    });
  };

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  });

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
            const typeInfo = messageTypeMap[message.type];
            return (
              <View
                key={message.id}
                className={classnames(styles.messageCard, !message.isRead && styles.unread)}
                onClick={() => handleMessageClick(message)}
              >
                <View className={styles.cardHeader}>
                  <View
                    className={classnames(styles.typeTag, styles[message.type])}
                  >
                    {typeInfo.label}
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
                  <View>
                    <Text className={styles.senderInfo}>发件人：{message.sender}</Text>
                    <Text className={styles.sendTime}> · {message.sendTime}</Text>
                  </View>
                  {message.needConfirm && (
                    <View
                      className={classnames(styles.actionBtn, message.isConfirmed && styles.confirmed)}
                      onClick={(e) => handleConfirm(e, message)}
                    >
                      {message.isConfirmed ? '已确认' : '确认'}
                    </View>
                  )}
                </View>
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
