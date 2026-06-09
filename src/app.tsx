import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import useAppStore from '@/store/app';
// 全局样式
import './app.scss';

function App(props) {
  const initFromStorage = useAppStore(state => state.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useDidShow(() => {
    initFromStorage();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
