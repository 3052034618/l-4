import React from 'react';
import { View } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatusTagProps {
  status: string;
  text: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ status, text }) => {
  return (
    <View className={classnames(styles.statusTag, styles[status])}>
      {text}
    </View>
  );
};

export default StatusTag;
